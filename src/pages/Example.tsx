import { useEffect, useState } from "react";

import {
  ArrowReloadHorizontalIcon,
  DragDropHorizontalIcon,
  SquareArrowDiagonal02Icon,
  Upload03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import ReactGridLayout, {
  useContainerWidth,
  type Layout,
  verticalCompactor,
} from "react-grid-layout";

import { SortableSquares } from "@/components/SortableSquares";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const STORAGE_KEY = "grid-layout";
const GRID_COLS = 48;

const defaultLayout: Layout = [
  { i: "group1", x: 0, y: 0, w: 12, h: 10 },
  { i: "group2", x: 12, y: 0, w: 10, h: 10 },
  { i: "group3", x: 22, y: 0, w: 14, h: 10 },
  { i: "group4", x: 0, y: 10, w: 18, h: 10 },
  { i: "group5", x: 18, y: 10, w: 18, h: 10 },
];

const loadLayout = (): Layout => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultLayout;
  } catch {
    return defaultLayout;
  }
};

const saveLayout = (layout: Layout) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch (error) {
    console.error("Failed to save layout:", error);
  }
};

const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
];

const groupData = [
  {
    id: "group1",
    title: "Warm Up",
    description: "Pre-match preparation",
    color: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    defaultSquares: Array.from({ length: 8 }, (_, i) => ({
      id: `group1-${i}`,
      label: `${i + 1}`,
      color: colors[i % colors.length],
    })),
  },
  {
    id: "group2",
    title: "Goal",
    description: "Score tracking",
    color: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-300 dark:border-green-700",
    defaultSquares: Array.from({ length: 6 }, (_, i) => ({
      id: `group2-${i}`,
      label: `${i + 1}`,
      color: colors[i % colors.length],
    })),
  },
  {
    id: "group3",
    title: "Penalty",
    description: "Penalty kicks",
    color: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-300 dark:border-purple-700",
    defaultSquares: Array.from({ length: 10 }, (_, i) => ({
      id: `group3-${i}`,
      label: `${i + 1}`,
      color: colors[i % colors.length],
    })),
  },
  {
    id: "group4",
    title: "Expulsion",
    description: "Player expulsions",
    color: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-300 dark:border-orange-700",
    defaultSquares: Array.from({ length: 12 }, (_, i) => ({
      id: `group4-${i}`,
      label: `${i + 1}`,
      color: colors[i % colors.length],
    })),
  },
  {
    id: "group5",
    title: "Lounge",
    description: "Post-match area",
    color: "bg-pink-100 dark:bg-pink-900/30",
    borderColor: "border-pink-300 dark:border-pink-700",
    defaultSquares: Array.from({ length: 7 }, (_, i) => ({
      id: `group5-${i}`,
      label: `${i + 1}`,
      color: colors[i % colors.length],
    })),
  },
];

export function Example() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState<Layout>(loadLayout);
  const [isSquareDragging, setIsSquareDragging] = useState(false);

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
  };

  const handleResetLayout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLayout(defaultLayout);
  };

  const handleBringToTop = () => {
    setLayout((currentLayout) =>
      verticalCompactor.compact(currentLayout, GRID_COLS)
    );
  };

  useEffect(() => {
    saveLayout(layout);
  }, [layout]);

  const handleSquareDragStart = () => {
    setIsSquareDragging(true);
  };

  const handleSquareDragEnd = () => {
    setIsSquareDragging(false);
  };

  return (
    <div className="flex flex-col space-y-8 py-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Grid Layout Example
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBringToTop}>
              <HugeiconsIcon icon={Upload03Icon} className="mr-1.5" />
              <span>Bring to top</span>
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
        <p className="text-muted-foreground">
          Drag and resize the 5 match scenario groups below. Each group contains
          sortable squares that can be reordered by dragging. Groups can be
          resized to any size and positioned on a 48-column grid.
        </p>
      </div>

      {/* Grid Layout Container */}
      <div ref={containerRef} className="w-full">
        {mounted && (
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
            {groupData.map((group) => (
              <div
                key={group.id}
                className={`group rounded-lg border-2 ${group.borderColor} ${group.color} px-4 shadow-sm h-full flex flex-col relative`}
              >
                <div className="flex flex-col h-full">
                  <div className="mb-0 flex items-center justify-between py-4 drag-handle cursor-move shrink-0">
                    <h3 className="text-lg font-semibold">{group.title}</h3>
                    <div className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <HugeiconsIcon
                        icon={DragDropHorizontalIcon}
                        className="w-5 h-5 text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <SortableSquares
                        groupId={group.id}
                        initialSquares={group.defaultSquares}
                        onDragStart={handleSquareDragStart}
                        onDragEnd={handleSquareDragEnd}
                      />
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
            ))}
          </ReactGridLayout>
        )}
      </div>
    </div>
  );
}
