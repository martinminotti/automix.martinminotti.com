"use client";

import React, { useCallback, useState } from "react";
import { Upload, Music, FileAudio } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DropzoneProps {
  onFilesDropped: (files: File[]) => void;
}

export function Dropzone({ onFilesDropped }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("audio/")
      );
      if (files.length > 0) {
        onFilesDropped(files);
      }
    },
    [onFilesDropped]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files).filter((file) =>
          file.type.startsWith("audio/")
        );
        if (files.length > 0) {
          onFilesDropped(files);
        }
      }
    },
    [onFilesDropped]
  );

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      animate={{
        borderColor: isDragging ? "rgb(139, 92, 246)" : "rgba(255,255,255,0.1)",
        backgroundColor: isDragging
          ? "rgba(139, 92, 246, 0.1)"
          : "rgba(0,0,0,0.2)",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
      )}
    >
      <input
        type="file"
        multiple
        accept="audio/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
        onChange={handleFileInput}
      />
      
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex flex-col items-center space-y-4 text-center z-10 p-4">
        <motion.div
          animate={{
            y: isDragging ? -10 : 0,
            scale: isDragging ? 1.1 : 1,
          }}
          className="p-4 rounded-full bg-white/5 ring-1 ring-white/10 shadow-xl backdrop-blur-md group-hover:bg-white/10 transition-colors"
        >
          {isDragging ? (
            <FileAudio className="w-8 h-8 text-violet-400" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
          )}
        </motion.div>
        
        <div className="space-y-1">
          <p className="text-lg font-medium text-white">
            {isDragging ? "Rilascia i file qui" : "Carica le tracce"}
          </p>
          <p className="text-sm text-gray-400 px-4">
            Trascina qui i file o clicca per sfogliare
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          <Music className="w-3 h-3" />
          <span>MP3, WAV, M4A supportati</span>
        </div>
      </div>
    </motion.div>
  );
}
