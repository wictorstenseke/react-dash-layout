import { useEffect, useRef, useState } from "react";

import {
  Add01Icon,
  PauseIcon,
  PlayIcon,
  Playlist01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import ReactGridLayout, {
  useContainerWidth,
  type Layout,
} from "react-grid-layout";

import { CommandPalette } from "@/components/CommandPalette";
import { GroupCard } from "@/components/GroupCard";
import { PlayerStatus } from "@/components/PlayerStatus";
import { SpotifyConnectButton } from "@/components/SpotifyConnectButton";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useCommandPalette } from "@/contexts/CommandPaletteContext";
import { useAuth } from "@/features/auth/AuthProvider";
import { usePlayback } from "@/features/playback/PlaybackProvider";
import { useSpotifyPlayer } from "@/features/spotify/SpotifyPlayerProvider";
import {
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useGroupsQuery,
} from "@/hooks/useGroups";

const GRID_COLS = 48;
const STORAGE_KEY_PREFIX = "dashboard-layout-";

const getStorageKey = (uid: string) => `${STORAGE_KEY_PREFIX}${uid}`;

const DEFAULT_WIDTH = 11;
const DEFAULT_HEIGHT = 8;

const loadLayout = (uid: string): Layout => {
  try {
    const saved = localStorage.getItem(getStorageKey(uid));
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

const saveLayout = (uid: string, layout: Layout) => {
  try {
    localStorage.setItem(getStorageKey(uid), JSON.stringify(layout));
  } catch (error) {
    console.error("Failed to save layout:", error);
  }
};

/**
 * Protected app page - main dashboard with groups and tracks
 */
export const App = () => {
  const { user, loading: authLoading, isAuthed } = useAuth();
  const { data: groups = [], isLoading, dataUpdatedAt } = useGroupsQuery();
  const deleteGroup = useDeleteGroupMutation();
  const createGroup = useCreateGroupMutation();
  const { isReady } = useSpotifyPlayer();
  const { togglePlayPause, isPlaying, selectedTrackId } = usePlayback();
  const { open, setOpen } = useCommandPalette();

  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState<Layout>([]);
  const [isSquareDragging, setIsSquareDragging] = useState(false);

  // Keyboard handler for Space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Space key and not in an input or text area
      if (e.code === "Space" && document.activeElement) {
        const tagName = document.activeElement.tagName.toLowerCase();
        const isContentEditable =
          document.activeElement.getAttribute("contenteditable") === "true";

        // Don't handle if in input, textarea, or contenteditable element
        if (
          tagName === "input" ||
          tagName === "textarea" ||
          isContentEditable
        ) {
          return;
        }

        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause]);

  // Track previous group IDs to detect actual changes
  const prevGroupIdsRef = useRef<string>("");
  // Track previous dataUpdatedAt to prevent unnecessary re-runs
  const prevDataUpdatedAtRef = useRef<number | undefined>(undefined);
  // Flag to skip onLayoutChange when we programmatically set the layout
  const skipNextLayoutChangeRef = useRef(false);
  // Track initial mount to skip saving on first render
  const isInitialMountRef = useRef(true);

  // Build layout from groups - this is computed, not an effect
  const computeLayout = (groupList: typeof groups, uid: string): Layout => {
    const savedLayout = loadLayout(uid);
    const savedLayoutMap = new Map(savedLayout.map((item) => [item.i, item]));

    return groupList.map((group, index) => {
      if (savedLayoutMap.has(group.id)) {
        const saved = savedLayoutMap.get(group.id)!;
        return {
          ...saved,
          w: saved.w ?? DEFAULT_WIDTH,
          h: saved.h ?? DEFAULT_HEIGHT,
        };
      } else {
        // Generate default layout for new group
        const row = Math.floor(index / 3);
        const col = index % 3;
        return {
          i: group.id,
          x: col * 16,
          y: row * 10,
          w: DEFAULT_WIDTH,
          h: DEFAULT_HEIGHT,
        };
      }
    });
  };

  // Sync layout when user or groups change
  useEffect(() => {
    // Early return if no user - don't process layout or update state
    // This prevents any state updates that could trigger re-renders
    if (!user?.uid || !isAuthed) {
      // Only clear layout if it's not already empty to avoid unnecessary updates
      if (layout.length > 0) {
        setLayout([]);
      }
      prevGroupIdsRef.current = "";
      prevDataUpdatedAtRef.current = undefined;
      return;
    }

    // If query is disabled or dataUpdatedAt is undefined, don't proceed
    // This prevents infinite loops when navigating while not authenticated
    if (dataUpdatedAt === undefined) {
      return;
    }

    // Only proceed if dataUpdatedAt has actually changed
    // This prevents re-running when the same data is returned
    if (dataUpdatedAt === prevDataUpdatedAtRef.current) {
      return;
    }
    prevDataUpdatedAtRef.current = dataUpdatedAt;

    // If no groups, clear layout
    if (groups.length === 0) {
      setLayout((current) => (current.length > 0 ? [] : current));
      prevGroupIdsRef.current = "";
      return;
    }

    // Check if groups actually changed by comparing IDs
    const currentGroupIds = groups.map((g) => g.id).join(",");
    if (prevGroupIdsRef.current === currentGroupIds) {
      return;
    }
    prevGroupIdsRef.current = currentGroupIds;

    const newLayout = computeLayout(groups, user.uid);
    skipNextLayoutChangeRef.current = true;
    setLayout(newLayout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, dataUpdatedAt]);

  // Save layout when it changes (but not on initial load)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (user?.uid && layout.length > 0) {
      saveLayout(user.uid, layout);
    }
  }, [layout, user?.uid]);

  // Early return if not authenticated - prevents any effects from running
  // This is a safety check in case RequireAuth hasn't redirected yet
  if (authLoading || !isAuthed || !user?.uid) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const handleLayoutChange = (newLayout: Layout) => {
    // Skip if this was triggered by our programmatic update
    if (skipNextLayoutChangeRef.current) {
      skipNextLayoutChangeRef.current = false;
      return;
    }

    // Ensure all layout items have valid dimensions
    const validatedLayout: Layout = newLayout.map((item) => ({
      ...item,
      w: item.w ?? DEFAULT_WIDTH,
      h: item.h ?? DEFAULT_HEIGHT,
    }));

    setLayout(validatedLayout);
  };

  const handleResetLayout = () => {
    if (!user?.uid) return;
    localStorage.removeItem(getStorageKey(user.uid));
    // Regenerate default layout
    const defaultLayout: Layout = groups.map((group, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      return {
        i: group.id,
        x: col * 16,
        y: row * 10,
        w: DEFAULT_WIDTH,
        h: DEFAULT_HEIGHT,
      };
    });
    setLayout(defaultLayout);
  };

  const handleToggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup.mutate(groupId);
    // Remove from layout
    setLayout((current) => current.filter((item) => item.i !== groupId));
  };

  const handleSquareDragStart = () => {
    setIsSquareDragging(true);
  };

  const handleSquareDragEnd = () => {
    setIsSquareDragging(false);
  };

  const handleCreateGroup = async () => {
    const groupNumber = (groups?.length ?? 0) + 1;
    await createGroup.mutateAsync({
      name: `Group ${groupNumber}`,
      color: "gray",
      order: groups?.length ?? 0,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading your Trackboard…</div>
      </div>
    );
  }

  // Empty state
  if (groups.length === 0) {
    return (
      <>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          onCreateGroup={handleCreateGroup}
          onResetLayout={handleResetLayout}
          onToggleTheme={handleToggleTheme}
        />
        <div className="flex flex-col space-y-6 py-4">
          {/* Page Header */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCreateGroup}>
                <HugeiconsIcon icon={Add01Icon} />
                <span>Create Group</span>
              </Button>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <PlayerStatus />
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                disabled={!isReady || !selectedTrackId}
              >
                <HugeiconsIcon
                  icon={isPlaying ? PauseIcon : PlayIcon}
                  className="mr-1.5"
                />
                <span>{isPlaying ? "Pause" : "Play"}</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <SpotifyConnectButton size="sm" />
            </div>
          </div>
          <Empty className="bg-muted/50 p-20 rounded-xl border w-auto max-w-2xl mx-auto">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon
                  icon={Playlist01Icon}
                  strokeWidth={1.5}
                  className="size-12"
                />
              </EmptyMedia>
              <EmptyTitle>Welcome to Trackboard</EmptyTitle>
              <EmptyDescription>
                Create a group to organize your tracks into sets, playlists, or
                categories.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={handleCreateGroup}>
                <HugeiconsIcon icon={Add01Icon} className="mr-1.5" />
                <span>Create your first group</span>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </>
    );
  }

  return (
    <>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onCreateGroup={handleCreateGroup}
        onResetLayout={handleResetLayout}
        onToggleTheme={handleToggleTheme}
      />
      <div className="flex flex-col space-y-6 py-4">
        {/* Page Header */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCreateGroup}>
              <HugeiconsIcon icon={Add01Icon} />
              <span>Create Group</span>
            </Button>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <PlayerStatus />
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
              disabled={!isReady || !selectedTrackId}
            >
              <HugeiconsIcon
                icon={isPlaying ? PauseIcon : PlayIcon}
                className="mr-1.5"
              />
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <SpotifyConnectButton size="sm" />
          </div>
        </div>

        {/* Grid Layout Container */}
        <div ref={containerRef} className="w-full">
          {mounted && layout.length > 0 && (
            <ReactGridLayout
              layout={layout}
              onLayoutChange={handleLayoutChange}
              width={width}
              gridConfig={{
                cols: GRID_COLS,
                rowHeight: 16,
                margin: [12, 12],
                containerPadding: [16, 16],
              }}
              dragConfig={{
                enabled: !isSquareDragging,
                threshold: 3,
                handle: ".drag-handle",
                cancel: ".no-drag",
              }}
              resizeConfig={{
                enabled: true,
                handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
              }}
            >
              {groups.map((group) => (
                <div key={group.id}>
                  <GroupCard
                    group={group}
                    onDelete={() => handleDeleteGroup(group.id)}
                    onSquareDragStart={handleSquareDragStart}
                    onSquareDragEnd={handleSquareDragEnd}
                  />
                </div>
              ))}
            </ReactGridLayout>
          )}
        </div>
      </div>
    </>
  );
};
