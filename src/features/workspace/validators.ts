import { z } from "zod";

export const workspaceRoleEnum = z.enum(["owner", "admin", "member"]);

export const slugSchema = z
  .string()
  .min(2)
  .max(60)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and dashes",
  );

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(80),
  slug: slugSchema,
  /** Corporate anchor this workspace is a subsidiary of. */
  parentId: z.string().uuid().optional(),
});

export const updateWorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(80).optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const workspaceIdSchema = z.object({ workspaceId: z.string().uuid() });

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
