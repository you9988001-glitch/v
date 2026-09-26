"use client";

import { useEffect, useState } from "react";
import type { AntipodeTapResult } from "@/lib/voice/antipode-tap";
import type { LiveOriginTime } from "@/lib/voice/live-time";
import { getInstrument } from "@/lib/voice/data";
import { Overlay, InstrumentArt } from "@/components/voice/pieces";
import {
  AntipodeTapNoticePanel,
  LiveTimeCard,
} from "@/components/voice/live-time-card";
import { IconBack } from "@/components/voice/ui";

function useHomelandLive(countryCode: string | null | undefined) {
  const [live, setLive] = useState<LiveOriginTime | null>(null);
  useEffect(() => {
    if (!countryCode) {
      setLive(null);
      return;
    }
    let cancelled = false;
    const tick = async () => {
      const { getLiveOriginTime } = await import("@/lib/voice/live-time");
      const next = await getLiveOriginTime(countryCode);
      if (!cancelled) setLive(next);
    };
    void tick();
    const id = setInterval(() => void tick(), 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [countryCode]);
  return live;
}

function MatchPair({
  fromId,
  toId,
  distanceKm,
}: {
  fromId: string;
  toId: string;
  distanceKm: number;
}) {
  const from = getInstrument(fromId);
  const to = getInstrument(toId);
  const fromLive = useHomelandLive(from?.countryCode);
  const toLive = useHomelandLive(to?.countryCode);

  if (!from || !to) {
    return (
      <p className="text-[0.8rem] text-[color:var(--v-muted)]">
        Catalog entries unavailable.
      </p>
    );
  }

  const toLiveDisplay: LiveOriginTime = toLive
    ? { ...toLive, regionLabel: to.origin }
    : {
        timeZone: "UTC",
        localTime: "--:--",
        hemisphere: "Northern",
        season: "Spring",
        regionLabel: to.origin,
      };

  const fromLiveDisplay: LiveOriginTime = fromLive
    ? { ...fromLive, regionLabel: from.origin }
    : {
        timeZone: "UTC",
        localTime: "--:--",
        hemisphere: "Northern",
        season: "Spring",
        regionLabel: from.origin,
      };

  return (
    <>
      <p className="text-center text-[0.75rem] leading-snug text-[color:var(--v-muted)]">
        Catalog match on the opposite side — ~{distanceKm} km from the antipode
        point. Saved to Discoveries.
      </p>
      <div className="relative mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-2 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[color:var(--v-faint)]">
            From
          </p>
          <div className="mb-2 flex items-center gap-2">
            <InstrumentArt
              instrument={from}
              className="h-11 w-11 shrink-0 rounded-xl"
              glyphSize={20}
            />
            <p className="font-display text-[0.9rem] font-semibold text-[color:var(--v-ink)]">
              {from.name}
            </p>
          </div>
          <LiveTimeCard
            inPair
            interactive={false}
            live={fromLiveDisplay}
            kicker={"Right now, in this voice's homeland"}
          />
        </div>
        <span
          className="pointer-events-none absolute left-1/2 top-[42%] z-10 hidden -translate-x-1/2 text-[1.1rem] sm:block"
          aria-hidden
        >
          🌍
        </span>
        <div className="min-w-0">
          <p className="mb-2 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[color:var(--v-faint)]">
            To
          </p>
          <div className="mb-2 flex items-center gap-2">
            <InstrumentArt
              instrument={to}
              className="h-11 w-11 shrink-0 rounded-xl"
              glyphSize={20}
            />
            <p className="font-display text-[0.9rem] font-semibold text-[color:var(--v-ink)]">
              {to.name}
            </p>
          </div>
          <LiveTimeCard
            inPair
            interactive={false}
            live={toLiveDisplay}
            kicker={"Right now, in this voice's homeland"}
          />
        </div>
      </div>
    </>
  );
}

export function AntipodeResultSheet({
  fromId,
  tap,
  onClose,
}: {
  fromId: string;
  tap: AntipodeTapResult;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isMatch = tap.kind === "open-detail";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      <Overlay onClose={onClose} labelledBy="v-antipode-sheet-title">
        <div className="flex max-h-[94dvh] flex-col overflow-y-auto overscroll-contain px-4 pb-8 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="v-press mb-3 inline-flex items-center gap-2 self-start rounded-full px-2 py-1.5 text-[0.8rem] font-medium text-[color:var(--v-muted)] hover:bg-[color:var(--v-panel-2)]"
          >
            <IconBack size={18} />
            Back
          </button>

          {isMatch ? (
            <>
              <p
                id="v-antipode-sheet-title"
                className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[color:var(--v-brass)]"
              >
                <span className="mr-1" aria-hidden>
                  ✨
                </span>
                A rare find
              </p>
              <MatchPair
                fromId={fromId}
                toId={tap.instrumentId}
                distanceKm={tap.distanceKm}
              />
            </>
          ) : (
            <>
              <h2
                id="v-antipode-sheet-title"
                className="sr-only"
              >
                Opposite side of Earth
              </h2>
              <AntipodeTapNoticePanel tap={tap} embedded />
            </>
          )}
        </div>
      </Overlay>
    </div>
  );
}
