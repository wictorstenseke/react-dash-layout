import { useEffect, useRef, useState } from "react";

import { Add01Icon, Playlist01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import ReactGridLayout, {
  useContainerWidth,
  type Layout,
} from "react-grid-layout";

import { CommandPalette } from "@/components/CommandPalette";
import { GroupCard } from "@/components/GroupCard";
import { AppHeader, type DashboardMode } from "@/components/layout/AppHeader";
import { PlayerBar } from "@/components/layout/PlayerBar";
import { SpotifyConnectDialog } from "@/components/SpotifyConnectDialog";
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
import { useSpotifyStatus } from "@/features/spotify/useSpotifyAuth";
import {
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useGroupsQuery,
} from "@/hooks/useGroups";

const GRID_COLS = 48;
const STORAGE_KEY_PREFIX = "dashboard-layout-";

const getStorageKey = (uid: string) => `${STORAGE_KEY_PREFIX}${uid}`;
const getModeStorageKey = (uid: string) => `dashboard-mode-${uid}`;

const DEFAULT_WIDTH = 11;
const DEFAULT_HEIGHT = 8;

const loadMode = (uid: string): DashboardMode => {
  try {
    const saved = localStorage.getItem(getModeStorageKey(uid));
    if (saved === "edit" || saved === "match") {
      return saved;
    }
  } catch {
    // Ignore errors
  }
  return "edit"; // Default to edit mode
};

const saveMode = (uid: string, mode: DashboardMode) => {
  try {
    localStorage.setItem(getModeStorageKey(uid), mode);
  } catch (error) {
    console.error("Failed to save mode:", error);
  }
};

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
  const { open, setOpen } = useCommandPalette();
  const { isLinked, loading: spotifyStatusLoading } = useSpotifyStatus();
  const { togglePlayPause } = usePlayback();

  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: false,
    initialWidth: typeof window !== 'undefined' ? window.innerWidth : 1280,
  });
  const [layout, setLayout] = useState<Layout>([]);
  const [isSquareDragging, setIsSquareDragging] = useState(false);
  const [showSpotifyDialog, setShowSpotifyDialog] = useState(false);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const hasCheckedSpotifyRef = useRef(false);
  const [mode, setMode] = useState<DashboardMode>(() => {
    if (user?.uid) {
      return loadMode(user.uid);
    }
    return "edit";
  });


  // Reset check ref when user changes
  useEffect(() => {
    if (user?.uid) {
      hasCheckedSpotifyRef.current = false;
      // Load mode for new user
      setMode(loadMode(user.uid));
    }
  }, [user?.uid]);

  // Save mode when it changes
  useEffect(() => {
    if (user?.uid) {
      saveMode(user.uid, mode);
    }
  }, [mode, user?.uid]);

  const handleModeChange = (newMode: DashboardMode) => {
    setMode(newMode);
  };

  // Global keyboard handler for cmd+l to toggle mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle cmd+l or ctrl+l
      if (e.key !== "l" || (!e.metaKey && !e.ctrlKey)) {
        return;
      }

      // Don't interfere with text inputs, textareas, or contenteditable elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest('[role="textbox"]') ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }

      // Don't interfere if command palette or dialogs are open
      if (open || showSpotifyDialog) {
        return;
      }

      // Prevent default
      e.preventDefault();

      // Toggle mode
      setMode((current) => (current === "edit" ? "match" : "edit"));
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, showSpotifyDialog]);

  // Global keyboard handler for spacebar to toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle spacebar
      if (e.key !== " " || e.keyCode !== 32) {
        return;
      }

      // Don't interfere with text inputs, textareas, or contenteditable elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest('[role="textbox"]') ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }

      // Don't interfere if command palette or dialogs are open
      if (open || showSpotifyDialog) {
        return;
      }

      // Prevent default scrolling behavior
      e.preventDefault();

      // Toggle play/pause
      togglePlayPause();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, open, showSpotifyDialog]);

  // Bootstrap: Check Spotify connection status and handle OAuth errors
  useEffect(() => {
    // Check for OAuth callback errors in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const spotifyError = urlParams.get("spotify");
    const errorMessage = urlParams.get("message");

    if (spotifyError === "error" && errorMessage) {
      // Parse and format error message for user-friendly display
      let formattedMessage = errorMessage;
      if (
        errorMessage.includes("cancelled") ||
        errorMessage.includes("denied")
      ) {
        formattedMessage = "Connection cancelled. Please try again.";
      } else if (
        errorMessage.includes("expired") ||
        errorMessage.includes("refresh")
      ) {
        formattedMessage =
          "Your Spotify connection needs to be renewed. Please reconnect.";
      }
      setSpotifyError(formattedMessage);
      setShowSpotifyDialog(true);
      hasCheckedSpotifyRef.current = true;

      // Clean up URL params
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("spotify");
      newUrl.searchParams.delete("message");
      window.history.replaceState({}, "", newUrl.toString());
      return;
    }

    // Wait for auth and Spotify status to be ready
    if (
      !authLoading &&
      isAuthed &&
      user?.uid &&
      !spotifyStatusLoading &&
      !hasCheckedSpotifyRef.current
    ) {
      hasCheckedSpotifyRef.current = true;

      // Show dialog if Spotify is not linked
      if (!isLinked) {
        setShowSpotifyDialog(true);
      }
    }
  }, [authLoading, isAuthed, user?.uid, spotifyStatusLoading, isLinked]);

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

  // Close dialog when Spotify becomes linked
  useEffect(() => {
    if (isLinked && showSpotifyDialog) {
      setShowSpotifyDialog(false);
      setSpotifyError(null);
    }
  }, [isLinked, showSpotifyDialog]);

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
          onToggleMode={() => setMode((current) => (current === "edit" ? "match" : "edit"))}
        />
        <SpotifyConnectDialog
          open={showSpotifyDialog}
          onOpenChange={setShowSpotifyDialog}
          errorMessage={spotifyError}
        />
        <AppHeader
        mode={mode}
        onModeChange={handleModeChange}
        onCreateGroup={handleCreateGroup}
      />
        <div className="flex flex-col space-y-6 py-4 pb-20">
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
        <PlayerBar />
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
        onToggleMode={() => setMode((current) => (current === "edit" ? "match" : "edit"))}
      />
      <SpotifyConnectDialog
        open={showSpotifyDialog}
        onOpenChange={setShowSpotifyDialog}
        errorMessage={spotifyError}
      />
      <AppHeader
        mode={mode}
        onModeChange={handleModeChange}
        onCreateGroup={handleCreateGroup}
      />
      <div className="flex flex-col space-y-6 py-4 pb-20 w-full">
        {/* Grid Layout Container */}
        <div
          ref={containerRef}
          className="w-full"
          style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
        >
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
                enabled: mode === "edit" && !isSquareDragging,
                threshold: 3,
                handle: ".drag-handle",
                cancel: ".no-drag",
                bounded: false,
              }}
              resizeConfig={{
                enabled: mode === "edit",
                handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
              }}
            >
              {groups.map((group) => (
                <div key={group.id}>
                  <GroupCard
                    group={group}
                    onDelete={mode === "edit" ? () => handleDeleteGroup(group.id) : undefined}
                    onSquareDragStart={handleSquareDragStart}
                    onSquareDragEnd={handleSquareDragEnd}
                    editMode={mode === "edit"}
                  />
                </div>
              ))}
            </ReactGridLayout>
          )}
        </div>
      </div>
      <PlayerBar />
    </>
  );
};
