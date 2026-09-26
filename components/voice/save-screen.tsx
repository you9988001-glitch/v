"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useVoice } from "@/contexts/voice-context";
import type { Instrument } from "@/lib/voice/data";
import { InstrumentCollection } from "./instrument-card";
import {
  Button,
  EmptyState,
  IconBookmark,
  IconGrid,
  IconList,
  cx,
} from "./ui";

/** Saved voices — mirrors Peaks Found (Mark → Save): list/grid + long-press remove. */
export function SaveScreen() {
  const { savedInstruments, savedCount, setNav, toggleSave, isSaved } =
    useVoice();
  const [view, setView] = useState<"list" | "grid">("list");
  const [pending, setPending] = useState<Instrument | null>(null);

  const confirmRemove = () => {
    if (!pending) return;
    if (isSaved(pending.id)) toggleSave(pending.id);
    setPending(null);
  };

  return (
    <div className="mx-auto max-w-md px-5 pt-3">
      <button
        type="button"
        onClick={() => setNav({ screen: "home" })}
        className="v-press mb-4 text-[0.8rem] font-semibold tracking-wide text-[color:var(--v-brass)]"
      >
        ← Home
      </button>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-[1.7rem] text-[color:var(--v-ink)]">
          Saved
        </h1>
        {savedInstruments.length > 0 ? (
          <div className="inline-flex overflow-hidden rounded-full border border-[color:var(--v-line)]">
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={cx(
                "v-press flex h-9 w-10 items-center justify-center",
                view === "list"
                  ? "bg-[color:var(--v-brass)] text-[color:var(--v-on-brass)]"
                  : "bg-[color:var(--v-panel)] text-[color:var(--v-muted)]",
              )}
            >
              <IconList size={20} />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={cx(
                "v-press flex h-9 w-10 items-center justify-center",
                view === "grid"
                  ? "bg-[color:var(--v-brass)] text-[color:var(--v-on-brass)]"
                  : "bg-[color:var(--v-panel)] text-[color:var(--v-muted)]",
              )}
            >
              <IconGrid size={20} />
            </button>
          </div>
        ) : null}
      </div>

      {savedInstruments.length > 0 ? (
        <p className="v-nums mt-1 text-sm text-[color:var(--v-muted)]">
          {savedCount.toLocaleString("en-US")} saved
        </p>
      ) : null}

      <div className="mt-4 pb-4">
        {savedInstruments.length === 0 ? (
          <EmptyState
            icon={<IconBookmark size={24} />}
            title="Nothing saved yet"
            hint="Tap Save on an instrument detail — it will appear here. Long-press a card to remove it."
            action={
              <Button variant="primary" onClick={() => setNav({ screen: "home" })}>
                Browse regions
              </Button>
            }
          />
        ) : (
          <InstrumentCollection
            instruments={savedInstruments}
            view={view}
            onRequestRemove={setPending}
          />
        )}
      </div>

      {pending && typeof document !== "undefined"
        ? createPortal(
            <div className="anim-fade-in fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-5">
              <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-sm rounded-3xl border border-[color:var(--v-line)] bg-[color:var(--v-panel-solid)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--v-brass)]">
                  Remove save
                </p>
                <h2 className="font-display mt-2 text-[1.45rem] text-[color:var(--v-ink)]">
                  Remove {pending.name}?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--v-muted)]">
                  This voice will leave your Saved list. You can save it again
                  anytime.
                </p>
                <div className="mt-5 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPending(null)}
                  >
                    No
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={confirmRemove}
                  >
                    Yes
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
