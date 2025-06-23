const googleRedirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
const googleClientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;

export const createGoogleAuthUrl = (redirectTo?: string | null): string => {
  const redirectUri = redirectTo
    ? `${googleRedirectUri}&redirect_path=${encodeURIComponent(redirectTo)}`
    : googleRedirectUri;

  const googleOAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.profile%20https://www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code
&client_id=${googleClientId}&redirect_uri=${redirectUri}`;

  return googleOAuthURL;
};
