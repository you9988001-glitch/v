import { antipodeCoords } from "@/lib/geo/antipode";
import { describeOpenOcean } from "@/lib/geo/ocean-label";
import { haversineKm } from "@/lib/geo/haversine";
import { isoCountryAtPoint } from "@/lib/geo/country-at-point";
import capitals from "@/lib/geo/country-capitals.json";
import { INSTRUMENTS } from "@/lib/voice/data";
import { voiceCatalogForIso } from "@/lib/voice/antipode-nav";

const countryCapitals = capitals as unknown as Record<string, [number, number]>;

export const ANTIPODE_DETAIL_MAX_KM = 300;

export type AntipodeTapResult =
  | {
      kind: "open-detail";
      instrumentId: string;
      instrumentName: string;
      distanceKm: number;
    }
  | { kind: "outside-catalog"; countryName: string; iso: string }
  | { kind: "no-nearby-entry"; countryName: string; iso: string }
  | { kind: "antarctica" }
  | { kind: "ocean"; description: string; coords: string }
  | { kind: "location-unavailable" };

type InstLoc = { id: string; name: string; lat: number; lon: number };

let instCache: InstLoc[] | null = null;

function loadInstrumentLocations(): InstLoc[] {
  if (instCache) return instCache;
  const caps = countryCapitals;
  const out: InstLoc[] = [];
  for (const it of INSTRUMENTS) {
    const code = it.countryCode?.toUpperCase();
    if (!code || !caps[code]) continue;
    const [lat, lon] = caps[code];
    out.push({ id: it.id, name: it.name, lat, lon });
  }
  instCache = out;
  return out;
}

function formatCoords(lat: number, lon: number): string {
  const latH = `${Math.abs(lat).toFixed(1)}° ${lat >= 0 ? "N" : "S"}`;
  const lonH = `${Math.abs(lon).toFixed(1)}° ${lon >= 0 ? "E" : "W"}`;
  return `${latH}, ${lonH}`;
}

function resolveReferenceCoords(countryCode: string): { lat: number; lon: number } | null {
  const row = countryCapitals[countryCode.toUpperCase()];
  if (!row) return null;
  return { lat: row[0], lon: row[1] };
}

async function countryDisplayName(iso: string): Promise<string> {
  const ct = (await import("countries-and-timezones")).default;
  return ct.getCountry(iso)?.name ?? iso;
}

export async function resolveVoiceAntipodeTap(input: {
  countryCode: string | null | undefined;
}): Promise<{ ap: { lat: number; lon: number } | null; tap: AntipodeTapResult }> {
  if (!input.countryCode) {
    return { ap: null, tap: { kind: "location-unavailable" } };
  }
  const ref = resolveReferenceCoords(input.countryCode);
  if (!ref) {
    return { ap: null, tap: { kind: "location-unavailable" } };
  }

  let ap: { lat: number; lon: number };
  try {
    ap = antipodeCoords(ref.lat, ref.lon);
    const tzLookup = (await import("tz-lookup")).default;
    tzLookup(ap.lat, ap.lon);
  } catch {
    return { ap: null, tap: { kind: "location-unavailable" } };
  }

  const instruments = loadInstrumentLocations();
  let best: InstLoc | null = null;
  let bestKm = Infinity;
  for (const it of instruments) {
    const d = haversineKm(ap.lat, ap.lon, it.lat, it.lon);
    if (d < bestKm) {
      bestKm = d;
      best = it;
    }
  }
  if (best && bestKm <= ANTIPODE_DETAIL_MAX_KM) {
    return {
      ap,
      tap: {
        kind: "open-detail",
        instrumentId: best.id,
        instrumentName: best.name,
        distanceKm: Math.round(bestKm),
      },
    };
  }

  const iso = await isoCountryAtPoint(ap.lat, ap.lon);
  if (!iso) {
    return {
      ap,
      tap: {
        kind: "ocean",
        description: describeOpenOcean(ap.lat, ap.lon),
        coords: formatCoords(ap.lat, ap.lon),
      },
    };
  }

  if (iso === "AQ" || ap.lat <= -60) {
    return { ap, tap: { kind: "antarctica" } };
  }

  const inCatalog = voiceCatalogForIso(iso);
  if (inCatalog) {
    return {
      ap,
      tap: {
        kind: "no-nearby-entry",
        countryName: await countryDisplayName(iso),
        iso,
      },
    };
  }

  return {
    ap,
    tap: {
      kind: "outside-catalog",
      countryName: await countryDisplayName(iso),
      iso,
    },
  };
}
