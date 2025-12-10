"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Dropzone } from "@/components/mix-builder/dropzone";
import { SongList } from "@/components/mix-builder/song-list";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Music2, Wand2 } from "lucide-react";

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
    setDownloadUrl(null); // Reset download if new files added
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

      // Get the blob from response
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
    <main className="min-h-screen p-4 md:p-24 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/10 backdrop-blur-sm mb-4">
          <Music2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          AutoMix
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create professional seamless mixes from your MP3s in seconds.
          Drag, drop, and let our AI-powered engine handle the crossfades.
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="border-gray-800 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>1. Upload Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <Dropzone onFilesDropped={handleFilesDropped} />
          </CardContent>
        </Card>

        {songs.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-gray-800 bg-black/40 backdrop-blur-xl h-fit">
              <CardHeader>
                <CardTitle>2. Arrange Playlist</CardTitle>
              </CardHeader>
              <CardContent>
                <SongList
                  songs={songs}
                  onReorder={handleReorder}
                  onRemove={handleRemove}
                />
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="border-gray-800 bg-black/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>3. Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Slider
                      label="Crossfade Duration"
                      valueDisplay={`${crossfade}s`}
                      min={0}
                      max={15}
                      step={1}
                      value={crossfade}
                      onChange={(e) => setCrossfade(Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">
                      Time overlap between songs. Higher values create smoother, longer transitions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="w-full text-lg h-16 bg-white text-black hover:bg-gray-200 transition-all shadow-lg shadow-white/10"
                onClick={handleGenerateMix}
                disabled={isProcessing || songs.length < 2}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Mix...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Mix
                  </>
                )}
              </Button>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {downloadUrl && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <a
                    href={downloadUrl}
                    download="automix-session.mp3"
                    className="block"
                  >
                    <Button
                      size="lg"
                      className="w-full text-lg h-16 bg-green-500 text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Mix
                    </Button>
                  </a>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Your mix is ready! Click to download.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
