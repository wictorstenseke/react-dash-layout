import type { User } from "firebase/auth";
import type { Timestamp } from "firebase/firestore";

export type AuthResult = {
  success: boolean;
  user?: User;
  error?: AuthError;
};

export type AuthError = {
  code: string;
  message: string;
};

export type AuthCallback = (user: User | null) => void;

export type { User };

// User document stored in Firestore users/{uid}
export type UserDocument = {
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
};

// Server-only token storage (not accessible from client)
export type SpotifyTokenDocument = {
  refresh_token: string;
  access_token?: string;
  expires_at?: Timestamp;
  scope?: string;
};
