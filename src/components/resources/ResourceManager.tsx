import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ResourceItem } from '../../types';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  deleteDoc, 
  doc, 
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const db = getFirestore();
const storage = getStorage();

interface ResourceManagerProps {
    className?: string;
    title?: string;
}

export const ResourceManager: React.FC<ResourceManagerProps> = ({ className, title = "Resources" }) => {
  const { userRole, currentUser } = useAuth();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Viewer State
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  // Permission Checks
  const canUpload = ['institutional-lead', 'admin', 'moderator'].includes(userRole || '');
  const canManage = ['admin', 'moderator'].includes(userRole || '');
  const isLead = userRole === 'institutional-lead';

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'resources'),
      where('parentId', '==', currentFolderId),
      orderBy('type', 'desc'),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ResourceItem[];
      setResources(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentFolderId]);

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;

    try {
      await addDoc(collection(db, 'resources'), {
        name,
        type: 'folder',
        parentId: currentFolderId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        accessLevel: 'public',
        createdBy: currentUser?.uid
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Access Level Prompt (Simple for now)
    const accessLevel = 'learner'; 

    try {
      setIsUploading(true);
      
      // 1. Upload to Storage
      // Path: resources/{userId}/{timestamp}_{filename} to avoid collisions
      const storagePath = `resources/${currentUser?.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // 2. Save Metadata to Firestore
      await addDoc(collection(db, 'resources'), {
        name: file.name,
        type: 'file',
        mimeType: file.type,
        url,
        storagePath,
        parentId: currentFolderId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        accessLevel, 
        size: file.size,
        createdBy: currentUser?.uid,
        uploadedBy: currentUser?.uid
      });

    } catch (error) {
      console.error("Error uploading:", error);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (item: ResourceItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'resources', item.id));

      // 2. Delete from Storage if it's a file
      if (item.type === 'file' && item.storagePath) {
        const fileRef = ref(storage, item.storagePath);
        await deleteObject(fileRef).catch(err => {
            console.warn("Failed to delete from storage (might be missing):", err);
        });
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete item");
    }
  };

  const handleRename = async (item: ResourceItem) => {
    const newName = prompt("Enter new name:", item.name);
    if (!newName || newName === item.name) return;

    try {
        await updateDoc(doc(db, 'resources', item.id), {
            name: newName,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error renaming:", error);
        alert("Failed to rename");
    }
  };

  const enterFolder = (folder: ResourceItem) => {
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
    setSelectedResource(null);
  };

  const navigateUp = (index: number) => {
    if (index === -1) {
      setFolderPath([]);
      setCurrentFolderId(null);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    }
    setSelectedResource(null);
  };

  // Helper to check delete permission locally (rules enforce it too)
  const canDelete = (item: ResourceItem) => {
    if (canManage) return true;
    if (isLead && item.uploadedBy === currentUser?.uid) return true; 
    if (isLead && item.createdBy === currentUser?.uid) return true;
    return false;
  };

  return (
    <div className={cn("w-full", className)}>
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
            <Button onClick={handleCreateFolder} variant="outline" size="sm" className="flex items-center">
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
                     onClick={() => item.type === 'folder' ? enterFolder(item) : setSelectedResource(item)}
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
                              onClick={(e) => { e.stopPropagation(); handleRename(item); }}
                              className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <Edit2 className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
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
                        <Button variant="ghost" size="sm" onClick={() => setSelectedResource(null)}>
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
