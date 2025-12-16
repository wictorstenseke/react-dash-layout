import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Singleton pattern - initialize once
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function initializeFirebase() {
  if (firebaseApp) return { firebaseApp, auth: auth!, db: db! };

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  // Validate required config
  if (!apiKey || !projectId) {
    const missing = [];
    if (!apiKey) missing.push("VITE_FIREBASE_API_KEY");
    if (!projectId) missing.push("VITE_FIREBASE_PROJECT_ID");

    console.error("Firebase config check:", {
      apiKey: apiKey ? "✓" : "✗",
      projectId: projectId ? "✓" : "✗",
      authDomain: authDomain ? "✓" : "✗",
      storageBucket: storageBucket ? "✓" : "✗",
      messagingSenderId: messagingSenderId ? "✓" : "✗",
      appId: appId ? "✓" : "✗",
    });

    throw new Error(
      `Firebase configuration is incomplete. Missing: ${missing.join(", ")}. ` +
        `Please check your .env.local file exists and restart the dev server (Vite only reads .env files on startup).`
    );
  }

  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };

  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);

  return { firebaseApp, auth, db };
}

const {
  firebaseApp: app,
  auth: authInstance,
  db: dbInstance,
} = initializeFirebase();

export { app as firebaseApp, authInstance as auth, dbInstance as db };
