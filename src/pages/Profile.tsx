import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { UserData } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { ConfirmationModal } from '../components/ui/confirmation-modal';

const db = getFirestore();

const Profile: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'default' | 'destructive';
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data() as UserData);
          setFormData(docSnap.data() as UserData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, formData);
      setProfileData({ ...profileData, ...formData } as UserData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setModalConfig({
        isOpen: true,
        title: "Error",
        message: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file size and type if needed
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setModalConfig({
        isOpen: true,
        title: "Upload Failed",
        message: "File size too large. Please choose an image under 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      // Convert file to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const mimeType = file.type;

        try {
          const functions = getFunctions();
          const uploadProfilePhoto = httpsCallable(functions, 'uploadProfilePhoto');
          
          const result = await uploadProfilePhoto({ photo: base64String, mimeType });
          const data = result.data as { photoURL: string };
          
          setFormData(prev => ({ ...prev, photoURL: data.photoURL }));
          
          setModalConfig({
            isOpen: true,
            title: "Success",
            message: "Profile photo updated successfully!",
            variant: "default"
          });
        } catch (error) {
           console.error("Error uploading photo:", error);
           setModalConfig({
             isOpen: true,
             title: "Upload Failed",
             message: "Failed to upload photo via backend. Please try again.",
             variant: "destructive"
           });
        } finally {
           setUploadingPhoto(false);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
         setModalConfig({
            isOpen: true,
            title: "Error",
            message: "Failed to read file.",
            variant: "destructive"
          });
         setUploadingPhoto(false);
      };

    } catch (error) {
      console.error("Error preparing photo upload:", error);
      setUploadingPhoto(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button 
          variant={isEditing ? "outline" : "default"}
          onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={formData.photoURL || currentUser?.photoURL || ''}
              alt={currentUser?.displayName || 'User'}
            />
            <AvatarFallback>
              {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <div className="flex flex-col gap-2">
               <Label htmlFor="photo-upload" className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1 rounded text-sm transition-colors text-center">
                 {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
               </Label>
               <Input 
                 id="photo-upload" 
                 type="file" 
                 accept="image/*"
                 className="hidden"
                 onChange={handlePhotoChange}
                 disabled={uploadingPhoto}
               />
            </div>
          )}
          <div>
            <CardTitle className="text-2xl">{currentUser?.displayName}</CardTitle>
            <p className="text-slate-500">{currentUser?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
              {userRole}
            </span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Common Fields */}
          <div className="space-y-2">
            <Label htmlFor="institution">Institution / Organization</Label>
            <Input 
              id="institution" 
              disabled={!isEditing}
              value={formData.institution || ''}
              onChange={e => setFormData({...formData, institution: e.target.value})}
              placeholder="e.g. University of Medicine"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              disabled={!isEditing}
              value={formData.bio || ''}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell us about yourself..."
              className="resize-none"
              rows={4}
            />
          </div>

          {/* Learner Specific */}
          {(userRole === 'learner' || userRole === 'admin') && (
             <div className="space-y-2">
              <Label htmlFor="yearInSchool">Year in School</Label>
              <Input 
                id="yearInSchool" 
                disabled={!isEditing}
                value={formData.yearInSchool || ''}
                onChange={e => setFormData({...formData, yearInSchool: e.target.value})}
                placeholder="e.g. 3rd Year Resident"
              />
            </div>
          )}

          {/* Lead Specific */}
          {(userRole === 'institutional-lead' || userRole === 'admin') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input 
                    id="title" 
                    disabled={!isEditing}
                    value={formData.title || ''}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Program Director"
                  />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="cellPhone">Cell Phone</Label>
                   <Input 
                     id="cellPhone" 
                     disabled={!isEditing}
                     value={formData.cellPhone || ''}
                     onChange={e => setFormData({...formData, cellPhone: e.target.value})}
                     placeholder="(555) 555-5555"
                   />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workAddress">Work Address</Label>
                <Input 
                  id="workAddress" 
                  disabled={!isEditing}
                  value={formData.workAddress || ''}
                  onChange={e => setFormData({...formData, workAddress: e.target.value})}
                  placeholder="123 Medical Ctr Dr..."
                />
              </div>
            </>
          )}
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  disabled={!isEditing}
                  value={formData.socialLinks?.linkedin || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X</Label>
                <Input 
                  id="twitter" 
                  disabled={!isEditing}
                  value={formData.socialLinks?.twitter || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input 
                  id="facebook" 
                  disabled={!isEditing}
                  value={formData.socialLinks?.facebook || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                  })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input 
                  id="instagram" 
                  disabled={!isEditing}
                  value={formData.socialLinks?.instagram || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-[#c2002f] hover:bg-[#a00027]">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        confirmText="OK"
      />
    </div>
  );
};

export default Profile;
