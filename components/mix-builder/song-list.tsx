"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Song {
  id: string;
  file: File;
}

interface SongListProps {
  songs: Song[];
  onReorder: (songs: Song[]) => void;
  onRemove: (id: string) => void;
}

function SortableItem({ song, onRemove }: { song: Song; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-800 rounded-lg group ${
        isDragging ? "opacity-50 ring-2 ring-white/20" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-white"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="p-2 rounded bg-gray-800 text-gray-400">
        <Music className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {song.file.name}
        </p>
        <p className="text-xs text-gray-500">
          {(song.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(song.id)}
        className="text-gray-500 hover:text-red-400 hover:bg-red-400/10"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function SongList({ songs, onReorder, onRemove }: SongListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = songs.findIndex((s) => s.id === active.id);
      const newIndex = songs.findIndex((s) => s.id === over.id);
      onReorder(arrayMove(songs, oldIndex, newIndex));
    }
  }

  if (songs.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={songs.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {songs.map((song) => (
            <SortableItem key={song.id} song={song} onRemove={onRemove} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
