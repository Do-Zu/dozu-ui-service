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
  Users, 
  Copy, 
  Check, 
  X, 
  Send,
  Shield,
  Upload,
  FileText
} from 'lucide-react';
import { useClassInvite } from '@/hooks/useClassInvite';
import { QRCodeGenerator } from './QRCodeGenerator';
import { PendingInvitesList } from './PendingInvitesList';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

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
  const [copied, setCopied] = useState(false);
  const [isImportingFile, setIsImportingFile] = useState(false);
  
  const createInviteLinkFromCode = (code: string) => {
    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;
    const locale = currentPath.split('/')[1] || 'en';
    return `${baseUrl}/${locale}/class-based?code=${code}`;
  };
  
  const existingInviteLink = invitationCode ? createInviteLinkFromCode(invitationCode) : null;
  
  const { toast } = useToast();
  const t = useTranslations('class.inviteStudents');
  const {
    inviteLink,
    pendingInvites,
    loading,
    error,
    generateInviteLink,
    regenerateInviteLink,
    sendEmailInvites,
    cancelInvite,
    resendInvite,
    refreshData,
    clearError,
  } = useClassInvite(classId);



  const checkEmailExists = (email: string): boolean => {
    const emailLower = email.toLowerCase().trim();
    return existingStudents.some(student => {
      const studentEmail = student.username.toLowerCase().trim();
      return studentEmail === emailLower;
    });
  };

  const handleEmailAdd = () => {
    const email = emailInput.trim();
    if (!email) return;
    
    if (!isValidEmail(email)) {
      toast({
        title: t('toast.error.invalidEmail'),
        variant: "destructive",
      });
      return;
    }

    if (emails.includes(email.toLowerCase())) {
      toast({
        title: t('toast.warning.emailInList', { email }),
        variant: "destructive",
      });
      return;
    }

    // Check if email is already in the class
    if (checkEmailExists(email)) {
      toast({
        title: t('toast.emailExists.title'),
        description: t('toast.emailExists.single', { email }),
        variant: "destructive",
      });
      return;
    }
    
    setEmails([...emails, email.toLowerCase()]);
    setEmailInput('');
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
      processEmails(pastedEmails);
      e.preventDefault();
    }
  };

  const processEmails = (newEmails: string[]) => {
    const emailLower = newEmails.map(email => email.toLowerCase().trim());
    
    // Filter out emails that are already in the class
    const alreadyInClassEmails = emailLower.filter(email => checkEmailExists(email));
    const validEmails = emailLower.filter(email => !checkEmailExists(email));
    
    // Filter out duplicates from existing emails list
    const uniqueValidEmails = validEmails.filter(email => !emails.includes(email));
    const alreadyInListEmails = validEmails.filter(email => emails.includes(email));
    
    // Show toast for emails already in class
    if (alreadyInClassEmails.length > 0) {
      toast({
        title: t('toast.emailExists.title'),
        description: t('toast.emailExists.multipleWithDetails', { 
          count: alreadyInClassEmails.length, 
          emails: alreadyInClassEmails.join(', ') 
        }),
        variant: "destructive",
      });
    }
    
    // Show toast for emails already in invitation list
    if (alreadyInListEmails.length > 0 && alreadyInListEmails.length < emailLower.length) {
      toast({
        title: t('toast.warning.emailsInList', { 
          count: alreadyInListEmails.length, 
          emails: alreadyInListEmails.join(', ') 
        }),
        variant: "default",
      });
    }
    
    // Add valid emails to the list
    if (uniqueValidEmails.length > 0) {
      setEmails([...emails, ...uniqueValidEmails]);
      toast({
        title: t('toast.success.emailsAdded', { count: uniqueValidEmails.length }),
        variant: "default",
      });
    } else if (alreadyInClassEmails.length > 0 || alreadyInListEmails.length > 0) {
      // Only show this if no new emails were added
      if (alreadyInClassEmails.length === emailLower.length) {
        // All emails are already in class
        toast({
          title: t('toast.info.allEmailsExist'),
          variant: "default",
        });
      } else if (alreadyInListEmails.length === validEmails.length) {
        // All valid emails are already in the list
        toast({
          title: t('toast.info.allEmailsInList'),
          variant: "default",
        });
      }
    }
  };

  const parseFileContent = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            reject(new Error('File is empty'));
            return;
          }
          
          // Parse CSV or TXT file
          // Support multiple formats: CSV with headers, plain text with one email per line, comma/semicolon separated
          const lines = content.split(/\r?\n/);
          const extractedEmails: string[] = [];
          
          lines.forEach((line, index) => {
            // Skip empty lines
            if (!line.trim()) return;
            
            // Skip CSV header if it looks like a header (contains "email" or "Email")
            if (index === 0 && line.toLowerCase().includes('email')) {
              return;
            }
            
            // Split by comma, semicolon, or tab
            const lineEmails = line.split(/[,;\t]/).map(email => email.trim());
            
            lineEmails.forEach(email => {
              if (email && isValidEmail(email)) {
                extractedEmails.push(email.toLowerCase());
              }
            });
          });
          
          // Remove duplicates
          const uniqueEmails = Array.from(new Set(extractedEmails));
          resolve(uniqueEmails);
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Failed to parse file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validExtensions = ['.csv', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: t('toast.error.invalidFileType'),
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: t('toast.error.fileTooLarge'),
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }
    
    setIsImportingFile(true);
    
    try {
      const extractedEmails = await parseFileContent(file);
      
      if (extractedEmails.length === 0) {
        toast({
          title: t('toast.error.emptyFile'),
          variant: "destructive",
        });
      } else {
        processEmails(extractedEmails);
      }
    } catch (error) {
      toast({
        title: t('toast.error.importFailed'),
        description: error instanceof Error ? error.message : '',
        variant: "destructive",
      });
    } finally {
      setIsImportingFile(false);
      e.target.value = '';
    }
  };

  const handleSendEmails = async () => {
    if (emails.length === 0) return;

    // Final check: filter out any emails that might have been added to the class since the list was created
    const emailsToSend = emails.filter(email => !checkEmailExists(email));
    const emailsAlreadyInClass = emails.filter(email => checkEmailExists(email));

    if (emailsAlreadyInClass.length > 0) {
      toast({
        title: t('toast.emailExists.title'),
        description: t('toast.emailExists.willNotSend', { 
          count: emailsAlreadyInClass.length, 
          emails: emailsAlreadyInClass.join(', ') 
        }),
        variant: "destructive",
      });
    }

    if (emailsToSend.length === 0) {
      toast({
        title: t('toast.warning.noEmailsToSend'),
        variant: "destructive",
      });
      setEmails([]);
      return;
    }

    try {
      const result = await sendEmailInvites(emailsToSend, { expiresInDays: 7, useLimit: 10 });
      
      // Handle response from API - check for failed emails
      if (result && result.results) {
        const failedEmails = result.results.filter(r => !r.success);
        const successfulEmails = result.results.filter(r => r.success);
        
        // Show toast for failed emails (e.g., already in class)
        if (failedEmails.length > 0) {
          const alreadyInClassEmails = failedEmails.filter(r => {
            const msg = r.message.toLowerCase();
            return msg.includes('already in') || 
                   msg.includes('already exists') ||
                   msg.includes('already in this class') ||
                   msg.includes('user is already');
          });
          
          if (alreadyInClassEmails.length > 0) {
            toast({
              title: t('toast.emailExists.title'),
              description: t('toast.emailExists.apiResponse', { 
                count: alreadyInClassEmails.length
              }),
              variant: "destructive",
            });
          }
          
          // Show other failures
          const otherFailures = failedEmails.filter(r => {
            const msg = r.message.toLowerCase();
            return !msg.includes('already in') && 
                   !msg.includes('already exists') &&
                   !msg.includes('already in this class') &&
                   !msg.includes('user is already');
          });
          
          if (otherFailures.length > 0) {
            const details = otherFailures.map(r => `${r.email} (${r.message})`).join(', ');
            toast({
              title: t('toast.sendError.title'),
              description: t('toast.sendError.description', { 
                count: otherFailures.length, 
                details 
              }),
              variant: "destructive",
            });
          }
        }
        
        // Show success toast
        if (successfulEmails.length > 0) {
          toast({
            title: t('toast.success.invitationsSentSuccess', { count: successfulEmails.length }),
            variant: "default",
          });
        }
      } else {
        // Fallback if result structure is different
        toast({
          title: t('toast.success.invitationsSent', { count: emailsToSend.length }),
          variant: "default",
        });
      }
      
      setEmails([]);
    } catch (error) {
      toast({
        title: t('toast.error.sendFailed'),
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
        title: t('toast.success.copied'),
        description: t('toast.success.copiedDescription'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: t('toast.error.copyFailed'),
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
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              {t('inviteLink')}
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {t('emailInvite')}
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
                      {invitationCode && t('usingInvitationCode', { code: invitationCode })}
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
                <CardTitle>{t('sendEmailInvitations')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="email-input">{t('emailAddresses')}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="file-import"
                        accept=".csv,.txt"
                        className="hidden"
                        onChange={handleFileImport}
                        disabled={isImportingFile}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('file-import')?.click()}
                        disabled={isImportingFile}
                        className="flex items-center gap-2"
                      >
                        {isImportingFile ? (
                          <>
                            <FileText className="w-4 h-4 animate-spin" />
                            {t('importing')}
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {t('importFromFile')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Input
                    id="email-input"
                    placeholder={t('emailInputPlaceholder')}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={handleEmailKeyPress}
                    onPaste={handleBulkEmailPaste}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('emailInputHint')}
                  </p>
                </div>

                {/* Email Chips */}
                {emails.length > 0 && (
                  <div>
                    <Label>{t('selectedEmails')} ({emails.length})</Label>
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
                  {t('sendInvitations')} ({emails.length})
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Pending Invites */}
        {/* {pendingInvites.length > 0 && (
          <div className="mt-6">
            <PendingInvitesList
              invites={pendingInvites}
              onCancel={cancelInvite}
              onResend={resendInvite}
              onRefresh={refreshData}
              loading={loading.getPendingInvites}
            />
          </div>
        )} */}

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


