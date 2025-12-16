import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

import type { AuthResult, AuthCallback, AuthError } from "./types";

/**
 * Maps Firebase auth error codes to user-friendly messages
 */
function mapAuthError(error: unknown): AuthError {
  const firebaseError = error as { code?: string; message?: string };
  const code = firebaseError.code || "unknown";

  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered",
    "auth/invalid-email": "Invalid email address",
    "auth/operation-not-allowed": "Email/password accounts are not enabled",
    "auth/weak-password": "Password should be at least 6 characters",
    "auth/user-disabled": "This account has been disabled",
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/invalid-credential": "Invalid email or password",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later",
    "auth/network-request-failed":
      "Network error. Please check your connection",
  };

  return {
    code,
    message:
      errorMessages[code] || firebaseError.message || "An error occurred",
  };
}

/**
 * Sign up a new user with email and password
 */
export async function signUpEmailPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    return {
      success: false,
      error: mapAuthError(error),
    };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signInEmailPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    return {
      success: false,
      error: mapAuthError(error),
    };
  }
}

/**
 * Send a password reset email to the user
 */
export async function sendPasswordReset(email: string): Promise<AuthResult> {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: mapAuthError(error),
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<AuthResult> {
  try {
    await signOut(auth);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: mapAuthError(error),
    };
  }
}

/**
 * Subscribe to auth state changes
 * Returns an unsubscribe function to stop listening
 */
export function onAuthStateChangedListener(callback: AuthCallback): () => void {
  return onAuthStateChanged(auth, callback);
}
