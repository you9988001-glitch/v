import {
  WORLD_REGIONS,
  originsInWorldRegion,
  type WorldRegionId,
} from "@/lib/voice/data";
import { isoCountryAtPoint } from "@/lib/geo/country-at-point";

export type VoiceAntipodeNav = {
  regionId: WorldRegionId;
  originName: string;
  isoAtPoint: string;
};

export function voiceCatalogForIso(iso: string): Omit<VoiceAntipodeNav, "isoAtPoint"> | null {
  const cc = iso.toUpperCase();
  for (const { id: regionId } of WORLD_REGIONS) {
    for (const o of originsInWorldRegion(regionId)) {
      if (o.countryCode?.toUpperCase() === cc) {
        return { regionId, originName: o.name };
      }
    }
  }
  return null;
}

export type AntipodeNavBlockReason = "ocean" | "not-in-catalog";

export async function voiceNavAtAntipode(
  lat: number,
  lon: number,
): Promise<{
  nav: VoiceAntipodeNav | null;
  blockReason: AntipodeNavBlockReason | null;
  isoAtPoint: string | null;
}> {
  const iso = await isoCountryAtPoint(lat, lon);
  if (!iso) return { nav: null, blockReason: "ocean", isoAtPoint: null };
  const row = voiceCatalogForIso(iso);
  if (!row)
    return { nav: null, blockReason: "not-in-catalog", isoAtPoint: iso };
  return { nav: { ...row, isoAtPoint: iso }, blockReason: null, isoAtPoint: iso };
}
