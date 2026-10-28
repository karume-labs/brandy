import { z } from "zod";
import { slugSchema } from "@/features/workspace/validators";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color like #0E726D");

export const colorRoleEnum = z.enum([
  "primary",
  "secondary",
  "accent",
  "neutral",
  "semantic",
]);

export const typographyRoleEnum = z.enum(["heading", "body", "mono"]);

export const createBrandSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(2).max(80),
  slug: slugSchema,
  tagline: z.string().max(160).optional(),
  isPrimary: z.boolean().default(false),
});

export const updateBrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(80).optional(),
  tagline: z.string().max(160).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  isPrimary: z.boolean().optional(),
});

export const brandIdSchema = z.object({ brandId: z.string().uuid() });

export const upsertColorSchema = z.object({
  brandId: z.string().uuid(),
  /** Existing token id - omitted for new tokens. */
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(60),
  hex: hexColor,
  role: colorRoleEnum,
  position: z.number().int().min(0).max(999).optional(),
});

export const removeColorSchema = z.object({ id: z.string().uuid() });

export const upsertGradientSchema = z.object({
  brandId: z.string().uuid(),
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(60),
  fromHex: hexColor,
  toHex: hexColor,
  angle: z.number().int().min(0).max(360).default(90),
});

export const upsertTypographySchema = z.object({
  brandId: z.string().uuid(),
  role: typographyRoleEnum,
  fontFamily: z.string().min(1).max(120),
  fontWeight: z.number().int().min(100).max(900).default(400),
  tracking: z.number().min(-0.2).max(1).default(0),
  lineHeight: z.number().min(1).max(3).default(1.5),
  isLocked: z.boolean().default(false),
});

export const promptContextEnum = z.enum([
  "logo_sheet",
  "brand_guide",
  "general",
]);

export const upsertPromptSchema = z.object({
  brandId: z.string().uuid(),
  /** Existing template id - omitted for new templates. */
  id: z.string().uuid().optional(),
  context: promptContextEnum,
  name: z.string().min(2).max(80),
  body: z.string().min(1).max(8000),
});

export const removePromptSchema = z.object({ id: z.string().uuid() });

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type UpsertColorInput = z.infer<typeof upsertColorSchema>;
export type UpsertGradientInput = z.infer<typeof upsertGradientSchema>;
export type UpsertTypographyInput = z.infer<typeof upsertTypographySchema>;
export type UpsertPromptInput = z.infer<typeof upsertPromptSchema>;
export type RemovePromptInput = z.infer<typeof removePromptSchema>;
