// Voice3141 — instrument atlas (English-first).
// Pure module (no "use client"): safe to import anywhere.
// Catalog is sharded by world region (App Studio upload-friendly sizes).

import metaJson from "@/lib/voice/meta.json";
import shardAsiaEast from "@/lib/voice/by-region/asia-east.json";
import shardAsiaSoutheast from "@/lib/voice/by-region/asia-southeast.json";
import shardAsiaSouthCentralWest from "@/lib/voice/by-region/asia-south-central-west.json";
import shardAfricaNorthEast from "@/lib/voice/by-region/africa-north-east.json";
import shardAfricaWestCentralSouth from "@/lib/voice/by-region/africa-west-central-south.json";
import shardEurope from "@/lib/voice/by-region/europe.json";
import shardAmericas from "@/lib/voice/by-region/americas.json";
import shardOceania from "@/lib/voice/by-region/oceania.json";

export type TabId = "collection" | "catalog" | "favorites";

export type FamilyId =
  | "string"
  | "wind"
  | "percussion"
  | "keyboard"
  | "freereed"
  | "lamellophone"
  | "electronic";

export interface FamilyMeta {
  id: FamilyId;
  name: string;
  hueVar: string;
  softVar: string;
}

export const FAMILIES: FamilyMeta[] = [
  { id: "string", name: "Strings", hueVar: "--v-string", softVar: "--v-string-soft" },
  { id: "wind", name: "Winds", hueVar: "--v-wind", softVar: "--v-wind-soft" },
  { id: "percussion", name: "Percussion", hueVar: "--v-percussion", softVar: "--v-percussion-soft" },
  { id: "keyboard", name: "Keyboard", hueVar: "--v-keyboard", softVar: "--v-keyboard-soft" },
  { id: "freereed", name: "Free reed", hueVar: "--v-freereed", softVar: "--v-freereed-soft" },
  {
    id: "lamellophone",
    name: "Lamellophone",
    hueVar: "--v-lamellophone",
    softVar: "--v-lamellophone-soft",
  },
  { id: "electronic", name: "Electronic", hueVar: "--v-electronic", softVar: "--v-electronic-soft" },
];

export const FAMILY_MAP: Record<FamilyId, FamilyMeta> = FAMILIES.reduce(
  (acc, f) => {
    acc[f.id] = f;
    return acc;
  },
  {} as Record<FamilyId, FamilyMeta>,
);

export function familyName(id: FamilyId): string {
  return FAMILY_MAP[id]?.name ?? id;
}

export const REGIONS: string[] = [
  "East Asia",
  "Southeast Asia",
  "South Asia",
  "Central Asia",
  "West Asia & Middle East",
  "North & East Africa",
  "West, Central & Southern Africa",
  "Europe",
  "North America & Caribbean",
  "South America",
  "Oceania",
];

export type WorldRegionId =
  | "asia-east"
  | "asia-southeast"
  | "asia-south-central-west"
  | "africa-north-east"
  | "africa-west-central-south"
  | "europe"
  | "americas"
  | "oceania";

export interface WorldRegionMeta {
  id: WorldRegionId;
  name: string;
  blurb: string;
  regions: string[];
}

export const WORLD_REGIONS: WorldRegionMeta[] = [
  {
    id: "asia-east",
    name: "East Asia",
    blurb: "Silk strings, bamboo breath, and courtly resonance.",
    regions: ["East Asia"],
  },
  {
    id: "asia-southeast",
    name: "Southeast Asia",
    blurb: "Gamelan bronze, gong cycles, and island winds.",
    regions: ["Southeast Asia"],
  },
  {
    id: "asia-south-central-west",
    name: "South, Central & West Asia",
    blurb: "Raga drones, steppe strings, and maqam reeds.",
    regions: ["South Asia", "Central Asia", "West Asia & Middle East"],
  },
  {
    id: "africa-north-east",
    name: "North & East Africa",
    blurb: "Nile frames, Horn lyres, and coastal pulse.",
    regions: ["North & East Africa"],
  },
  {
    id: "africa-west-central-south",
    name: "West, Central & Southern Africa",
    blurb: "Talking skins, forest xylophones, and Sahel lutes.",
    regions: ["West, Central & Southern Africa"],
  },
  {
    id: "europe",
    name: "Europe",
    blurb: "Bowed nobility, pipe halls, and free-reed breath boxes.",
    regions: ["Europe"],
  },
  {
    id: "americas",
    name: "Americas",
    blurb: "Andean winds, steel song, and New World strings.",
    regions: ["North America & Caribbean", "South America"],
  },
  {
    id: "oceania",
    name: "Oceania",
    blurb: "Island drums and the deep earth drone.",
    regions: ["Oceania"],
  },
];

export function worldRegionMeta(id: WorldRegionId): WorldRegionMeta | undefined {
  return WORLD_REGIONS.find((r) => r.id === id);
}

export interface InstrumentClassification {
  code: string;
  gloss: string;
}

export interface Instrument {
  id: string;
  name: string;
  latin: string;
  origin: string;
  region: string;
  family: FamilyId;
  note: string;
  countryCode?: string | null;
  technique?: string | null;
  materials?: string | null;
  summary?: string | null;
  /** Documented Hornbostel–Sachs only; null if unverified. Not shown in UI. */
  classification?: InstrumentClassification | null;
  /** 2–4 peer instrument ids (same family+region, else family). */
  relatedInstruments?: string[];
  /** 2–3 complementary-family instrument ids for ensemble context. */
  ensemblePairing?: string[];
  /** Cross-country peers: same family, different country. */
  relatedInstruments2?: string[];
  /** Cross-country complementary ensemble peers. */
  ensemblePairing2?: string[];
}

export const TARGET_COUNT = 3141;

export const CATALOG_META = metaJson as {
  title: string;
  totalVoices: number;
  originCount: number;
  countryCount: number;
  generated: string;
  attribution: string;
};

const FAMILY_SET = new Set<string>(FAMILIES.map((f) => f.id));

function asInstrument(row: {
  id: string;
  name: string;
  latin: string;
  origin: string;
  region: string;
  family: string;
  note: string;
  countryCode?: string | null;
  technique?: string | null;
  materials?: string | null;
  summary?: string | null;
  classification?: InstrumentClassification | null;
  relatedInstruments?: string[];
  ensemblePairing?: string[];
  relatedInstruments2?: string[];
  ensemblePairing2?: string[];
}): Instrument {
  const family = (FAMILY_SET.has(row.family) ? row.family : "string") as FamilyId;
  const ids = (xs?: string[]) =>
    Array.isArray(xs) ? xs.filter((x): x is string => typeof x === "string") : [];
  return {
    id: row.id,
    name: row.name,
    latin: row.latin || row.name,
    origin: row.origin,
    region: row.region,
    family,
    note: row.note,
    countryCode: row.countryCode ?? null,
    technique: row.technique ?? null,
    materials: row.materials ?? null,
    summary: row.summary ?? null,
    classification: row.classification ?? null,
    relatedInstruments: ids(row.relatedInstruments),
    ensemblePairing: ids(row.ensemblePairing),
    relatedInstruments2: ids(row.relatedInstruments2),
    ensemblePairing2: ids(row.ensemblePairing2),
  };
}

type InstrumentRow = {
  id: string;
  name: string;
  latin: string;
  origin: string;
  region: string;
  family: string;
  note: string;
  countryCode?: string | null;
  technique?: string | null;
  materials?: string | null;
  summary?: string | null;
  classification?: InstrumentClassification | null;
  relatedInstruments?: string[];
  ensemblePairing?: string[];
  relatedInstruments2?: string[];
  ensemblePairing2?: string[];
};

const INSTRUMENT_ROWS: InstrumentRow[] = [
  ...(shardAsiaEast as InstrumentRow[]),
  ...(shardAsiaSoutheast as InstrumentRow[]),
  ...(shardAsiaSouthCentralWest as InstrumentRow[]),
  ...(shardAfricaNorthEast as InstrumentRow[]),
  ...(shardAfricaWestCentralSouth as InstrumentRow[]),
  ...(shardEurope as InstrumentRow[]),
  ...(shardAmericas as InstrumentRow[]),
  ...(shardOceania as InstrumentRow[]),
];

export const INSTRUMENTS: Instrument[] = INSTRUMENT_ROWS.map(asInstrument);

export function instrumentsInWorldRegion(id: WorldRegionId): Instrument[] {
  const meta = worldRegionMeta(id);
  if (!meta) return [];
  const set = new Set(meta.regions);
  return INSTRUMENTS.filter((it) => set.has(it.region));
}

export interface OriginRow {
  name: string;
  count: number;
  countryCode?: string | null;
}

export function originsInWorldRegion(id: WorldRegionId): OriginRow[] {
  const map = new Map<string, { count: number; countryCode: string | null }>();
  for (const it of instrumentsInWorldRegion(id)) {
    const prev = map.get(it.origin);
    if (prev) {
      prev.count += 1;
      if (!prev.countryCode && it.countryCode) prev.countryCode = it.countryCode;
    } else {
      map.set(it.origin, {
        count: 1,
        countryCode: it.countryCode ?? null,
      });
    }
  }
  return [...map.entries()]
    .map(([name, v]) => ({
      name,
      count: v.count,
      countryCode: v.countryCode,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export function flagUrl(code?: string | null, size = 80): string | null {
  if (!code || code.length !== 2) return null;
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}

export function flagEmoji(code?: string | null): string {
  if (!code || code.length !== 2) return "🏳️";
  const cc = code.toUpperCase();
  return String.fromCodePoint(
    ...[...cc].map((c) => 127397 + c.charCodeAt(0)),
  );
}

export function worldRegionStats(id: WorldRegionId): {
  voiceCount: number;
  originCount: number;
} {
  const voices = instrumentsInWorldRegion(id);
  return {
    voiceCount: voices.length,
    originCount: originsInWorldRegion(id).length,
  };
}

export const INSTRUMENT_MAP: Record<string, Instrument> = INSTRUMENTS.reduce(
  (acc, it) => {
    acc[it.id] = it;
    return acc;
  },
  {} as Record<string, Instrument>,
);

export function getInstrument(id: string): Instrument | undefined {
  return INSTRUMENT_MAP[id];
}

export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesQuery(it: Instrument, query: string): boolean {
  const q = fold(query);
  if (!q) return true;
  return (
    fold(it.name).includes(q) ||
    fold(it.latin).includes(q) ||
    fold(it.origin).includes(q) ||
    fold(it.region).includes(q) ||
    fold(familyName(it.family)).includes(q) ||
    fold(it.note).includes(q)
  );
}

export interface Filters {
  query: string;
  region: string | null;
  family: FamilyId | null;
}

export const emptyFilters: Filters = { query: "", region: null, family: null };

export function passesFilters(it: Instrument, f: Filters): boolean {
  if (f.region && it.region !== f.region) return false;
  if (f.family && it.family !== f.family) return false;
  if (!matchesQuery(it, f.query)) return false;
  return true;
}

export function filterInstruments(f: Filters): Instrument[] {
  return INSTRUMENTS.filter((it) => passesFilters(it, f));
}

export function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.region) n++;
  if (f.family) n++;
  return n;
}

function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function utcDayKey(at: number = Date.now()): string {
  const d = new Date(at);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dailyInstrument(at: number = Date.now()): Instrument {
  const key = utcDayKey(at);
  const idx = hashStr("voice3141:" + key) % INSTRUMENTS.length;
  return INSTRUMENTS[idx];
}

export function dayLabel(at: number = Date.now()): string {
  const d = new Date(at);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

const VALID_IDS = new Set(INSTRUMENTS.map((it) => it.id));

export function extractObject(raw: unknown): Record<string, unknown> {
  let cur = raw;
  for (let i = 0; i < 3; i++) {
    if (cur && typeof cur === "object" && "blob" in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>).blob;
    } else {
      break;
    }
  }
  return cur && typeof cur === "object" ? (cur as Record<string, unknown>) : {};
}

const VALID_TABS: TabId[] = ["collection", "catalog", "favorites"];

export function pickTab(v: unknown): TabId {
  if (typeof v !== "string") return "collection";
  if (v === "catalog") return "catalog";
  if (v === "favorites") return "favorites";
  if (v === "collection") return "collection";
  // Legacy Save tab → Regions home (Saved lives on the door card, like Peaks Found)
  if (v === "save") return "collection";
  // Old Today tab → Regions home
  if (v === "today") return "collection";
  return "collection";
}

export interface PrefsState {
  tab: TabId;
}

export function sanitizePrefs(raw: unknown): PrefsState {
  const o = extractObject(raw);
  return { tab: pickTab(o.tab) };
}

export function prefsToBlob(p: PrefsState): Record<string, unknown> {
  return { tab: p.tab };
}

export const MAX_FAVORITES = 600;
export const MAX_SAVED = 600;

function sanitizeIdList(raw: unknown, max: number): string[] {
  const o = extractObject(raw);
  const arr = Array.isArray(o.ids) ? o.ids : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of arr) {
    if (typeof v === "string" && VALID_IDS.has(v) && !seen.has(v)) {
      seen.add(v);
      out.push(v);
      if (out.length >= max) break;
    }
  }
  return out;
}

export function sanitizeFavorites(raw: unknown): string[] {
  return sanitizeIdList(raw, MAX_FAVORITES);
}

export function favoritesToBlob(ids: string[]): Record<string, unknown> {
  return { ids: ids.slice(0, MAX_FAVORITES) };
}

export function sanitizeSaved(raw: unknown): string[] {
  return sanitizeIdList(raw, MAX_SAVED);
}

export function savedToBlob(ids: string[]): Record<string, unknown> {
  return { ids: ids.slice(0, MAX_SAVED) };
}
