"use client";

import { type ReactNode } from "react";
import { useVoice } from "@/contexts/voice-context";
import { FAMILY_MAP, type Instrument } from "@/lib/voice/data";
import { FamilyGlyph, IconClose, cx } from "./ui";

export function LoadingScreen() {
  return (
    <div className="v-app-bg flex min-h-[100dvh] flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="anim-pop flex h-16 w-16 items-center justify-center rounded-2xl v-hero-grad text-[color:var(--v-on-brass)]">
        <FamilyGlyph family="string" size={30} />
      </div>
      <div className="space-y-1">
        <p className="font-display text-xl text-[color:var(--v-ink)]">Voice3141</p>
        <p className="text-sm text-[color:var(--v-muted)]">Loading voices…</p>
      </div>
      <span
        className="anim-spin inline-block h-6 w-6 rounded-full border-2 border-[color:var(--v-brass)] border-t-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

export function StorageNotice() {
  const { storageTrouble } = useVoice();
  if (!storageTrouble) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[210] flex justify-center px-4 pt-3 v-safe-top">
      <div className="anim-toast pointer-events-auto rounded-full border border-[color:var(--v-line)] bg-[color:var(--v-panel)] px-4 py-2 text-xs text-[color:var(--v-muted)] shadow-sm">
        Saving to your Pi account is taking a moment…
      </div>
    </div>
  );
}

export function ToastHost() {
  const { toasts } = useVoice();
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="anim-toast rounded-full bg-[color:var(--v-ink)] px-4 py-2.5 text-sm font-medium text-[color:var(--v-bg)] shadow-lg"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

/** Family-hued art tile with an inline glyph — list/cards only. */
export function InstrumentArt({
  instrument,
  className,
  glyphSize = 40,
}: {
  instrument: Instrument;
  className?: string;
  glyphSize?: number;
}) {
  const fam = FAMILY_MAP[instrument.family];
  return (
    <div
      className={cx(
        "relative flex items-center justify-center overflow-hidden",
        className,
      )}
      style={{
        background: `radial-gradient(120% 110% at 25% 15%, color-mix(in oklch, var(${fam.hueVar}) 22%, var(--v-panel)), var(--v-panel))`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(120deg, color-mix(in oklch, currentColor 6%, transparent) 0 1px, transparent 1px 14px)",
          color: `var(${fam.hueVar})`,
          opacity: 0.5,
        }}
        aria-hidden="true"
      />
      <FamilyGlyph
        family={instrument.family}
        size={glyphSize}
        style={{ color: `var(${fam.hueVar})` }}
        className="relative"
      />
    </div>
  );
}

// Bottom sheet by default; `full` matches Peaks detail (edge-to-edge, no top gap).
export function Overlay({
  children,
  onClose,
  labelledBy,
  full = false,
}: {
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
  full?: boolean;
}) {
  return (
    <div className="v-overlay-shell fixed inset-0 z-[90] flex flex-col">
      {!full ? (
        <button
          aria-label="Close"
          onClick={onClose}
          className="v-overlay-backdrop absolute inset-0 bg-black/70"
        />
      ) : null}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cx(
          "anim-fade-up relative mx-auto flex w-full flex-col overflow-hidden",
          full
            ? "h-[100dvh] max-h-[100dvh] max-w-none flex-1 rounded-none bg-[color:var(--v-bg)]"
            : "mt-auto max-h-[94dvh] max-w-md rounded-t-3xl border-t border-[color:var(--v-line)] bg-[color:var(--v-panel-solid)] md:max-w-2xl",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function OverlayHeader({
  title,
  onClose,
}: {
  title?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
      <div className="mx-auto h-1 w-10 rounded-full bg-[color:var(--v-line)]" aria-hidden="true" />
      <button
        aria-label="Close"
        onClick={onClose}
        className="v-press absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--v-muted)] hover:bg-[color:var(--v-panel-2)]"
      >
        <IconClose size={20} />
      </button>
      {title ? <span className="sr-only">{title}</span> : null}
    </div>
  );
}
