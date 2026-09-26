"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { VoiceProvider, useVoice } from "@/contexts/voice-context";
import { BottomNav } from "@/components/voice/bottom-nav";
import { HomeScreen } from "@/components/voice/home-screen";
import { RegionScreen } from "@/components/voice/region-screen";
import { OriginScreen } from "@/components/voice/origin-screen";
import { CatalogScreen } from "@/components/voice/catalog-screen";
import { SaveScreen } from "@/components/voice/save-screen";
import { FavoritesScreen } from "@/components/voice/favorites-screen";
import { CuratorNotePage } from "@/components/voice/curator-note";
import { DiscoveriesPage } from "@/components/voice/discoveries-page";

const InstrumentDetail = dynamic(
  () =>
    import("@/components/voice/instrument-detail").then((m) => ({
      default: m.InstrumentDetail,
    })),
  { ssr: false, loading: () => null },
);
import { LoadingScreen, StorageNotice, ToastHost } from "@/components/voice/pieces";
import {
  patchVoiceUiResume,
  readVoiceUiResume,
  writeVoiceUiResume,
} from "@/lib/voice/ui-resume";

function Shell() {
  const { ready, tab, nav, openId, discoveries, openInstrument } = useVoice();
  const [curatorOpen, setCuratorOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return readVoiceUiResume()?.curatorNote === true;
  });
  const [discoveriesOpen, setDiscoveriesOpen] = useState(false);

  const snapCuratorForReturn = useCallback(() => {
    if (!openId) return;
    writeVoiceUiResume({
      tab,
      nav,
      openId,
      curatorNote: true,
    });
  }, [tab, nav, openId]);

  useEffect(() => {
    const r = readVoiceUiResume();
    if (r?.curatorNote) setCuratorOpen(true);
  }, []);

  if (!ready) return <LoadingScreen />;

  return (
    <div className="v-app-bg min-h-[100dvh]">
      <main className="anim-fade-in v-safe-top mx-auto w-full max-w-md pb-28 md:max-w-2xl">
        {tab === "collection" && nav.screen === "home" && <HomeScreen />}
        {tab === "collection" && nav.screen === "saved" && <SaveScreen />}
        {tab === "collection" && nav.screen === "region" && (
          <RegionScreen regionId={nav.regionId} />
        )}
        {tab === "collection" && nav.screen === "origin" && (
          <OriginScreen regionId={nav.regionId} originName={nav.originName} />
        )}
        {tab === "collection" && nav.screen === "search" && <CatalogScreen />}
        {tab === "catalog" ? <CatalogScreen /> : null}
        {tab === "favorites" ? <FavoritesScreen /> : null}
      </main>
      <BottomNav />
      {!curatorOpen && !discoveriesOpen && openId ? (
        <InstrumentDetail
          onOpenCuratorNote={() => {
            snapCuratorForReturn();
            setCuratorOpen(true);
          }}
          onOpenDiscoveries={() => setDiscoveriesOpen(true)}
        />
      ) : null}
      {curatorOpen ? (
        <CuratorNotePage
          currentApp="voice3141"
          beforeExternalNav={snapCuratorForReturn}
          onBack={() => {
            setCuratorOpen(false);
            patchVoiceUiResume({ curatorNote: false });
          }}
        />
      ) : null}
      {discoveriesOpen ? (
        <DiscoveriesPage
          discoveries={discoveries}
          onBack={() => setDiscoveriesOpen(false)}
          onOpenInstrument={(id) => {
            setDiscoveriesOpen(false);
            openInstrument(id);
          }}
        />
      ) : null}
      <ToastHost />
      <StorageNotice />
    </div>
  );
}

export function Voice3141App() {
  return (
    <VoiceProvider>
      <Shell />
    </VoiceProvider>
  );
}
