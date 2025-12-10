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
        await new Promise<void>((resolve, reject) => {
            let command = ffmpeg();

            // Add inputs
            filePaths.forEach((p) => {
                command = command.input(p);
            });

            // Build complex filter
            // Logic:
            // [0][1]acrossfade=d=5:c1=tri:c2=tri[a1]
            // [a1][2]acrossfade=d=5:c1=tri:c2=tri[a2]
            // ...

            const filterComplex: string[] = [];
            let lastLabel = "0";

            for (let i = 1; i < filePaths.length; i++) {
                const input1 = i === 1 ? "0" : `a${i - 1}`;
                const input2 = `${i}`;
                const output = i === filePaths.length - 1 ? "out" : `a${i}`;

                filterComplex.push(
                    `[${input1}][${input2}]acrossfade=d=${crossfade}:c1=tri:c2=tri[${output}]`
                );
            }

            command
                .complexFilter(filterComplex.join(";"))
                .map("[out]")
                .output(outputPath)
                .on("end", () => resolve())
                .on("error", (err) => {
                    console.error("FFmpeg error:", err);
                    reject(err);
                })
                .run();
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
