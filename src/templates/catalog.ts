export const templateCatalog = [
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Composición limpia con tipografía protagonista y formas suaves.",
  },
  {
    id: "editorial-split",
    name: "Editorial Split",
    description: "Dos afirmaciones editoriales separadas por una línea animada.",
  },
] as const;

export type TemplateId = (typeof templateCatalog)[number]["id"];

export function isTemplateId(value: string): value is TemplateId {
  return templateCatalog.some((template) => template.id === value);
}
