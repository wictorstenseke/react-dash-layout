import { useEffect, useRef, useState } from "react";

import {
  ArrowReloadHorizontalIcon,
  Upload03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import ReactGridLayout, {
  useContainerWidth,
  type Layout,
  verticalCompactor,
} from "react-grid-layout";

import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { GroupCard } from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthProvider";
import { useDeleteGroupMutation, useGroupsQuery } from "@/hooks/useGroups";

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
  const { user } = useAuth();
  const { data: groups = [], isLoading } = useGroupsQuery();
  const deleteGroup = useDeleteGroupMutation();

  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState<Layout>([]);
  const [isSquareDragging, setIsSquareDragging] = useState(false);

  // Track previous group IDs to detect actual changes
  const prevGroupIdsRef = useRef<string>("");

  // Sync layout when user or groups change
  // Note: This effect synchronizes React state with localStorage (external system)
  // and merges with dynamic group data, which is a legitimate use case for effects.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!user?.uid || groups.length === 0) {
      if (layout.length > 0) {
        setLayout([]);
      }
      prevGroupIdsRef.current = "";
      return;
    }

    // Check if groups actually changed by comparing IDs
    const currentGroupIds = groups.map((g) => g.id).join(",");
    if (prevGroupIdsRef.current === currentGroupIds) {
      return; // No change in groups, skip update
    }
    prevGroupIdsRef.current = currentGroupIds;

    // Load saved layout from localStorage
    const savedLayout = loadLayout(user.uid);
    const savedLayoutMap = new Map(savedLayout.map((item) => [item.i, item]));

    // Build final layout: use saved positions/sizes, or generate defaults for new groups
    const newLayout: Layout = groups.map((group, index) => {
      if (savedLayoutMap.has(group.id)) {
        // Use saved layout for this group
        return savedLayoutMap.get(group.id)!;
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

    setLayout(newLayout);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [user?.uid, groups, layout.length]);

  // Save layout when it changes
  useEffect(() => {
    if (user?.uid && layout.length > 0) {
      saveLayout(user.uid, layout);
    }
  }, [layout, user?.uid]);

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
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

  const handleBringToTop = () => {
    setLayout((currentLayout) =>
      verticalCompactor.compact(currentLayout, GRID_COLS)
    );
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading your dashboard…</div>
      </div>
    );
  }

  // Empty state
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
          <p className="text-muted-foreground max-w-md">
            Create your first group to start organizing your tracks. Groups help
            you organize songs into sets, playlists, or categories.
          </p>
        </div>
        <CreateGroupDialog
          trigger={<Button size="lg">Create your first group</Button>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 py-4">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {groups.length} group{groups.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateGroupDialog />
            <Button variant="outline" size="sm" onClick={handleBringToTop}>
              <HugeiconsIcon icon={Upload03Icon} className="mr-1.5" />
              <span>Compact</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetLayout}>
              <HugeiconsIcon
                icon={ArrowReloadHorizontalIcon}
                className="mr-1.5"
              />
              <span>Reset layout</span>
            </Button>
          </div>
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
  );
};
