"use client";

import { useMemo, useState } from "react";
import {
  instrumentsInWorldRegion,
  type WorldRegionId,
} from "@/lib/voice/data";
import { useVoice } from "@/contexts/voice-context";
import { InstrumentRow } from "./instrument-card";

export function OriginScreen({
  regionId,
  originName,
}: {
  regionId: WorldRegionId;
  originName: string;
}) {
  const { setNav } = useVoice();
  const [q, setQ] = useState("");

  const voices = useMemo(() => {
    const rows = instrumentsInWorldRegion(regionId).filter(
      (it) => it.origin === originName,
    );
    rows.sort((a, b) => a.name.localeCompare(b.name, "en"));
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (it) =>
        it.name.toLowerCase().includes(needle) ||
        it.latin.toLowerCase().includes(needle),
    );
  }, [regionId, originName, q]);

  return (
    <div className="px-5 pb-8 pt-3">
      <button
        type="button"
        onClick={() => setNav({ screen: "region", regionId })}
        className="v-press mb-4 text-[0.8rem] font-semibold tracking-wide text-[color:var(--v-brass)]"
      >
        ← Origins
      </button>

      <header className="mb-4">
        <h1 className="font-display text-[1.9rem] leading-none text-[color:var(--v-ink)]">
          {originName}
        </h1>
        <p className="mt-1 text-[0.82rem] text-[color:var(--v-muted)]">
          {voices.length} voices
        </p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search voices…"
        className="mb-3 w-full rounded-xl border border-[color:var(--v-line)] bg-black/25 px-3.5 py-2.5 text-sm text-[color:var(--v-ink)] outline-none placeholder:text-[color:var(--v-faint)] focus:border-[color:var(--v-brass)]"
      />

      <div className="flex flex-col gap-2.5">
        {voices.map((it) => (
          <InstrumentRow key={it.id} instrument={it} />
        ))}
      </div>
    </div>
  );
}
