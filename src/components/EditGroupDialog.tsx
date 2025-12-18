import { useState, type FormEvent, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GROUP_COLORS, type GroupColor } from "@/features/groups/types";
import { useUpdateGroupMutation } from "@/hooks/useGroups";
import { cn } from "@/lib/utils";

const colorClasses: Record<GroupColor, { bg: string; ring: string }> = {
  gray: { bg: "bg-gray-500", ring: "ring-gray-500" },
  "gray-light": { bg: "bg-gray-400", ring: "ring-gray-400" },
  "gray-dark": { bg: "bg-gray-600", ring: "ring-gray-600" },
  blue: { bg: "bg-blue-500", ring: "ring-blue-500" },
  green: { bg: "bg-green-500", ring: "ring-green-500" },
  purple: { bg: "bg-purple-500", ring: "ring-purple-500" },
  orange: { bg: "bg-orange-500", ring: "ring-orange-500" },
  pink: { bg: "bg-pink-500", ring: "ring-pink-500" },
  teal: { bg: "bg-teal-500", ring: "ring-teal-500" },
  red: { bg: "bg-red-500", ring: "ring-red-500" },
  yellow: { bg: "bg-yellow-500", ring: "ring-yellow-500" },
};

type EditGroupDialogProps = {
  groupId: string;
  currentName: string;
  currentColor: GroupColor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditGroupDialog = ({
  groupId,
  currentName,
  currentColor,
  open,
  onOpenChange,
}: EditGroupDialogProps) => {
  const [name, setName] = useState(currentName);
  const [color, setColor] = useState<GroupColor>(currentColor);
  const updateGroup = useUpdateGroupMutation();

  // Reset form when dialog opens with new values
  useEffect(() => {
    if (open) {
      setName(currentName);
      setColor(currentColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    await updateGroup.mutateAsync({
      groupId,
      data: {
        name: name.trim(),
        color,
      },
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader></DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              placeholder="e.g., Warm Up, Set 1, Chill"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {GROUP_COLORS.map((c) => (
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || updateGroup.isPending}
            >
              {updateGroup.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
