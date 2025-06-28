export interface UserBasic {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
}

export interface GetUsersQuery {
  role?: 'admin' | 'user';
  isActive?: boolean;
  isVerified?: boolean;
  hasCompletedOnboarding?: boolean;
}


