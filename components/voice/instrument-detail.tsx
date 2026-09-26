"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LiveOriginTime } from "@/lib/voice/live-time";
import { LiveTimeCard } from "@/components/voice/live-time-card";
import { AntipodeResultSheet } from "@/components/voice/antipode-result-sheet";
import type { AntipodeTapResult } from "@/lib/voice/antipode-tap";
import { useVoice } from "@/contexts/voice-context";
import { usePiAuth } from "@/contexts/pi-auth-context";
import {
  FAMILY_MAP,
  familyName,
  flagEmoji,
  flagUrl,
  getInstrument,
} from "@/lib/voice/data";
import { PAYMENT_ENV } from "@/lib/payment-env";
import { Overlay, InstrumentArt } from "./pieces";
import {
  Button,
  FamilyTag,
  IconBack,
  IconHeart,
  IconHeartFilled,
  IconSparkle,
} from "./ui";

/** Payment-only screen — no instrument chatter. */
function VoicePaywall() {
  const {
    productPrice,
    productCatalogIssue,
    purchaseUnlock,
    purchasesReady,
    isUnlocked,
    refreshUnlockStatus,
  } = useVoice();
  const { sdk, isAuthenticated, hasError } = usePiAuth();
  const [busy, setBusy] = useState(false);
  const [checkTimedOut, setCheckTimedOut] = useState(false);

  useEffect(() => {
    void refreshUnlockStatus();
  }, [refreshUnlockStatus]);

  useEffect(() => {
    if (purchasesReady) {
      setCheckTimedOut(false);
      return;
    }
    const t = window.setTimeout(() => setCheckTimedOut(true), 4000);
    return () => window.clearTimeout(t);
  }, [purchasesReady]);

  const handlePay = async () => {
    if (busy || isUnlocked) return;
    setBusy(true);
    document.body.classList.add("v-pi-checkout");
    try {
      await purchaseUnlock();
    } finally {
      document.body.classList.remove("v-pi-checkout");
      setBusy(false);
    }
  };

  const gateReady = purchasesReady || checkTimedOut || hasError;
  const checking = !gateReady && !isUnlocked;
  const appName = "Voice 3141";

  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col justify-center px-5 pb-10 pt-6 md:max-w-lg">
      <div className="rounded-3xl border border-[color:var(--v-line)] bg-[color:var(--v-panel-solid)] p-5">
        <div className="rounded-2xl border border-[color:var(--v-string)]/40 bg-[rgba(232,195,106,0.14)] px-4 py-3">
          <p className="text-[0.88rem] leading-relaxed text-[color:var(--v-ink)]">
            {PAYMENT_ENV.intro}
          </p>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-[color:var(--v-muted)]">
            {PAYMENT_ENV.credit}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--v-brass)]">
            Pi payment
          </p>
          <span className="rounded-full bg-[rgba(232,195,106,0.2)] px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-[color:var(--v-string)]">
            {PAYMENT_ENV.badge}
          </span>
        </div>

        <h2 className="font-display mt-2 text-[1.75rem] leading-tight text-[color:var(--v-ink)]">
          {checking
            ? PAYMENT_ENV.checkingTitle
            : isUnlocked
              ? PAYMENT_ENV.unlockedTitle
              : PAYMENT_ENV.payTitle}
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-[color:var(--v-muted)]">
          {checking
            ? PAYMENT_ENV.checkingBody
            : isUnlocked
              ? PAYMENT_ENV.unlockedBody(appName)
              : PAYMENT_ENV.testNote}
        </p>

        {!checking && !isUnlocked ? (
          <>
            <div className="mt-5 rounded-2xl border border-[color:var(--v-line)] bg-black/25 px-4 py-3">
              {!isAuthenticated ? (
                <p className="text-sm text-[color:var(--v-string)]">
                  {PAYMENT_ENV.signInHint}
                </p>
              ) : productCatalogIssue ? (
                <p className="text-sm text-[color:var(--v-string)]">
                  {productCatalogIssue}
                </p>
              ) : productPrice === null ? (
                <p className="text-sm text-[color:var(--v-string)]">
                  {PAYMENT_ENV.loadingProduct}
                </p>
              ) : (
                <>
                  <p className="text-lg font-semibold text-[color:var(--v-ink)]">
                    {appName}
                  </p>
                  <p className="v-nums mt-3 text-xl font-semibold text-[color:var(--v-brass-deep)]">
                    {PAYMENT_ENV.priceLabel(productPrice)}
                  </p>
                </>
              )}
            </div>

            <Button
              onClick={handlePay}
              variant="primary"
              className="mt-5 w-full py-3.5"
              disabled={productPrice === null || !sdk || busy}
            >
              {busy
                ? PAYMENT_ENV.busyLabel
                : productPrice === null
                  ? PAYMENT_ENV.unavailable
                  : PAYMENT_ENV.buttonLabel(productPrice)}
            </Button>
            <p className="mt-3 text-center text-[0.75rem] leading-relaxed text-[color:var(--v-faint)]">
              {PAYMENT_ENV.footer}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function InstrumentDetail({
  onOpenCuratorNote,
  onOpenDiscoveries,
}: {
  onOpenCuratorNote: () => void;
  onOpenDiscoveries: () => void;
}) {
  const {
    openId,
    closeInstrument,
    openInstrument,
    recordAntipodeDiscovery,
    isFavorite,
    toggleFavorite,
    isSaved,
    toggleSave,
    isUnlocked,
    refreshUnlockStatus,
    toast,
    setNav,
  } = useVoice();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openId && !isUnlocked) void refreshUnlockStatus();
  }, [openId, isUnlocked, refreshUnlockStatus]);

  /* Related / Ensemble taps reuse the same overlay — always show the hero top. */
  useEffect(() => {
    if (!openId) return;
    const jump = () => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    };
    jump();
    const t = window.setTimeout(jump, 0);
    const raf = window.requestAnimationFrame(jump);
    return () => {
      window.clearTimeout(t);
      window.cancelAnimationFrame(raf);
    };
  }, [openId]);

  const [liveTime, setLiveTime] = useState<LiveOriginTime | null>(null);
  const [oppositeLive, setOppositeLive] = useState<LiveOriginTime | null>(
    null,
  );
  const [antipodeSheet, setAntipodeSheet] = useState<AntipodeTapResult | null>(
    null,
  );
  useEffect(() => {
    const code = openId ? getInstrument(openId)?.countryCode : null;
    if (!code) {
      setLiveTime(null);
      setOppositeLive(null);
      return;
    }
    let cancelled = false;
    const update = async () => {
      try {
        const { getLiveOriginTime, getAntipodeLiveTime } = await import(
          "@/lib/voice/live-time"
        );
        const next = await getLiveOriginTime(code);
        const opp = await getAntipodeLiveTime(code);
        if (!cancelled) {
          setLiveTime(next);
          setOppositeLive(opp);
        }
      } catch {
        if (!cancelled) {
          setLiveTime(null);
          setOppositeLive(null);
        }
      }
    };
    void update();
    const id = setInterval(() => void update(), 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [openId]);

  if (!openId) return null;
  const it = getInstrument(openId);
  if (!it) return null;

  const fam = FAMILY_MAP[it.family];
  const fav = isFavorite(it.id);
  const saved = isSaved(it.id);

  /* Locked: wait for restore, then payment only — no instrument name / art / notes. */
  if (!isUnlocked) {
    return (
      <Overlay onClose={closeInstrument} labelledBy="paywall-title" full>
        <div className="v-safe-top flex items-center justify-between px-3 pt-3">
          <button
            onClick={closeInstrument}
            aria-label="Back"
            className="v-press inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--v-ink)] hover:bg-[color:var(--v-panel-2)]"
          >
            <IconBack size={22} />
          </button>
          <span className="h-10 w-10" />
        </div>
        <h1 id="paywall-title" className="sr-only">
          Payment
        </h1>
        <VoicePaywall />
      </Overlay>
    );
  }

  const flagSrc = flagUrl(it.countryCode, 80);

  const handleSave = () => {
    toggleSave(it.id);
    toast(saved ? "Removed from saved" : `Saved ${it.name}`);
  };

  const handleFavorite = () => {
    toggleFavorite(it.id);
    toast(fav ? "Removed from favorites" : `Added ${it.name} to favorites`);
  };

  return (
    <Overlay onClose={closeInstrument} labelledBy="detail-title" full>
      <div className="v-safe-top flex shrink-0 items-center justify-between px-3 pt-3">
        <button
          onClick={closeInstrument}
          aria-label="Back"
          className="v-press inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--v-ink)] hover:bg-[color:var(--v-panel-2)]"
        >
          <IconBack size={22} />
        </button>
        <span className="h-10 w-10" />
      </div>

      <div
        key={it.id}
        ref={scrollRef}
        className="v-no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6"
      >
        <div id="detail-hero" className="scroll-mt-4">
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--v-line)] bg-black/30 text-xl">
              {flagSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={flagSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span aria-hidden>{flagEmoji(it.countryCode)}</span>
              )}
            </span>
            <p className="min-w-0 text-[0.95rem] font-semibold leading-snug text-[color:var(--v-ink)]">
              {it.origin}
            </p>
          </div>

          <h1
            id="detail-title"
            className="mt-4 font-display text-[30px] font-bold leading-tight text-[color:var(--v-ink)]"
          >
            {it.name}
          </h1>
          {it.latin !== it.name ? (
            <p className="mt-1 text-sm text-[color:var(--v-faint)]">{it.latin}</p>
          ) : null}

        </div>
        {it.summary ? (
          <p className="mt-3 text-[1.9rem] leading-relaxed text-[color:var(--v-muted)]">
            {it.summary}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FamilyTag hueVar={fam.hueVar} softVar={fam.softVar}>
            {familyName(it.family)}
          </FamilyTag>
          <span className="text-sm text-[color:var(--v-faint)]">{it.region}</span>
          {saved ? (
            <span className="rounded-full bg-[color:color-mix(in_oklch,var(--v-brass)_22%,transparent)] px-2.5 py-0.5 text-[0.72rem] font-semibold text-[color:var(--v-brass-deep)]">
              Saved
            </span>
          ) : null}
        </div>

        {it.technique ? (
          <div className="mt-5 rounded-2xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)] px-4 py-3">
            <p className="text-[1.4rem] font-semibold uppercase tracking-wide text-[color:var(--v-faint)]">
              Technique
            </p>
            <p className="mt-0.5 text-[1.44rem] leading-snug text-[color:var(--v-muted)]">
              How the sound is produced — plucked, bowed, blown, struck, or
              shaken.
            </p>
            <p className="mt-1 text-[1.9rem] font-medium capitalize leading-snug text-[color:var(--v-ink)]">
              {it.technique}
            </p>
          </div>
        ) : null}

        <section id="voice-notes" className="mt-5 scroll-mt-24">
          <div className="mb-2 flex items-center gap-1.5 text-[color:var(--v-brass-deep)]">
            <IconSparkle size={16} />
            <span className="text-[22px] font-semibold uppercase tracking-[0.14em]">
              This instrument’s voice
            </span>
          </div>
          <p className="v-pre text-[32px] leading-[1.8] text-[color:var(--v-ink)]">
            {it.note}
          </p>
        </section>

        {(() => {
          const related = (it.relatedInstruments ?? [])
            .map((id) => getInstrument(id))
            .filter((x): x is NonNullable<typeof x> => Boolean(x));
          const related2 = (it.relatedInstruments2 ?? [])
            .map((id) => getInstrument(id))
            .filter((x): x is NonNullable<typeof x> => Boolean(x));
          if (!related.length && !related2.length) return null;
          return (
            <>
              {related.length ? (
                <section id="related" className="mt-8 scroll-mt-24">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[color:var(--v-string)]">
                    Related
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {related.map((rel) => (
                      <li key={rel.id}>
                        <button
                          type="button"
                          onClick={() => openInstrument(rel.id)}
                          className="v-press flex w-full items-center gap-3 rounded-2xl border border-[color:color-mix(in_oklch,var(--v-string)_48%,var(--v-line))] bg-[color:color-mix(in_oklch,var(--v-string)_14%,var(--v-panel))] px-3 py-2.5 text-left"
                        >
                          <InstrumentArt
                            instrument={rel}
                            className="h-12 w-12 shrink-0 rounded-xl"
                            glyphSize={22}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.95rem] font-semibold leading-snug text-[color:var(--v-ink)]">
                              {rel.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[0.75rem] text-[color:var(--v-string)]">
                              {familyName(rel.family)} · {rel.origin}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {related2.length ? (
                <section id="related-ii" className="mt-5 scroll-mt-24">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[color:var(--v-wind)]">
                    Related II
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {related2.map((rel) => (
                      <li key={rel.id}>
                        <button
                          type="button"
                          onClick={() => openInstrument(rel.id)}
                          className="v-press flex w-full items-center gap-3 rounded-2xl border border-[color:color-mix(in_oklch,var(--v-wind)_50%,var(--v-line))] bg-[color:color-mix(in_oklch,var(--v-wind)_12%,var(--v-panel))] px-3 py-2.5 text-left"
                        >
                          <InstrumentArt
                            instrument={rel}
                            className="h-12 w-12 shrink-0 rounded-xl"
                            glyphSize={22}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.95rem] font-semibold leading-snug text-[color:var(--v-ink)]">
                              {rel.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[0.75rem] text-[color:var(--v-string)]">
                              {familyName(rel.family)} · {rel.origin}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          );
        })()}

        {(() => {
          const paired = (it.ensemblePairing ?? [])
            .map((id) => getInstrument(id))
            .filter((x): x is NonNullable<typeof x> => Boolean(x));
          const paired2 = (it.ensemblePairing2 ?? [])
            .map((id) => getInstrument(id))
            .filter((x): x is NonNullable<typeof x> => Boolean(x));
          if (!paired.length && !paired2.length) return null;
          return (
            <>
              {paired.length ? (
                <section id="ensemble" className="mt-8 scroll-mt-24">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[color:var(--v-brass)]">
                    Ensemble
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {paired.map((ens) => (
                      <li key={ens.id}>
                        <button
                          type="button"
                          onClick={() => openInstrument(ens.id)}
                          className="v-press flex w-full items-center gap-3 rounded-2xl border border-[color:color-mix(in_oklch,var(--v-brass)_45%,var(--v-line))] bg-[color:color-mix(in_oklch,var(--v-brass)_14%,var(--v-panel))] px-3 py-2.5 text-left"
                        >
                          <InstrumentArt
                            instrument={ens}
                            className="h-12 w-12 shrink-0 rounded-xl"
                            glyphSize={22}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.95rem] font-semibold leading-snug text-[color:var(--v-ink)]">
                              {ens.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[0.75rem] text-[color:var(--v-brass-deep)]">
                              {familyName(ens.family)} · {ens.origin}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {paired2.length ? (
                <section id="ensemble-ii" className="mt-5 scroll-mt-24">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[color:var(--v-keyboard)]">
                    Ensemble II
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {paired2.map((ens) => (
                      <li key={ens.id}>
                        <button
                          type="button"
                          onClick={() => openInstrument(ens.id)}
                          className="v-press flex w-full items-center gap-3 rounded-2xl border border-[color:color-mix(in_oklch,var(--v-keyboard)_48%,var(--v-line))] bg-[color:color-mix(in_oklch,var(--v-keyboard)_14%,var(--v-panel))] px-3 py-2.5 text-left"
                        >
                          <InstrumentArt
                            instrument={ens}
                            className="h-12 w-12 shrink-0 rounded-xl"
                            glyphSize={22}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.95rem] font-semibold leading-snug text-[color:var(--v-ink)]">
                              {ens.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[0.75rem] text-[color:var(--v-keyboard)]">
                              {familyName(ens.family)} · {ens.origin}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          );
        })()}

        {liveTime || oppositeLive ? (
          <div className="mt-14 scroll-mt-24 flex flex-col">
            {liveTime ? (
              <LiveTimeCard
                inPair
                live={liveTime}
                kicker={"Right now, in this voice's homeland"}
              />
            ) : (
              <p className="rounded-2xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)] px-4 py-3 text-[0.75rem] text-[color:var(--v-muted)]">
                Local time unavailable — homeland location data missing.
              </p>
            )}
            {oppositeLive ? (
              <div className={`${liveTime ? "mt-5" : ""} flex flex-col gap-2`}>
                <p className="text-center text-[0.62rem] font-bold uppercase tracking-[0.2em] text-orange-400">
                  <span
                    className="mr-1.5 inline-block text-[1.24rem] leading-none"
                    aria-hidden
                  >
                    🌍
                  </span>
                  Same moment on Earth — opposite hemisphere
                </p>
                <LiveTimeCard
                  inPair
                  contrast
                  live={oppositeLive}
                  kicker="Right now, at this place"
                  onAntipodeTap={(tap) => {
                    if (tap.kind === "open-detail" && openId) {
                      recordAntipodeDiscovery(openId, tap.instrumentId);
                    }
                    setAntipodeSheet(tap);
                  }}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          id="sources"
          className={`${liveTime || oppositeLive ? "mt-12" : "mt-14"} scroll-mt-24 pb-2`}
        >
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[color:var(--v-faint)]">
            Sources
          </p>
          <div className="mt-3 space-y-2 text-[0.88rem] leading-relaxed text-[color:var(--v-muted)]">
            <p>
              This catalog exists because the Curator believes an instrument
              shaped by human hands is never mere matter — it carries the
              maker&apos;s hand into its own voice. 3141 in tribute to π,
              gathered from famous traditions and unnamed corners of the world
              alike — each one checked to be real.
            </p>
            <p>
              Instrument names, origins, and classification: researched from
              publicly available ethnomusicological and cultural references.
            </p>
            <p>
              Playing technique and each instrument&apos;s &quot;voice&quot;:
              researched and written in collaboration with Cursor Agent and
              Claude.
            </p>
            <p>
              Local time and season: calculated from each instrument&apos;s
              verified country using a maintained timezone dataset. For
              countries spanning multiple timezones, one representative zone
              is shown, not the specific region an instrument comes from.
              Hemisphere and season follow the capital city&apos;s side of
              the equator — for the handful of countries whose territory
              straddles it, this is an approximation, not an exact
              per-region calculation.
            </p>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (openId) onOpenCuratorNote();
              }}
              className="v-press min-w-0 flex-1 rounded-full border border-[color:var(--v-line)] bg-[color:var(--v-panel)] px-2 py-1.5 text-[0.72rem] font-semibold leading-tight text-[color:var(--v-brass-deep)] sm:text-[0.78rem]"
            >
              Curator&apos;s note
            </button>
            <button
              type="button"
              onClick={onOpenDiscoveries}
              className="v-press min-w-0 flex-1 rounded-full border border-[color:var(--v-line)] bg-[color:var(--v-panel)] px-2 py-1.5 text-[0.72rem] font-semibold leading-tight text-[color:var(--v-brass-deep)] sm:text-[0.78rem]"
            >
              Discoveries
            </button>
            <button
              type="button"
              onClick={() => {
                closeInstrument();
                setNav({ screen: "home" });
              }}
              className="v-press min-w-0 flex-1 rounded-full border border-[color:var(--v-line)] bg-[color:var(--v-panel)] px-2 py-1.5 text-[0.72rem] font-semibold leading-tight text-[color:var(--v-brass-deep)] sm:text-[0.78rem]"
            >
              Regions
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[color:var(--v-line)] bg-[rgba(20,8,36,0.92)] px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2">
          <Button
            variant={saved ? "outline" : "primary"}
            className="min-w-0 flex-1"
            onClick={handleSave}
            aria-pressed={saved}
          >
            <span className="truncate">Save</span>
          </Button>
          <Button
            variant={fav ? "outline" : "primary"}
            className="min-w-0 flex-1"
            onClick={handleFavorite}
            aria-pressed={fav}
          >
            {fav ? (
              <IconHeartFilled size={18} className="shrink-0" />
            ) : (
              <IconHeart size={18} className="shrink-0" />
            )}
            <span className="truncate">Favorite</span>
          </Button>
        </div>
      </div>

      {antipodeSheet ? (
        <AntipodeResultSheet
          fromId={openId}
          tap={antipodeSheet}
          onClose={() => setAntipodeSheet(null)}
        />
      ) : null}
    </Overlay>
  );
}
