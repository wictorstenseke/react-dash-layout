import {
  DragDropHorizontalIcon,
  Delete02Icon,
  SquareArrowDiagonal02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { AddTrackDialog } from "@/components/AddTrackDialog";
import { SortableTracks } from "@/components/SortableTracks";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Group, GroupColor } from "@/features/groups/types";
import {
  useDeleteTrackMutation,
  useReorderTracksMutation,
  useTracksQuery,
} from "@/hooks/useTracks";

const groupColorClasses: Record<GroupColor, { bg: string; border: string }> = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-300 dark:border-blue-700",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-300 dark:border-green-700",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-300 dark:border-purple-700",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    border: "border-orange-300 dark:border-orange-700",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    border: "border-pink-300 dark:border-pink-700",
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    border: "border-teal-300 dark:border-teal-700",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-300 dark:border-red-700",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border-yellow-300 dark:border-yellow-700",
  },
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    border: "border-indigo-300 dark:border-indigo-700",
  },
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    border: "border-cyan-300 dark:border-cyan-700",
  },
};

type GroupCardProps = {
  group: Group;
  onDelete: () => void;
  onSquareDragStart: () => void;
  onSquareDragEnd: () => void;
};

export const GroupCard = ({
  group,
  onDelete,
  onSquareDragStart,
  onSquareDragEnd,
}: GroupCardProps) => {
  const { data: tracks = [], isLoading } = useTracksQuery(group.id);
  const reorderTracks = useReorderTracksMutation(group.id);
  const deleteTrack = useDeleteTrackMutation(group.id);

  const colorClasses = groupColorClasses[group.color];

  const handleReorder = (trackIds: string[]) => {
    reorderTracks.mutate(trackIds);
  };

  const handleDeleteTrack = (trackId: string) => {
    deleteTrack.mutate(trackId);
  };

  return (
    <div
      className={`group rounded-lg border-2 ${colorClasses.border} ${colorClasses.bg} px-4 shadow-sm h-full flex flex-col relative`}
    >
      <div className="flex flex-col h-full">
        {/* Header with drag handle */}
        <div className="mb-0 flex items-center justify-between py-4 drag-handle cursor-move shrink-0">
          <h3 className="text-lg font-semibold">{group.name}</h3>
          <div className="flex items-center gap-1">
            <AddTrackDialog
              groupId={group.id}
              trigger={
                <Button variant="ghost" size="icon-sm">
                  <span className="text-lg leading-none">+</span>
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              className="text-muted-foreground hover:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            </Button>
            <div className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <HugeiconsIcon
                icon={DragDropHorizontalIcon}
                className="w-5 h-5 text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Tracks content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                Loading tracks…
              </div>
            ) : (
              <SortableTracks
                groupId={group.id}
                tracks={tracks}
                onReorder={handleReorder}
                onDelete={handleDeleteTrack}
                onDragStart={onSquareDragStart}
                onDragEnd={onSquareDragEnd}
              />
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Custom resize icon overlay */}
      <div className="absolute bottom-2 right-2 pointer-events-none">
        <HugeiconsIcon
          icon={SquareArrowDiagonal02Icon}
          className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors"
        />
      </div>
    </div>
  );
};
