export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  isNewUser?: boolean;
  hasCompletedOnboarding?: boolean;
  onboardingStep?: number;
  createdAt?: string;
  lastLoginAt?: string;
  accessToken?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  hasCompletedOnboarding: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  isNewUser: boolean;
}

export type UserType = 'guest' | 'new_user' | 'returning_user' | 'onboarded_user';

export interface RedirectConfig {
  guest: string;
  new_user: string;
  returning_user: string;
  onboarded_user: string;
}
