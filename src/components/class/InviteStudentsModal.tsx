'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Link, 
  Mail, 
  Search, 
  Users, 
  Copy, 
  Check, 
  X, 
  Send,
  Shield
} from 'lucide-react';
import { useClassInvite } from '@/hooks/useClassInvite';
import { QRCodeGenerator } from './QRCodeGenerator';
import { PendingInvitesList } from './PendingInvitesList';
import { useToast } from '@/hooks/use-toast';
import { UserSearchResult } from '@/types/class-based-learning/classInvite.type';

interface InviteStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  className?: string;
  invitationCode?: string;
  existingStudents?: Array<{ userId: number; username: string; fullName: string | null; avatarUrl: string; enrolledAt: string }>;
}

export function InviteStudentsModal({
  open,
  onOpenChange,
  classId,
  className = '',
  invitationCode,
  existingStudents = [],
}: InviteStudentsModalProps) {
  const [activeTab, setActiveTab] = useState('link');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  
  const createInviteLinkFromCode = (code: string) => {
    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;
    const locale = currentPath.split('/')[1] || 'en';
    return `${baseUrl}/${locale}/class-based?code=${code}`;
  };
  
  const existingInviteLink = invitationCode ? createInviteLinkFromCode(invitationCode) : null;
  
  const { toast } = useToast();
  const {
    inviteLink,
    pendingInvites,
    searchResults,
    selectedUsers,
    loading,
    error,
    generateInviteLink,
    regenerateInviteLink,
    sendEmailInvites,
    searchUsers,
    selectUser,
    removeSelectedUser,
    clearSelectedUsers,
    sendSelectedUserInvites,
    cancelInvite,
    resendInvite,
    refreshData,
    clearError,
  } = useClassInvite(classId);


  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const handleEmailAdd = () => {
    const email = emailInput.trim();
    if (email && !emails.includes(email) && isValidEmail(email)) {
      // Check if email is already in the class
      const isAlreadyInClass = existingStudents.some(student => 
        student.username.toLowerCase().includes(email.toLowerCase()) ||
        student.fullName?.toLowerCase().includes(email.toLowerCase())
      );
      
      if (isAlreadyInClass) {
        toast({
          title: "Warning",
          description: `Email ${email} is already in the class`,
          variant: "destructive",
        });
        return;
      }
      
      setEmails([...emails, email]);
      setEmailInput('');
    }
  };

  const handleEmailRemove = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEmailAdd();
    }
  };

  const handleBulkEmailPaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    const pastedEmails = pastedText
      .split(/[,\n;]/)
      .map(email => email.trim())
      .filter(email => email && isValidEmail(email));
    
    if (pastedEmails.length > 0) {
      // Filter out emails that are already in the class
      const validEmails = pastedEmails.filter(email => {
        const isAlreadyInClass = existingStudents.some(student => 
          student.username.toLowerCase().includes(email.toLowerCase()) ||
          student.fullName?.toLowerCase().includes(email.toLowerCase())
        );
        return !isAlreadyInClass;
      });
      
      const alreadyInClassEmails = pastedEmails.filter(email => {
        const isAlreadyInClass = existingStudents.some(student => 
          student.username.toLowerCase().includes(email.toLowerCase()) ||
          student.fullName?.toLowerCase().includes(email.toLowerCase())
        );
        return isAlreadyInClass;
      });
      
      if (alreadyInClassEmails.length > 0) {
        toast({
          title: "Warning",
          description: `${alreadyInClassEmails.length} email(s) are already in the class: ${alreadyInClassEmails.join(', ')}`,
          variant: "destructive",
        });
      }
      
      setEmails([...emails, ...validEmails.filter(email => !emails.includes(email))]);
      e.preventDefault();
    }
  };

  const handleSendEmails = async () => {
    if (emails.length === 0) return;

    try {
      await sendEmailInvites(emails, { expiresInDays: 7, useLimit: 10 });
      setEmails([]);
      toast({
        title: "Success",
        description: `Invitations sent to ${emails.length} email(s)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email invitations",
        variant: "destructive",
      });
    }
  };

  const handleSendSelectedUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await sendSelectedUserInvites({ expiresInDays: 7, useLimit: 10 });
      toast({
        title: "Success",
        description: `Invitations sent to ${selectedUsers.length} user(s)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send user invitations",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    const linkToCopy = existingInviteLink || inviteLink?.inviteLink;
    if (!linkToCopy) return;

    try {
      await navigator.clipboard.writeText(linkToCopy);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };


  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Invite Students
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Invite Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Invite
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Users
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Invite Link */}
          <TabsContent value="link" className="space-y-6 flex flex-col items-center">
            {existingInviteLink && (
              <>
                {/* QR Code */}
                <div className="flex flex-col items-center space-y-4">
                  <QRCodeGenerator
                    inviteLink={existingInviteLink}
                    size={200}
                    showDownload={true}
                    showCopy={true}
                    showSizeControl={false}
                  />
                </div>
                 {/* Link Display - moved above QR code */}
                 <div className="w-full max-w-lg space-y-4">
                  <div className="text-sm text-muted-foreground text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3" />
                      Using invitation code: {invitationCode}
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Tab 2: Email Invitation */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Send Email Invitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email-input">Email Addresses</Label>
                  <Input
                    id="email-input"
                    placeholder="Enter email addresses (comma separated or press Enter)"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={handleEmailKeyPress}
                    onPaste={handleBulkEmailPaste}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    You can paste multiple emails separated by commas, semicolons, or new lines
                  </p>
                </div>

                {/* Email Chips */}
                {emails.length > 0 && (
                  <div>
                    <Label>Selected Emails ({emails.length})</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {emails.map((email, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-red-500"
                            onClick={() => handleEmailRemove(email)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSendEmails}
                  disabled={emails.length === 0 || loading.sendEmails}
                  className="w-full"
                >
                  <Send className={`w-4 h-4 mr-2 ${loading.sendEmails ? 'animate-spin' : ''}`} />
                  Send Invitations ({emails.length})
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Search Users */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search and Invite Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search-input">Search Users</Label>
                  <Input
                    id="search-input"
                    placeholder="Search by name, username, or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Search Results */}
                {searchQuery && (
                  <div>
                    <Label>Search Results ({searchResults.length})</Label>
                    <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                      {loading.searchUsers ? (
                        <div className="text-center py-4">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((user) => (
                          <div
                            key={user.userId}
                            className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Checkbox
                              checked={selectedUsers.some(u => u.userId === user.userId)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  selectUser(user);
                                } else {
                                  removeSelectedUser(user.userId);
                                }
                              }}
                            />
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback>
                                {getInitials(user.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-sm text-muted-foreground">
                                @{user.username} • {user.email}
                              </div>
                            </div>
                            {user.isAlreadyInClass && (
                              <Badge variant="outline">Already in class</Badge>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No users found
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <div>
                    <Label>Selected Users ({selectedUsers.length})</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUsers.map((user) => (
                        <Badge key={user.userId} variant="secondary" className="flex items-center gap-1">
                          {user.fullName}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeSelectedUser(user.userId)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSendSelectedUsers}
                  disabled={selectedUsers.length === 0 || loading.sendEmails}
                  className="w-full"
                >
                  <Send className={`w-4 h-4 mr-2 ${loading.sendEmails ? 'animate-spin' : ''}`} />
                  Send Invitations ({selectedUsers.length})
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="mt-6">
            <PendingInvitesList
              invites={pendingInvites}
              onCancel={cancelInvite}
              onResend={resendInvite}
              onRefresh={refreshData}
              loading={loading.getPendingInvites}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

