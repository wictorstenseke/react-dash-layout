import type { User } from "firebase/auth";

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
