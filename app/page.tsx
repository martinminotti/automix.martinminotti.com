"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Dropzone } from "@/components/mix-builder/dropzone";
import { SongList } from "@/components/mix-builder/song-list";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Music2, Wand2, Sparkles, AudioWaveform } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Song {
  id: string;
  file: File;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [crossfade, setCrossfade] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesDropped = (files: File[]) => {
    const newSongs = files.map((file) => ({
      id: uuidv4(),
      file,
    }));
    setSongs((prev) => [...prev, ...newSongs]);
    setDownloadUrl(null);
  };

  const handleReorder = (newSongs: Song[]) => {
    setSongs(newSongs);
  };

  const handleRemove = (id: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleGenerateMix = async () => {
    if (songs.length < 2) {
      setError("Please upload at least 2 songs to create a mix.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setDownloadUrl(null);

    const formData = new FormData();
    songs.forEach((song) => {
      formData.append("files", song.file);
    });
    formData.append("crossfade", crossfade.toString());

    try {
      const response = await fetch("/api/mix", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate mix");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center py-20 px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center space-y-6 mb-20"
      >
        <div className="relative inline-flex items-center justify-center mb-2">
          <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <AudioWaveform className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Auto<span className="text-primary">Mix</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Create seamless, professional mixes in seconds.
            <br className="hidden md:block" />
            Drag, drop, and let our AI engine handle the transitions.
          </p>
        </div>
      </motion.div>

      <div className="w-full grid gap-12">
        {/* Upload Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="glass rounded-3xl p-1">
            <div className="bg-card/50 rounded-[22px] p-8 md:p-10 border border-white/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">1</div>
                <h2 className="text-2xl font-semibold text-white">Upload Tracks</h2>
              </div>
              <Dropzone onFilesDropped={handleFilesDropped} />
            </div>
          </div>
        </motion.section>

        <AnimatePresence>
          {songs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid lg:grid-cols-12 gap-8 w-full"
            >
              {/* Playlist Section */}
              <div className="lg:col-span-8 space-y-4">
                <div className="glass rounded-3xl p-1 h-full">
                  <div className="bg-card/50 rounded-[22px] p-8 md:p-10 border border-white/5 h-full">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">2</div>
                      <h2 className="text-2xl font-semibold text-white">Arrange Playlist</h2>
                    </div>
                    <SongList
                      songs={songs}
                      onReorder={handleReorder}
                      onRemove={handleRemove}
                    />
                  </div>
                </div>
              </div>

              {/* Settings & Actions Section */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass rounded-3xl p-1">
                  <div className="bg-card/50 rounded-[22px] p-8 border border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">3</div>
                      <h2 className="text-2xl font-semibold text-white">Mix Settings</h2>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-medium text-gray-300">Crossfade Duration</label>
                          <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-sm font-mono text-primary">
                            {crossfade}s
                          </span>
                        </div>
                        <Slider
                          min={0}
                          max={15}
                          step={1}
                          value={crossfade}
                          onChange={(e) => setCrossfade(Number(e.target.value))}
                          className="py-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          <span>Cut (0s)</span>
                          <span>Smooth (15s)</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 text-sm text-primary mb-2 font-medium">
                          <Sparkles className="w-4 h-4" />
                          <span>Smart Transition</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Our engine automatically analyzes volume levels to ensure smooth transitions between tracks.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Button
                    size="lg"
                    className="w-full h-16 text-lg bg-white text-black hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5 font-bold rounded-2xl"
                    onClick={handleGenerateMix}
                    disabled={isProcessing || songs.length < 2}
                  >
                    {isProcessing ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Processing Mix...
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Wand2 className="h-6 w-6" />
                        Generate Mix
                      </div>
                    )}
                  </Button>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium"
                      >
                        {error}
                      </motion.div>
                    )}

                    {downloadUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-3"
                      >
                        <a
                          href={downloadUrl}
                          download="automix-session.mp3"
                          className="block"
                        >
                          <Button
                            size="lg"
                            className="w-full h-16 text-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-400 hover:to-green-500 border-0 shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold rounded-2xl"
                          >
                            <Download className="mr-3 h-6 w-6" />
                            Download Mix
                          </Button>
                        </a>
                        <p className="text-center text-xs text-muted-foreground font-medium animate-pulse">
                          Ready for the dancefloor! 🕺
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
