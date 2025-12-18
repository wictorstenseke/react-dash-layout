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
import { Cancel01Icon, Edit02Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useSpotifyPlayer } from "@/features/spotify/useSpotifyPlayer";
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

/**
 * Inserts hyphens in long words to allow breaking with hyphens
 */
const addHyphensToLongWords = (text: string, maxLength = 8): string => {
  return text
    .split(/(\s+)/)
    .map((word) => {
      if (word.trim().length > maxLength && /^\S+$/.test(word)) {
        // Insert soft hyphens every few characters for long words
        const chars = word.split("");
        const result: string[] = [];
        for (let i = 0; i < chars.length; i++) {
          result.push(chars[i]);
          // Insert hyphen opportunity every 4-5 characters, but not at the end
          if (i > 0 && i < chars.length - 1 && (i + 1) % 4 === 0) {
            result.push("\u00AD"); // Soft hyphen (invisible, allows breaking)
          }
        }
        return result.join("");
      }
      return word;
    })
    .join("");
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
  const { play, isReady } = useSpotifyPlayer();

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

  const handlePlay = () => {
    if (track.spotifyTrackId && isReady) {
      play(track.spotifyTrackId);
    }
  };

  const canPlay = !!track.spotifyTrackId && isReady;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          onClick={canPlay ? handlePlay : undefined}
          className={cn(
            colorClasses[track.color],
            "group/track relative w-20 h-20 rounded-md flex items-center justify-center text-white font-semibold shadow-sm hover:shadow-md transition-shadow p-1",
            canPlay
              ? "cursor-pointer hover:scale-105"
              : "cursor-grab active:cursor-grabbing"
          )}
          title={
            canPlay
              ? `Play: ${track.title || track.label}`
              : track.spotifyTrackId
                ? "Player not ready"
                : undefined
          }
          lang="en"
        >
          <span
            className="text-xs text-center leading-tight overflow-hidden block"
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: "5",
              WebkitBoxOrient: "vertical",
              lineClamp: 5,
              padding: 0,
              margin: 0,
            }}
          >
            {addHyphensToLongWords(track.label)}
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {canPlay && (
          <ContextMenuItem
            onSelect={(event) => {
              event.preventDefault();
              handlePlay();
            }}
          >
            <HugeiconsIcon icon={PlayIcon} className="mr-2 size-4" />
            <span>Play</span>
          </ContextMenuItem>
        )}
        {canPlay && (onRename || onDelete) && <ContextMenuSeparator />}
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
          {tracks.map((track, index) => (
            <SortableTrack
              key={`${groupId}-${track.id}-${index}`}
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
