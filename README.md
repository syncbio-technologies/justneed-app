# Justneed Frontend

React Native (Expo) app for swipe-style job search and applications.

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm start      # Start Expo dev server
```

Then choose your platform:
- `a` - Android emulator
- `i` - iOS simulator
- `w` - Web browser

Common scripts: `npm run android`, `npm run ios`, `npm run web`, `npm run tunnel`.

## Configuration

### Environment (.env)

Copy `.env.example` to `.env` and set Google OAuth client IDs:
```
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
```
Web client redirect URIs to whitelist:
- `http://localhost:8081`
- `https://auth.expo.io/@karthick2302/justneed-app` (Expo proxy / native dev)

Restart `npm start` after editing `.env`.

### API Base URL

Update `src/config/api.ts` with your backend server IP:

```typescript
const getApiBase = () => {
  if (Platform.OS === 'web') {
    return 'http://<your-machine-ip>:3000';  // Change to your machine IP
  }
  return 'http://<your-machine-ip>:3000';    // Change to your machine IP
};
```

Replace `<your-machine-ip>` with your actual machine IP address (e.g., `192.168.0.18`).

## Project Structure

```
src/
├── screens/         # Screen components
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── SwipeScreen.tsx
│   ├── ApplicationsScreen.tsx
│   ├── PinnedScreen.tsx
│   ├── ProfileScreen.tsx
│   └── ...
├── components/      # Reusable components
│   ├── InputField.tsx
│   ├── PrimaryButton.tsx
│   ├── SwipeCard.tsx
│   └── ...
├── context/         # React Context
│   ├── AuthContext.tsx
│   └── FavoritesContext.tsx
├── services/        # API and external services
│   ├── firebaseService.ts
│   ├── jobService.ts
│   └── ...
├── config/          # Configuration
│   └── api.ts
├── constants/       # Constants and theme
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── ...
├── types/           # TypeScript definitions
│   └── index.ts
└── utils/           # Utility functions
    ├── formatDate.ts
    └── ...

assets/             # Images, fonts, icons
├── icon.png
├── splash-icon.png
└── ...
```

## File Uploads
- Resume & Cover Letter: PDF/DOC/DOCX, **max 100 KB** (blocked with inline warning).
- Profile photo: stored as base64; keep it small to avoid storage limits on web.
- Files are saved to the backend DB (no Cloudinary needed).

## Features
- Auth: Email/password + Google Sign-In.
- Swipe jobs with filters; view details; save and apply.
- Applications list with status updates.
- Profile with resume/cover upload and photo.
- Skill card preview.

## Navigation Structure

```
App
├── Auth Stack (if not logged in)
│   ├── LoginScreen
│   └── SignUpScreen
└── Main Stack (if logged in)
    ├── Tab Navigator
    │   ├── Swipe (Home)
    │   ├── Pinned (Favorites)
    │   ├── Applications
    │   └── Profile
    └── Modal Screens
        ├── JobDetailsScreen
        └── SkillCardScreen
```

## Authentication Flow

1. User enters email and password
2. Request sent to `/auth/login` endpoint
3. Backend validates credentials and returns JWT token
4. Token stored in AsyncStorage
5. User navigated to main app
6. Token included in all subsequent API requests

## State Management

### AuthContext
- Manages user authentication state
- Handles login/signup/logout
- Stores user profile data
- Manages JWT tokens

### FavoritesContext
- Manages saved/pinned jobs
- Persists favorites to AsyncStorage

## API Integration

- REST calls live in `src/services/jobService.ts` and other service files.
- Auth flows are handled in `src/context/AuthContext.tsx` using the base URL from `src/config/api.ts`.

## Troubleshooting

### Network Request Failed
- Verify backend is running on `http://localhost:3000`
- Check that `src/config/api.ts` has the correct machine IP
- Ensure frontend and backend are on the same network
- Try using `localhost` for web platform, machine IP for mobile

### Build Issues
- Clear cache: `npm start -- --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Emulator Issues
- Android: Ensure Android Studio and emulator are running
- iOS: Ensure Xcode is installed and simulator is running
- Web: Should work in any modern browser

## License

This project is licensed under the MIT License. See the LICENSE file for details.
