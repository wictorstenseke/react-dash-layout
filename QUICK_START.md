# Quick Start Guide - Spotify Integration

## For Local Development (Right Now)

You need to run Firebase emulators so your app can connect to the Spotify functions locally.

### Step 1: Install Functions Dependencies

```bash
cd functions
npm install
cd ..
```

### Step 2: Build Functions

The functions need to be compiled from TypeScript to JavaScript before running:

```bash
cd functions
npm run build
cd ..
```

This creates the `functions/lib/` directory with compiled JavaScript files.

### Step 3: Set Up Environment Variables

Create `functions/.env` file:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
FUNCTIONS_EMULATOR=true
FRONTEND_URL=http://localhost:5173
```

### Step 4: Start Firebase Emulators

In a **separate terminal**, run:

```bash
firebase emulators:start --only auth,functions,firestore
```

This will start:

- Auth emulator at `http://127.0.0.1:9099`
- Functions emulator at `http://127.0.0.1:5001`
- Firestore emulator at `http://127.0.0.1:8080`
- Emulator UI at `http://localhost:4000`

### Step 5: Keep Emulators Running

**Keep this terminal open** - the emulators need to stay running while you develop.

### Step 6: Start Your Dev Server

In another terminal:

```bash
npm run dev
```

Now when you click "Connect Spotify", it will connect to the local emulators!

### Step 7: Create a Test Account

Since you're using the Auth emulator, you need to create an account:

**Option 1: Sign up through the app (Recommended)**

1. Go to `http://localhost:5173/login`
2. Click "Sign up" (or "Don't have an account? Sign up")
3. Enter an email and password (min 6 characters)
4. Click "Create Account"
5. You'll be automatically signed in!

**Option 2: Use Emulator UI**

1. Open `http://localhost:4000` (Emulator UI)
2. Go to the "Authentication" tab
3. Click "Add user"
4. Enter email and password
5. Click "Add"

**Note:** Accounts in the emulator are temporary and reset when you stop the emulators.

---

## For Production Deployment

When you're ready to deploy:

### 1. Deploy Functions

```bash
firebase deploy --only functions
```

### 2. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Make Sure Spotify Redirect URIs Are Set

In your Spotify Developer Dashboard, add:

```
https://europe-west1-spotdash-dbaf2.cloudfunctions.net/spotifyCallback
```

---

## Troubleshooting

### "Failed to fetch" or Network Error

- ✅ Make sure Firebase emulators are running (`firebase emulators:start --only auth,functions,firestore`)
- ✅ Check that emulators are on ports 9099 (auth), 5001 (functions), and 8080 (firestore)
- ✅ Verify `functions/.env` has `FUNCTIONS_EMULATOR=true`

### "401 Unauthorized" Errors

- ✅ **Make sure Auth emulator is running**: Include `auth` in your emulator start command
- ✅ Restart your dev server after starting emulators (to connect to Auth emulator)
- ✅ Verify you're logged in (check browser console for auth state)

### "Functions not found" or "lib/index.js does not exist" Error

- ✅ **Build the functions first**: `cd functions && npm run build`
- ✅ Make sure you're in the project root when running `firebase emulators:start`
- ✅ Check that `functions/lib/index.js` exists after building
- ✅ If you change function code, rebuild: `cd functions && npm run build`

### OAuth Redirect Issues

- ✅ For local dev, make sure this URI is in Spotify Dashboard:
  ```
  http://127.0.0.1:5001/spotdash-dbaf2/europe-west1/spotifyCallback
  ```
- ✅ For production, add:
  ```
  https://europe-west1-spotdash-dbaf2.cloudfunctions.net/spotifyCallback
  ```

---

## Quick Commands Reference

```bash
# Start emulators (local dev)
firebase emulators:start --only functions,firestore

# Deploy functions (production)
firebase deploy --only functions

# View function logs
firebase functions:log

# Check if secrets are set
firebase functions:secrets:access SPOTIFY_CLIENT_SECRET
```
