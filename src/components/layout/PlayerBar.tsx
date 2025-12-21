import { Player } from "@/components/Player";
import { PlayerStatus } from "@/components/PlayerStatus";
import { cn } from "@/lib/utils";

type PlayerBarProps = {
  className?: string;
};

export const PlayerBar = ({ className }: PlayerBarProps) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 w-full border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-4",
        className
      )}
    >
      <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: PlayerStatus */}
        <div className="flex">
          <PlayerStatus />
        </div>

        {/* Center: Player Controls */}
        <div className="flex flex-1 items-center justify-center">
          <Player />
        </div>

        {/* Right: Empty for balance */}
        <div className="flex-1" />
      </div>
    </div>
  );
};

