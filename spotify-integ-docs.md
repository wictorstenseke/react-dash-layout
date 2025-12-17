# Spotify Integration + Firebase + Cloud Functions

**Scope:** Private single-user soundboard. No publishing/sharing of playlists.

---

## 0. User Scenarios (Must Be Supported)

### Scenario A — "Goal" Group with Playlist Import

1. User creates a group on the dashboard named "Mål" (Goal).
2. User selects "Add from Spotify playlist".
3. User searches or browses their Spotify playlists.
4. User picks one playlist and imports tracks into the "Mål" group.
5. The group now shows track "cells" (buttons).
6. During a match, user clicks a cell on the dashboard → the track starts immediately.

### Scenario B — "Goal" Group with Manual Track Picking

1. User creates a group named "Mål".
2. User selects "Add track".
3. User searches Spotify for a track (typeahead + results).
4. User selects a track → it becomes a cell in the "Mål" group.
5. User clicks the cell in Match mode → the track starts immediately.

### Scenario C — Mixed Content & Fast Playback

- A group can contain tracks imported from playlists + manually added tracks.
- Playback is always triggered from the dashboard cells (soundboard behavior).

### Key UX Principles

- **Edit mode:** Safe management (create/import/reorder)
- **Match mode:** Locked, fast, minimal actions (play now)

---

## 1. Preconditions / Config

### Spotify Developer Dashboard

- Create Spotify App => Client ID (Client Secret optional depending on flow)
- Add Redirect URIs (exact match) for:
  - Local dev: Cloud Functions emulator or local server callback
  - Production: deployed Functions callback URL + allowed front-end return URL(s)

### Premium Requirement

- Playback control + Web Playback SDK require Spotify Premium.
- App must detect and show a clear actionable message when Premium is required.

---

## 2. Architecture Decisions (Recommended)

### Auth Flow

- Use Authorization Code + PKCE (Spotify-recommended for web/SPA).
- Store refresh token server-side for safety and consistent sessions.

### Where Logic Lives

**Frontend (Vite/React):**

- Groups + cells CRUD (Firestore)
- UI for connecting Spotify, importing playlists, searching tracks
- Playback UI (player ready / select device)

**Cloud Functions:**

- Spotify OAuth endpoints (login/callback/refresh)
- Secure refresh-token storage + access-token minting
- Optional proxy for Spotify Web API requests (recommended for robustness)

### Playback Strategy

**Primary (recommended MVP):** Web Playback SDK

- Creates a browser-based Spotify Connect device, enables "play inside app"

**Fallback:** Spotify Connect external device selection

- If SDK not available/ready, allow user to pick an active device

---

## 3. Firestore Data Model (Minimal + Clean)

### Client-Owned App State

```
users/{uid}
  - settings: { preferredDeviceId?, playbackMode? }
  - spotify: { linked: boolean, linkedAt?, displayName?, premium? }
```

### Groups

```
users/{uid}/groups/{groupId}
  - name: string
  - order: number
  - source: { type: "manual" | "playlist", playlistId?, snapshotAt? }
```

### Cells

```
users/{uid}/groups/{groupId}/cells/{cellId}
  - trackId: string
  - title: string
  - artists: string[]
  - imageUrl?: string
  - durationMs: number
  - order: number
  - addedAt: timestamp
  - origin?: { type: "playlist" | "manual", playlistId? } (optional, helpful later)
```

### Server-Only Token Storage (NOT Client-Readable)

```
spotifyTokens/{uid}
  - refresh_token: string
  - access_token?: string (optional cache)
  - expires_at?: timestamp
  - scope?: string
```

### Security Requirements

- `users` data: readable/writable only by that uid
- `spotifyTokens`: no client read/write, only Functions service account

---

## 4. Cloud Functions — Required Endpoints

All endpoints must verify Firebase identity (ID token) before mapping to uid.

### (1) GET /spotify/login

**Purpose:** Start OAuth

**Inputs:**

- Firebase ID token (Authorization header) OR session cookie
- optional `redirectBackUrl`

**Behavior:**

- Generate state + PKCE challenge, bind to uid
- Redirect to Spotify authorize URL with scopes + state + code_challenge

### (2) GET /spotify/callback

**Purpose:** Handle redirect from Spotify

**Inputs:** `code`, `state`

**Behavior:**

- Validate state belongs to uid, validate PKCE verifier
- Exchange code => access_token + refresh_token + expires_in
- Store refresh_token in `spotifyTokens/{uid}`
- Call GET /me:
  - store displayName in `users/{uid}/spotify`
  - check product/premium if available via /me and store premium flag
- Mark `users/{uid}/spotify.linked = true`

**Redirect:**

- back to frontend (success/failure)

### (3) POST /spotify/refresh

**Purpose:** Return a fresh access token

**Inputs:**

- Firebase ID token

**Behavior:**

- Use refresh_token => new access token
- store expires_at (and optionally cache access token)

**Output:**

- `access_token`, `expires_at`

### Recommended "Proxy" Endpoints

(Reduces frontend complexity + rate-limit control)

- **(4) GET /spotify/me**
- **(5) GET /spotify/playlists**
- **(6) GET /spotify/playlistTracks?playlistId=...**
- **(7) GET /spotify/searchTracks?q=...**

Each proxy endpoint:

- Verifies uid
- Ensures valid access token (refresh if needed)
- Calls Spotify Web API
- Returns normalized data to frontend

---

## 5. Spotify Scopes (MVP Set)

### Minimum for Your Scenarios

- `playlist-read-private` (playlist browsing + import)
- `user-read-playback-state` (device status)
- `user-modify-playback-state` (play/pause/seek/volume)
- `streaming` (required for Web Playback SDK)

### Optional

- `playlist-read-collaborative`
- `user-read-currently-playing`

---

## 6. Frontend Features (Implement in This Order)

### Phase 1 — Foundation (Firebase)

- Firebase Auth wired (even with placeholder UI)
- Firestore initialized
- Rules enforced
- RequireAuth routing gate
- Basic group CRUD to Firestore (create "Mål", reorder, delete)

### Phase 2 — Spotify Linking (No Playlists Yet)

- "Connect Spotify" button
- End-to-end OAuth via Functions:
  - login -> callback -> linked flag set
- Show "Spotify connected" status + displayName
- Add a dev diagnostics panel:
  - uid
  - spotify linked true/false
  - token refresh test button (calls `/spotify/refresh`)

### Phase 3 — Spotify Data (Playlists + Search) into Groups

#### Playlist Import (Scenario A)

- UI in Edit mode for a selected group:
  - "Import from playlist"
  - list playlists (GET `/spotify/playlists`)
  - pick playlist -> fetch tracks -> write cells to Firestore
- Define MVP import rule:
  - Replace all cells in the group with imported snapshot

#### Manual Track Add (Scenario B)

- "Add track" search input
- Search endpoint (GET `/spotify/searchTracks?q=...`)
- Select result -> write one cell to Firestore

### Phase 4 — Playback from Dashboard Cells (Scenario A/B/C)

#### Playback Target Requirement

- A track can only play if there is an active device.

#### Implement Web Playback SDK

- Initialize SDK with access token provider
- On "ready" => get device_id, store preferredDeviceId
- Ensure playback is transferred to this device before play

#### Play Action (Cell Click)

- Ensure token valid (refresh if needed)
- Ensure device ready:
  - If web SDK ready: use its device_id
  - Else: show "Select device / open Spotify" guidance
- Call play:
  - `PUT /me/player/play` with `uri: spotify:track:{trackId}` and `device_id`
- Provide pause action (optional in MVP but recommended)

### Phase 5 — Match Mode Hardening

- Lock edits, reduce UI to large buttons
- Add device status indicator (Ready / Not ready)
- Handle autoplay/user gesture constraints gracefully:
  - First action can be "Enable player" / "Activate playback"

---

## 7. Playback Orchestration Rules (Important)

Spotify warns that execution order is not guaranteed for some player endpoints.

### Requirement

Treat complex actions as a sequence with awaits and small delays if needed:

1. ensure device
2. play track
3. (optional) set volume
4. (optional) seek to 0

### For MVP

- Keep it simple: ensure device -> play only.
- Add volume/seek later once stable.

---

## 8. Rate Limits & Resilience

### Must Handle

- `401` => refresh then retry once
- `403` => show "Premium required" or missing scope
- `429` => exponential backoff based on Retry-After header
- network errors => show "Try again" toast

### Caching Recommendations

- Cache playlist and track metadata in Firestore (cells already do this).
- Consider caching `/me/playlists` results short-term (in memory) during Edit mode.

---

## 9. Definition of Done — "Playground Page" MVP Verification

### A) Connect

- User clicks "Connect Spotify" -> completes OAuth -> sees displayName

### B) Groups

- User creates a group "Mål" in dashboard

### C) Playlist Import

- User imports a playlist into "Mål" -> sees track cells

### D) Manual Add

- User searches track -> adds to "Mål" -> sees new cell

### E) Playback

- User initializes Web Playback SDK -> device ready indicator
- Clicking any cell plays that track immediately inside the app
- Pause works

### F) Errors

- Clear actionable errors:
  - Premium required
  - Player not ready / open Spotify
  - Reconnect needed

---

## 10. Implementation Checklist

- [ ] Firestore initialized + rules applied
- [ ] Groups/cells schema implemented
- [ ] Spotify OAuth PKCE via Functions: login/callback/refresh
- [ ] Server-only token storage (spotifyTokens) protected
- [ ] Spotify proxy endpoints for playlists/search/tracks
- [ ] Edit mode: import playlist -> cells
- [ ] Edit mode: search track -> add cell
- [ ] Web Playback SDK: ready + deviceId
- [ ] Cell click => play track
- [ ] Match mode: locked + big buttons + device status
- [ ] Error handling: 401/403/429 + no device
