"use client";

import { useVoice } from "@/contexts/voice-context";
import {
  FAMILY_MAP,
  dayLabel,
  familyName,
  filterInstruments,
  type Instrument,
} from "@/lib/voice/data";
import { InstrumentArt } from "./pieces";
import { InstrumentRow } from "./instrument-card";
import {
  Button,
  Eyebrow,
  FamilyTag,
  IconHeart,
  IconHeartFilled,
  IconSparkle,
  cx,
} from "./ui";

export function TodayScreen() {
  const { dailyToday, isFavorite, toggleFavorite, openInstrument, setTab } =
    useVoice();
  const it = dailyToday;
  const fam = FAMILY_MAP[it.family];
  const fav = isFavorite(it.id);

  const kindred: Instrument[] = filterInstruments({
    query: "",
    region: null,
    family: it.family,
  })
    .filter((x) => x.id !== it.id)
    .slice(0, 3);

  return (
    <div className="px-4 pb-8 pt-5">
      <header className="mb-4 text-center">
        <Eyebrow className="!tracking-[0.22em]">Voice of the day</Eyebrow>
        <p className="mt-1 text-xs text-[color:var(--v-faint)]">{dayLabel()}</p>
      </header>

      <div className="anim-fade-up overflow-hidden rounded-3xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)]">
        <div className="relative">
          <InstrumentArt instrument={it} className="h-52 w-full" glyphSize={64} />
          <button
            onClick={() => toggleFavorite(it.id)}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={fav}
            className={cx(
              "v-press absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full backdrop-blur",
              fav
                ? "bg-[color:var(--v-panel)] text-[color:var(--v-heart)]"
                : "bg-black/40 text-[color:var(--v-ink)]",
            )}
          >
            {fav ? <IconHeartFilled size={22} /> : <IconHeart size={22} />}
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2">
            <FamilyTag hueVar={fam.hueVar} softVar={fam.softVar}>
              {familyName(it.family)}
            </FamilyTag>
            <span className="text-[11px] text-[color:var(--v-faint)]">
              {it.origin} · {it.region}
            </span>
          </div>
          <h1 className="mt-3 font-display text-[28px] font-bold leading-tight text-[color:var(--v-ink)]">
            {it.name}
          </h1>
          {it.latin !== it.name ? (
            <p className="text-sm text-[color:var(--v-faint)]">{it.latin}</p>
          ) : null}

          <div className="mt-4 rounded-2xl bg-[color:var(--v-panel-2)] p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-[color:var(--v-brass-deep)]">
              <IconSparkle size={16} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                This instrument’s voice
              </span>
            </div>
            <p className="v-pre text-[15px] leading-relaxed text-[color:var(--v-ink)]">
              {it.note}
            </p>
          </div>

          <div className="mt-4 flex gap-2.5">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => openInstrument(it.id)}
            >
              Read more
            </Button>
            <Button variant="outline" onClick={() => setTab("collection")}>
              Explore
            </Button>
          </div>
        </div>
      </div>

      {kindred.length > 0 ? (
        <section className="mt-7">
          <h2 className="mb-2.5 font-display text-lg font-semibold text-[color:var(--v-ink)]">
            Kindred voices
          </h2>
          <div className="flex flex-col gap-2.5">
            {kindred.map((k) => (
              <InstrumentRow key={k.id} instrument={k} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
