export const templateCatalog = [
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Composición limpia con tipografía protagonista y formas suaves.",
  },
] as const;

export type TemplateId = (typeof templateCatalog)[number]["id"];

export function isTemplateId(value: string): value is TemplateId {
  return templateCatalog.some((template) => template.id === value);
}
