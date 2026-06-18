import "./styles/global.css";
import "./styles/minimal-clean.css";
import "./styles/editorial-split.css";

import { aspectRatios, isAspectRatioId } from "./aspect-ratios";
import { brandSchema, jobSchema } from "./schema";
import { isTemplateId } from "./templates/catalog";
import { getTemplateDefinition } from "./templates/registry";

interface RenderWindow extends Window {
  renderReady: boolean;
  renderAt: (seconds: number) => void;
  animationDuration: number;
}

const renderWindow = window as RenderWindow;
renderWindow.renderReady = false;
renderWindow.animationDuration = 0;
renderWindow.renderAt = () => undefined;

async function loadJson(path: string): Promise<unknown> {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path}. HTTP ${response.status}.`);
  }

  return response.json() as Promise<unknown>;
}

function applyBrandVariables(colors: {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  muted: string;
}): void {
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--background", colors.background);
  rootStyle.setProperty("--surface", colors.surface);
  rootStyle.setProperty("--accent", colors.primary);
  rootStyle.setProperty("--secondary", colors.secondary);
  rootStyle.setProperty("--text", colors.text);
  rootStyle.setProperty("--muted", colors.muted);
}

async function bootstrap(): Promise<void> {
  const app = document.querySelector<HTMLElement>("#app");

  if (!app) {
    throw new Error("No existe el elemento #app.");
  }

  const job = jobSchema.parse(await loadJson("/job.json"));
  const searchParams = new URLSearchParams(window.location.search);

  const requestedTemplate = searchParams.get("template") ?? job.template;
  const requestedRatio = searchParams.get("ratio") ?? "9:16";
  const mode = searchParams.get("mode") ?? "preview";

  if (!isTemplateId(requestedTemplate)) {
    throw new Error(`Plantilla desconocida: ${requestedTemplate}.`);
  }

  if (!isAspectRatioId(requestedRatio)) {
    throw new Error(`Relación de aspecto desconocida: ${requestedRatio}.`);
  }

  const brand = brandSchema.parse(
    await loadJson(`/brands/${encodeURIComponent(job.brand)}.json`),
  );

  applyBrandVariables(brand.colors);
  document.documentElement.dataset.aspectRatio = requestedRatio;

  const aspectRatio = aspectRatios[requestedRatio];
  const template = getTemplateDefinition(requestedTemplate);
  const context = {
    job,
    brand,
    aspectRatioId: requestedRatio,
    aspectRatio,
  };

  const templateRoot = template.mount(context);
  app.replaceChildren(templateRoot);

  const timeline = template.createTimeline({
    ...context,
    root: templateRoot,
  });

  renderWindow.animationDuration = job.duration;
  renderWindow.renderAt = (seconds: number): void => {
    const safeSeconds = Math.min(Math.max(seconds, 0), job.duration);
    timeline.pause();
    timeline.seek(safeSeconds, true);
  };
  renderWindow.renderReady = true;

  if (mode === "render") {
    renderWindow.renderAt(0);
  } else {
    timeline.play(0);
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  document.body.textContent = error instanceof Error ? error.message : "Error desconocido.";
});
