# AutoMix - Professional MP3 Mixer

A modern web application to mix multiple MP3 files with automatic crossfade.

## Features

- **Drag & Drop Upload**: Easily upload multiple MP3 files.
- **Sortable Playlist**: Drag to reorder your tracks.
- **Configurable Crossfade**: Adjust the overlap time between songs (0-15s).
- **Server-side Processing**: High-quality audio processing using FFmpeg.
- **Instant Download**: Get your mixed MP3 immediately.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Framer Motion (via dnd-kit).
- **Backend**: Next.js API Routes.
- **Audio Processing**: FFmpeg (via fluent-ffmpeg).

## Prerequisites

- Node.js 18+
- FFmpeg installed on your system (must be in PATH).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Drag and drop your MP3 files into the upload area.
2. Arrange the order of songs by dragging them in the list.
3. Use the slider to set the crossfade duration (e.g., 5 seconds).
4. Click "Generate Mix".
5. Wait for processing and download your mix!

## Extending the Project

- **BPM Analysis**: Use `music-tempo` or FFmpeg's `bpm` filter to detect tempo and match beats.
- **Volume Normalization**: Add `loudnorm` filter to the FFmpeg chain.
- **Metadata**: Use `node-id3` to read/write ID3 tags (Artist, Title, Cover Art).
- **Waveform Visualization**: Use `wavesurfer.js` on the frontend to show previews.
