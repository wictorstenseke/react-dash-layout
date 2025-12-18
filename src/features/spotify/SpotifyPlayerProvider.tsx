import { createContext, useContext, type ReactNode } from "react";

import { useSpotifyPlayerInternal } from "./useSpotifyPlayer";

type SpotifyPlayerContextValue = ReturnType<typeof useSpotifyPlayerInternal>;

const SpotifyPlayerContext = createContext<SpotifyPlayerContextValue | null>(
  null
);

type SpotifyPlayerProviderProps = {
  children: ReactNode;
};

/**
 * Provider that manages Spotify player state and shares it across components
 */
export const SpotifyPlayerProvider = ({
  children,
}: SpotifyPlayerProviderProps) => {
  const playerState = useSpotifyPlayerInternal();

  return (
    <SpotifyPlayerContext.Provider value={playerState}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

/**
 * Hook to access Spotify player state from context
 */
export const useSpotifyPlayer = () => {
  const context = useContext(SpotifyPlayerContext);
  if (!context) {
    throw new Error(
      "useSpotifyPlayer must be used within a SpotifyPlayerProvider"
    );
  }
  return context;
};
