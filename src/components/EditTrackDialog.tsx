import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUpdateTrackMutation } from "@/hooks/useTracks";

import type { Track } from "@/features/groups/types";

type EditTrackDialogProps = {
  groupId: string;
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const EditTrackDialog = ({
  groupId,
  track,
  open,
  onOpenChange,
}: EditTrackDialogProps) => {
  // Initialize state with track's startTimeMs - using key prop on Dialog to reset when track changes
  const [startTimeMs, setStartTimeMs] = useState(track.startTimeMs ?? 0);
  const updateTrack = useUpdateTrackMutation(groupId);

  const durationMs = track.durationMs ?? 0;
  const maxStartTime = Math.max(0, durationMs - 1000); // Don't allow starting in last second

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await updateTrack.mutateAsync({
      trackId: track.id,
      data: {
        startTimeMs: startTimeMs > 0 ? startTimeMs : undefined,
      },
    });

    onOpenChange(false);
  };

  const handleClear = async () => {
    await updateTrack.mutateAsync({
      trackId: track.id,
      data: {
        startTimeMs: undefined,
      },
    });

    setStartTimeMs(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={track.id}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Track</DialogTitle>
          <DialogDescription>
            Set a start time for this track. The track will always start at this
            position when played.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">{track.label}</p>
              {track.artists && track.artists.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {track.artists.join(", ")}
                </p>
              )}
            </div>

            {durationMs > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="start-time">Start Time</Label>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(startTimeMs)} / {formatTime(durationMs)}
                  </span>
                </div>
                <input
                  id="start-time"
                  type="range"
                  min="0"
                  max={maxStartTime}
                  step="1000"
                  value={startTimeMs}
                  onChange={(e) => setStartTimeMs(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  style={{
                    background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${
                      (startTimeMs / maxStartTime) * 100
                    }%, rgb(229 231 235) ${
                      (startTimeMs / maxStartTime) * 100
                    }%, rgb(229 231 235) 100%)`,
                  }}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>0:00</span>
                  <span>{formatTime(maxStartTime)}</span>
                </div>
                {startTimeMs > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Track will start at {formatTime(startTimeMs)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Track duration not available. Start time cannot be set.
              </p>
            )}
          </div>

          <DialogFooter>
            {startTimeMs > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={updateTrack.isPending}
              >
                Clear Start Time
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateTrack.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateTrack.isPending || durationMs === 0}
            >
              {updateTrack.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
