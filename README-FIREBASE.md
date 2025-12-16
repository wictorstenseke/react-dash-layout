# Firebase Setup Guide

This project uses Firebase for authentication and data storage. This guide will help you set up and configure Firebase for local development and deployment.

## Prerequisites

- Firebase account at [https://firebase.google.com](https://firebase.google.com)
- Node.js and npm installed
- Firebase CLI (optional, for deploying security rules)

## Project Configuration

**Firebase Project:** `spotdash-dbaf2`
**Firestore Region:** `europe-west1` (Belgium)
**Web App:** SpotDash Web App

## Initial Setup

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Firebase configuration values:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select project: `spotdash-dbaf2`
   - Go to **Project Settings** (gear icon) > **Your apps**
   - Select the web app: "SpotDash Web App"
   - Copy the config values to `.env.local`

3. Your `.env.local` should look like:

   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=spotdash-dbaf2.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=spotdash-dbaf2
   VITE_FIREBASE_STORAGE_BUCKET=spotdash-dbaf2.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=21180593862
   VITE_FIREBASE_APP_ID=1:21180593862:web:...
   ```

   **Note:** The actual values from MCP setup:
   - API Key: `AIzaSyDOHT1cIZfODBG9fnm7YQ9iV6wYv3fI4ZM`
   - Auth Domain: `spotdash-dbaf2.firebaseapp.com`
   - Project ID: `spotdash-dbaf2`
   - Storage Bucket: `spotdash-dbaf2.firebasestorage.app`
   - Messaging Sender ID: `21180593862`
   - App ID: `1:21180593862:web:0985dcab951792fbfe49c7`

### 3. Deploy Firestore Security Rules

The security rules are defined in `firestore.rules` and ensure users can only access their own data.

#### Option A: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `spotdash-dbaf2`
3. Navigate to **Firestore Database** > **Rules**
4. Copy the contents of `firestore.rules` and paste into the editor
5. Click **Publish**

#### Option B: Using Firebase CLI

1. Install Firebase CLI (if not already installed):

   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:

   ```bash
   firebase login
   ```

3. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Project Structure

```
src/
├── lib/
│   └── firebase.ts              # Firebase initialization (singleton)
├── features/
│   ├── auth/
│   │   ├── types.ts             # Auth TypeScript types
│   │   ├── authService.ts       # Auth functions (sign up, sign in, etc.)
│   │   └── AuthProvider.tsx     # React context for auth state
│   └── groups/
│       ├── types.ts             # Group TypeScript types
│       └── groupsRepo.ts        # Firestore CRUD operations
└── components/
    └── DevAuthProbe.tsx         # Dev-only auth testing component
```

## Firebase Services Used

### Authentication

Email/Password authentication is enabled in the Firebase console.

**Service Layer:** `src/features/auth/authService.ts`

Available functions:

- `signUpEmailPassword(email, password)` - Register new user
- `signInEmailPassword(email, password)` - Sign in existing user
- `sendPasswordReset(email)` - Send password reset email
- `signOutUser()` - Sign out current user
- `onAuthStateChangedListener(callback)` - Subscribe to auth state changes

**React Integration:** `src/features/auth/AuthProvider.tsx`

Use the `useAuth()` hook in any component:

```tsx
import { useAuth } from "@/features/auth/AuthProvider";

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;

  return <div>Welcome, {user.email}</div>;
}
```

### Firestore Database

**Data Structure:**

```
users/{uid}/
  └── groups/{groupId}
      ├── name: string
      ├── order: number
      ├── createdAt: Timestamp
      └── updatedAt: Timestamp
```

**Repository:** `src/features/groups/groupsRepo.ts`

Available functions:

- `createGroup(uid, { name, order })` - Create a new group
- `listGroups(uid)` - List all groups (ordered by `order` field)
- `updateGroup(uid, groupId, patch)` - Update group fields
- `deleteGroup(uid, groupId)` - Delete a group

Example usage:

```tsx
import { createGroup, listGroups } from "@/features/groups/groupsRepo";
import { useAuth } from "@/features/auth/AuthProvider";

function GroupsManager() {
  const { user } = useAuth();

  async function addGroup() {
    if (!user) return;

    const group = await createGroup(user.uid, {
      name: "My Group",
      order: 0,
    });
    console.log("Created:", group);
  }

  async function loadGroups() {
    if (!user) return;

    const groups = await listGroups(user.uid);
    console.log("Groups:", groups);
  }

  // ...
}
```

## Development Testing

### Dev Auth Probe

In development mode, a debug panel appears in the bottom-right corner showing:

- Current auth state (user email or "Not signed in")
- Groups count from Firestore
- Any errors reading from Firestore

This component (`DevAuthProbe`) only renders in development and is automatically removed in production builds.

### Testing Authentication

You can test auth functions in the browser console:

```javascript
import {
  signUpEmailPassword,
  signInEmailPassword,
  signOutUser,
} from "./src/features/auth/authService";

// Sign up
const result = await signUpEmailPassword("test@example.com", "password123");
console.log(result);

// Sign in
const result = await signInEmailPassword("test@example.com", "password123");
console.log(result);

// Sign out
await signOutUser();
```

### Testing Firestore

```javascript
import { createGroup, listGroups } from "./src/features/groups/groupsRepo";

// Get current user UID from auth state
const uid = "your-user-uid";

// Create a test group
await createGroup(uid, { name: "Test Group", order: 1 });

// List groups
const groups = await listGroups(uid);
console.log(groups);
```

## Security

### Environment Variables

- **Never commit `.env.local`** to version control (already in `.gitignore`)
- Keep your API keys private
- `.env.local.example` is committed as a template with placeholder values

### Firestore Security Rules

The security rules ensure:

- Users must be authenticated to access any data
- Users can only read/write their own data under `/users/{uid}/`
- All other paths are denied by default

Current rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /groups/{groupId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Running the Application

1. Ensure `.env.local` is configured
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser to the displayed URL (typically `http://localhost:5173`)
4. Check the DevAuthProbe in the bottom-right corner for auth state

## Troubleshooting

### "Firebase configuration is incomplete"

**Cause:** Missing or invalid environment variables in `.env.local`

**Solution:**

1. Verify `.env.local` exists and has all required variables
2. Restart the dev server after updating `.env.local`

### "Permission denied" in Firestore

**Cause:** Security rules not deployed or user not authenticated

**Solution:**

1. Deploy security rules (see section above)
2. Ensure user is signed in before accessing Firestore
3. Verify you're accessing data under `/users/{your-uid}/`

### Auth errors

Common error codes:

- `auth/email-already-in-use` - Email is already registered
- `auth/invalid-email` - Email format is invalid
- `auth/weak-password` - Password is less than 6 characters
- `auth/user-not-found` - No account with this email
- `auth/wrong-password` - Incorrect password
- `auth/invalid-credential` - Invalid email or password

All errors are automatically mapped to user-friendly messages in `authService.ts`.

## Production Deployment

1. Ensure all environment variables are set in your hosting platform
2. Build the application:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder to your hosting service
4. Verify Firestore security rules are deployed

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com)
- [Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)

## Support

For issues specific to this implementation, check:

1. Browser console for error messages
2. DevAuthProbe status in development mode
3. Firebase Console for auth and Firestore activity logs
