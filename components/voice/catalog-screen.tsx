"use client";

import { useMemo, useState } from "react";
import { TOTAL_CURATED, useVoice } from "@/contexts/voice-context";
import {
  TARGET_COUNT,
  WORLD_REGIONS,
  filterInstruments,
  instrumentsInWorldRegion,
  type WorldRegionId,
} from "@/lib/voice/data";
import { InstrumentRow } from "./instrument-card";
import { EmptyState, IconSearch, cx } from "./ui";

const SHOW_CAP = 120;

/** Peaks-style catalog: search + region chips + capped live list. */
export function CatalogScreen() {
  const { setTab } = useVoice();
  const [q, setQ] = useState("");
  const [regionId, setRegionId] = useState<WorldRegionId | "">("");

  const results = useMemo(() => {
    const base = regionId
      ? instrumentsInWorldRegion(regionId)
      : filterInstruments({ query: "", region: null, family: null });
    const needle = q.trim().toLowerCase();
    const filtered = !needle
      ? base
      : base.filter((it) => {
          const bag =
            `${it.name} ${it.latin} ${it.origin} ${it.region} ${it.note}`.toLowerCase();
          return bag.includes(needle);
        });
    return filtered.slice(0, SHOW_CAP);
  }, [q, regionId]);

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-5 pb-6 md:max-w-2xl">
      <h1 className="font-display text-[1.9rem] text-[color:var(--v-ink)]">
        Catalog
      </h1>
      <p className="mt-1 text-sm text-[color:var(--v-muted)]">
        Fast search across {TOTAL_CURATED.toLocaleString("en-US")} of{" "}
        {TARGET_COUNT.toLocaleString("en-US")} voices.
      </p>

      <div className="relative mt-4">
        <IconSearch
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--v-faint)]"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or origin…"
          className="w-full rounded-xl border border-[color:var(--v-line)] bg-black/25 py-2.5 pl-9 pr-3 text-sm text-[color:var(--v-ink)] outline-none placeholder:text-[color:var(--v-faint)] focus:border-[color:var(--v-brass)]"
          inputMode="search"
          autoComplete="off"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setRegionId("")}
          className={cx(
            "v-press shrink-0 rounded-full border px-3 py-1.5 text-[0.75rem]",
            !regionId
              ? "border-transparent bg-[color:var(--v-brass)] text-[color:var(--v-on-brass)]"
              : "border-[color:var(--v-line)] text-[color:var(--v-muted)]",
          )}
        >
          All
        </button>
        {WORLD_REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegionId(r.id)}
            className={cx(
              "v-press shrink-0 rounded-full border px-3 py-1.5 text-[0.75rem]",
              regionId === r.id
                ? "border-transparent bg-[color:var(--v-brass)] text-[color:var(--v-on-brass)]"
                : "border-[color:var(--v-line)] text-[color:var(--v-muted)]",
            )}
          >
            {r.name}
          </button>
        ))}
      </div>

      <p className="v-nums mt-3 text-[0.75rem] text-[color:var(--v-faint)]">
        Showing {results.length}
        {results.length === SHOW_CAP ? ` · top ${SHOW_CAP}` : ""}
      </p>

      <div className="mt-3 flex flex-col gap-2.5">
        {results.length === 0 ? (
          <EmptyState
            icon={<IconSearch size={24} />}
            title="No matches"
            hint="Try another spelling, or browse by region cards on Home."
            action={
              <button
                type="button"
                className="text-sm font-semibold text-[color:var(--v-brass)]"
                onClick={() => setTab("collection")}
              >
                Back to regions
              </button>
            }
          />
        ) : (
          results.map((it) => <InstrumentRow key={it.id} instrument={it} />)
        )}
      </div>
    </div>
  );
}
