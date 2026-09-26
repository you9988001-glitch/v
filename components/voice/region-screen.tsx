"use client";

import {
  flagEmoji,
  flagUrl,
  originsInWorldRegion,
  worldRegionMeta,
  worldRegionStats,
  type WorldRegionId,
} from "@/lib/voice/data";
import { useVoice } from "@/contexts/voice-context";

export function RegionScreen({ regionId }: { regionId: WorldRegionId }) {
  const { setNav } = useVoice();
  const meta = worldRegionMeta(regionId);
  const origins = originsInWorldRegion(regionId);
  const stats = worldRegionStats(regionId);

  return (
    <div className="px-5 pb-8 pt-3">
      <button
        type="button"
        onClick={() => setNav({ screen: "home" })}
        className="v-press mb-4 text-[0.8rem] font-semibold tracking-wide text-[color:var(--v-brass)]"
      >
        ← Regions
      </button>

      <header className="mb-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--v-faint)]">
          Region
        </p>
        <h1 className="font-display mt-1 text-[2.1rem] leading-none text-[color:var(--v-ink)]">
          {meta?.name}
        </h1>
        <p className="mt-2 text-[0.9rem] text-[color:var(--v-muted)]">{meta?.blurb}</p>
        <p className="v-nums mt-3 text-[0.8rem] text-[color:var(--v-string)]">
          {stats.originCount} origins · {stats.voiceCount} voices
        </p>
      </header>

      <div className="grid grid-cols-1 gap-2">
        {origins.map((o) => {
          const src = flagUrl(o.countryCode, 80);
          return (
            <button
              key={o.name}
              type="button"
              onClick={() =>
                setNav({ screen: "origin", regionId, originName: o.name })
              }
              className="v-press v-card flex items-center gap-3 px-3.5 py-3 text-left"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--v-line)] bg-black/30 text-xl">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt=""
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span aria-hidden>{flagEmoji(o.countryCode)}</span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[1.2rem] leading-none text-[color:var(--v-ink)]">
                  {o.name}
                </span>
                <span className="mt-1 block text-[0.78rem] text-[color:var(--v-muted)]">
                  {o.count} voice{o.count === 1 ? "" : "s"}
                </span>
              </span>
              <span className="text-[color:var(--v-faint)]">›</span>
            </button>
          );
        })}
        {origins.length === 0 && (
          <p className="v-card p-4 text-sm text-[color:var(--v-muted)]">
            No origins in this region yet.
          </p>
        )}
      </div>
    </div>
  );
}
