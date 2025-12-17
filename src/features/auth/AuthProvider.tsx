import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import { onAuthStateChangedListener } from "./authService";

import type { AuthError, User } from "./types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthed: boolean;
  error: AuthError | null;
  setError: (error: AuthError | null) => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const isAuthed = user !== null;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthed, error, setError, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
