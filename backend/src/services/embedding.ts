import { spawn, ChildProcess } from "child_process";
import { createInterface, Interface } from "readline";
import { existsSync } from "fs";
import path from "path";

const LOCAL_EMBED_SCRIPT = path.resolve(__dirname, "../ml/local_embed.py");
const VENV_PYTHON = path.resolve(__dirname, "../../.venv/bin/python3");
const PYTHON_CMD = existsSync(VENV_PYTHON) ? VENV_PYTHON : "python3";

interface QueuedRequest {
  texts: string[];
  resolve: (embeddings: number[][]) => void;
  reject: (err: Error) => void;
}

let worker: ChildProcess | null = null;
let rl: Interface | null = null;
let ready = false;
let startPromise: Promise<void> | null = null;
const queue: QueuedRequest[] = [];
let inFlight: QueuedRequest | null = null;

function flush() {
  if (inFlight || !ready || !worker || queue.length === 0) return;
  inFlight = queue.shift()!;
  worker.stdin!.write(JSON.stringify({ texts: inFlight.texts }) + "\n");
}

function handleCrash(code: number | null) {
  const failed: QueuedRequest[] = [];
  if (inFlight) {
    failed.push(inFlight);
    inFlight = null;
  }
  while (queue.length > 0) {
    failed.push(queue.shift()!);
  }
  worker = null;
  rl = null;
  ready = false;
  startPromise = null;
  for (const req of failed) {
    req.reject(new Error(`Python worker exited with code ${code}`));
  }
}

function start(): Promise<void> {
  if (startPromise) return startPromise;

  startPromise = new Promise<void>((resolve, reject) => {
    worker = spawn(PYTHON_CMD, [LOCAL_EMBED_SCRIPT]);

    worker.stderr?.on("data", (data: Buffer) => {
      console.error(`[python] ${data.toString().trim()}`);
    });

    rl = createInterface({ input: worker.stdout! });

    rl.on("line", (line: string) => {
      if (!ready) {
        try {
          const msg = JSON.parse(line);
          if (msg.status === "ready") {
            ready = true;
            resolve();
            flush();
          }
        } catch {
          reject(new Error(`Unexpected first line from Python: ${line}`));
        }
        return;
      }

      if (!inFlight) return;

      const req = inFlight;
      inFlight = null;

      try {
        const result = JSON.parse(line);
        if (result.error) {
          req.reject(new Error(result.error));
        } else {
          req.resolve(result.embeddings);
        }
      } catch {
        req.reject(
          new Error(`Invalid JSON from Python: ${line.slice(0, 200)}`)
        );
      }

      flush();
    });

    worker.on("close", (code: number | null) => {
      handleCrash(code);
    });

    worker.on("error", (err: Error) => {
      worker = null;
      rl = null;
      ready = false;
      startPromise = null;
      reject(err);
    });
  });

  return startPromise;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  return new Promise((resolve, reject) => {
    queue.push({ texts, resolve, reject });

    if (!startPromise) {
      start().catch((err) => {
        const failed = [...queue];
        queue.length = 0;
        inFlight = null;
        for (const req of failed) req.reject(err);
      });
    }

    flush();
  });
}
