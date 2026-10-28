import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { diffObjects, recordAudit } from "@/features/audit/server/record";
import { user } from "@/features/auth/schema";
import { auth } from "@/features/auth/server/better-auth";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "@/features/auth/validators";
import { db } from "@/shared/lib/db";

export interface Actor {
  id?: string | null;
  name?: string | null;
  email?: string | null;
}

/** Creates a user via Better Auth, then applies role + permissions. */
export const createUserWithRole = async (
  input: CreateUserInput,
  actor: Actor,
) => {
  const result = await auth.api.createUser({
    body: { name: input.name, email: input.email, password: input.password },
  });

  if (result?.user?.id) {
    await db
      .update(user)
      .set({
        emailVerified: true,
        role: input.role,
        permissions: input.permissions ?? null,
      })
      .where(eq(user.id, result.user.id));

    await recordAudit(
      {
        action: "create",
        entityType: "user",
        entityId: result.user.id,
        entityLabel: result.user.email,
        summary: `Created user ${result.user.email}`,
      },
      actor,
    );
  }
  return result;
};

/** Updates profile fields with an audit diff; optional password reset. */
export const updateUserWithAudit = async (
  input: UpdateUserInput & { id: string },
  actor: Actor,
) => {
  const [before] = await db.select().from(user).where(eq(user.id, input.id));
  if (!before) {
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  const [updated] = await db
    .update(user)
    .set({
      name: input.name,
      email: input.email,
      role: input.role,
      permissions: input.permissions ?? null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.id))
    .returning();

  if (updated) {
    await recordAudit(
      {
        action: "update",
        entityType: "user",
        entityId: updated.id,
        entityLabel: updated.email,
        summary: `Updated user ${updated.email}`,
        changes: diffObjects(before, updated, [
          "name",
          "email",
          "role",
          "permissions",
        ]),
      },
      actor,
    );
  }

  if (input.password) {
    await auth.api
      .setUserPassword({
        body: { userId: input.id, newPassword: input.password },
      })
      .catch((e: unknown) => {
        console.error("Failed to update password via better-auth admin", e);
      });
  }

  return updated;
};
