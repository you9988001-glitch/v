# -*- coding: utf-8 -*-
"""Rewrite Voice3141 instrument catalog to English-first fields."""
from pathlib import Path

# id, english name, local/latin label, origin, region, family, note
ROWS = [
  ("gayageum", "Gayageum", "Gayageum", "Korea", "East Asia", "string", "Twelve silk strings plucked into a clear, lingering voice."),
  ("geomungo", "Geomungo", "Geomungo", "Korea", "East Asia", "string", "Struck with a bamboo stick — a deep, scholarly bass."),
  ("haegeum", "Haegeum", "Haegeum", "Korea", "East Asia", "string", "Two bowed strings that weep almost like a human voice."),
  ("daegeum", "Daegeum", "Daegeum", "Korea", "East Asia", "wind", "A large bamboo flute whose buzzing membrane colors the wind."),
  ("piri", "Piri", "Piri", "Korea", "East Asia", "wind", "A short double-reed pipe with a bold, straight tone."),
  ("janggu", "Janggu", "Janggu", "Korea", "East Asia", "percussion", "An hourglass drum whose two heads push and pull the beat."),
  ("kkwaenggwari", "Kkwaenggwari", "Kkwaenggwari", "Korea", "East Asia", "percussion", "A small brass gong that leads folk processions with a sharp call."),
  ("guzheng", "Guzheng", "Guzheng", "China", "East Asia", "string", "Movable bridges under long strings — glittering waves of plucked sound."),
  ("guqin", "Guqin", "Guqin", "China", "East Asia", "string", "Seven quiet strings for the scholar’s intimate whisper."),
  ("erhu", "Erhu", "Erhu", "China", "East Asia", "string", "A two-string fiddle that sings with aching clarity."),
  ("pipa", "Pipa", "Pipa", "China", "East Asia", "string", "A pear-shaped lute whose tremolo paints battles and rainfall."),
  ("dizi", "Dizi", "Dizi", "China", "East Asia", "wind", "A bamboo flute brightened by a vibrating membrane."),
  ("sheng", "Sheng", "Sheng", "China", "East Asia", "freereed", "A mouth organ of pipes that can sound chords in one breath."),
  ("shamisen", "Shamisen", "Shamisen", "Japan", "East Asia", "string", "Three strings struck with a plectrum into sharp, percussive song."),
  ("koto", "Koto", "Koto", "Japan", "East Asia", "string", "Thirteen strings flowing like courtly water."),
  ("shakuhachi", "Shakuhachi", "Shakuhachi", "Japan", "East Asia", "wind", "An end-blown bamboo flute of breath and silence."),
  ("taiko", "Taiko", "Taiko", "Japan", "East Asia", "percussion", "Drums played with the whole body — earth-shaking pulse."),
  ("morinkhuur", "Morin khuur", "Morin khuur", "Mongolia", "East Asia", "string", "A horse-head fiddle that paints steppe wind on two strings."),
  ("danbau", "Dan bau", "Đàn bầu", "Vietnam", "Southeast Asia", "string", "A single string bent until it slides like a singing voice."),
  ("dantranh", "Dan tranh", "Đàn tranh", "Vietnam", "Southeast Asia", "string", "A zither whose pressed strings bloom with living vibrato."),
  ("angklung", "Angklung", "Angklung", "Indonesia", "Southeast Asia", "percussion", "Shaken bamboo tubes that lock into communal harmony."),
  ("bonang", "Bonang", "Bonang", "Indonesia", "Southeast Asia", "percussion", "Bronze kettle gongs weaving bright melodies in gamelan."),
  ("saron", "Saron", "Saron", "Indonesia", "Southeast Asia", "percussion", "Bronze bars that carry the skeletal melody of gamelan."),
  ("kulintang", "Kulintang", "Kulintang", "Philippines", "Southeast Asia", "percussion", "A row of small bossed gongs rolling like melodic waves."),
  ("khaen", "Khaen", "Khaen", "Laos", "Southeast Asia", "freereed", "Bamboo free-reed pipes breathing endless chordal song."),
  ("ranat", "Ranat ek", "Ranat ek", "Thailand", "Southeast Asia", "percussion", "Wooden xylophone bars ringing over a boat-shaped resonator."),
  ("sitar", "Sitar", "Sitar", "Northern India", "South Asia", "string", "Sympathetic strings shimmer beneath raga’s voice."),
  ("sarod", "Sarod", "Sarod", "Northern India", "South Asia", "string", "A fretless metal fingerboard for deep, sliding tone."),
  ("tabla", "Tabla", "Tabla", "Northern India", "South Asia", "percussion", "Twin drums that speak precise rhythmic syllables."),
  ("bansuri", "Bansuri", "Bansuri", "India", "South Asia", "wind", "Krishna’s soft bamboo flute."),
  ("tanpura", "Tanpura", "Tanpura", "India", "South Asia", "string", "A continuous drone that holds the sky for every raga."),
  ("sarangi", "Sarangi", "Sarangi", "Northern India", "South Asia", "string", "A bowed voice said to be closest to human song."),
  ("veena", "Veena", "Veena", "Southern India", "South Asia", "string", "A sacred lute that slides between notes like sung prayer."),
  ("mridangam", "Mridangam", "Mridangam", "Southern India", "South Asia", "percussion", "A double-headed drum at the heart of Carnatic pulse."),
  ("shehnai", "Shehnai", "Shehnai", "Northern India", "South Asia", "wind", "An auspicious double reed for weddings and festivals."),
  ("dombra", "Dombra", "Dombra", "Kazakhstan", "Central Asia", "string", "Two strings brushed fast with steppe storytelling."),
  ("dutar", "Dutar", "Dutar", "Central Asia", "Central Asia", "string", "Silk twin strings with a soft desert road voice."),
  ("komuz", "Komuz", "Komuz", "Kyrgyzstan", "Central Asia", "string", "Three strings played with acrobatic hand sweeps."),
  ("oud", "Oud", "Oud", "Middle East", "West Asia & Middle East", "string", "A fretless lute ancestor sliding through microtones."),
  ("ney", "Ney", "Ney", "Middle East / Persia", "West Asia & Middle East", "wind", "A reed flute with the breath of Sufi longing."),
  ("qanun", "Qanun", "Qanun", "Middle East", "West Asia & Middle East", "string", "Dozens of strings cascading like a waterfall zither."),
  ("santur", "Santur", "Santur", "Persia", "West Asia & Middle East", "percussion", "Hammered strings sparkling like water droplets."),
  ("tar", "Tar", "Tār", "Iran", "West Asia & Middle East", "string", "A double-bowl lute singing Persian modes through skin."),
  ("daf", "Daf", "Daf", "Persia", "West Asia & Middle East", "percussion", "A frame drum whose jingles shimmer with every strike."),
  ("duduk", "Duduk", "Duduk", "Armenia", "West Asia & Middle East", "wind", "An apricot-wood double reed — warm and mournful."),
  ("baglama", "Baglama", "Bağlama", "Türkiye", "West Asia & Middle East", "string", "A long-necked lute full of Anatolian tremor."),
  ("darbuka", "Darbuka", "Darbuka", "Middle East / North Africa", "West Asia & Middle East", "percussion", "A goblet drum from deep boom to sharp slap."),
  ("kora", "Kora", "Kora", "West Africa", "Africa", "string", "A 21-string harp-lute glittering like flowing water."),
  ("balafon", "Balafon", "Balafon", "West Africa", "Africa", "percussion", "Wooden keys over gourd resonators — warm and buzzing."),
  ("mbira", "Mbira", "Mbira", "Zimbabwe", "Africa", "percussion", "Thumb-plucked metal lamellae in hypnotic layers."),
  ("djembe", "Djembe", "Djembe", "West Africa", "Africa", "percussion", "One drum spanning bass to razor slap."),
  ("ngoni", "Ngoni", "Ngoni", "Mali", "Africa", "string", "A small hide lute — a distant ancestor of the banjo."),
  ("talkingdrum", "Talking drum", "Talking drum", "West Africa", "Africa", "percussion", "Tension cords reshape pitch until the drum speaks."),
  ("krar", "Krar", "Krar", "Ethiopia", "Africa", "string", "A five- or six-string lyre with a lively bounce."),
  ("guembri", "Guembri", "Guembri", "Morocco", "Africa", "string", "A deep three-string lute driving Gnawa trance."),
  ("violin", "Violin", "Violin", "Italy", "Europe", "string", "Four strings spanning song to cry — the West’s bowed crown."),
  ("cello", "Cello", "Cello", "Europe", "Europe", "string", "Held to the chest — closest to the human vocal range."),
  ("harp", "Harp", "Harp", "Europe", "Europe", "string", "A cascade of strings at a fingertip’s touch."),
  ("bagpipe", "Great Highland bagpipe", "Great Highland bagpipe", "Scotland", "Europe", "wind", "Endless drone beneath a highland cry."),
  ("accordion", "Accordion", "Accordion", "Europe", "Europe", "freereed", "Bellows that breathe chords in and out."),
  ("hurdygurdy", "Hurdy-gurdy", "Hurdy-gurdy", "Europe", "Europe", "string", "A wheel bows strings while drones turn forever."),
  ("mandolin", "Mandolin", "Mandolin", "Italy", "Europe", "string", "Paired courses trembling in bright tremolo."),
  ("nyckelharpa", "Nyckelharpa", "Nyckelharpa", "Sweden", "Europe", "string", "Keyed fiddle with buzzing sympathetic strings."),
  ("balalaika", "Balalaika", "Balalaika", "Russia", "Europe", "string", "A triangular body and three snapping strings."),
  ("pipeorgan", "Pipe organ", "Pipe organ", "Europe", "Europe", "keyboard", "Thousands of pipes filling an entire hall."),
  ("harpsichord", "Harpsichord", "Harpsichord", "Europe", "Europe", "keyboard", "Plucked strings with Baroque sparkle."),
  ("clavichord", "Clavichord", "Clavichord", "Europe", "Europe", "keyboard", "A private keyboard that whispers and shakes the tone."),
  ("piano", "Piano", "Piano", "Italy", "Europe", "keyboard", "Hammers on strings — soft to thunder at will."),
  ("harmonica", "Harmonica", "Harmonica", "Europe", "Europe", "freereed", "Inhale and exhale chords in the palm of a hand."),
  ("oboe", "Oboe", "Oboe", "Europe", "Europe", "wind", "A double reed that often gives the orchestra its A."),
  ("clarinet", "Clarinet", "Clarinet", "Europe", "Europe", "wind", "From woody chalumeau to brilliant upper cry."),
  ("saxophone", "Saxophone", "Saxophone", "Belgium", "Europe", "wind", "Metal body, single reed — a voice that sings like speech."),
  ("trombone", "Trombone", "Trombone", "Europe", "Europe", "wind", "A slide that glides between the notes."),
  ("frenchhorn", "French horn", "French horn", "Europe", "Europe", "wind", "Coiled brass with a warm, distant call."),
  ("banjo", "Banjo", "Banjo", "United States", "North America & Caribbean", "string", "A taut skin head and bright, leaping attack."),
  ("steelpan", "Steelpan", "Steelpan", "Trinidad and Tobago", "North America & Caribbean", "percussion", "Tuned steel drums — a twentieth-century melody metal."),
  ("dulcimer", "Appalachian dulcimer", "Appalachian dulcimer", "United States", "North America & Caribbean", "string", "A lap zither of gentle drone and tune."),
  ("nativeflute", "Native American flute", "Native American flute", "North America", "North America & Caribbean", "wind", "A two-chamber flute as soft as breath."),
  ("charango", "Charango", "Charango", "Andes", "South America", "string", "A tiny Andean lute glittering in close courses."),
  ("quena", "Quena", "Quena", "Andes", "South America", "wind", "An open-ended Andean cane flute."),
  ("siku", "Siku", "Siku", "Andes", "South America", "wind", "Panpipes completed only when two players answer each other."),
  ("berimbau", "Berimbau", "Berimbau", "Brazil", "South America", "percussion", "A single-string bow driving capoeira’s rhythm."),
  ("cuica", "Cuica", "Cuíca", "Brazil", "South America", "percussion", "A friction drum that laughs and squeaks from within."),
  ("didgeridoo", "Didgeridoo", "Didgeridoo", "Australia", "Oceania", "wind", "Circular breath for an endless earth-drone."),
  ("patepacific", "Pate", "Pate", "Polynesia", "Oceania", "percussion", "Hollowed log drums carrying news across islands."),
  ("theremin", "Theremin", "Theremin", "Russia", "Europe", "electronic", "Pitch shaped in empty air — no touch required."),
  ("ondesmartenot", "Ondes Martenot", "Ondes Martenot", "France", "Europe", "electronic", "An early electronic voice sliding on a ring controller."),
  ("moog", "Moog synthesizer", "Moog synthesizer", "United States", "North America & Caribbean", "electronic", "Voltage-controlled waves that opened a new dictionary of sound."),
]

OUT = Path(r"C:\CODE-ARCHE\voice3141-appstudio\lib\voice\data.ts")

header = r'''// Voice3141 — curated instrument collection (English-first).
// Pure module (no "use client"): safe to import anywhere.

export type TabId = "collection" | "today" | "favorites";

export type FamilyId =
  | "string"
  | "wind"
  | "percussion"
  | "keyboard"
  | "freereed"
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
  "Africa",
  "Europe",
  "North America & Caribbean",
  "South America",
  "Oceania",
];

export type WorldRegionId =
  | "east-asia"
  | "southeast-asia"
  | "south-central-asia"
  | "west-asia"
  | "africa"
  | "europe"
  | "americas-oceania";

export interface WorldRegionMeta {
  id: WorldRegionId;
  name: string;
  blurb: string;
  regions: string[];
}

export const WORLD_REGIONS: WorldRegionMeta[] = [
  {
    id: "east-asia",
    name: "East Asia",
    blurb: "Silk, bamboo, and courtly resonance from Korea to Mongolia.",
    regions: ["East Asia"],
  },
  {
    id: "southeast-asia",
    name: "Southeast Asia",
    blurb: "Gamelan bronze, bamboo breaths, and communal pulse.",
    regions: ["Southeast Asia"],
  },
  {
    id: "south-central-asia",
    name: "South & Central Asia",
    blurb: "Raga drones, steppe strings, and desert song lines.",
    regions: ["South Asia", "Central Asia"],
  },
  {
    id: "west-asia",
    name: "West Asia & Middle East",
    blurb: "Fretted maqam, reed sighs, and glowing frame drums.",
    regions: ["West Asia & Middle East"],
  },
  {
    id: "africa",
    name: "Africa",
    blurb: "Talking skins, thumb pianos, and harp-lutes of the Sahel.",
    regions: ["Africa"],
  },
  {
    id: "europe",
    name: "Europe",
    blurb: "Bowed nobility, pipe halls, and free-reed breath boxes.",
    regions: ["Europe"],
  },
  {
    id: "americas-oceania",
    name: "Americas & Oceania",
    blurb: "Andean winds, steel song, and the deep earth drone.",
    regions: ["North America & Caribbean", "South America", "Oceania"],
  },
];

export function worldRegionMeta(id: WorldRegionId): WorldRegionMeta | undefined {
  return WORLD_REGIONS.find((r) => r.id === id);
}

export interface Instrument {
  id: string;
  name: string;
  latin: string;
  origin: string;
  region: string;
  family: FamilyId;
  note: string;
}

export const TARGET_COUNT = 3141;

export const INSTRUMENTS: Instrument[] = [
'''

def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')

lines = []
for id_, name, latin, origin, region, family, note in ROWS:
    lines.append(
        f'  {{ id: "{id_}", name: "{esc(name)}", latin: "{esc(latin)}", origin: "{esc(origin)}", region: "{esc(region)}", family: "{family}", note: "{esc(note)}" }},'
    )

footer = r'''
];

export function instrumentsInWorldRegion(id: WorldRegionId): Instrument[] {
  const meta = worldRegionMeta(id);
  if (!meta) return [];
  const set = new Set(meta.regions);
  return INSTRUMENTS.filter((it) => set.has(it.region));
}

export interface OriginRow {
  name: string;
  count: number;
}

export function originsInWorldRegion(id: WorldRegionId): OriginRow[] {
  const map = new Map<string, number>();
  for (const it of instrumentsInWorldRegion(id)) {
    map.set(it.origin, (map.get(it.origin) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
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

const VALID_TABS: TabId[] = ["collection", "today", "favorites"];

export function pickTab(v: unknown): TabId {
  return typeof v === "string" && (VALID_TABS as string[]).includes(v)
    ? (v as TabId)
    : "collection";
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

export function sanitizeFavorites(raw: unknown): string[] {
  const o = extractObject(raw);
  const arr = Array.isArray(o.ids) ? o.ids : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of arr) {
    if (typeof v === "string" && VALID_IDS.has(v) && !seen.has(v)) {
      seen.add(v);
      out.push(v);
      if (out.length >= MAX_FAVORITES) break;
    }
  }
  return out;
}

export function favoritesToBlob(ids: string[]): Record<string, unknown> {
  return { ids: ids.slice(0, MAX_FAVORITES) };
}
'''

OUT.write_text(header + "\n".join(lines) + footer, encoding="utf-8")
print("wrote", OUT, "instruments", len(ROWS))
