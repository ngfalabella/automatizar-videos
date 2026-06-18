import { execFile, spawn } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import { promisify } from "node:util";

import { chromium } from "playwright";
import { ZodError } from "zod";

import { aspectRatios, type AspectRatioId } from "../src/aspect-ratios";
import { brandSchema, jobSchema, type BrandConfig, type JobConfig } from "../src/schema";
import { templateCatalog, type TemplateId } from "../src/templates/catalog";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const viteBaseUrl = process.env.VITE_RENDER_URL ?? "http://127.0.0.1:5173";

async function readJsonFile(filePath: string): Promise<unknown> {
  const source = await readFile(filePath, "utf8");
  return JSON.parse(source) as unknown;
}

async function loadConfiguration(): Promise<{ job: JobConfig; brand: BrandConfig }> {
  const jobPath = path.join(projectRoot, "public", "job.json");
  const job = jobSchema.parse(await readJsonFile(jobPath));

  const brandPath = path.join(projectRoot, "public", "brands", `${job.brand}.json`);
  const brand = brandSchema.parse(await readJsonFile(brandPath));

  return { job, brand };
}

async function verifyFfmpeg(): Promise<void> {
  try {
    await execFileAsync("ffmpeg", ["-version"]);
  } catch {
    throw new Error("FFmpeg no está instalado o no está disponible en PATH.");
  }
}

async function verifyVite(): Promise<void> {
  try {
    const response = await fetch(viteBaseUrl, { signal: AbortSignal.timeout(3_000) });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch {
    throw new Error(
      `Vite no responde en ${viteBaseUrl}. Ejecutá \"npm run dev\" en otra terminal.`,
    );
  }
}

type ReadlineInterface = ReturnType<typeof createInterface>;

async function askOption<T extends string>(
  readline: ReadlineInterface,
  question: string,
  options: readonly { id: T; label: string; description: string }[],
  defaultId: T,
): Promise<T> {
  console.log(`\n${question}`);
  options.forEach((option, index) => {
    const defaultMark = option.id === defaultId ? " (predeterminada)" : "";
    console.log(`${index + 1}. ${option.label} — ${option.description}${defaultMark}`);
  });

  while (true) {
    const answer = (await readline.question("> ")).trim();

    if (!answer) {
      return defaultId;
    }

    const selectedIndex = Number.parseInt(answer, 10) - 1;
    const selectedOption = options[selectedIndex];

    if (selectedOption) {
      return selectedOption.id;
    }

    console.log("Opción inválida. Ingresá el número correspondiente.");
  }
}

function sanitizeFilePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function runFfmpeg(
  framesDir: string,
  outputPath: string,
  fps: number,
): Promise<void> {
  const args = [
    "-y",
    "-framerate",
    String(fps),
    "-i",
    path.join(framesDir, "frame-%04d.png"),
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-r",
    String(fps),
    "-movflags",
    "+faststart",
    outputPath,
  ];

  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args, { stdio: "inherit" });

    ffmpeg.once("error", reject);
    ffmpeg.once("close", (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(new Error(`FFmpeg finalizó con código ${String(exitCode)}.`));
    });
  });
}

async function main(): Promise<void> {
  await verifyFfmpeg();
  await verifyVite();

  const { job, brand } = await loadConfiguration();

  const readline = createInterface({ input: process.stdin, output: process.stdout });

  let templateId: TemplateId;
  let ratioId: AspectRatioId;

  try {
    templateId = await askOption<TemplateId>(
      readline,
      "Seleccioná una plantilla:",
      templateCatalog.map((template) => ({
        id: template.id,
        label: template.name,
        description: template.description,
      })),
      job.template,
    );

    const ratioOptions = Object.entries(aspectRatios).map(([id, definition]) => ({
      id: id as AspectRatioId,
      label: `${id} — ${definition.width} × ${definition.height}`,
      description: definition.label,
    }));

    ratioId = await askOption<AspectRatioId>(
      readline,
      "Seleccioná una relación de aspecto:",
      ratioOptions,
      "9:16",
    );
  } finally {
    readline.close();
  }

  const ratio = aspectRatios[ratioId];
  const totalFrames = Math.round(job.duration * job.fps);
  const framesDir = path.join(projectRoot, "frames");
  const outputDir = path.join(projectRoot, "output");

  await rm(framesDir, { recursive: true, force: true });
  await mkdir(framesDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });

  const outputFilename = [
    "post",
    sanitizeFilePart(job.brand),
    templateId,
    ratio.fileToken,
  ].join("-") + ".mp4";
  const outputPath = path.join(outputDir, outputFilename);

  const url = new URL(viteBaseUrl);
  url.searchParams.set("template", templateId);
  url.searchParams.set("ratio", ratioId);
  url.searchParams.set("mode", "render");

  console.log(`\nCliente: ${brand.name}`);
  console.log(`URL de render: ${url.toString()}`);
  console.log(`Frames: ${totalFrames} (${job.duration}s a ${job.fps} FPS)`);

  const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch({
    headless: true,
    ...(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {}),
  });

  try {
    const page = await browser.newPage({
      viewport: { width: ratio.width, height: ratio.height },
      deviceScaleFactor: 1,
    });

    await page.goto(url.toString(), { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.renderReady === true, undefined, {
      timeout: 15_000,
    });

    const browserDuration = await page.evaluate(() => window.animationDuration);

    if (Math.abs(browserDuration - job.duration) > 0.001) {
      throw new Error(
        `La duración del navegador (${browserDuration}) no coincide con job.json (${job.duration}).`,
      );
    }

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
      const seconds = frameIndex / job.fps;
      await page.evaluate((time) => window.renderAt(time), seconds);

      const frameName = `frame-${String(frameIndex).padStart(4, "0")}.png`;
      await page.screenshot({
        path: path.join(framesDir, frameName),
        type: "png",
        animations: "disabled",
      });

      const completed = frameIndex + 1;
      const progressStep = Math.max(1, Math.floor(totalFrames / 10));

      if (completed === totalFrames || completed % progressStep === 0) {
        console.log(`Capturados ${completed}/${totalFrames} frames.`);
      }
    }
  } finally {
    await browser.close();
  }

  await runFfmpeg(framesDir, outputPath, job.fps);
  console.log(`\nVideo generado: ${outputPath}`);
}

main().catch((error: unknown) => {
  if (error instanceof ZodError) {
    console.error("Configuración inválida:");
    console.error(error.issues);
  } else {
    console.error(error instanceof Error ? error.message : error);
  }

  process.exitCode = 1;
});
