export const aspectRatios = {
  "9:16": {
    width: 1080,
    height: 1920,
    label: "Historias y reels verticales",
    fileToken: "9x16",
  },
  "5:4": {
    width: 1080,
    height: 1350,
    label: "Publicación horizontal compacta",
    fileToken: "5x4",
  },
} as const;

export type AspectRatioId = keyof typeof aspectRatios;
export type AspectRatioDefinition = (typeof aspectRatios)[AspectRatioId];

export function isAspectRatioId(value: string): value is AspectRatioId {
  return Object.prototype.hasOwnProperty.call(aspectRatios, value);
}
