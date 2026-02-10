import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ResourceItem } from '../../types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { 
  Folder, 
  FileText, 
  Upload, 
  Trash2, 
  ChevronRight, 
  Download,
  Loader2,
  FileIcon,
  X,
  Edit2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ConfirmationModal } from '../ui/confirmation-modal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const functions = getFunctions();
const db = getFirestore();

interface ResourceManagerProps {
    className?: string;
    title?: string;
}

export const ResourceManager: React.FC<ResourceManagerProps> = ({ className, title = "Resources" }) => {
  const { userRole, currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentFolderId = searchParams.get('folderId');
  const selectedResourceId = searchParams.get('resourceId');

  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const dragCounter = useRef(0);
  
  // Viewer State - filtered from resources or fetched individually if needed
  // For simplicity, we'll try to find it in the current list first
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  // Modals State
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [deleteState, setDeleteState] = useState<{ isOpen: boolean; item: ResourceItem | null }>({
    isOpen: false,
    item: null,
  });

  const [createFolderState, setCreateFolderState] = useState<{ isOpen: boolean; name: string }>({
    isOpen: false,
    name: '',
  });

  const [renameState, setRenameState] = useState<{ isOpen: boolean; item: ResourceItem | null; newName: string }>({
    isOpen: false,
    item: null,
    newName: '',
  });

  // Permission Checks
  const canUpload = ['institutional-lead', 'admin', 'moderator'].includes(userRole || '');
  const canManage = ['admin', 'moderator'].includes(userRole || '');
  const isLead = userRole === 'institutional-lead';

  // 1. Fetch Resources for current folder
  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const getResourcesFn = httpsCallable<{ parentId: string | null }, { resources: ResourceItem[] }>(functions, 'getResources');
      const result = await getResourcesFn({ parentId: currentFolderId });
      setResources(result.data.resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // 2. Sync Selected Resource
  useEffect(() => {
    if (selectedResourceId && resources.length > 0) {
      const found = resources.find(r => r.id === selectedResourceId);
      if (found) setSelectedResource(found);
    } else if (!selectedResourceId) {
      setSelectedResource(null);
    }
  }, [selectedResourceId, resources]);

  // 3. Reconstruct Path if missing (Deep Linking support)
  useEffect(() => {
    const reconstructPath = async () => {
        if (!currentFolderId) {
            setFolderPath([]);
            return;
        }

        // If we already have a path that ends in currentFolderId, we are good
        if (folderPath.length > 0 && folderPath[folderPath.length - 1].id === currentFolderId) {
            return;
        }

        try {
            // Simplified reconstruction: Just fetch current folder for now
            // Ideally we'd recursively fetch parents, but let's start with the current one
            const docRef = doc(db, 'resources', currentFolderId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                // If we really want full breadcrumbs, we'd need to fetch the parent chain.
                // For now, let's just show the current folder. 
                // A more robust solution would be to store 'path' array in the document itself.
                
                // Hack: If we don't have the parent in our path, we reset to just this folder.
                // This means "Home" takes you back to root, which is safe.
                setFolderPath([{ id: docSnap.id, name: data.name }]);
            }
        } catch (error) {
            console.error("Error reconstructing path:", error);
        }
    };
    
    reconstructPath();
  }, [currentFolderId, folderPath]); // Only run when folder changes


  const handleCreateFolder = async () => {
    if (!createFolderState.name) return;

    try {
      const createFolderFn = httpsCallable<{ name: string; parentId: string | null }, ResourceItem>(functions, 'createResourceFolder');
      await createFolderFn({ name: createFolderState.name, parentId: currentFolderId });
      fetchResources(); // Refresh list
      setCreateFolderState({ isOpen: false, name: '' });
    } catch (error) {
      console.error("Error creating folder:", error);
      setAlertState({
        isOpen: true,
        title: "Error",
        message: "Failed to create folder"
      });
    }
  };

  const uploadFile = async (file: File) => {
    // Size check (e.g. 10MB limit for Base64)
    if (file.size > 10 * 1024 * 1024) {
      setAlertState({
        isOpen: true,
        title: "Error",
        message: "File is too large. Maximum size is 10MB."
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        try {
          const uploadFileFn = httpsCallable(functions, 'uploadResourceFile');
          await uploadFileFn({
            fileData: base64,
            fileName: file.name,
            mimeType: file.type,
            parentId: currentFolderId,
            accessLevel: 'learner'
          });
          
          fetchResources();
        } catch (error) {
           console.error("Error uploading:", error);
           setAlertState({
             isOpen: true,
             title: "Error",
             message: "Failed to upload file"
           });
        } finally {
           setIsUploading(false);
           if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      
      reader.onerror = () => {
        console.error("Error reading file");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error("Error prep:", error);
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await uploadFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (!canUpload) {
        setAlertState({
            isOpen: true,
            title: "Permission Denied",
            message: "You do not have permission to upload files."
        });
        return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setDroppedFile(file);
    }
  };

  const handleConfirmDropUpload = async () => {
    if (droppedFile) {
      await uploadFile(droppedFile);
      setDroppedFile(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteState.item) return;
    
    try {
      const deleteResourceFn = httpsCallable(functions, 'deleteResource');
      await deleteResourceFn({ resourceId: deleteState.item.id });
      fetchResources();
      setDeleteState({ isOpen: false, item: null });
      // If we deleted the currently viewed resource
      if (selectedResourceId === deleteState.item.id) {
          setSearchParams(curr => {
              const next = new URLSearchParams(curr);
              next.delete('resourceId');
              return next;
          });
      }
    } catch (error) {
      console.error("Error deleting:", error);
      setAlertState({
        isOpen: true,
        title: "Error",
        message: "Failed to delete item"
      });
    }
  };

  const confirmRename = async () => {
    if (!renameState.item || !renameState.newName || renameState.newName === renameState.item.name) {
        setRenameState({ ...renameState, isOpen: false });
        return;
    }

    try {
        const renameResourceFn = httpsCallable(functions, 'renameResource');
        await renameResourceFn({ resourceId: renameState.item.id, newName: renameState.newName });
        fetchResources();
        setRenameState({ isOpen: false, item: null, newName: '' });
    } catch (error) {
        console.error("Error renaming:", error);
        setAlertState({
            isOpen: true,
            title: "Error",
            message: "Failed to rename"
        });
    }
  };

  const enterFolder = (folder: ResourceItem) => {
    // Optimistic Update
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
    
    setSearchParams(curr => {
        const next = new URLSearchParams(curr);
        next.set('folderId', folder.id);
        next.delete('resourceId'); // Close viewer
        return next;
    });
  };

  const navigateUp = (index: number) => {
    if (index === -1) {
      setFolderPath([]);
      setSearchParams(curr => {
        const next = new URLSearchParams(curr);
        next.delete('folderId');
        next.delete('resourceId');
        return next;
      });
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      const targetFolderId = newPath[newPath.length - 1].id;
      setSearchParams(curr => {
        const next = new URLSearchParams(curr);
        next.set('folderId', targetFolderId);
        next.delete('resourceId');
        return next;
      });
    }
  };

  // Helper to check delete permission locally (rules enforce it too)
  const canDelete = (item: ResourceItem) => {
    if (canManage) return true;
    if (isLead && item.uploadedBy === currentUser?.uid) return true; 
    if (isLead && item.createdBy === currentUser?.uid) return true;
    return false;
  };

  return (
    <div 
        className={cn("w-full relative", className)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
        {isDragging && canUpload && (
            <div className="absolute inset-0 z-50 bg-blue-50/90 border-4 border-dashed border-blue-400 rounded-lg flex flex-col items-center justify-center pointer-events-none transition-all">
                <Upload className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
                <p className="text-xl font-bold text-blue-600">Drop files here to upload</p>
            </div>
        )}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 font-serif mb-1">{title}</h2>
           <p className="text-gray-600 text-sm">Shared documents and training materials.</p>
        </div>
        
        {canUpload && (
          <div className="flex space-x-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
            />
            <Button onClick={() => setCreateFolderState({ isOpen: true, name: '' })} variant="outline" size="sm" className="flex items-center">
              <Folder className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <Button 
                onClick={() => fileInputRef.current?.click()} 
                size="sm"
                className="bg-[#c2002f] hover:bg-[#a00027] text-white flex items-center"
                disabled={isUploading}
            >
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2" />}
              Upload File
            </Button>
          </div>
        )}
      </div>

      <nav className="flex items-center text-sm text-gray-500 mb-4 bg-slate-50 p-2 rounded-md">
        <button 
          onClick={() => navigateUp(-1)}
          className="hover:text-[#c2002f] font-medium px-1"
        >
          Home
        </button>
        {folderPath.map((item, idx) => (
          <React.Fragment key={item.id}>
            <ChevronRight className="w-4 h-4 mx-1" />
            <button 
              onClick={() => navigateUp(idx)}
              className={cn(
                "hover:text-[#c2002f] px-1",
                idx === folderPath.length - 1 && "font-bold text-gray-900 pointer-events-none"
              )}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cn("bg-white rounded-lg shadow border border-gray-200 min-h-[400px]", selectedResource ? "lg:col-span-1" : "lg:col-span-3")}>
             {loading ? (
               <div className="flex justify-center items-center h-48">
                 <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
               </div>
             ) : resources.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                 <Folder className="w-12 h-12 mb-2 opacity-20" />
                 <p>This folder is empty</p>
               </div>
             ) : (
               <div className="divide-y divide-gray-100">
                 {resources.map((item) => (
                   <div 
                     key={item.id} 
                     className={cn(
                        "flex items-center justify-between p-3 hover:bg-slate-50 group transition-colors cursor-pointer",
                        selectedResource?.id === item.id && "bg-slate-100"
                     )}
                     onClick={() => {
                       if (item.type === 'folder') {
                           enterFolder(item);
                       } else {
                           setSearchParams(curr => {
                               const next = new URLSearchParams(curr);
                               next.set('resourceId', item.id!);
                               return next;
                           });
                       }
                     }}
                   >
                     <div className="flex items-center flex-1 min-w-0">
                       {item.type === 'folder' ? (
                         <Folder className="w-8 h-8 text-blue-400 mr-3 fill-current flex-shrink-0" />
                       ) : (
                         <div className="relative flex-shrink-0">
                            <FileText className="w-8 h-8 text-gray-400 mr-3" />
                            {item.mimeType?.includes('pdf') && (
                                <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[9px] px-1 rounded">PDF</span>
                            )}
                         </div>
                       )}
                       <div className="truncate">
                         <p className="font-medium text-gray-900 group-hover:text-[#c2002f] transition-colors truncate">{item.name}</p>
                         <p className="text-xs text-gray-500 truncate">
                           {item.updatedAt?.toDate ? item.updatedAt.toDate().toLocaleDateString() : 'Just now'}
                           {item.size ? ` • ${Math.round(item.size / 1024)} KB` : ''}
                         </p>
                       </div>
                     </div>

                   <div className="flex items-center space-x-1 ml-2">
                       {canDelete(item) && (
                         <>
                           <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); setRenameState({ isOpen: true, item, newName: item.name }); }}
                              className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <Edit2 className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             onClick={(e) => { e.stopPropagation(); setDeleteState({ isOpen: true, item }); }}
                             className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             )}
        </div>
        
        {/* Preview Panel */}
        {selectedResource && (
            <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200 flex flex-col h-[600px] sticky top-6">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="font-semibold text-lg truncate flex-1">{selectedResource.name}</h2>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                             <a href={selectedResource.url} target="_blank" rel="noopener noreferrer" download>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                             </a>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSearchParams(curr => { const next = new URLSearchParams(curr); next.delete('resourceId'); return next; })}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-slate-50/50">
                    {selectedResource.mimeType?.includes('pdf') ? (
                         <iframe 
                            src={selectedResource.url} 
                            className="w-full h-full rounded border border-gray-200"
                            title="PDF Preview"
                         />
                    ) : selectedResource.name.endsWith('.md') || selectedResource.mimeType?.includes('markdown') ? (
                         <div className="prose prose-sm max-w-none bg-white p-6 rounded shadow-sm">
                             <MarkdownFetcher url={selectedResource.url} />
                         </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                             <FileIcon className="w-16 h-16 mb-4" />
                             <p>Preview not available for this file type.</p>
                             <Button variant="link" asChild className="mt-2">
                                <a href={selectedResource.url} target="_blank" rel="noopener noreferrer">
                                    Open in new tab
                                </a>
                             </Button>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Resource Modals */}
      <ConfirmationModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
        title={alertState.title}
        message={alertState.message}
      />

      <ConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Delete Resource"
        message={`Are you sure you want to delete "${deleteState.item?.name}"?`}
        variant="destructive"
        confirmText="Delete"
      />

      <ConfirmationModal
        isOpen={createFolderState.isOpen}
        onClose={() => setCreateFolderState({ isOpen: false, name: '' })}
        onConfirm={handleCreateFolder}
        title="New Folder"
        message={
          <div className="flex flex-col gap-4">
            <p>Enter a name for the new folder:</p>
            <Input
              value={createFolderState.name}
              onChange={(e) => setCreateFolderState({ ...createFolderState, name: e.target.value })}
              placeholder="Folder Name"
              autoFocus
            />
          </div>
        }
        confirmText="Create"
      />

      <ConfirmationModal
        isOpen={renameState.isOpen}
        onClose={() => setRenameState({ isOpen: false, item: null, newName: '' })}
        onConfirm={confirmRename}
        title="Rename Resource"
        message={
          <div className="flex flex-col gap-4">
            <p>Enter a new name for the resource:</p>
            <Input
              value={renameState.newName}
              onChange={(e) => setRenameState({ ...renameState, newName: e.target.value })}
              placeholder="Resource Name"
              autoFocus
            />
          </div>
        }
        confirmText="Rename"
      />

      <ConfirmationModal
        isOpen={!!droppedFile}
        onClose={() => setDroppedFile(null)}
        onConfirm={handleConfirmDropUpload}
        title="Upload File"
        message={`Are you sure you want to upload "${droppedFile?.name}"?`}
        confirmText="Upload"
      />
    </div>
  );
};

// Helper component to fetch and render markdown
const MarkdownFetcher = ({ url }: { url: string | undefined }) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!url) return;
        fetch(url)
            .then(res => res.text())
            .then(text => {
                setContent(text);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch markdown", err);
                setContent("Failed to load content.");
                setLoading(false);
            });
    }, [url]);

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin" /></div>;

    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
};
