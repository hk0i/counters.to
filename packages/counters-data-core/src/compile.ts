/**
 * Counters.to — Data Transformation & Validation Pipeline
 *
 * Implements EDD section 3 in three phases:
 *   1. Structural Integrity Verification (front matter vs. registry.yaml)
 *   2. Relational Graph Assembly (threats / advantages join)
 *   3. Content Transformation (markdown -> HTML)
 *
 * Output written to packages/counters-web/public/api/v1/ per EDD section 4.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { marked } from "marked";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const HEROES_DIR = path.join(DATA_DIR, "heroes");
const REGISTRY_PATH = path.join(DATA_DIR, "registry.yaml");

const OUT_ROOT = path.resolve(ROOT, "..", "counters-web", "public", "api", "v1");

// ---------- Types ----------

interface Registry {
  roles: string[];
  damageTypes: string[];
  mechanics: string[];
  strategy: {
    archetypes: string[];
    tags: string[];
  };
}

interface HeroFrontMatter {
  id: string;
  name: string;
  role: string;
  /** Content-authorship timestamp for this profile. gray-matter/js-yaml parse
   * an unquoted YAML timestamp scalar (e.g. `lastUpdated: 2026-07-10`) into a
   * native Date automatically. Distinct from `patchVersion` (not yet tracked)
   * which will record the actual game patch/season a hero's kit reflects. */
  lastUpdated: Date;
  damageTypes: string[];
  mechanics: string[];
  strategy: {
    archetype: string;
    tags: string[];
  };
  weakTo: string[];
  strongTo: string[];
}

interface CompiledHero extends HeroFrontMatter {
  htmlContent: string;
}

interface MatchedTrait {
  heroId: string;
  heroName: string;
  matchedTraits: string[];
}

// ---------- Failure helper (EDD 3.1: verbose log + process.exit(1)) ----------

function fail(message: string): never {
  console.error(`[TYPO ERROR] ${message}`);
  process.exit(1);
}

// ---------- Phase 1: Structural Integrity Verification ----------

function loadRegistry(): Registry {
  const raw = fs.readFileSync(REGISTRY_PATH, "utf8");
  return yaml.load(raw) as Registry;
}

function loadHeroFiles(): { file: string; data: HeroFrontMatter; content: string }[] {
  const files = fs.readdirSync(HEROES_DIR).filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(HEROES_DIR, file), "utf8");
    const parsed = matter(raw);
    return { file, data: parsed.data as HeroFrontMatter, content: parsed.content };
  });
}

function validateHero(
  file: string,
  data: HeroFrontMatter,
  registry: Registry
): void {
  const relationalVocab = new Set([...registry.damageTypes, ...registry.mechanics]);

  if (!registry.roles.includes(data.role)) {
    fail(`Unknown role [${data.role}] in ${file}`);
  }
  for (const dt of data.damageTypes ?? []) {
    if (!registry.damageTypes.includes(dt)) {
      fail(`Unknown tag [${dt}] in ${file}`);
    }
  }
  for (const m of data.mechanics ?? []) {
    if (!registry.mechanics.includes(m)) {
      fail(`Unknown tag [${m}] in ${file}`);
    }
  }
  if (!registry.strategy.archetypes.includes(data.strategy?.archetype)) {
    fail(`Unknown tag [${data.strategy?.archetype}] in ${file}`);
  }
  for (const t of data.strategy?.tags ?? []) {
    if (!registry.strategy.tags.includes(t)) {
      fail(`Unknown tag [${t}] in ${file}`);
    }
  }
  for (const w of data.weakTo ?? []) {
    if (!relationalVocab.has(w)) {
      fail(`Unknown cross-reference [${w}] in ${file}`);
    }
  }
  for (const s of data.strongTo ?? []) {
    if (!relationalVocab.has(s)) {
      fail(`Unknown cross-reference [${s}] in ${file}`);
    }
  }
}

// ---------- Phase 2: Relational Graph Assembly ----------

function heroTraits(h: HeroFrontMatter): Set<string> {
  return new Set([...(h.damageTypes ?? []), ...(h.mechanics ?? [])]);
}

function computeRelational(
  current: HeroFrontMatter,
  all: HeroFrontMatter[]
): { threats: MatchedTrait[]; advantages: MatchedTrait[] } {
  const threats: MatchedTrait[] = [];
  const advantages: MatchedTrait[] = [];

  for (const other of all) {
    if (other.id === current.id) continue;
    const otherTraits = heroTraits(other);

    const threatMatches = (current.weakTo ?? []).filter((t) => otherTraits.has(t));
    if (threatMatches.length > 0) {
      threats.push({ heroId: other.id, heroName: other.name, matchedTraits: threatMatches });
    }

    const advantageMatches = (current.strongTo ?? []).filter((t) => otherTraits.has(t));
    if (advantageMatches.length > 0) {
      advantages.push({ heroId: other.id, heroName: other.name, matchedTraits: advantageMatches });
    }
  }

  return { threats, advantages };
}

// ---------- Phase 3: Content Transformation ----------

function compileHtml(markdownBody: string): string {
  return marked.parse(markdownBody.trim(), { async: false }) as string;
}

// ---------- Output writers (EDD section 4) ----------

function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

function writeJson(filePath: string, payload: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + "\n");
}

// ---------- Main pipeline ----------

function main(): void {
  const registry = loadRegistry();
  const heroFiles = loadHeroFiles();

  // Phase 1
  for (const { file, data } of heroFiles) {
    validateHero(file, data, registry);
  }
  console.log(`[compile] Phase 1 OK — ${heroFiles.length} hero files validated against registry.yaml`);

  const allFrontMatter = heroFiles.map((h) => h.data);

  // Registry endpoint
  writeJson(path.join(OUT_ROOT, "registry", "index.json"), { data: registry });

  // Lean collection endpoint
  const leanHeroes = allFrontMatter
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((h) => ({
      id: h.id,
      name: h.name,
      role: h.role,
      // Serializes to an ISO-8601 string via Date.prototype.toJSON — JSON has
      // no native date type, so this is the standard wire representation.
      lastUpdated: h.lastUpdated,
      damageTypes: h.damageTypes,
      mechanics: h.mechanics,
      strategy: h.strategy,
    }));
  writeJson(path.join(OUT_ROOT, "heroes", "index.json"), { data: leanHeroes });

  // Deep per-hero endpoints (Phase 2 + Phase 3)
  for (const { data, content } of heroFiles) {
    const { threats, advantages } = computeRelational(data, allFrontMatter);
    const htmlContent = compileHtml(content);

    const deep: CompiledHero & {
      threats: MatchedTrait[];
      advantages: MatchedTrait[];
      htmlContent: string;
    } = {
      ...data,
      threats,
      advantages,
      htmlContent,
    };

    writeJson(path.join(OUT_ROOT, "heroes", data.id, "index.json"), { data: deep });
  }

  console.log(`[compile] Phase 2+3 OK — wrote ${heroFiles.length} deep hero resources to ${OUT_ROOT}`);
}

main();
