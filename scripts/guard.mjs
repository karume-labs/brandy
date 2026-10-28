#!/usr/bin/env bun
/**
 * Mechanical enforcement of the guardrails' hard rules
 * (.agents/guardrails/rules/GENERAL.MD, ENV-VARS.MD, NAMING.MD).
 *
 * Checks per source file:
 *  1. File size cap (~150 lines)
 *  2. No relative imports (absolute aliases only)
 *  3. Arrow functions + named exports (no `function` declarations; default
 *     exports only where Next.js requires them)
 *  4. `process.env` only in the env modules + root config files
 *  5. No @ts-expect-error / @ts-expect-error / `as any`
 *
 * Run: `bun run guard`
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const SRC = "src";
const MAX_LINES = 150;

const DEFAULT_EXPORT_ALLOWED = [
  // Next.js route files may default-export; everything else is named.
  /^src\/app\/.+\/(page|layout|route)\.tsx?$/,
  /^src\/app\/(page|layout|route)\.tsx?$/,
];
const defaultExportAllowed = (file) =>
  DEFAULT_EXPORT_ALLOWED.some((pattern) => pattern.test(file));

const ENV_ALLOWED = [
  "src/shared/env.server.ts",
  "src/shared/env.ts",
  "next.config.ts",
  "drizzle.config.ts",
];

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) {
      out.push(full);
    }
  }
  return out;
};

const violations = [];

for (const file of walk(SRC)) {
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");

  // 1. Size cap
  if (lines.length > MAX_LINES) {
    violations.push(
      `${file}:${lines.length} lines (cap ${MAX_LINES}) - split by responsibility`,
    );
  }

  lines.forEach((line, index) => {
    const at = `${file}:${index + 1}`;

    // 2. Relative imports
    if (/^\s*(import|export)\s.*from\s+["']\.{1,2}\//.test(line)) {
      violations.push(`${at} relative import - use the @/ alias`);
    }
    if (/^\s*import\s+["']\.{1,2}\//.test(line)) {
      violations.push(`${at} relative side-effect import`);
    }

    // 3. Function declarations
    if (/^\s*(export\s+)?function\s+[A-Za-z]/.test(line)) {
      violations.push(
        `${at} function declaration - use an arrow function with a named export`,
      );
    }
    if (/^\s*export\s+default\s+function/.test(line)) {
      if (!defaultExportAllowed(file)) {
        violations.push(`${at} default export outside a Next.js route file`);
      }
    }

    // 4. process.env outside env modules
    if (/\bprocess\.env\b/.test(line) && !ENV_ALLOWED.includes(file)) {
      violations.push(
        `${at} process.env read outside the env modules - import validated env`,
      );
    }

    // 5. Suppressions and any-casts
    if (/@ts-ignore|@ts-expect-error/.test(line)) {
      violations.push(`${at} TypeScript suppression comment`);
    }
    if (/\bas\s+any\b/.test(line)) {
      violations.push(`${at} "as any" cast`);
    }
  });
}

if (violations.length > 0) {
  console.error(`guard: ${violations.length} violation(s)\n`);
  for (const violation of violations) {
    console.error(`  ✗ ${violation}`);
  }
  process.exit(1);
}

console.log("guard: all clear ✔");
