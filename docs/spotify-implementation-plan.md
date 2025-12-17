# Spotify Integration Implementation Plan

**Project:** spotdash-dbaf2
**Region:** europe-west1
**Scope:** Private single-user soundboard with Spotify playback

---

## Current State (Already Implemented)

### ✅ Phase 1 — Firebase Foundation (COMPLETE)

| Component     | Status | Details                                         |
| ------------- | ------ | ----------------------------------------------- |
| Firebase Auth | ✅     | Email/password authentication                   |
| Firestore     | ✅     | Initialized with security rules                 |
| RequireAuth   | ✅     | Route protection gate                           |
| Groups CRUD   | ✅     | `users/{uid}/groups/{groupId}`                  |
| Tracks CRUD   | ✅     | `users/{uid}/groups/{groupId}/tracks/{trackId}` |

### Current Data Models

**Group** (`src/features/groups/types.ts`):

```typescript
{
  id: string;
  name: string;
  color: GroupColor;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Track** (`src/features/groups/types.ts`):

```typescript
{
  id: string;
  label: string;
  color: TrackColor;
  order: number;
  createdAt: Timestamp;
}
```

### Current Firestore Rules

```
users/{userId} → read/write if auth.uid == userId
users/{userId}/groups/{groupId} → read/write if auth.uid == userId
users/{userId}/groups/{groupId}/tracks/{trackId} → read/write if auth.uid == userId
```

---

## Data Model Updates Required

### 1. Extend Track Type for Spotify

Update `src/features/groups/types.ts`:

```typescript
export type Track = {
  id: string;
  label: string; // Display name (can be track title or custom)
  color: TrackColor;
  order: number;
  createdAt: Timestamp;

  // Spotify fields (optional for backwards compatibility)
  spotifyTrackId?: string; // Spotify track URI/ID
  title?: string; // Original Spotify track title
  artists?: string[]; // Artist names
  albumImageUrl?: string; // Album art URL
  durationMs?: number; // Track duration
  origin?: {
    // How track was added
    type: "manual" | "playlist";
    playlistId?: string;
  };
};
```

### 2. Add User Document for Spotify Status

New document at `users/{uid}`:

```typescript
{
  settings?: {
    preferredDeviceId?: string;
    playbackMode?: "sdk" | "connect";
  };
  spotify?: {
    linked: boolean;
    linkedAt?: Timestamp;
    displayName?: string;
    premium?: boolean;
  };
}
```

### 3. Server-Only Token Storage (NEW)

Collection `spotifyTokens/{uid}` — **NO client access**:

```typescript
{
  refresh_token: string;
  access_token?: string;      // Optional cache
  expires_at?: Timestamp;
  scope?: string;
}
```

### 4. Updated Firestore Rules

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // User document + subcollections
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /groups/{groupId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        match /tracks/{trackId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }

    // Server-only token storage - NO client access
    match /spotifyTokens/{userId} {
      allow read, write: if false;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Phase 2 — Spotify OAuth (Cloud Functions)

### Prerequisites

**Environment Variables:**

Frontend (`.env.local`):

```
VITE_SPOTIFY_CLIENT_ID=<your-client-id>  ✅ Already configured
```

Cloud Functions Secret:

```
SPOTIFY_CLIENT_SECRET  ✅ Already configured via firebase functions:secrets:set
```

**Spotify Developer Dashboard:**

- Add Redirect URIs:
  - Local: `http://127.0.0.1:5001/spotdash-dbaf2/europe-west1/spotifyCallback`
  - Production: `https://europe-west1-spotdash-dbaf2.cloudfunctions.net/spotifyCallback`

### Required Cloud Function Endpoints

#### 2.1 `GET /spotify/login`

**Purpose:** Start OAuth flow with PKCE

**Input:**

- Firebase ID token (Authorization header)
- Optional `redirectBackUrl` query param

**Behavior:**

1. Verify Firebase ID token → extract uid
2. Generate `state` (random string bound to uid)
3. Generate PKCE `code_verifier` and `code_challenge`
4. Store state + verifier temporarily (Firestore or in-memory)
5. Redirect to Spotify authorize URL:
   ```
   https://accounts.spotify.com/authorize?
     client_id=...
     response_type=code
     redirect_uri=.../spotifyCallback
     state=...
     code_challenge=...
     code_challenge_method=S256
     scope=playlist-read-private user-read-playback-state user-modify-playback-state streaming
   ```

#### 2.2 `GET /spotify/callback`

**Purpose:** Handle Spotify redirect, exchange code for tokens

**Input:**

- `code` (from Spotify)
- `state` (to validate request)

**Behavior:**

1. Validate `state` belongs to a known uid
2. Retrieve `code_verifier` for this state
3. Exchange code for tokens:
   ```
   POST https://accounts.spotify.com/api/token
   grant_type=authorization_code
   code=...
   redirect_uri=...
   client_id=...
   code_verifier=...
   ```
4. Store `refresh_token` in `spotifyTokens/{uid}`
5. Call Spotify `GET /me` to get user info
6. Update `users/{uid}/spotify`:
   ```typescript
   {
     linked: true,
     linkedAt: serverTimestamp(),
     displayName: spotifyUser.display_name,
     premium: spotifyUser.product === "premium"
   }
   ```
7. Redirect to frontend with success/error status

#### 2.3 `POST /spotify/refresh`

**Purpose:** Return fresh access token to frontend

**Input:**

- Firebase ID token (Authorization header)

**Behavior:**

1. Verify Firebase ID token → extract uid
2. Retrieve `refresh_token` from `spotifyTokens/{uid}`
3. Call Spotify token endpoint:
   ```
   POST https://accounts.spotify.com/api/token
   grant_type=refresh_token
   refresh_token=...
   client_id=...
   ```
4. Optionally cache new `access_token` and `expires_at` in Firestore
5. Return `{ access_token, expires_in }` to client

### Spotify Proxy Endpoints (Recommended)

These simplify frontend code and handle token refresh automatically:

#### 2.4 `GET /spotify/me`

Returns current user's Spotify profile.

#### 2.5 `GET /spotify/playlists`

Returns user's playlists (paginated).

#### 2.6 `GET /spotify/playlistTracks?playlistId=...`

Returns tracks from a specific playlist.

#### 2.7 `GET /spotify/searchTracks?q=...`

Searches Spotify for tracks.

**All proxy endpoints:**

1. Verify Firebase ID token
2. Ensure valid access token (refresh if needed)
3. Call Spotify Web API
4. Return normalized data to frontend

### Spotify Scopes (MVP)

```
playlist-read-private
user-read-playback-state
user-modify-playback-state
streaming
```

---

## Phase 3 — Spotify Data Integration (Frontend)

### 3.1 Update Track Types

Extend existing types with Spotify fields (see Data Model Updates above).

### 3.2 Playlist Import Flow

**UI in Edit Mode:**

1. User clicks "Import from playlist" on a group
2. Show list of user's playlists (via `/spotify/playlists`)
3. User selects playlist
4. Fetch tracks (via `/spotify/playlistTracks`)
5. Write tracks to Firestore as Track documents:
   ```typescript
   {
     label: track.name,
     color: "blue", // default
     order: index,
     spotifyTrackId: track.id,
     title: track.name,
     artists: track.artists.map(a => a.name),
     albumImageUrl: track.album.images[0]?.url,
     durationMs: track.duration_ms,
     origin: { type: "playlist", playlistId }
   }
   ```

### 3.3 Manual Track Search Flow

**UI in Edit Mode:**

1. User clicks "Add track" on a group
2. Show search input
3. Search Spotify (via `/spotify/searchTracks`)
4. User selects track from results
5. Write single track to Firestore with `origin: { type: "manual" }`

---

## Phase 4 — Playback (Web Playback SDK)

### 4.1 Install SDK

Add to `index.html`:

```html
<script src="https://sdk.scdn.co/spotify-player.js"></script>
```

Or load dynamically in React.

### 4.2 Token Provider

Create a function that:

1. Checks if current access token is valid
2. If expired, calls `/spotify/refresh`
3. Returns valid access token

### 4.3 Initialize Player

```typescript
const player = new Spotify.Player({
  name: "Spotdash Player",
  getOAuthToken: async (cb) => {
    const token = await getValidAccessToken();
    cb(token);
  },
  volume: 0.5,
});

player.addListener("ready", ({ device_id }) => {
  // Store device_id for playback
  setPreferredDeviceId(device_id);
});

player.connect();
```

### 4.4 Play Track on Cell Click

```typescript
const playTrack = async (spotifyTrackId: string) => {
  const token = await getValidAccessToken();
  const deviceId = getPreferredDeviceId();

  await fetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [`spotify:track:${spotifyTrackId}`],
      }),
    }
  );
};
```

### 4.5 Device Status Indicator

Show in UI:

- ✅ "Player ready" — SDK connected
- ⚠️ "No device" — Need to initialize or select device
- ❌ "Premium required" — User needs Spotify Premium

---

## Phase 5 — Match Mode Hardening

### 5.1 UI Changes

- Lock all edit functionality
- Large, touch-friendly track buttons
- Minimal distractions

### 5.2 Device Status

- Always visible indicator
- Auto-reconnect on disconnect

### 5.3 Error Handling

| Error            | Action                                     |
| ---------------- | ------------------------------------------ |
| 401 Unauthorized | Refresh token, retry once                  |
| 403 Forbidden    | Show "Premium required" or "Missing scope" |
| 429 Rate Limited | Exponential backoff with Retry-After       |
| No device        | Show "Initialize player" prompt            |
| Network error    | Show "Try again" toast                     |

---

## Implementation Checklist

### Phase 2 — Spotify OAuth

- [ ] Initialize Firebase Functions in project
- [x] Set up SPOTIFY_CLIENT_SECRET as secret ✅
- [ ] Implement `spotifyLogin` function
- [ ] Implement `spotifyCallback` function
- [ ] Implement `spotifyRefresh` function
- [ ] Update Firestore rules for `spotifyTokens`
- [ ] Add Redirect URIs to Spotify Developer Dashboard
- [ ] Frontend: "Connect Spotify" button
- [ ] Frontend: Display linked status + displayName
- [ ] Dev diagnostics panel (uid, linked, test refresh)

### Phase 3 — Spotify Data

- [ ] Implement proxy endpoints (playlists, playlistTracks, searchTracks)
- [ ] Update Track type with Spotify fields
- [ ] UI: Import from playlist dialog
- [ ] UI: Search and add track dialog
- [ ] Write imported tracks to Firestore

### Phase 4 — Playback

- [ ] Add Spotify Web Playback SDK
- [ ] Implement token provider
- [ ] Initialize player on app load
- [ ] Store preferred device ID
- [ ] Cell click → play track
- [ ] Pause functionality
- [ ] Device ready indicator

### Phase 5 — Match Mode

- [ ] Edit/Match mode toggle
- [ ] Lock edits in Match mode
- [ ] Large button UI
- [ ] Error handling (401/403/429)
- [ ] "No device" handling

---

## Definition of Done (MVP)

### A) Connect

- [ ] User clicks "Connect Spotify" → completes OAuth → sees displayName

### B) Groups

- [ ] User creates group "Mål" in dashboard (already works)

### C) Playlist Import

- [ ] User imports playlist into group → sees track cells with Spotify data

### D) Manual Add

- [ ] User searches track → adds to group → sees new cell

### E) Playback

- [ ] Web Playback SDK initializes → device ready indicator shows
- [ ] Clicking any cell plays that track immediately
- [ ] Pause works

### F) Errors

- [ ] Clear actionable errors for: Premium required, Player not ready, Reconnect needed

---

## File Structure (New/Modified)

```
functions/
├── src/
│   ├── index.ts              # Export all functions
│   ├── spotify/
│   │   ├── login.ts          # OAuth start
│   │   ├── callback.ts       # OAuth callback
│   │   ├── refresh.ts        # Token refresh
│   │   ├── playlists.ts      # Proxy: get playlists
│   │   ├── playlistTracks.ts # Proxy: get playlist tracks
│   │   └── searchTracks.ts   # Proxy: search
│   └── utils/
│       ├── auth.ts           # Firebase auth verification
│       └── spotify-api.ts    # Spotify API helpers
├── package.json
└── tsconfig.json

src/
├── features/
│   ├── spotify/
│   │   ├── spotifyService.ts    # Frontend API calls
│   │   ├── useSpotifyAuth.ts    # Auth hook
│   │   ├── useSpotifyPlayer.ts  # Playback SDK hook
│   │   └── types.ts             # Spotify types
│   └── groups/
│       └── types.ts             # Updated Track type
├── components/
│   ├── SpotifyConnectButton.tsx
│   ├── ImportPlaylistDialog.tsx
│   ├── SearchTrackDialog.tsx
│   └── PlayerStatus.tsx
```

---

## Local Development Setup

### 1. Start Firebase Emulators

```bash
cd functions
npm install
firebase emulators:start --only functions,firestore
```

### 2. Set Local Environment

Functions will use emulator URLs automatically when `FUNCTIONS_EMULATOR=true`.

### 3. Spotify Redirect URI for Local Dev

Add to Spotify Developer Dashboard:

```
http://127.0.0.1:5001/spotdash-dbaf2/europe-west1/spotifyCallback
```

### 4. Test OAuth Flow

1. Start dev server: `npm run dev`
2. Start emulators: `firebase emulators:start`
3. Click "Connect Spotify" in app
4. Complete OAuth
5. Verify `users/{uid}/spotify.linked = true` in Firestore emulator

---

## Manual Steps

Actions that require elevated permissions or manual intervention should be documented in `manual-steps.md` for the developer to execute afterwards. Examples:

- Firebase deploy commands
- Spotify Developer Dashboard configuration
- Environment variable setup
- Security rules deployment
- Any command that fails due to authentication/permissions

The AI assistant will create/update `manual-steps.md` with clear instructions when such steps are encountered.

---

## Notes

- **Premium Requirement:** Web Playback SDK requires Spotify Premium. Detect and show clear message.
- **Token Security:** Never expose `refresh_token` to client. Only Cloud Functions access `spotifyTokens` collection.
- **Rate Limits:** Spotify has rate limits. Cache playlist/track data in Firestore when possible.
- **PKCE:** Use Authorization Code with PKCE flow (no client secret needed for token exchange from client, but we use Functions anyway for security).
