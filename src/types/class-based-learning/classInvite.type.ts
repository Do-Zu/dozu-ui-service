export interface InviteLink {
  token: string;
  inviteLink: string;
  expiresAt: Date;
  useLimit: number | null;
  usedCount: number;
}

export interface PendingInvite {
  inviteId: number;
  invitedEmail: string;
  invitedUserName?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

export interface InviteEmailResult {
  success: boolean;
  email: string;
  message: string;
}

export interface InviteEmailBatchResult {
  totalSent: number;
  totalFailed: number;
  results: InviteEmailResult[];
}

export interface UserSearchResult {
  userId: number;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isAlreadyInClass?: boolean;
}

export interface InviteLinkOptions {
  expiresInDays?: number;
  useLimit?: number;
}

export interface EmailInviteOptions {
  expiresInDays?: number;
  useLimit?: number;
  customMessage?: string;
}

export interface ClassInviteState {
  inviteLink: InviteLink | null;
  pendingInvites: PendingInvite[];
  searchResults: UserSearchResult[];
  selectedUsers: UserSearchResult[];
  loading: {
    generateLink: boolean;
    sendEmails: boolean;
    searchUsers: boolean;
    getPendingInvites: boolean;
  };
  error: string | null;
}
