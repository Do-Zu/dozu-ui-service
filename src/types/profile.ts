export interface ProfileData {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  location: string;
  bio: string;
  joinDate: string;
  avatar: string;
  university: string;
  major: string;
  notificationSettings?: NotificationSettings;
  privacySettings?: PrivacySettings;
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ShowPassword {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

export interface NotificationSettings {
  dailyReminders: boolean;
  weeklyReports: boolean;
  achievementNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface PrivacySettings {
  showProfile: boolean;
  showProgress: boolean;
  showAchievements: boolean;
  allowMessages: boolean;
}
