"use client";

import { useState } from "react";
import { useVoice } from "@/contexts/voice-context";
import { InstrumentRow } from "./instrument-card";
import {
  Button,
  Eyebrow,
  EmptyState,
  IconHeart,
  IconTrash,
} from "./ui";

/** Instruments from the heart button. */
export function FavoritesScreen() {
  const { favoriteInstruments, clearFavorites, setTab } = useVoice();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="px-4 pb-8 pt-5">
      <header className="mb-4 flex items-end justify-between gap-2">
        <div>
          <Eyebrow>Your shelf</Eyebrow>
          <h1 className="mt-1 font-display text-[26px] font-bold leading-tight text-[color:var(--v-ink)]">
            Favorites
          </h1>
          <p className="mt-1 text-[13px] text-[color:var(--v-muted)]">
            {favoriteInstruments.length} favorite
            {favoriteInstruments.length === 1 ? "" : "s"}.
          </p>
        </div>
        {favoriteInstruments.length > 0 ? (
          <button
            onClick={() => setConfirmClear((v) => !v)}
            className="v-press inline-flex items-center gap-1.5 rounded-full border border-[color:var(--v-line)] px-3 py-2 text-xs font-semibold text-[color:var(--v-muted)]"
          >
            <IconTrash size={15} />
            Clear
          </button>
        ) : null}
      </header>

      {confirmClear && favoriteInstruments.length > 0 ? (
        <div className="anim-fade-up mb-4 rounded-2xl border border-[color:color-mix(in_srgb,var(--v-heart)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--v-heart)_12%,transparent)] p-4">
          <p className="text-sm text-[color:var(--v-ink)]">
            Clear all favorites? This cannot be undone.
          </p>
          <div className="mt-3 flex gap-2.5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmClear(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                clearFavorites();
                setConfirmClear(false);
              }}
            >
              Clear all
            </Button>
          </div>
        </div>
      ) : null}

      {favoriteInstruments.length === 0 ? (
        <EmptyState
          icon={<IconHeart size={24} />}
          title="No favorites yet"
          hint="Tap the heart on any instrument to keep it here."
          action={
            <Button variant="primary" onClick={() => setTab("collection")}>
              Browse regions
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {favoriteInstruments.map((it) => (
            <InstrumentRow key={it.id} instrument={it} />
          ))}
        </div>
      )}
    </div>
  );
}
