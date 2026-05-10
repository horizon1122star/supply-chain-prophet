import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") || "Global";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Path to the python script
      // It is located at the root of the Agentic-Ai directory.
      const scriptPath = path.resolve(process.cwd(), "../run_weather.py");

      const pythonProcess = spawn("python", [scriptPath, query], {
        // Run with unbuffered output if possible, though flush=True in python handles it
        env: { ...process.env, PYTHONUNBUFFERED: "1" },
      });

      pythonProcess.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            try {
              // Only send if it's parseable JSON (to filter out random python warnings)
              JSON.parse(line.trim());
              controller.enqueue(encoder.encode(`data: ${line.trim()}\n\n`));
            } catch {
              // Not JSON, ignore or log
              console.warn("Non-JSON output from Python:", line.trim());
            }
          }
        }
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
