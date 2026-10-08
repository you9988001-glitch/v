"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { VOICE_UNLOCK_PRODUCT_ID } from "@/lib/product-config";
import {
  buildPurchaseDeed,
  buildRestoreSealDeed,
  deedFromUnknown,
  formatDeedDate,
  OWNERSHIP_STATE_KEY,
  readLocalDeed,
  writeLocalDeed,
  type OwnershipDeed,
} from "@/lib/voice/ownership-deed";
import {
  isRestoreOwned,
  OWNERSHIP_DEED_SEALED_EVENT,
  UNLOCK_FALLBACK,
} from "@/lib/voice/unlock-gate";
import { Button } from "@/components/voice/ui";
import { PAYMENT_ENV } from "@/lib/payment-env";

function extractBlob(rec: unknown): Record<string, unknown> {
  if (!rec || typeof rec !== "object") return {};
  const maybe = rec as { blob?: unknown };
  const blob = "blob" in maybe ? maybe.blob : rec;
  if (!blob || typeof blob !== "object") return {};
  const inner = (blob as { blob?: unknown }).blob;
  if (inner && typeof inner === "object") return inner as Record<string, unknown>;
  return blob as Record<string, unknown>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <p className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-wide text-[color:var(--v-faint)]">
        {label}
      </p>
      <p className="v-nums min-w-0 overflow-hidden break-all text-right text-[0.88rem] leading-snug text-[color:var(--v-ink)] [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}

export function OwnershipDeedBody({ deed }: { deed: OwnershipDeed }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[color:var(--v-string)]/40 bg-[rgba(232,195,106,0.14)] px-4 py-3">
        <p className="text-[0.88rem] leading-relaxed text-[color:var(--v-ink)]">
          {PAYMENT_ENV.ownedIntro}
        </p>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-[color:var(--v-muted)]">
          {PAYMENT_ENV.credit}
        </p>
      </div>

      <div className="divide-y divide-[color:var(--v-line)]">
        <Row label="Status" value={PAYMENT_ENV.deedOwnedStatus} />
        <Row label="Paid" value={PAYMENT_ENV.deedPaidLabel(deed.priceInPi)} />
        <Row label="Collected since" value={formatDeedDate(deed.purchasedAt)} />
        <Row label="Sealed on device" value={formatDeedDate(deed.sealedAt)} />
        <Row label="Product" value={deed.productName} />
        <Row
          label="Payment ID"
          value={deed.paymentId ?? "Restored on Pi · id sealed after checkout"}
        />
        <Row
          label="Tx ID"
          value={deed.txid ?? "Restored on Pi · tx sealed after checkout"}
        />
        {deed.username ? (
          <Row label="Pi user" value={`@${deed.username}`} />
        ) : null}
      </div>
    </div>
  );
}

export function OwnershipDeedModal({
  deed,
  title,
  onClose,
}: {
  deed: OwnershipDeed;
  title?: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="anim-fade-in fixed inset-0 z-[140] flex items-end justify-center bg-black/80 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-[color:var(--v-line)] bg-[color:var(--v-panel-solid)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.65)] md:max-w-lg"
      >
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--v-brass)]">
          CODE ARCHE · collection
        </p>
        <h2 className="font-display mt-2 text-[1.7rem] text-[color:var(--v-ink)]">
          {title ?? "Voice 3141 collection proof"}
        </h2>
        <div className="mt-4">
          <OwnershipDeedBody deed={deed} />
        </div>
        <Button className="mt-5 w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>,
    document.body,
  );
}

/** Quiet home-footer card — open proof only when tapped. */
export function OwnershipProofCard() {
  const { sdk, products, restoredPurchases, isAuthenticated } = usePiAuth();
  const [deed, setDeed] = useState<OwnershipDeed | null>(null);
  const [open, setOpen] = useState(false);

  const product = useMemo(
    () => products?.find((p) => p.id === VOICE_UNLOCK_PRODUCT_ID) ?? null,
    [products],
  );

  const restoreOwned = useMemo(
    () =>
      isRestoreOwned(restoredPurchases, product, [
        deed?.productId,
        deed?.productSlug,
      ]),
    [deed?.productId, deed?.productSlug, product, restoredPurchases],
  );

  useEffect(() => {
    const sync = () => setDeed(readLocalDeed());
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener(OWNERSHIP_DEED_SEALED_EVENT, sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener(OWNERSHIP_DEED_SEALED_EVENT, sync);
    };
  }, [restoredPurchases, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    (async () => {
      let next = readLocalDeed();

      if (!next && sdk) {
        try {
          const rec = await sdk.state.get(OWNERSHIP_STATE_KEY);
          const blob = extractBlob(rec);
          next = deedFromUnknown(blob.deed ?? blob);
          if (next) writeLocalDeed(next);
        } catch {
          /* ignore */
        }
      }

      // Seal a local display deed when Pi restore confirms ownership
      // (works even if product catalog is empty — use hardcoded fallback).
      if (!next && restoreOwned) {
        next = buildRestoreSealDeed({
          productId: product?.id ?? UNLOCK_FALLBACK.productId,
          productSlug: product?.slug ?? UNLOCK_FALLBACK.productSlug,
          productName: product?.name ?? UNLOCK_FALLBACK.productName,
          priceInPi: UNLOCK_FALLBACK.priceInPi,
        });
        writeLocalDeed(next);
        if (sdk) {
          try {
            await sdk.state.set(OWNERSHIP_STATE_KEY, { deed: next });
          } catch {
            /* local deed still stands for display */
          }
        }
      }

      if (!cancelled && next) setDeed(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, restoreOwned, product, sdk]);

  // Always visible — pre-purchase shows a "no ownership yet" state.
  const owned = restoreOwned || Boolean(deed);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="v-press mt-8 w-full rounded-2xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)] px-4 py-3.5 text-left"
      >
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--v-brass)]">
          Collection proof
        </p>
        <p className="mt-1 text-[0.95rem] text-[color:var(--v-ink)]">
          {owned
            ? "View your Voice 3141 purchase record"
            : "Nothing in your collection yet"}
        </p>
        {deed && (
          <p className="v-nums mt-1 text-[0.8rem] text-[color:var(--v-faint)]">
            {PAYMENT_ENV.deedPaidLabel(deed.priceInPi)} · {formatDeedDate(deed.purchasedAt)}
          </p>
        )}
      </button>
      {open && deed && (
        <OwnershipDeedModal deed={deed} onClose={() => setOpen(false)} />
      )}
      {open && !deed && owned && (
        <ConfirmingOwnershipModal onClose={() => setOpen(false)} />
      )}
      {open && !deed && !owned && (
        <NoOwnershipModal onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function ConfirmingOwnershipModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/80 p-4 anim-fade-in sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-[color:var(--v-line)] bg-[color:var(--v-panel-solid)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
      >
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--v-brass)]">
          CODE ARCHE · collection
        </p>
        <h2 className="font-display mt-2 text-[1.7rem] text-[color:var(--v-ink)]">
          Confirming your purchase
        </h2>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-[color:var(--v-muted)]">
          Pi has confirmed your collection, but the record is still being sealed
          on this device. Reopen this card in a moment to see the full details.
        </p>
        <Button className="mt-5 w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>,
    document.body,
  );
}

function NoOwnershipModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/80 p-4 anim-fade-in sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-[color:var(--v-line)] bg-[color:var(--v-panel-solid)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
      >
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--v-brass)]">
          CODE ARCHE · collection
        </p>
        <h2 className="font-display mt-2 text-[1.7rem] text-[color:var(--v-ink)]">
          Nothing in your collection yet
        </h2>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-[color:var(--v-muted)]">
          Open any instrument&apos;s detail page. After sealed unlock, collect it
          into your collection and hold it.
        </p>
        <Button className="mt-5 w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>,
    document.body,
  );
}

/** Call after a successful makePurchase to seal payment evidence. */
export async function sealPurchaseDeed(args: {
  productId: string;
  productSlug: string;
  productName: string;
  priceInPi: number;
  paymentId: string;
  txid: string;
  sdk: {
    state: { set: (key: string, blob: Record<string, unknown>) => Promise<void> };
  } | null;
  username?: string | null;
}): Promise<OwnershipDeed> {
  const deed = buildPurchaseDeed(args);
  writeLocalDeed(deed);
  if (args.sdk) {
    try {
      await args.sdk.state.set(OWNERSHIP_STATE_KEY, { deed });
    } catch {
      /* local remains */
    }
  }
  return deed;
}
