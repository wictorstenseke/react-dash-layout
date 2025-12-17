declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: typeof Spotify;
  }
}

declare namespace Spotify {
  interface PlayerInit {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }

  interface WebPlaybackState {
    context: {
      uri: string;
      metadata: unknown;
    };
    disallows: {
      pausing: boolean;
      peeking_next: boolean;
      peeking_prev: boolean;
      resuming: boolean;
      seeking: boolean;
      skipping_next: boolean;
      skipping_prev: boolean;
    };
    paused: boolean;
    position: number;
    duration: number;
    track_window: {
      current_track: WebPlaybackTrack;
      previous_tracks: WebPlaybackTrack[];
      next_tracks: WebPlaybackTrack[];
    };
  }

  interface WebPlaybackTrack {
    uri: string;
    id: string;
    type: string;
    media_type: string;
    name: string;
    is_playable: boolean;
    album: {
      uri: string;
      name: string;
      images: Array<{ url: string }>;
    };
    artists: Array<{
      uri: string;
      name: string;
    }>;
  }

  interface WebPlaybackPlayer {
    device_id: string;
  }

  interface WebPlaybackError {
    message: string;
  }

  class Player {
    constructor(options: PlayerInit);
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(
      event: "ready",
      callback: (state: WebPlaybackPlayer) => void
    ): void;
    addListener(
      event: "not_ready",
      callback: (state: WebPlaybackPlayer) => void
    ): void;
    addListener(
      event: "player_state_changed",
      callback: (state: WebPlaybackState | null) => void
    ): void;
    addListener(
      event: "initialization_error" | "authentication_error" | "account_error" | "playback_error",
      callback: (error: WebPlaybackError) => void
    ): void;
    removeListener(event: string, callback?: () => void): void;
    getCurrentState(): Promise<WebPlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    activateElement(): Promise<void>;
  }
}

export {};
