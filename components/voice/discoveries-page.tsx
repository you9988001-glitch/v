"use client";

import { useState } from "react";
import { IconBack } from "@/components/voice/ui";
import { InstrumentArt } from "@/components/voice/pieces";
import { getInstrument, type Instrument } from "@/lib/voice/data";
import type { AntipodeDiscovery } from "@/lib/voice/discoveries";
import {
  DISCOVERIES_INTRO,
  VOICE_ANTIPODE_MATCH_ODDS,
} from "@/lib/voice/discoveries";

function formatWhen(ms: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(ms));
}

function InstrumentDiscoveryCard({
  label,
  instrument,
  onOpen,
}: {
  label: string;
  instrument: Instrument;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="v-press flex h-full min-w-0 flex-col rounded-2xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)] p-2.5 text-left"
    >
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[color:var(--v-faint)]">
        {label}
      </p>
      <InstrumentArt
        instrument={instrument}
        className="mx-auto mt-2 h-14 w-14 shrink-0 rounded-xl"
        glyphSize={24}
      />
      <p className="v-clamp-2 mt-2 font-display text-[0.82rem] font-semibold leading-snug text-[color:var(--v-ink)]">
        {instrument.name}
      </p>
      <p className="mt-1 text-[0.72rem] leading-snug text-[color:var(--v-faint)]">
        {instrument.origin}
      </p>
    </button>
  );
}

function DiscoverySplitView({
  discovery,
  onOpenInstrument,
}: {
  discovery: AntipodeDiscovery;
  onOpenInstrument: (instrumentId: string) => void;
}) {
  const from = getInstrument(discovery.fromId);
  const to = getInstrument(discovery.toId);

  return (
    <div className="mx-auto max-w-md">
      <p className="text-[0.88rem] text-[color:var(--v-muted)]">
        {formatWhen(discovery.discoveredAt)}
      </p>
      <p className="mt-1 text-[0.8rem] leading-snug text-[color:var(--v-muted)]">
        Earth&apos;s opposite sides met here — open either instrument.
      </p>

      <div className="relative mt-6 grid grid-cols-2 gap-2">
        {from ? (
          <InstrumentDiscoveryCard
            label="From"
            instrument={from}
            onOpen={() => onOpenInstrument(from.id)}
          />
        ) : (
          <div className="rounded-2xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)] p-3 text-[0.75rem] text-[color:var(--v-muted)]">
            From entry unavailable
          </div>
        )}
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-[1.1rem]"
          aria-hidden
        >
          🌍
        </span>
        {to ? (
          <InstrumentDiscoveryCard
            label="To"
            instrument={to}
            onOpen={() => onOpenInstrument(to.id)}
          />
        ) : (
          <div className="rounded-2xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)] p-3 text-[0.75rem] text-[color:var(--v-muted)]">
            To entry unavailable
          </div>
        )}
      </div>
    </div>
  );
}

export function DiscoveriesPage({
  discoveries,
  onBack,
  onOpenInstrument,
}: {
  discoveries: AntipodeDiscovery[];
  onBack: () => void;
  onOpenInstrument: (instrumentId: string) => void;
}) {
  const [selected, setSelected] = useState<AntipodeDiscovery | null>(null);

  const handleHeaderBack = () => {
    if (selected) setSelected(null);
    else onBack();
  };

  return (
    <div className="fixed inset-0 z-[130] flex flex-col bg-[color:var(--v-bg)]">
      <div className="v-safe-top flex shrink-0 items-center gap-2 border-b border-[color:var(--v-line)] px-3 pb-3 pt-3">
        <button
          type="button"
          onClick={handleHeaderBack}
          aria-label="Back"
          className="v-press inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--v-ink)] hover:bg-[color:var(--v-panel)]"
        >
          <IconBack size={22} />
        </button>
        <h1 className="text-[0.95rem] font-semibold tracking-wide text-[color:var(--v-ink)]">
          {selected ? "Discovery" : "Discoveries"}
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-5">
        {selected ? (
          <DiscoverySplitView
            discovery={selected}
            onOpenInstrument={onOpenInstrument}
          />
        ) : (
          <>
            <div className="mx-auto max-w-md space-y-4 text-[0.92rem] leading-relaxed text-[color:var(--v-muted)]">
              {DISCOVERIES_INTRO.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <p className="mx-auto mt-6 max-w-md text-[0.88rem] leading-relaxed text-[color:var(--v-ink)]">
              {VOICE_ANTIPODE_MATCH_ODDS}
            </p>

            <div className="mx-auto mt-10 max-w-md">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[color:var(--v-faint)]">
                Your discoveries
              </p>
              {discoveries.length === 0 ? (
                <p className="mt-4 text-[0.88rem] text-[color:var(--v-muted)]">
                  No discoveries yet.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {discoveries.map((d) => {
                    const from = getInstrument(d.fromId);
                    const to = getInstrument(d.toId);
                    const fromName = from?.name ?? d.fromId;
                    const toName = to?.name ?? d.toId;
                    return (
                      <li key={`${d.fromId}-${d.toId}-${d.discoveredAt}`}>
                        <button
                          type="button"
                          onClick={() => setSelected(d)}
                          className="v-press w-full rounded-2xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)] px-3 py-2.5 text-left"
                        >
                          <p className="text-[0.75rem] text-[color:var(--v-muted)]">
                            From {fromName}
                          </p>
                          <p className="mt-0.5 text-[0.92rem] font-semibold text-[color:var(--v-ink)]">
                            → {toName}
                          </p>
                          <p className="mt-1 text-[0.72rem] text-[color:var(--v-faint)]">
                            {formatWhen(d.discoveredAt)}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
