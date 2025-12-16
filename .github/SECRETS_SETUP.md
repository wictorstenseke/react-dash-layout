# GitHub Secrets Setup

Detta repository använder GitHub Secrets för Firebase-konfiguration i CI/CD-pipelinen.

## Konfigurerade Secrets

Följande secrets är konfigurerade för detta projekt:

- `VITE_FIREBASE_API_KEY` - Firebase API Key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase Project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
- `VITE_FIREBASE_APP_ID` - Firebase App ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase Measurement ID (för Analytics)

## Verifiera Secrets

För att lista alla secrets:

```bash
gh secret list
```

## Uppdatera Secrets

För att uppdatera ett secret:

```bash
gh secret set SECRET_NAME --body "secret_value"
```

## Lägga till nya Secrets

1. Gå till repository settings på GitHub: `Settings > Secrets and variables > Actions`
2. Klicka på "New repository secret"
3. Fyll i namnet och värdet
4. Klicka på "Add secret"

Alternativt via CLI:

```bash
gh secret set SECRET_NAME --body "secret_value"
```

## CI/CD Integration

Secrets används automatiskt i `.github/workflows/ci.yml` under build-steget. De injiceras som miljövariabler som Vite kan läsa.

## Lokal Utveckling

För lokal utveckling, skapa en `.env.local` fil med samma variabler (se `.env.local.example`).

**OBS:** `.env.local` är i `.gitignore` och committas aldrig till repository.
