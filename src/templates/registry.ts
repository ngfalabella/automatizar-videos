import type { TemplateId } from "./catalog";
import type { TemplateDefinition } from "./types";

import { editorialSplitTemplate } from "./editorial-split";
import { minimalCleanTemplate } from "./minimal-clean";

export const templateRegistry = {
  "minimal-clean": minimalCleanTemplate,
  "editorial-split": editorialSplitTemplate,
} satisfies Record<TemplateId, TemplateDefinition>;

export function getTemplateDefinition(
  templateId: TemplateId,
): TemplateDefinition {
  return templateRegistry[templateId];
}