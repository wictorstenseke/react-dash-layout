import { useState } from "react";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
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

interface Square {
  id: string;
  label: string;
  color: string;
}

interface SortableSquaresProps {
  groupId: string;
  initialSquares?: Square[];
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const defaultSquares: Square[] = [
  { id: "1", label: "1", color: "bg-blue-500" },
  { id: "2", label: "2", color: "bg-green-500" },
  { id: "3", label: "3", color: "bg-yellow-500" },
  { id: "4", label: "4", color: "bg-red-500" },
  { id: "5", label: "5", color: "bg-purple-500" },
];

const getStorageKey = (groupId: string) => `squares-${groupId}`;

const loadSquares = (groupId: string, fallback: Square[]): Square[] => {
  try {
    const saved = localStorage.getItem(getStorageKey(groupId));
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const saveSquares = (groupId: string, squares: Square[]) => {
  try {
    localStorage.setItem(getStorageKey(groupId), JSON.stringify(squares));
  } catch (error) {
    console.error("Failed to save squares:", error);
  }
};

const SortableSquare = ({ square }: { square: Square }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: square.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${square.color} w-18 h-18 rounded-md flex items-center justify-center text-white font-semibold cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow`}
    >
      {square.label}
    </div>
  );
};

export const SortableSquares = ({
  groupId,
  initialSquares = defaultSquares,
  onDragStart,
  onDragEnd,
}: SortableSquaresProps) => {
  const [squares, setSquares] = useState<Square[]>(() =>
    loadSquares(groupId, initialSquares)
  );

  // Configure sensors to prevent conflicts with react-grid-layout
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragStart = (_event: DragStartEvent) => {
    onDragStart?.();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSquares((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newSquares = arrayMove(items, oldIndex, newIndex);
        saveSquares(groupId, newSquares);
        return newSquares;
      });
    }
    onDragEnd?.();
  };

  return (
    <DndContext
      id={groupId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={squares.map((s) => s.id)}
        strategy={rectSortingStrategy}
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {squares.map((square) => (
            <SortableSquare key={square.id} square={square} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
