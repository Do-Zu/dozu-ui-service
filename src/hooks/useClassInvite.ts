import { useState, useEffect, useCallback } from 'react';
import { classInviteService } from '@/services/class-based-learning/classInvite.service';
import { 
  ClassInviteState, 
  InviteLinkOptions, 
  EmailInviteOptions, 
  UserSearchResult 
} from '@/types/class-based-learning/classInvite.type';

export function useClassInvite(classId: number) {
  const [state, setState] = useState<ClassInviteState>({
    inviteLink: null,
    pendingInvites: [],
    searchResults: [],
    selectedUsers: [],
    loading: {
      generateLink: false,
      sendEmails: false,
      searchUsers: false,
      getPendingInvites: false,
    },
    error: null,
  });

  // Load initial data
  useEffect(() => {
    if (classId) {
      loadInitialData();
    }
  }, [classId]);

  const loadInitialData = async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, getPendingInvites: true },
        error: null,
      }));

      const [inviteLink, pendingInvites] = await Promise.all([
        classInviteService.getCurrentInviteLink(classId),
        classInviteService.getPendingInvites(classId),
      ]);

      setState(prev => ({
        ...prev,
        inviteLink,
        pendingInvites,
        loading: { ...prev.loading, getPendingInvites: false },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: { ...prev.loading, getPendingInvites: false },
      }));
    }
  };

  const generateInviteLink = useCallback(async (options: InviteLinkOptions = {}) => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, generateLink: true },
        error: null,
      }));

      const inviteLink = await classInviteService.generateInviteLink(classId, options);
      
      setState(prev => ({
        ...prev,
        inviteLink,
        loading: { ...prev.loading, generateLink: false },
      }));

      return inviteLink;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate invite link',
        loading: { ...prev.loading, generateLink: false },
      }));
      throw error;
    }
  }, [classId]);

  const regenerateInviteLink = useCallback(async (options: InviteLinkOptions = {}) => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, generateLink: true },
        error: null,
      }));

      const inviteLink = await classInviteService.regenerateInviteLink(classId, options);
      
      setState(prev => ({
        ...prev,
        inviteLink,
        loading: { ...prev.loading, generateLink: false },
      }));

      return inviteLink;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to regenerate invite link',
        loading: { ...prev.loading, generateLink: false },
      }));
      throw error;
    }
  }, [classId]);

  const sendEmailInvites = useCallback(async (
    emails: string[], 
    options: EmailInviteOptions = {}
  ) => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, sendEmails: true },
        error: null,
      }));

      const results = await classInviteService.inviteByEmail(classId, emails, options);
      
      // Refresh pending invites after sending
      const pendingInvites = await classInviteService.getPendingInvites(classId);
      
      setState(prev => ({
        ...prev,
        pendingInvites,
        loading: { ...prev.loading, sendEmails: false },
      }));

      return results;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send email invites',
        loading: { ...prev.loading, sendEmails: false },
      }));
      throw error;
    }
  }, [classId]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({
        ...prev,
        searchResults: [],
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, searchUsers: true },
        error: null,
      }));

      const searchResults = await classInviteService.searchUsersToInvite(query, classId);
      
      setState(prev => ({
        ...prev,
        searchResults,
        loading: { ...prev.loading, searchUsers: false },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to search users',
        loading: { ...prev.loading, searchUsers: false },
      }));
    }
  }, [classId]);

  const selectUser = useCallback((user: UserSearchResult) => {
    setState(prev => ({
      ...prev,
      selectedUsers: [...prev.selectedUsers, user],
    }));
  }, []);

  const removeSelectedUser = useCallback((userId: number) => {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.filter(user => user.userId !== userId),
    }));
  }, []);

  const clearSelectedUsers = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedUsers: [],
    }));
  }, []);

  const sendSelectedUserInvites = useCallback(async (options: EmailInviteOptions = {}) => {
    const emails = state.selectedUsers.map(user => user.email);
    if (emails.length === 0) return;

    try {
      const results = await sendEmailInvites(emails, options);
      clearSelectedUsers();
      return results;
    } catch (error) {
      throw error;
    }
  }, [state.selectedUsers, sendEmailInvites, clearSelectedUsers]);

  const cancelInvite = useCallback(async (inviteId: number) => {
    try {
      await classInviteService.cancelInvite(classId, inviteId);
      
      // Refresh pending invites
      const pendingInvites = await classInviteService.getPendingInvites(classId);
      setState(prev => ({
        ...prev,
        pendingInvites,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to cancel invite',
      }));
      throw error;
    }
  }, [classId]);

  const resendInvite = useCallback(async (inviteId: number) => {
    try {
      await classInviteService.resendInvite(classId, inviteId);
      
      // Refresh pending invites
      const pendingInvites = await classInviteService.getPendingInvites(classId);
      setState(prev => ({
        ...prev,
        pendingInvites,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to resend invite',
      }));
      throw error;
    }
  }, [classId]);

  const refreshData = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
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
  };
}
