export interface UserBasic {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  planType?: 'free' | 'pro' | null;
  planName?: string | null;
  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'pending' | 'suspended' | 'trialing' | null;
  currentPeriodEnd?: string | null;
}

export interface GetUsersQuery {
  role?: 'admin' | 'user';
  isActive?: boolean;
  isVerified?: boolean;
  hasCompletedOnboarding?: boolean;
  planType?: 'free' | 'pro';
}


