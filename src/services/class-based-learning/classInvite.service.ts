import { 
  InviteLink, 
  PendingInvite, 
  InviteEmailResult, 
  InviteEmailBatchResult,
  UserSearchResult, 
  InviteLinkOptions, 
  EmailInviteOptions 
} from '@/types/class-based-learning/classInvite.type';
import { deleteRequest, getRequest, postRequest, putRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';

class ClassInviteService {

  /**
   * Generate invite link for a class
   */
  async generateInviteLink(
    classId: number, 
    options: InviteLinkOptions = {}
  ): Promise<InviteLink> {
    const { expiresInDays = 7, useLimit = 10 } = options;
    
    const response = await postRequest<{ expiresInDays: number; useLimit: number }, InviteLink>(
      `/classes/teacher/${classId}/invites/generate-link`,
      {
        expiresInDays,
        useLimit,
      }
    );
    
    if (response.status !== 'success' && response.status !== 'created') {
      throw new Error(response.message);
    }
    return response.data;
  }

  /**
   * Regenerate invite link for a class
   */
  async regenerateInviteLink(
    classId: number, 
    options: InviteLinkOptions = {}
  ): Promise<InviteLink> {
    const { expiresInDays = 7, useLimit = 10 } = options;
    
    const response = await postRequest<{ expiresInDays: number; useLimit: number }, InviteLink>(
      `/classes/teacher/${classId}/invites/regenerate`,
      {
        expiresInDays,
        useLimit,
      }
    );
    
    if (response.status !== 'success' && response.status !== 'created') {
      throw new Error(response.message);
    }
    return response.data;
  }

  /**
   * Send email invitations to multiple users
   */
  async inviteByEmail(
    classId: number, 
    emails: string[], 
    options: EmailInviteOptions = {}
  ): Promise<InviteEmailBatchResult> {
    const { expiresInDays = 7, useLimit = 1, customMessage } = options;
    
    const response = await postRequest<{ emails: string[]; expiresInDays: number; useLimit: number; customMessage?: string }, InviteEmailBatchResult>(
      `/classes/teacher/${classId}/invites/email`,
      {
        emails,
        expiresInDays,
        useLimit,
        customMessage,
      }
    );
    
    if (response.status !== 'success' && response.status !== 'created') {
      throw new Error(response.message);
    }
    return response.data;
  }

  /**
   * Search users to invite (exclude users already in class)
   */
  async searchUsersToInvite(
    query: string, 
    classId: number
  ): Promise<UserSearchResult[]> {
    if (!query.trim()) return [];
    
    const response = await getRequest<void, UserSearchResult[]>(
      `/class-invites/search-users?q=${encodeURIComponent(query)}&classId=${classId}`
    );
    
    if (response.status !== 'success') {
      throw new Error(response.message);
    }
    return response.data;
  }


  /**
   * Cancel a pending invitation
   */
  async cancelInvite(classId: number, inviteId: number): Promise<void> {
    const response = await deleteRequest<void, ApiResponse<void>>(
      `/classes/teacher/${classId}/invites/${inviteId}`
    );
    
    if (response.status !== 'success') {
      throw new Error(response.message);
    }
  }

  /**
   * Resend an invitation
   */
  async resendInvite(classId: number, inviteId: number): Promise<void> {
    const response = await postRequest<{}, void>(
      `/classes/teacher/${classId}/invites/${inviteId}/resend`,
      {}
    );
    
    if (response.status !== 'success' && response.status !== 'created') {
      throw new Error(response.message);
    }
  }

}

export const classInviteService = new ClassInviteService();
