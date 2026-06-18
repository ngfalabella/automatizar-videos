import { z } from "zod";

import { isTemplateId } from "./templates/catalog";

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal de seis dígitos.");

export const brandSchema = z.object({
  name: z.string().trim().min(1),
  colors: z.object({
    background: hexColorSchema,
    surface: hexColorSchema,
    primary: hexColorSchema,
    secondary: hexColorSchema,
    text: hexColorSchema,
    muted: hexColorSchema,
  }),
});

export const jobSchema = z.object({
  brand: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "La marca debe usar formato kebab-case."),
  template: z.string().refine(isTemplateId, "La plantilla no existe en el catálogo."),
  duration: z.number().positive().max(60),
  fps: z.number().int().positive().max(60),
  content: z.object({
    eyebrow: z.string().max(120),
    headline: z.string().trim().min(1).max(280),
    subtitle: z.string().max(320),
    secondaryHeadline: z.string().max(180).default(""),
  }),
});

export type BrandConfig = z.infer<typeof brandSchema>;
export type JobConfig = z.infer<typeof jobSchema>;
