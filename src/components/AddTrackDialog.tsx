import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRACK_COLORS, type TrackColor } from "@/features/groups/types";
import { useCreateTrackMutation, useTracksQuery } from "@/hooks/useTracks";
import { cn } from "@/lib/utils";

const colorClasses: Record<TrackColor, { bg: string; ring: string }> = {
  blue: { bg: "bg-blue-500", ring: "ring-blue-500" },
  green: { bg: "bg-green-500", ring: "ring-green-500" },
  yellow: { bg: "bg-yellow-500", ring: "ring-yellow-500" },
  red: { bg: "bg-red-500", ring: "ring-red-500" },
  purple: { bg: "bg-purple-500", ring: "ring-purple-500" },
  pink: { bg: "bg-pink-500", ring: "ring-pink-500" },
  indigo: { bg: "bg-indigo-500", ring: "ring-indigo-500" },
  orange: { bg: "bg-orange-500", ring: "ring-orange-500" },
  teal: { bg: "bg-teal-500", ring: "ring-teal-500" },
  cyan: { bg: "bg-cyan-500", ring: "ring-cyan-500" },
};

type AddTrackDialogProps = {
  groupId: string;
  trigger?: React.ReactElement;
};

export const AddTrackDialog = ({ groupId, trigger }: AddTrackDialogProps) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState<TrackColor>("blue");

  const { data: tracks } = useTracksQuery(groupId);
  const createTrack = useCreateTrackMutation(groupId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!label.trim()) return;

    const order = tracks?.length ?? 0;

    await createTrack.mutateAsync({
      label: label.trim(),
      color,
      order,
    });

    // Reset form and close
    setLabel("");
    setColor("blue");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button size="sm">Add Track</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Track</DialogTitle>
          <DialogDescription>
            Add a track to this group. Give it a name and pick a color.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="track-label">Track Name</Label>
            <Input
              id="track-label"
              placeholder="e.g., Song Title, Track 1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {TRACK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    colorClasses[c].bg,
                    color === c
                      ? `ring-2 ${colorClasses[c].ring} ring-offset-2 ring-offset-background`
                      : "hover:scale-110"
                  )}
                  aria-label={`Select ${c} color`}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!label.trim() || createTrack.isPending}
            >
              {createTrack.isPending ? "Adding…" : "Add Track"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
