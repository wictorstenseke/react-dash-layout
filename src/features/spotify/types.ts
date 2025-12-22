// Spotify API response types
export type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

export type SpotifyArtist = {
  id: string;
  name: string;
  uri: string;
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  images: SpotifyImage[];
  uri: string;
};

export type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  uri: string;
};

export type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  tracks: {
    total: number;
  };
  owner: {
    display_name: string;
  };
};

export type SpotifyPlaylistsResponse = {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
};

export type SpotifyPlaylistTracksResponse = {
  items: Array<{
    track: SpotifyTrack;
  }>;
  total: number;
  limit: number;
  offset: number;
  next: string | null;
};

export type SpotifySearchResponse = {
  tracks?: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
  };
  playlists?: {
    items: SpotifyPlaylist[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
  };
};

export type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
};

// Player types
export type PlayerState = "idle" | "ready" | "playing" | "paused" | "error";

export type DeviceInfo = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
};
