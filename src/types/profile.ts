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

export interface IAchievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface IGamificationStats {
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    experiencePoints: number;
    nextLevelExperience: number;
    achievements: IAchievement[];
    weeklyActivity: number[];
    totalLessonsCompleted: number;
    totalQuizzesCompleted: number;
    totalFlashcardsReviewed: number;
    averageScore: number;
}

export interface IUserProfile {
    userId: number;
    username: string;
    fullName: string | null;
    email: string;
    avatarUrl: string;
    bio?: string | null;
    location?: string | null;
    university?: string | null;
    major?: string | null;
    enrolledAt: string;
    
    // Gamification stats
    gamificationStats?: IGamificationStats;
}