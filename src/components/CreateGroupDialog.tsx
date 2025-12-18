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
import { GROUP_COLORS, type GroupColor } from "@/features/groups/types";
import { useCreateGroupMutation, useGroupsQuery } from "@/hooks/useGroups";
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

type CreateGroupDialogProps = {
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const CreateGroupDialog = ({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateGroupDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [name, setName] = useState("");
  const [color, setColor] = useState<GroupColor>("gray");

  const { data: groups } = useGroupsQuery();
  const createGroup = useCreateGroupMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    const order = groups?.length ?? 0;

    await createGroup.mutateAsync({
      name: name.trim(),
      color,
      order,
    });

    // Reset form and close
    setName("");
    setColor("gray");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button>Create Group</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to organize your tracks. Give it a name and pick a
            color.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createGroup.isPending}
            >
              {createGroup.isPending ? "Creating…" : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
