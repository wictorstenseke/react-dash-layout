# Manual Setup Steps for Spotify Integration

This document contains manual steps that require elevated permissions or external configuration that the AI assistant cannot perform automatically.

## 1. Firebase Functions Setup

### Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### Install Functions Dependencies
```bash
cd functions
npm install
```

### Set Spotify Client Secret as Firebase Secret
```bash
firebase functions:secrets:set SPOTIFY_CLIENT_SECRET
# When prompted, enter your Spotify Client Secret from the Spotify Developer Dashboard
```

### Set Environment Variables for Functions
Create `functions/.env` file for local development:
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
FUNCTIONS_EMULATOR=true
FRONTEND_URL=http://localhost:5173
```

For production, set these as environment variables:
```bash
firebase functions:config:set spotify.client_id="your_spotify_client_id"
```

## 2. Spotify Developer Dashboard Configuration

### Create Spotify App
1. Go to https://developer.spotify.com/dashboard
2. Click "Create app"
3. Fill in:
   - App name: "Spotdash"
   - App description: "Private soundboard with Spotify playback"
   - Redirect URIs: (see below)
   - APIs used: "Web API" and "Web Playback SDK"
4. Save the app

### Add Redirect URIs
In your Spotify app settings, add these Redirect URIs:

**Local Development:**
```
http://127.0.0.1:5001/spotdash-dbaf2/europe-west1/spotifyCallback
```

**Production:**
```
https://europe-west1-spotdash-dbaf2.cloudfunctions.net/spotifyCallback
```

### Get Credentials
1. In your Spotify app dashboard, note your:
   - **Client ID** → Add to `.env.local` as `VITE_SPOTIFY_CLIENT_ID`
   - **Client Secret** → Set as Firebase secret (see step 1 above)

## 3. Update Firestore Rules

Deploy the updated Firestore rules:
```bash
firebase deploy --only firestore:rules
```

## 4. Deploy Cloud Functions

### Build Functions
```bash
cd functions
npm run build
```

### Deploy to Firebase
```bash
firebase deploy --only functions
```

This will deploy all Spotify integration functions:
- `spotifyLogin`
- `spotifyCallback`
- `spotifyRefresh`
- `spotifyPlaylists`
- `spotifyPlaylistTracks`
- `spotifySearchTracks`

## 5. Frontend Environment Variables

Create/update `.env.local` in the project root:
```
# Firebase Configuration (existing)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=spotdash-dbaf2
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Spotify Integration (new)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
```

## 6. Test Local Development

### Start Firebase Emulators
```bash
# From project root
firebase emulators:start --only functions,firestore
```

The emulators will run at:
- Functions: http://127.0.0.1:5001
- Firestore: http://127.0.0.1:8080

### Start Frontend Dev Server
```bash
# From project root
npm run dev
```

### Test OAuth Flow
1. Navigate to http://localhost:5173
2. Log in with Firebase Auth
3. Click "Connect Spotify" button (once implemented)
4. Complete OAuth flow
5. Verify `users/{uid}/spotify.linked = true` in Firestore emulator UI

## 7. Production Deployment

### Deploy Everything
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy functions
firebase deploy --only functions

# Build and deploy frontend (if using Firebase Hosting)
npm run build
firebase deploy --only hosting
```

## 8. Verify Deployment

After deployment, verify:
1. All functions are deployed and accessible
2. Firestore rules are updated
3. OAuth flow works in production
4. Redirect URIs match production URLs

## Troubleshooting

### Functions Deployment Issues
- Ensure Node.js version matches `engines.node` in `functions/package.json` (Node 20)
- Check that all secrets are set: `firebase functions:secrets:access SPOTIFY_CLIENT_SECRET`
- View function logs: `firebase functions:log`

### OAuth Flow Issues
- Verify redirect URIs exactly match in Spotify Dashboard (including protocol, port, path)
- Check that SPOTIFY_CLIENT_ID is set correctly in both frontend and functions
- Ensure SPOTIFY_CLIENT_SECRET is set as a Firebase secret

### Token Refresh Issues
- Verify the `spotifyTokens` collection has proper security rules (no client access)
- Check that refresh tokens are being stored correctly in Firestore
- Review function logs for token refresh errors

## Security Checklist

- [ ] SPOTIFY_CLIENT_SECRET is stored as a Firebase secret (not in code)
- [ ] spotifyTokens collection has `allow read, write: if false` rule
- [ ] Redirect URIs are exact matches (no wildcards)
- [ ] Frontend only receives access tokens (never refresh tokens)
- [ ] All API requests verify Firebase Auth token
