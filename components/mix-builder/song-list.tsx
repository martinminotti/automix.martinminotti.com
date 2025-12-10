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
import { GripVertical, X, Music2, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Song {
  id: string;
  file: File;
}

interface SongListProps {
  songs: Song[];
  onReorder: (songs: Song[]) => void;
  onRemove: (id: string) => void;
}

function SortableItem({
  song,
  index,
  onRemove,
}: {
  song: Song;
  index: number;
  onRemove: (id: string) => void;
}) {
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
      className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group ${
        isDragging
          ? "bg-violet-500/20 border-violet-500/50 shadow-2xl scale-105"
          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-gray-500 hover:text-white transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-inner">
        <span className="text-xs font-bold text-gray-500 font-mono">
          {index + 1}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate text-base">
          {song.file.name.replace(/\.[^/.]+$/, "")}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
            {(song.file.size / 1024 / 1024).toFixed(2)} MB
          </span>
          <span className="text-xs text-gray-500 uppercase">
            {song.file.type.split("/")[1] || "MP3"}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(song.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
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
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {songs.map((song, index) => (
              <SortableItem
                key={song.id}
                song={song}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}
