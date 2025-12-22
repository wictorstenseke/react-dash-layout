import { useState } from "react";

import {
  MoreVerticalIcon,
  PencilEdit02Icon,
  RemoveSquareIcon,
  SquareArrowDiagonal02Icon,
  Upload03Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { DeleteGroupDialog } from "@/components/DeleteGroupDialog";
import { EditGroupDialog } from "@/components/EditGroupDialog";
import { ImportPlaylistDialog } from "@/components/ImportPlaylistDialog";
import { SearchTrackDialog } from "@/components/SearchTrackDialog";
import { SortableTracks } from "@/components/SortableTracks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useDeleteTrackMutation,
  useReorderTracksMutation,
  useTracksQuery,
  useUpdateTrackMutation,
} from "@/hooks/useTracks";
import { cn } from "@/lib/utils";

import type { Group, GroupColor, TrackColor } from "@/features/groups/types";

const groupColorClasses: Record<GroupColor, { bg: string; border: string }> = {
  "gray-light": {
    bg: "bg-gray-50 dark:bg-gray-800/30",
    border: "border-gray-200 dark:border-gray-600",
  },
  gray: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    border: "border-gray-300 dark:border-gray-700",
  },
  "gray-dark": {
    bg: "bg-gray-200 dark:bg-gray-950/30",
    border: "border-gray-400 dark:border-gray-800",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-300 dark:border-blue-700",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-300 dark:border-green-700",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border-yellow-300 dark:border-yellow-700",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-300 dark:border-red-700",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-300 dark:border-purple-700",
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    border: "border-teal-300 dark:border-teal-700",
  },
};

type GroupCardProps = {
  group: Group;
  onDelete?: () => void;
  onSquareDragStart: () => void;
  onSquareDragEnd: () => void;
  editMode?: boolean;
};

export const GroupCard = ({
  group,
  onDelete,
  onSquareDragStart,
  onSquareDragEnd,
  editMode = true,
}: GroupCardProps) => {
  const { data: tracks = [], isLoading } = useTracksQuery(group.id);
  const reorderTracks = useReorderTracksMutation(group.id);
  const deleteTrack = useDeleteTrackMutation(group.id);
  const updateTrack = useUpdateTrackMutation(group.id);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const colorClasses = groupColorClasses[group.color];

  const handleReorder = (trackIds: string[]) => {
    reorderTracks.mutate(trackIds);
  };

  const handleDeleteTrack = (trackId: string) => {
    deleteTrack.mutate(trackId, {
      onError: (error) => {
        console.error("Failed to delete track:", error);
      },
    });
  };

  const handleUpdateTrackColor = (trackId: string, color: TrackColor): void => {
    updateTrack.mutate(
      {
        trackId,
        data: { color },
      },
      {
        onError: (error) => {
          console.error("Failed to update track color:", error);
        },
      }
    );
  };

  return (
    <>
      <EditGroupDialog
        groupId={group.id}
        currentName={group.name}
        currentColor={group.color}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      {onDelete && (
        <DeleteGroupDialog
          groupName={group.name}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={onDelete}
        />
      )}
      <SearchTrackDialog
        groupId={group.id}
        groupColor={group.color}
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
      />
      <ImportPlaylistDialog
        groupId={group.id}
        groupColor={group.color}
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
      <div
        className={`group rounded-lg border-2 ${colorClasses.border} ${colorClasses.bg} px-4 shadow-sm h-full flex flex-col relative`}
      >
        <div className="flex flex-col h-full">
          {/* Header with drag handle */}
          <div
            className={cn(
              "mb-0 flex items-center justify-between py-4 shrink-0",
              editMode && "drag-handle cursor-move"
            )}
          >
            <h3 className="text-lg font-semibold">{group.name}</h3>
            {editMode && (
              <div
                className="no-drag"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="h-auto w-auto p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer [&_svg]:w-5! [&_svg]:h-5!"
                    >
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        className="text-muted-foreground"
                      />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-auto min-w-max">
                  <DropdownMenuItem
                    onClick={() => setSearchDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <HugeiconsIcon
                      icon={Search01Icon}
                      strokeWidth={2}
                      className="mr-2"
                    />
                    <span>Search</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setImportDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <HugeiconsIcon
                      icon={Upload03Icon}
                      strokeWidth={2}
                      className="mr-2"
                    />
                    <span>Add your playlist</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setEditDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <HugeiconsIcon
                      icon={PencilEdit02Icon}
                      strokeWidth={2}
                      className="mr-2"
                    />
                    <span>Edit group</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    <HugeiconsIcon
                      icon={RemoveSquareIcon}
                      strokeWidth={2}
                      className="mr-2"
                    />
                    <span>Remove group</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            )}
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
                  groupColor={group.color}
                  onReorder={editMode ? handleReorder : undefined}
                  onDelete={editMode ? handleDeleteTrack : undefined}
                  onUpdateColor={editMode ? handleUpdateTrackColor : undefined}
                  onDragStart={onSquareDragStart}
                  onDragEnd={onSquareDragEnd}
                  onAddTrack={editMode ? () => setSearchDialogOpen(true) : undefined}
                  editMode={editMode}
                />
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Custom resize icon overlay */}
        {editMode && (
          <div className="absolute bottom-2 right-2 pointer-events-none">
            <HugeiconsIcon
              icon={SquareArrowDiagonal02Icon}
              className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors"
            />
          </div>
        )}
      </div>
    </>
  );
};
