import type { TemplateDefinition } from "./types";
import type { TemplateId } from "./catalog";
import { minimalCleanTemplate } from "./minimal-clean";

export const templateRegistry = {
  "minimal-clean": minimalCleanTemplate,
} satisfies Record<TemplateId, TemplateDefinition>;

export function getTemplateDefinition(templateId: TemplateId): TemplateDefinition {
  return templateRegistry[templateId];
}
