"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LEGAL_DOCS, type LegalDocId } from "@/lib/code-arche-legal";

function LegalDocBody({ docId }: { docId: LegalDocId }) {
  const doc = LEGAL_DOCS[docId];
  return (
    <div className="space-y-5 text-left text-[0.92rem] leading-relaxed text-[color:var(--v-muted)]">
      {doc.sections.map((section, i) => (
        <section key={i} className="space-y-2.5">
          {section.heading ? (
            <h3 className="text-[0.98rem] font-semibold text-[color:var(--v-ink)]">
              {section.heading}
            </h3>
          ) : null}
          {section.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {section.bullets?.length ? (
            <ul className="list-disc space-y-2 pl-5">
              {section.bullets.map((b, k) => (
                <li key={k}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function LegalDocModal({
  docId,
  onClose,
}: {
  docId: LegalDocId;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!mounted) return null;

  const doc = LEGAL_DOCS[docId];

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center bg-black/80 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="v-legal-title"
        className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[color:var(--v-line)] bg-[color:var(--v-panel-solid)] shadow-[0_24px_60px_rgba(0,0,0,0.65)] md:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[color:var(--v-line)] px-5 pb-3 pt-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--v-string)]">
            CODE ARCHE
          </p>
          <h2
            id="v-legal-title"
            className="mt-2 text-[1.55rem] font-semibold text-[color:var(--v-ink)]"
          >
            {doc.title}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <LegalDocBody docId={docId} />
        </div>
        <div className="border-t border-[color:var(--v-line)] p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-[color:var(--v-line)] bg-[color:var(--v-panel)] px-4 py-3 text-sm font-semibold text-[color:var(--v-ink)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Shared CODE ARCHE legal footer — opens in-app copy (no external hop). */
export function LegalFooter() {
  const [open, setOpen] = useState<LegalDocId | null>(null);

  return (
    <>
      <footer className="mt-10 pb-2 text-center text-[0.74rem] tracking-[0.14em] text-[color:var(--v-faint)] opacity-80">
        <div className="mb-5 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 text-[0.78rem] tracking-[0.08em] opacity-100">
          <button
            type="button"
            onClick={() => setOpen("privacy")}
            className="font-semibold text-[color:var(--v-string)] underline-offset-2 hover:underline"
          >
            Privacy Policy
          </button>
          <span aria-hidden="true" className="text-[color:var(--v-faint)]">
            ·
          </span>
          <button
            type="button"
            onClick={() => setOpen("terms")}
            className="font-semibold text-[color:var(--v-string)] underline-offset-2 hover:underline"
          >
            Terms of Service
          </button>
        </div>
        <p className="leading-relaxed">
          © 2026 CODE ARCHE. All Rights Reserved.
          <br />
          IN RECOGNITION OF PI NETWORK GENESIS PHILOSOPHY.
          <br />
          Contact : you9988001@gmail.com
        </p>
      </footer>
      {open ? <LegalDocModal docId={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
