export const ROUTES = {
  // Auth routes
  LOGIN: 'Login',
  SIGNUP: 'SignUp',
  VERIFY_EMAIL: 'VerifyEmail',
  FORGOT_PASSWORD: 'ForgotPassword',
  VERIFY_OTP: 'VerifyOtp',
  RESET_PASSWORD: 'ResetPassword',
  
  // Main tab routes
  SWIPE: 'Swipe',
  APPLICATIONS: 'Applications',
  PROFILE: 'Profile',
  
  // Stack routes
  MAIN: 'Main',
  JOB_DETAILS: 'JobDetails',
} as const;

export type RouteNames = typeof ROUTES[keyof typeof ROUTES];

