"use client";

import { useState } from "react";
import {
  TARGET_COUNT,
  WORLD_REGIONS,
  worldRegionStats,
  type WorldRegionId,
} from "@/lib/voice/data";
import { TOTAL_CURATED, useVoice } from "@/contexts/voice-context";
import { OwnershipProofCard } from "@/components/voice/ownership-deed-card";
import { LegalFooter } from "@/components/voice/legal-footer";

const ACCENTS: Record<WorldRegionId, string> = {
  /* Brighter orange with a soft yellow cast — all devices */
  "asia-east": "from-[#ffd166]/44 to-[#f4a261]/28",
  "asia-southeast": "from-[#ffb347]/40 to-[#ffd166]/26",
  "asia-south-central-west": "from-[#e8c36a]/32 to-[#2dd4bf]/18",
  "africa-north-east": "from-[#e8c36a]/35 to-[#f07178]/18",
  "africa-west-central-south": "from-[#f0abfc]/22 to-[#e8c36a]/28",
  europe: "from-[#7dd3fc]/30 to-[#a78bfa]/22",
  americas: "from-[#38bdf8]/28 to-[#2dd4bf]/22",
  oceania: "from-[#5eead4]/30 to-[#38bdf8]/22",
};

export function HomeScreen() {
  const { setNav, savedCount } = useVoice();
  const progress = savedCount / TARGET_COUNT;
  const voicesRemaining = Math.max(0, TOTAL_CURATED - savedCount);
  const [narrativeOpen, setNarrativeOpen] = useState(false);

  return (
    <div className="px-5 pb-8 pt-4">
      <header className="mb-6">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--v-brass)]">
          CODE ARCHE · Voice
        </p>
        <h1 className="font-display mt-2 text-[2.35rem] leading-[1.05] text-[color:var(--v-string)]">
          Voice 3141
        </h1>
        <div className="mt-3 space-y-2.5">
          <button
            type="button"
            onClick={() => setNarrativeOpen((v) => !v)}
            aria-expanded={narrativeOpen}
            className="v-press animate-[pulse_8s_cubic-bezier(0.4,0,0.6,1)_infinite] text-left text-[0.9rem] font-bold leading-[1.65] text-[color:var(--v-ink)]"
          >
            [The Birth Narrative of Voice] {narrativeOpen ? "▾" : "▸"}
          </button>
          <div
            className={`grid overflow-hidden transition-[grid-template-rows] duration-500 ease-out ${
              narrativeOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div
              className={`min-h-0 transition-all duration-500 ease-out ${
                narrativeOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-1.5 opacity-0"
              }`}
            >
              <p className="text-[1.44rem] font-semibold leading-[1.55] text-[color:color-mix(in_oklab,var(--v-string)_88%,var(--v-bg)_12%)]">
                Symbolizing the eternal and unchanging nature of Pi (3.14159), it was
                crafted by thoroughly examining the cultural assets of 250 countries
                worldwide, carrying the unyielding passion and aspirations of pioneers.
                It is a cultural entity designed so that diverse sounds, shaped by
                human touch and breath, embrace one another to form a single grand
                harmony. Yet, what remains at the end of this grand journey is a
                small, portable possession that you can effortlessly pull out and
                keep anywhere, anytime—and that is quite enough.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setNav({ screen: "saved" })}
          className="v-press v-card mt-5 w-full p-4 text-left"
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[color:var(--v-faint)]">
                World atlas
              </p>
              <p className="v-nums mt-1 text-xl text-[color:var(--v-brass-deep)]">
                {TOTAL_CURATED.toLocaleString("en-US")}
                <span className="text-[color:var(--v-faint)]">
                  {" "}
                  / {voicesRemaining.toLocaleString("en-US")}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.62rem] uppercase tracking-wider text-[color:var(--v-string)]">
                Saved ›
              </p>
              <p className="v-nums text-sm text-[color:var(--v-string)]">
                {savedCount.toLocaleString("en-US")}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/35">
            <div
              className="h-full rounded-full v-hero-grad transition-[width] duration-500"
              style={{
                width: `${Math.min(100, Math.max(2, (savedCount / TARGET_COUNT) * 100 || 2))}%`,
              }}
            />
          </div>
          <p className="mt-2 text-[0.72rem] text-[color:var(--v-faint)]">
            Tap Saved to browse saved voices ·{" "}
            {((progress || 0) * 100).toFixed(progress < 0.01 ? 2 : 1)}%
          </p>
        </button>
      </header>

      <section className="grid grid-cols-1 gap-3">
        {WORLD_REGIONS.map((r, i) => {
          const stats = worldRegionStats(r.id);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setNav({ screen: "region", regionId: r.id })}
              className="v-press v-card relative overflow-hidden p-4 text-left"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${ACCENTS[r.id]}`}
              />
              <div className="relative flex items-start justify-between gap-3 max-sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[1.55rem] leading-none text-[color:var(--v-ink)] max-sm:text-[1.4rem]">
                    {r.name}
                  </p>
                  <p className="v-clamp-2 mt-2 text-[0.84rem] leading-snug text-[color:var(--v-muted)] max-sm:text-[0.76rem]">
                    {r.blurb}
                  </p>
                </div>
                <div className="shrink-0 rounded-xl border border-[color:var(--v-line)] bg-black/25 px-2.5 py-2 text-right max-sm:rounded-lg max-sm:px-2 max-sm:py-1.5">
                  <p className="v-nums text-sm text-[color:var(--v-brass-deep)] max-sm:text-[0.79rem]">
                    {stats.voiceCount}
                  </p>
                  <p className="text-[0.62rem] uppercase tracking-wider text-[color:var(--v-faint)] max-sm:text-[0.56rem]">
                    voices
                  </p>
                  <p className="v-nums mt-1 text-[0.75rem] text-[color:var(--v-string)] max-sm:mt-0.5 max-sm:text-[0.68rem]">
                    {stats.originCount} origins
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      <OwnershipProofCard />
      <LegalFooter />
    </div>
  );
}
