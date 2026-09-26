"use client";

import { useMemo, useState } from "react";
import { TOTAL_CURATED } from "@/contexts/voice-context";
import {
  FAMILIES,
  REGIONS,
  TARGET_COUNT,
  activeFilterCount,
  emptyFilters,
  filterInstruments,
  type FamilyId,
  type Filters,
} from "@/lib/voice/data";
import { InstrumentRow } from "./instrument-card";
import { Overlay, OverlayHeader } from "./pieces";
import {
  Button,
  Eyebrow,
  EmptyState,
  IconClose,
  IconFilter,
  IconSearch,
  cx,
} from "./ui";

export function CollectionScreen() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(() => filterInstruments(filters), [filters]);
  const activeCount = activeFilterCount(filters);

  return (
    <div className="px-4 pb-28 pt-5">
      <header className="mb-4">
        <Eyebrow>Search · {TARGET_COUNT.toLocaleString("en-US")} voices</Eyebrow>
        <h1 className="mt-1 font-display text-[26px] font-bold leading-tight text-[color:var(--v-ink)]">
          Catalog
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--v-muted)]">
          Fast search across {TOTAL_CURATED.toLocaleString("en-US")} curated
          voices. Filter by region or family.
        </p>
      </header>

      <div className="flex items-center gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--v-line)] bg-[color:var(--v-panel)] px-4 py-2.5">
          <IconSearch size={18} className="text-[color:var(--v-faint)]" />
          <input
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder="Search name, region, family…"
            className="w-full bg-transparent text-sm text-[color:var(--v-ink)] outline-none placeholder:text-[color:var(--v-faint)]"
            inputMode="search"
          />
          {filters.query ? (
            <button
              onClick={() => setFilters((f) => ({ ...f, query: "" }))}
              aria-label="Clear search"
              className="v-press text-[color:var(--v-faint)]"
            >
              <IconClose size={16} />
            </button>
          ) : null}
        </label>
        <button
          onClick={() => setSheetOpen(true)}
          aria-label="Filters"
          className={cx(
            "v-press relative inline-flex h-11 w-11 items-center justify-center rounded-full border",
            activeCount > 0
              ? "border-[color:var(--v-brass)] bg-[color:var(--v-brass-soft)] text-[color:var(--v-brass-deep)]"
              : "border-[color:var(--v-line)] bg-[color:var(--v-panel)] text-[color:var(--v-muted)]",
          )}
        >
          <IconFilter size={20} />
          {activeCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[color:var(--v-brass-deep)] px-1 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>
      </div>

      {activeCount > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {filters.region ? (
            <ActiveChip
              label={filters.region}
              onClear={() => setFilters((f) => ({ ...f, region: null }))}
            />
          ) : null}
          {filters.family ? (
            <ActiveChip
              label={FAMILIES.find((x) => x.id === filters.family)?.name ?? ""}
              onClear={() => setFilters((f) => ({ ...f, family: null }))}
            />
          ) : null}
          <button
            onClick={() => setFilters((f) => ({ ...f, region: null, family: null }))}
            className="v-press rounded-full px-2 py-1 text-[11px] font-semibold text-[color:var(--v-brass-deep)]"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <p className="mt-4 text-xs font-medium text-[color:var(--v-faint)]">
        {results.length} voice{results.length === 1 ? "" : "s"}
      </p>

      <div className="mt-2 flex flex-col gap-2.5">
        {results.length === 0 ? (
          <EmptyState
            icon={<IconSearch size={24} />}
            title="No voices found"
            hint="Try a different search or clear your filters."
          />
        ) : (
          results.map((it, i) => (
            <div
              key={it.id}
              className="anim-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 0.03}s` }}
            >
              <InstrumentRow instrument={it} />
            </div>
          ))
        )}
      </div>

      {sheetOpen ? (
        <FilterSheet
          filters={filters}
          onChange={setFilters}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}
    </div>
  );
}

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--v-brass-soft)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--v-brass-deep)]">
      {label}
      <button onClick={onClear} aria-label={`Remove ${label} filter`} className="v-press">
        <IconClose size={13} />
      </button>
    </span>
  );
}

function FilterSheet({
  filters,
  onChange,
  onClose,
}: {
  filters: Filters;
  onChange: (updater: (f: Filters) => Filters) => void;
  onClose: () => void;
}) {
  return (
    <Overlay onClose={onClose}>
      <OverlayHeader onClose={onClose} />
      <div className="v-no-scrollbar overflow-y-auto px-5 pb-8">
        <h2 className="font-display text-xl font-bold text-[color:var(--v-ink)]">
          Narrow the search
        </h2>

        <section className="mt-5">
          <Eyebrow>Family</Eyebrow>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {FAMILIES.map((f) => {
              const active = filters.family === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      family: active ? null : (f.id as FamilyId),
                    }))
                  }
                  className="v-press"
                >
                  <span
                    className={cx(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold ring-1 ring-inset",
                      active ? "" : "ring-[color:var(--v-line)]",
                    )}
                    style={
                      active
                        ? {
                            backgroundColor: `var(${f.softVar})`,
                            color: `var(${f.hueVar})`,
                            boxShadow: `inset 0 0 0 1px var(${f.hueVar})`,
                          }
                        : { color: "var(--v-muted)" }
                    }
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: `var(${f.hueVar})` }}
                    />
                    {f.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <Eyebrow>Region</Eyebrow>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {REGIONS.map((r) => {
              const active = filters.region === r;
              return (
                <button
                  key={r}
                  onClick={() =>
                    onChange((prev) => ({ ...prev, region: active ? null : r }))
                  }
                  className={cx(
                    "v-press rounded-full px-3 py-2 text-[13px] font-semibold ring-1 ring-inset",
                    active
                      ? "bg-[color:var(--v-brass-soft)] text-[color:var(--v-brass-deep)] ring-[color:var(--v-brass)]"
                      : "text-[color:var(--v-muted)] ring-[color:var(--v-line)]",
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-8 flex gap-2.5">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onChange(() => emptyFilters)}
          >
            Reset
          </Button>
          <Button variant="primary" className="flex-1" onClick={onClose}>
            Show results
          </Button>
        </div>
      </div>
    </Overlay>
  );
}
