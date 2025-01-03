const appConfig = {
  appName: 'dozu',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  defaultLocale: 'en',
  supportedLocales: ['en', 'vn', 'us'],
  theme: {
    primaryColor: '#0070f3',
    secondaryColor: '#f5f5f5',
  },
};

export default appConfig;
