import { Button } from "@/components/ui/button";
import { useConnectSpotify, useSpotifyStatus } from "@/features/spotify/useSpotifyAuth";

type SpotifyConnectButtonProps = {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
};

export const SpotifyConnectButton = ({
  variant = "default",
  size = "default",
}: SpotifyConnectButtonProps) => {
  const { isLinked, displayName, loading } = useSpotifyStatus();
  const connectSpotify = useConnectSpotify();

  const handleConnect = () => {
    const currentUrl = window.location.pathname + window.location.search;
    connectSpotify.mutate(currentUrl);
  };

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled>
        Loading…
      </Button>
    );
  }

  if (isLinked) {
    return (
      <Button variant="outline" size={size} disabled>
        ✓ {displayName ? `Connected as ${displayName}` : "Spotify Connected"}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleConnect}
      disabled={connectSpotify.isPending}
    >
      {connectSpotify.isPending ? "Connecting…" : "Connect Spotify"}
    </Button>
  );
};
