import type { AspectRatioDefinition, AspectRatioId } from "../aspect-ratios";
import type { BrandConfig, JobConfig } from "../schema";

export interface TemplateMountContext {
  job: JobConfig;
  brand: BrandConfig;
  aspectRatioId: AspectRatioId;
  aspectRatio: AspectRatioDefinition;
}

export interface TemplateTimelineContext extends TemplateMountContext {
  root: HTMLElement;
}

export interface TemplateDefinition {
  id: string;
  mount(context: TemplateMountContext): HTMLElement;
  createTimeline(context: TemplateTimelineContext): GSAPTimeline;
}
