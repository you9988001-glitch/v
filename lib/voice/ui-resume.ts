/** Persist Voice UI path so leaving via curator links can restore on return. */

import {
  WORLD_REGIONS,
  originsInWorldRegion,
  type TabId,
  type WorldRegionId,
} from "@/lib/voice/data";

const KEY = "voice3141.ui.resume.v1";

export type VoiceNavResume =
  | { screen: "home" }
  | { screen: "saved" }
  | { screen: "region"; regionId: WorldRegionId }
  | { screen: "origin"; regionId: WorldRegionId; originName: string }
  | { screen: "search" };

export type VoiceUiResume = {
  tab: TabId;
  nav: VoiceNavResume;
  openId: string | null;
  curatorNote: boolean;
};

const WORLD_REGION_IDS: WorldRegionId[] = WORLD_REGIONS.map((r) => r.id);

function isWorldRegionId(v: unknown): v is WorldRegionId {
  return (
    typeof v === "string" &&
    (WORLD_REGION_IDS as string[]).includes(v)
  );
}

/** Legacy combined shard id → split world regions. */
function normalizeWorldRegionId(
  v: unknown,
  originName?: unknown,
): WorldRegionId | null {
  if (v === "asia-east-se") {
    if (typeof originName === "string" && originName) {
      for (const id of ["asia-east", "asia-southeast"] as WorldRegionId[]) {
        if (originsInWorldRegion(id).some((o) => o.name === originName)) {
          return id;
        }
      }
    }
    return "asia-east";
  }
  if (isWorldRegionId(v)) return v;
  return null;
}

function sanitizeNav(raw: unknown): VoiceNavResume {
  if (!raw || typeof raw !== "object") return { screen: "home" };
  const n = raw as Record<string, unknown>;
  if (n.screen === "saved") return { screen: "saved" };
  if (n.screen === "search") return { screen: "search" };
  if (n.screen === "region") {
    const regionId = normalizeWorldRegionId(n.regionId);
    if (regionId) return { screen: "region", regionId };
  }
  if (n.screen === "origin" && typeof n.originName === "string" && n.originName) {
    const regionId = normalizeWorldRegionId(n.regionId, n.originName);
    if (regionId) {
      return {
        screen: "origin",
        regionId,
        originName: n.originName,
      };
    }
  }
  return { screen: "home" };
}

export function readVoiceUiResume(): VoiceUiResume | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Record<string, unknown>;
    const tab =
      o.tab === "catalog" || o.tab === "favorites" || o.tab === "collection"
        ? o.tab
        : "collection";
    return {
      tab,
      nav: sanitizeNav(o.nav),
      openId: typeof o.openId === "string" ? o.openId : null,
      curatorNote: o.curatorNote === true,
    };
  } catch {
    return null;
  }
}

export function writeVoiceUiResume(next: VoiceUiResume): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function patchVoiceUiResume(partial: Partial<VoiceUiResume>): void {
  const prev = readVoiceUiResume();
  if (!prev) return;
  writeVoiceUiResume({ ...prev, ...partial });
}
