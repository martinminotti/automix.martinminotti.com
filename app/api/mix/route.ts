import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, rm, readFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import os from "os";

// Helper to save uploaded file
async function saveFile(file: File, dir: string): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(dir, file.name.replace(/[^a-zA-Z0-9.-]/g, "_")); // Sanitize filename
    await writeFile(filePath, buffer);
    return filePath;
}

// Configure FFmpeg path
const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
ffmpeg.setFfmpegPath(FFMPEG_PATH);

export async function POST(request: NextRequest) {
    const tempDir = path.join(os.tmpdir(), `automix-${uuidv4()}`);

    try {
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];
        const crossfade = parseInt(formData.get("crossfade") as string) || 5;

        if (files.length < 2) {
            return NextResponse.json(
                { error: "At least 2 files are required" },
                { status: 400 }
            );
        }

        // Create temp directory
        await mkdir(tempDir, { recursive: true });

        // Save files
        const filePaths = await Promise.all(
            files.map((file) => saveFile(file, tempDir))
        );

        const outputPath = path.join(tempDir, "output.mp3");

        // Build FFmpeg command
        await new Promise<void>(async (resolve, reject) => {
            try {
                // Check durations to prevent crossfade errors
                const durations = await Promise.all(
                    filePaths.map((p) => new Promise<number>((res, rej) => {
                        ffmpeg.ffprobe(p, (err, metadata) => {
                            if (err) rej(err);
                            else res(metadata.format.duration || 0);
                        });
                    }))
                );

                // Find the shortest file duration
                const minDuration = Math.min(...durations);

                // Safety check: crossfade cannot be longer than the shortest file
                // We use minDuration / 2 as a safe upper bound for middle tracks that need to fade both ends
                // But strictly for acrossfade, it just needs to be < duration.
                // To be safe and avoid "duration < crossfade" errors, we clamp it.
                const safeCrossfade = Math.min(crossfade, Math.floor(minDuration * 0.9)); // 90% of shortest duration max

                let command = ffmpeg();

                // Add inputs
                filePaths.forEach((p) => {
                    command = command.input(p);
                });

                const filterComplex: string[] = [];

                for (let i = 1; i < filePaths.length; i++) {
                    const input1 = i === 1 ? "0" : `a${i - 1}`;
                    const input2 = `${i}`;
                    const output = i === filePaths.length - 1 ? "out" : `a${i}`;

                    filterComplex.push(
                        `[${input1}][${input2}]acrossfade=d=${safeCrossfade}:c1=tri:c2=tri[${output}]`
                    );
                }

                command
                    .complexFilter(filterComplex.join(";"))
                    .map("[out]")
                    .output(outputPath)
                    .on("end", () => resolve())
                    .on("error", (err) => {
                        console.error("FFmpeg processing error:", err);
                        reject(err);
                    })
                    .run();
            } catch (e) {
                reject(e);
            }
        });

        // Read output file
        const outputBuffer = await readFile(outputPath);

        // Cleanup
        await rm(tempDir, { recursive: true, force: true });

        // Return response
        return new NextResponse(outputBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": 'attachment; filename="automix-session.mp3"',
            },
        });

    } catch (error) {
        console.error("Mix generation error:", error);
        // Try to cleanup on error
        try {
            await rm(tempDir, { recursive: true, force: true });
        } catch (e) {
            // Ignore cleanup error
        }

        return NextResponse.json(
            { error: "Failed to generate mix" },
            { status: 500 }
        );
    }
}
