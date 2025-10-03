'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, MapPin, Edit3, Save, X } from 'lucide-react';
import { ProfileData } from '../../../../types/profile';
import AvatarManager from './AvatarManager';

interface ProfileHeaderProps {
  profileData: ProfileData;
  onProfileUpdate: (updatedProfile: ProfileData) => void;
  onAvatarUpdate?: (file: File) => void;
  onAvatarRemove?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  onProfileUpdate,
  // onAvatarUpdate, // Disabled avatar update functionality
  // onAvatarRemove, // Disabled avatar remove functionality
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileData>(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = () => {
    onProfileUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update editData when profileData changes
  React.useEffect(() => {
    setEditData(profileData);
  }, [profileData]);
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex flex-col items-center space-y-4">
            <AvatarManager 
              profileData={profileData}
            />
            
            <Badge variant="secondary" className="text-xs">
              Member since {new Date(profileData.joinDate).getFullYear()}
            </Badge>
          </div>

          <div className="flex-1 space-y-4">
            {!isEditing ? (
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  {profileData?.username || 'Unknown User'}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profileData?.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData?.location || 'No location'}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {profileData?.bio || 'No bio available'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={editData.username}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Username cannot be changed
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={handleEdit} className="gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
