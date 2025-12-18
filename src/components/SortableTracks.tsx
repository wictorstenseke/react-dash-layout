import { useEffect, useRef } from "react";

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
import {
  PaintBoardIcon,
  PlayIcon,
  RemoveSquareIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { TRACK_COLORS } from "@/features/groups/types";
import { usePlayback } from "@/features/playback/PlaybackProvider";
import { useSpotifyPlayer } from "@/features/spotify/SpotifyPlayerProvider";
import { cn } from "@/lib/utils";

import type { GroupColor, Track, TrackColor } from "@/features/groups/types";

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
 * Maps GroupColor to TrackColor (most colors match, use blue as fallback)
 */
const mapGroupColorToTrackColor = (groupColor: GroupColor): TrackColor => {
  // Most group colors match track colors directly
  if (TRACK_COLORS.includes(groupColor as TrackColor)) {
    return groupColor as TrackColor;
  }
  // Fallback to blue if somehow there's a mismatch
  return "blue";
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
  defaultColor: TrackColor;
  onDelete?: (trackId: string) => void;
  onUpdateColor?: (trackId: string, color: TrackColor) => void;
};

const SortableTrack = ({
  track,
  defaultColor,
  onDelete,
  onUpdateColor,
}: SortableTrackProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });
  const { isReady } = useSpotifyPlayer();
  const { selectTrack, playTrack, selectedTrackId, currentTrackId, isPlaying } =
    usePlayback();

  // Track pointer position to detect if it was a click (no movement) vs drag
  const pointerDownRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const dragStartedRef = useRef(false);

  // Track when drag actually starts
  useEffect(() => {
    if (isDragging) {
      dragStartedRef.current = true;
    } else {
      // Reset when drag ends
      dragStartedRef.current = false;
      pointerDownRef.current = null;
    }
  }, [isDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Use track.color if set, otherwise use defaultColor from group
  // Note: track.color might be undefined for old tracks that don't have this field
  const trackColor = track.color ?? defaultColor;

  const handleDelete = () => {
    onDelete?.(track.id);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    dragStartedRef.current = false;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerDownRef.current || dragStartedRef.current || isDragging) {
      pointerDownRef.current = null;
      return;
    }

    const deltaX = Math.abs(e.clientX - pointerDownRef.current.x);
    const deltaY = Math.abs(e.clientY - pointerDownRef.current.y);
    const deltaTime = Date.now() - pointerDownRef.current.time;
    const moved = deltaX > 5 || deltaY > 5; // Allow small movement for click
    const isQuickClick = deltaTime < 300; // Click should be quick

    if (!moved && isQuickClick && track.spotifyTrackId && isReady) {
      // Single click - select track
      selectTrack(track.spotifyTrackId);
    }

    pointerDownRef.current = null;
  };

  const handleDoubleClick = () => {
    if (track.spotifyTrackId && isReady && !isDragging) {
      playTrack(track.spotifyTrackId);
    }
  };

  // Handle pointer down for both drag and click detection
  const handlePointerDownWithDrag = (e: React.PointerEvent) => {
    handlePointerDown(e);
    // Call original drag listener if it exists
    if (listeners?.onPointerDown) {
      listeners.onPointerDown(e);
    }
  };

  const handleContextPlay = () => {
    if (track.spotifyTrackId && isReady) {
      playTrack(track.spotifyTrackId);
    }
  };

  const handleColorChange = (color: TrackColor) => {
    onUpdateColor?.(track.id, color);
  };

  const canPlay = !!track.spotifyTrackId && isReady;
  const isSelected = track.spotifyTrackId === selectedTrackId;
  const isCurrentlyPlaying =
    track.spotifyTrackId === currentTrackId && isPlaying;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          onPointerDown={handlePointerDownWithDrag}
          onPointerUp={canPlay ? handlePointerUp : undefined}
          onDoubleClick={canPlay ? handleDoubleClick : undefined}
          className={cn(
            colorClasses[trackColor],
            "group/track relative w-20 h-20 rounded-md flex items-center justify-center text-white font-semibold shadow-sm hover:shadow-md transition-all p-1",
            isDragging && "cursor-grabbing opacity-50",
            !isDragging && canPlay && "cursor-pointer hover:scale-105",
            !isDragging && !canPlay && "cursor-pointer",
            (isSelected || isCurrentlyPlaying) && "ring-2 ring-white",
            isSelected && !isCurrentlyPlaying && "brightness-75"
          )}
          title={
            canPlay
              ? `${track.title || track.label}`
              : track.spotifyTrackId
                ? "Player not ready"
                : undefined
          }
          lang="en"
        >
          <span
            className="text-xs text-center leading-tight overflow-hidden block relative z-10"
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
          {isCurrentlyPlaying && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
              <HugeiconsIcon
                icon={PlayIcon}
                strokeWidth={2}
                className="size-8 drop-shadow-lg"
              />
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {canPlay && (
          <ContextMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleContextPlay();
            }}
          >
            <HugeiconsIcon icon={PlayIcon} strokeWidth={2} className="mr-2" />
            <span>Play</span>
          </ContextMenuItem>
        )}
        {canPlay && (onUpdateColor || onDelete) && <ContextMenuSeparator />}
        {onUpdateColor && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <HugeiconsIcon
                icon={PaintBoardIcon}
                strokeWidth={2}
                className="mr-2"
              />
              <span>Color</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {TRACK_COLORS.map((color) => (
                <ContextMenuItem
                  key={color}
                  onClick={(e) => {
                    e.preventDefault();
                    handleColorChange(color);
                  }}
                >
                  <div
                    className={cn("w-4 h-4 rounded-full", colorClasses[color])}
                  />
                  <span className="capitalize">{color}</span>
                  {trackColor === color && (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={2}
                      className="ml-auto"
                    />
                  )}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        {onDelete && (
          <>
            {onUpdateColor && <ContextMenuSeparator />}
            <ContextMenuItem
              variant="destructive"
              className="gap-0"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              <HugeiconsIcon
                icon={RemoveSquareIcon}
                strokeWidth={2}
                className="mr-2"
              />
              <span>Remove track</span>
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
  groupColor: GroupColor;
  onReorder?: (trackIds: string[]) => void;
  onDelete?: (trackId: string) => void;
  onUpdateColor?: (trackId: string, color: TrackColor) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

export const SortableTracks = ({
  groupId,
  tracks,
  groupColor,
  onReorder,
  onDelete,
  onUpdateColor,
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

  // Map group color to track color for default
  const defaultTrackColor = mapGroupColorToTrackColor(groupColor);

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
              defaultColor={defaultTrackColor}
              onDelete={onDelete}
              onUpdateColor={onUpdateColor}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
