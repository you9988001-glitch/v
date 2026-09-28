"use client";

import { useCallback } from "react";
import { useVoice } from "@/contexts/voice-context";
import { FAMILY_MAP, familyName, type Instrument } from "@/lib/voice/data";
import { useLongPress } from "@/lib/voice/use-long-press";
import { InstrumentArt } from "./pieces";
import {
  FamilyTag,
  IconChevron,
  IconHeart,
  IconHeartFilled,
  cx,
} from "./ui";

/** List-row art — Catalog tab matches Regions browse lists. */
const LIST_INSTRUMENT_ART =
  "h-[4.75rem] w-[4.75rem] shrink-0 rounded-xl sm:h-20 sm:w-20 md:h-[5.25rem] md:w-[5.25rem] md:rounded-2xl";

function SavedDot() {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--v-brass)] text-[color:var(--v-on-brass)]"
      aria-label="Saved"
      title="Saved"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 12.5 4.5 4.5L19 7" />
      </svg>
    </span>
  );
}

function FavButton({ id }: { id: string }) {
  const { isFavorite, toggleFavorite } = useVoice();
  const fav = isFavorite(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(id);
      }}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={fav}
      className={cx(
        "v-press inline-flex h-9 w-9 items-center justify-center rounded-full",
        fav
          ? "text-[color:var(--v-heart)]"
          : "text-[color:var(--v-faint)] hover:bg-[color:var(--v-panel-2)]",
      )}
    >
      {fav ? <IconHeartFilled size={19} /> : <IconHeart size={19} />}
    </button>
  );
}

export function InstrumentRow({
  instrument,
  onRequestRemove,
}: {
  instrument: Instrument;
  onRequestRemove?: (instrument: Instrument) => void;
}) {
  const { openInstrument, isSaved } = useVoice();
  const fam = FAMILY_MAP[instrument.family];
  const saved = isSaved(instrument.id);
  const onLong = useCallback(() => {
    onRequestRemove?.(instrument);
  }, [instrument, onRequestRemove]);
  const { bind, didLongPress } = useLongPress(onLong);

  return (
    <div
      className="v-press flex items-stretch gap-3 rounded-2xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)] p-3 select-none"
      {...(onRequestRemove ? bind : {})}
      style={onRequestRemove ? { touchAction: "manipulation" } : undefined}
    >
      <button
        type="button"
        onClick={() => {
          if (didLongPress()) return;
          openInstrument(instrument.id);
        }}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-label={`Open ${instrument.name}`}
      >
        <InstrumentArt
          instrument={instrument}
          className={LIST_INSTRUMENT_ART}
          glyphSize={34}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[15px] font-semibold text-[color:var(--v-ink)] v-clamp-1 md:text-base">
              {instrument.name}
            </h3>
            {saved ? <SavedDot /> : null}
            {instrument.latin !== instrument.name ? (
              <span className="v-clamp-1 text-xs text-[color:var(--v-faint)]">
                {instrument.latin}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <FamilyTag hueVar={fam.hueVar} softVar={fam.softVar}>
              {familyName(instrument.family)}
            </FamilyTag>
            <span className="text-[11px] text-[color:var(--v-faint)]">
              {instrument.origin}
            </span>
          </div>
        </div>
      </button>
      <div className="flex flex-col items-center justify-between gap-2 py-0.5">
        <FavButton id={instrument.id} />
        <IconChevron size={18} className="text-[color:var(--v-faint)]" />
      </div>
    </div>
  );
}

export function InstrumentGridCard({
  instrument,
  onRequestRemove,
}: {
  instrument: Instrument;
  onRequestRemove?: (instrument: Instrument) => void;
}) {
  const { openInstrument, isSaved } = useVoice();
  const fam = FAMILY_MAP[instrument.family];
  const saved = isSaved(instrument.id);
  const onLong = useCallback(() => {
    onRequestRemove?.(instrument);
  }, [instrument, onRequestRemove]);
  const { bind, didLongPress } = useLongPress(onLong);

  return (
    <button
      type="button"
      {...(onRequestRemove ? bind : {})}
      onClick={() => {
        if (didLongPress()) return;
        openInstrument(instrument.id);
      }}
      className="v-press flex flex-col overflow-hidden rounded-2xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)] text-left select-none"
      style={onRequestRemove ? { touchAction: "manipulation" } : undefined}
    >
      <div className="relative">
        <InstrumentArt
          instrument={instrument}
          className="aspect-[4/3] w-full"
          glyphSize={36}
        />
        <div className="absolute right-2 top-2">
          <div className="rounded-full bg-black/40 p-0.5 backdrop-blur">
            <FavButton id={instrument.id} />
          </div>
        </div>
        {saved ? (
          <div className="absolute left-2 top-2">
            <SavedDot />
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="font-display text-[1rem] leading-snug text-[color:var(--v-ink)] v-clamp-1">
          {instrument.name}
        </p>
        <p className="mt-1.5 text-[0.78rem] text-[color:var(--v-faint)] v-clamp-1">
          {instrument.origin}
        </p>
        <div className="mt-2">
          <FamilyTag hueVar={fam.hueVar} softVar={fam.softVar}>
            {familyName(instrument.family)}
          </FamilyTag>
        </div>
      </div>
    </button>
  );
}

export function InstrumentCollection({
  instruments,
  view,
  onRequestRemove,
}: {
  instruments: Instrument[];
  view: "list" | "grid";
  onRequestRemove?: (instrument: Instrument) => void;
}) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {instruments.map((it) => (
          <InstrumentGridCard
            key={it.id}
            instrument={it}
            onRequestRemove={onRequestRemove}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {instruments.map((it) => (
        <InstrumentRow
          key={it.id}
          instrument={it}
          onRequestRemove={onRequestRemove}
        />
      ))}
    </div>
  );
}
