import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Cancel01Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

import type { Track, TrackColor } from "@/features/groups/types";

const colorClasses: Record<TrackColor, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  indigo: "bg-indigo-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
};

type SortableTrackProps = {
  track: Track;
  onDelete?: (trackId: string) => void;
  onRename?: (trackId: string) => void;
};

const SortableTrack = ({ track, onDelete, onRename }: SortableTrackProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    onDelete?.(track.id);
  };

  const handleRename = () => {
    onRename?.(track.id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={cn(
            colorClasses[track.color],
            "group/track relative w-18 h-18 rounded-md flex items-center justify-center text-white font-semibold cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
          )}
        >
          <span className="text-xs text-center px-1 truncate max-w-full">
            {track.label}
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {onRename && (
          <ContextMenuItem
            onSelect={(event) => {
              event.preventDefault();
              handleRename();
            }}
          >
            <HugeiconsIcon icon={Edit02Icon} className="mr-2 size-4" />
            <span>Rename</span>
          </ContextMenuItem>
        )}
        {onDelete && (
          <>
            {onRename && <ContextMenuSeparator />}
            <ContextMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="mr-2 size-4" />
              <span>Remove</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

type SortableTracksProps = {
  groupId: string;
  tracks: Track[];
  onReorder?: (trackIds: string[]) => void;
  onDelete?: (trackId: string) => void;
  onRename?: (trackId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

export const SortableTracks = ({
  groupId,
  tracks,
  onReorder,
  onDelete,
  onRename,
  onDragStart,
  onDragEnd,
}: SortableTracksProps) => {
  // Configure sensors to prevent conflicts with react-grid-layout
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = () => {
    onDragStart?.();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((item) => item.id === active.id);
      const newIndex = tracks.findIndex((item) => item.id === over.id);
      const reorderedTracks = arrayMove(tracks, oldIndex, newIndex);
      onReorder?.(reorderedTracks.map((t) => t.id));
    }
    onDragEnd?.();
  };

  if (tracks.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
        No tracks yet
      </div>
    );
  }

  return (
    <DndContext
      id={groupId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tracks.map((t) => t.id)}
        strategy={rectSortingStrategy}
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {tracks.map((track) => (
            <SortableTrack
              key={track.id}
              track={track}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
