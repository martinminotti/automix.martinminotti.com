"use client";

import React, { useCallback } from "react";
import { Upload, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFilesDropped: (files: File[]) => void;
}

export function Dropzone({ onFilesDropped }: DropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);

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
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-colors duration-200 ease-in-out cursor-pointer",
        isDragging
          ? "border-white bg-white/10"
          : "border-gray-700 hover:border-gray-500 hover:bg-white/5"
      )}
    >
      <input
        type="file"
        multiple
        accept="audio/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
      />
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="p-3 rounded-full bg-gray-800">
          <Upload className="w-6 h-6 text-gray-400" />
        </div>
        <div className="text-sm">
          <span className="font-semibold text-white">Click to upload</span> or
          drag and drop
        </div>
        <p className="text-xs text-gray-500">MP3, WAV, M4A (Max 50MB each)</p>
      </div>
    </div>
  );
}
