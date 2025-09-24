// dozu-ui-service/src/app/[locale]/stats/components/mockData.ts

// Mock data for the main dashboard overview
export const dashboardMockData = {
  totalStudyHours: 27.1,
  averageDailyStudy: 3.9,
  completedTopics: 84, // "Completed Items" from the image
  weeklyComparison: {
    percentageChange: 12, // "+12% from previous week"
  },
  dailyStudyHours: [
    { day: 'Sun', hours: 4.5, date: '2025-06-15' },
    { day: 'Mon', hours: 3.2, date: '2025-06-16' },
    { day: 'Tue', hours: 5.0, date: '2025-06-17' },
    { day: 'Wed', hours: 2.8, date: '2025-06-18' },
    { day: 'Thu', hours: 6.1, date: '2025-06-19' },
    { day: 'Fri', hours: 3.5, date: '2025-06-20' },
    { day: 'Sat', hours: 2.0, date: '2025-06-21' },
  ],
};

// Mock data for the learning methods distribution chart
export const learningMethodsMockData = [
  { method: 'Flashcards', percentage: 40 },
  { method: 'Quizzes', percentage: 30 },
  { method: 'Notes', percentage: 20 },
  { method: 'Videos', percentage: 10 },
];

// Mock data for the detailed progress statistics card
export const progressStatisticsMockData = {
  totalContents: 120,
  completedContents: 84,
  inProgressContents: 25,
  notStartedContents: 11,
  averageCompletionPercentage: (84 / 120) * 100,
  averageScore: 88.5,
  totalTimeSpent: 27.1 * 3600, // 27.1 hours in seconds
  lastActiveAt: new Date('2025-06-21T18:00:00Z').toISOString(),
};

// Mock data for the weekly comparison card
export const weeklyComparisonMockData = {
    totalStudyHours: 27.1,
    percentageChange: 12,
};
