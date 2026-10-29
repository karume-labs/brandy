import { readdir } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { brandPrompts, brands } from "@/features/brand/schema";
import {
  BRANDING_DIR,
  targetSlugs,
  titleize,
} from "@/features/brand/server/seed-files";
import {
  ingestGuide,
  ingestSheet,
  publishSeededAssets,
} from "@/features/brand/server/seed-ingest";
import { workspaceMembers, workspaces } from "@/features/workspace/schema";
import { db } from "@/shared/lib/db";

/** Seed cellar that holds every migrated brand. */
const WORKSPACE = { name: "Brandy Brands", slug: "brandy-brands" };

const DEFAULT_PROMPTS = [
  {
    context: "logo_sheet" as const,
    name: "Logo sheet handoff",
    body: "Here is the official logo sheet for {{brand.name}}. Treat these\nvariants as the single source of truth: never redraw, recolor, or restyle\nthe mark. Use Stacked for tight vertical spaces, Horizontal for headers,\nIcon Only for favicons and avatars, and Mono for one-color print. Always\npreserve the clear space and minimum size rules attached to each variant.",
  },
  {
    context: "brand_guide" as const,
    name: "Brand guide handoff",
    body: "Attached is the brand guide for {{brand.name}}. Follow its color\ntokens and typography exactly: use {{colors.list}} as the palette, respect\nthe heading/body font split, and never place brand colors below their WCAG\ncontrast threshold. If a design conflicts with the guide, the guide wins.",
  },
];

const ensureWorkspace = async (userId: string | null) => {
  const [created] = await db
    .insert(workspaces)
    .values(WORKSPACE)
    .onConflictDoNothing()
    .returning();
  const workspace =
    created ??
    (await db.query.workspaces.findFirst({
      where: eq(workspaces.slug, WORKSPACE.slug),
    }));
  if (!workspace) throw new Error("Could not create seed workspace");
  if (created) console.log(`  Workspace "${workspace.name}" created.`);

  if (userId) {
    await db
      .insert(workspaceMembers)
      .values({ workspaceId: workspace.id, userId, role: "owner" })
      .onConflictDoNothing();
  }
  return workspace;
};

const seedBrand = async (
  workspaceId: string,
  slug: string,
  entries: string[],
  userId: string | null,
) => {
  const existing = await db.query.brands.findFirst({
    where: eq(brands.slug, slug),
  });
  if (existing) {
    // Recover from a partial run: brand exists but its sheet/guide never landed.
    await ingestSheet(existing.id, entries, slug, userId);
    await ingestGuide(existing.id, entries, slug, userId);
    return;
  }

  const [brand] = await db
    .insert(brands)
    .values({ workspaceId, name: titleize(slug), slug })
    .returning();
  if (!brand) return;
  console.log(`  Brand "${brand.name}" created.`);

  for (const prompt of DEFAULT_PROMPTS) {
    await db
      .insert(brandPrompts)
      .values({ brandId: brand.id, ...prompt })
      .onConflictDoNothing();
  }

  await ingestSheet(brand.id, entries, slug, userId);
  await ingestGuide(brand.id, entries, slug, userId);
};

/**
 * Moves the manual branding folder into the app: one workspace, one brand per
 * logo sheet / brand guide, sheets run through real ingestion (variant
 * segmentation + palette distillation). Idempotent: existing slugs are kept.
 */
export const seedBrands = async (userId: string | null): Promise<void> => {
  const entries = await readdir(BRANDING_DIR).catch(() => []);
  const slugs = targetSlugs(entries);

  if (slugs.length === 0) {
    console.log(`  No branding files found in ${BRANDING_DIR}; skipping.`);
    return;
  }

  const workspace = await ensureWorkspace(userId);
  for (const slug of slugs) {
    await seedBrand(workspace.id, slug, entries, userId);
  }
  await publishSeededAssets(slugs);
};
