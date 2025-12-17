# Manual Steps

This document contains steps that require manual execution due to permissions, authentication, or external service configuration.

---

## ✅ Completed

### Spotify Client Secret

```bash
firebase functions:secrets:set SPOTIFY_CLIENT_SECRET
```

Status: ✅ Already configured

---

## 🔲 Pending

### Spotify Developer Dashboard — Redirect URIs

Add these exact URIs to your Spotify app settings:

**Local development:**

```
http://127.0.0.1:5001/spotdash-dbaf2/europe-west1/spotifyCallback
```

**Production:**

```
https://europe-west1-spotdash-dbaf2.cloudfunctions.net/spotifyCallback
```

Steps:

1. Go to https://developer.spotify.com/dashboard
2. Select your app
3. Click "Edit Settings"
4. Under "Redirect URIs", add the URIs above
5. Click "Save"

---

## Template for New Steps

```markdown
### [Step Title]

**Why:** [Brief explanation]

**Command/Action:**
\`\`\`bash
[command here]
\`\`\`

**Or manual steps:**

1. Step one
2. Step two

Status: 🔲 Pending
```
