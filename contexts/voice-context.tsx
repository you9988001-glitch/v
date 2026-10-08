"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import {
  INSTRUMENTS,
  type Instrument,
  type TabId,
  type PrefsState,
  type WorldRegionId,
  sanitizePrefs,
  prefsToBlob,
  sanitizeFavorites,
  favoritesToBlob,
  sanitizeSaved,
  savedToBlob,
  MAX_FAVORITES,
  MAX_SAVED,
  getInstrument,
  extractObject,
} from "@/lib/voice/data";
import { KeyWriter, storeOf } from "@/lib/voice/store";
import { VOICE_UNLOCK_PRODUCT_ID } from "@/lib/product-config";
import { sealPurchaseDeed } from "@/components/voice/ownership-deed-card";
import {
  buildRestoreSealDeed,
  readLocalDeed,
  writeLocalDeed,
  type OwnershipDeed,
} from "@/lib/voice/ownership-deed";
import {
  hasUnlockAccess,
  isRestoreOwned,
  OWNERSHIP_DEED_SEALED_EVENT,
  purchaseQtyForUnlock,
  TEST_PI_PRICE,
  UNLOCK_FALLBACK,
} from "@/lib/voice/unlock-gate";
import { PAYMENT_ENV, catalogPriceMatchesUnlock } from "@/lib/payment-env";
import { resolveUnlockProduct } from "@/lib/resolve-unlock-product";
import { isPaywallPreviewOnly } from "@/lib/paywall-preview-only";
import {
  patchVoiceUiResume,
  readVoiceUiResume,
  writeVoiceUiResume,
} from "@/lib/voice/ui-resume";
import {
  appendDiscovery,
  discoveriesToBlob,
  sanitizeDiscoveries,
  type AntipodeDiscovery,
} from "@/lib/voice/discoveries";

export interface Toast {
  id: string;
  message: string;
}

export type NavState =
  | { screen: "home" }
  | { screen: "saved" }
  | { screen: "region"; regionId: WorldRegionId }
  | { screen: "origin"; regionId: WorldRegionId; originName: string }
  | { screen: "search" };

interface VoiceContextValue {
  ready: boolean;
  storageTrouble: boolean;
  tab: TabId;
  setTab: (t: TabId) => void;
  nav: NavState;
  setNav: (n: NavState) => void;
  /** Heart → Favorites tab */
  favorites: string[];
  favoriteCount: number;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
  favoriteInstruments: Instrument[];
  /** Detail Save button → Save tab */
  saved: string[];
  savedCount: number;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
  clearSaved: () => void;
  savedInstruments: Instrument[];
  openId: string | null;
  openInstrument: (id: string) => void;
  closeInstrument: () => void;
  productPrice: number | null;
  /** Set when Portal catalog price ≠ 3.141 π — checkout blocked. */
  productCatalogIssue: string | null;
  /** True only after purchase balances have been restored (or failed empty). */
  purchasesReady: boolean;
  isUnlocked: boolean;
  purchaseUnlock: () => Promise<OwnershipDeed | null>;
  refreshUnlockStatus: () => Promise<void>;
  toasts: Toast[];
  toast: (message: string) => void;
  discoveries: AntipodeDiscovery[];
  recordAntipodeDiscovery: (fromId: string, toId: string) => void;
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);

const KEY_PREFS = "voice.prefs";
const KEY_FAVORITES = "voice.favorites";
const KEY_SAVED = "voice.saved";
const KEY_DISCOVERIES = "voice.discoveries";

const VALID_INSTRUMENT_IDS = new Set(INSTRUMENTS.map((i) => i.id));

export function VoiceProvider({ children }: { children: ReactNode }) {
  const auth = usePiAuth();
  const sdk = auth.sdk;
  const isAuthenticated = auth.isAuthenticated;
  const products = auth.products;
  const restoredPurchases = auth.restoredPurchases;
  const refreshPurchases =
    auth.refreshPurchases ??
    (async () => {
      /* older SDKLite shells may omit this helper */
    });

  const [ready, setReady] = useState(true);
  const [storageTrouble, setStorageTrouble] = useState(false);
  const [tab, setTabState] = useState<TabId>("collection");
  const [nav, setNavState] = useState<NavState>({ screen: "home" });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [discoveries, setDiscoveries] = useState<AntipodeDiscovery[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const resumeHydrated = useRef(false);
  const usedUiResume = useRef(false);

  const prefsRef = useRef<PrefsState>({ tab: "collection" });
  const favoritesRef = useRef<string[]>([]);
  const savedRef = useRef<string[]>([]);
  const discoveriesRef = useRef<AntipodeDiscovery[]>([]);

  useEffect(() => {
    if (resumeHydrated.current) return;
    resumeHydrated.current = true;
    const r = readVoiceUiResume();
    if (!r) return;
    usedUiResume.current = true;
    setTabState(r.tab);
    setNavState(r.nav);
    if (r.openId && getInstrument(r.openId)) setOpenId(r.openId);
    prefsRef.current = { ...prefsRef.current, tab: r.tab };
  }, []);

  const setNav = useCallback((n: NavState) => {
    setNavState(n);
    patchVoiceUiResume({ nav: n });
  }, []);

  useEffect(() => {
    if (!resumeHydrated.current) return;
    writeVoiceUiResume({
      tab,
      nav,
      openId,
      curatorNote: readVoiceUiResume()?.curatorNote === true,
    });
  }, [tab, nav, openId]);

  useEffect(() => {
    const flush = () => {
      writeVoiceUiResume({
        tab,
        nav,
        openId,
        curatorNote: readVoiceUiResume()?.curatorNote === true,
      });
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tab, nav, openId]);

  const prefsWriterRef = useRef<KeyWriter | null>(null);
  const favWriterRef = useRef<KeyWriter | null>(null);
  const savedWriterRef = useRef<KeyWriter | null>(null);
  const discoveriesWriterRef = useRef<KeyWriter | null>(null);

  const toast = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  useEffect(() => {
    const store = storeOf(isAuthenticated ? (sdk as never) : null);
    const onTrouble = (v: boolean) => setStorageTrouble(v);
    prefsWriterRef.current = new KeyWriter(store, KEY_PREFS, 900, onTrouble);
    favWriterRef.current = new KeyWriter(store, KEY_FAVORITES, 1000, onTrouble);
    savedWriterRef.current = new KeyWriter(store, KEY_SAVED, 1000, onTrouble);
    discoveriesWriterRef.current = new KeyWriter(
      store,
      KEY_DISCOVERIES,
      1000,
      onTrouble,
    );

    if (!isAuthenticated) return;

    let cancelled = false;
    (async () => {
      try {
        const [pRec, fRec, sRec, dRec] = await Promise.all([
          store.get(KEY_PREFS),
          store.get(KEY_FAVORITES),
          store.get(KEY_SAVED),
          store.get(KEY_DISCOVERIES),
        ]);
        if (cancelled) return;
        const prefs = sanitizePrefs(pRec?.blob);
        const favs = sanitizeFavorites(fRec?.blob);
        const saves = sanitizeSaved(sRec?.blob);
        const dObj = extractObject(dRec?.blob);
        const disc = sanitizeDiscoveries(
          dObj.discoveries,
          VALID_INSTRUMENT_IDS,
        );
        favoritesRef.current = favs;
        savedRef.current = saves;
        discoveriesRef.current = disc;
        // Keep local UI resume path (tab/nav/openId) when returning from other apps.
        if (!usedUiResume.current) {
          prefsRef.current = prefs;
          setTabState(prefs.tab);
        } else {
          prefsRef.current = { ...prefs, tab: prefsRef.current.tab };
        }
        setFavorites(favs);
        setSaved(saves);
        setDiscoveries(disc);
      } catch {
        /* fresh */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, sdk]);

  useEffect(() => {
    const flush = () => {
      prefsWriterRef.current?.flushNow();
      favWriterRef.current?.flushNow();
      savedWriterRef.current?.flushNow();
      discoveriesWriterRef.current?.flushNow();
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const commitPrefs = useCallback(() => {
    prefsWriterRef.current?.now(() => prefsToBlob(prefsRef.current));
  }, []);

  const commitFavorites = useCallback(() => {
    favWriterRef.current?.now(() => favoritesToBlob(favoritesRef.current));
  }, []);

  const commitSaved = useCallback(() => {
    savedWriterRef.current?.now(() => savedToBlob(savedRef.current));
  }, []);

  const commitDiscoveries = useCallback(() => {
    discoveriesWriterRef.current?.now(() =>
      discoveriesToBlob(discoveriesRef.current),
    );
  }, []);

  const recordAntipodeDiscovery = useCallback(
    (fromId: string, toId: string) => {
      if (!getInstrument(fromId) || !getInstrument(toId)) return;
      const next = appendDiscovery(discoveriesRef.current, fromId, toId);
      discoveriesRef.current = next;
      setDiscoveries(next);
      commitDiscoveries();
    },
    [commitDiscoveries],
  );

  const setTab = useCallback(
    (t: TabId) => {
      setTabState(t);
      prefsRef.current = { ...prefsRef.current, tab: t };
      commitPrefs();
      patchVoiceUiResume({ tab: t });
      if (t === "collection") setNav({ screen: "home" });
    },
    [commitPrefs, setNav],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      if (!getInstrument(id)) return;
      const has = favoritesRef.current.includes(id);
      let next: string[];
      if (has) {
        next = favoritesRef.current.filter((x) => x !== id);
      } else {
        if (favoritesRef.current.length >= MAX_FAVORITES) {
          toast("Favorites are full.");
          return;
        }
        next = [id, ...favoritesRef.current];
      }
      favoritesRef.current = next;
      setFavorites(next);
      commitFavorites();
      toast(has ? "Removed from favorites." : "Added to favorites.");
    },
    [commitFavorites, toast],
  );

  const clearFavorites = useCallback(() => {
    favoritesRef.current = [];
    setFavorites([]);
    commitFavorites();
    toast("Cleared all favorites.");
  }, [commitFavorites, toast]);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  const toggleSave = useCallback(
    (id: string) => {
      if (!getInstrument(id)) return;
      const has = savedRef.current.includes(id);
      let next: string[];
      if (has) {
        next = savedRef.current.filter((x) => x !== id);
      } else {
        if (savedRef.current.length >= MAX_SAVED) {
          toast("Save list is full.");
          return;
        }
        next = [id, ...savedRef.current];
      }
      savedRef.current = next;
      setSaved(next);
      commitSaved();
      toast(has ? "Removed from Save." : "Saved.");
    },
    [commitSaved, toast],
  );

  const clearSaved = useCallback(() => {
    savedRef.current = [];
    setSaved([]);
    commitSaved();
    toast("Cleared all saved voices.");
  }, [commitSaved, toast]);

  const openInstrument = useCallback((id: string) => {
    if (!getInstrument(id)) return;
    setOpenId(id);
    patchVoiceUiResume({ openId: id, curatorNote: false });
  }, []);
  const closeInstrument = useCallback(() => {
    setOpenId(null);
    patchVoiceUiResume({ openId: null, curatorNote: false });
  }, []);

  const unlockProduct = useMemo(
    () => resolveUnlockProduct(products, VOICE_UNLOCK_PRODUCT_ID),
    [products],
  );

  const [localDeed, setLocalDeed] = useState<OwnershipDeed | null>(null);
  /** Set only after a verified purchase / restore qty>0 in this session — bridges restore lag. */
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);

  useEffect(() => {
    setLocalDeed(readLocalDeed());
  }, []);

  const purchasesReady = restoredPurchases !== null;

  const restoreOwned = useMemo(
    () =>
      hasUnlockAccess(restoredPurchases, unlockProduct, localDeed, [
        localDeed?.productId,
        localDeed?.productSlug,
      ]),
    [localDeed, restoredPurchases, unlockProduct],
  );

  const isUnlocked =
    (restoreOwned || purchaseConfirmed) && !isPaywallPreviewOnly();

  useEffect(() => {
    const syncDeed = () => setLocalDeed(readLocalDeed());
    window.addEventListener(OWNERSHIP_DEED_SEALED_EVENT, syncDeed);
    return () =>
      window.removeEventListener(OWNERSHIP_DEED_SEALED_EVENT, syncDeed);
  }, []);

  useEffect(() => {
    if (restoreOwned) setPurchaseConfirmed(true);
  }, [restoreOwned]);

  // When Pi restore confirms ownership, seal a local deed if missing.
  useEffect(() => {
    if (!restoreOwned || localDeed) return;
    const next = buildRestoreSealDeed({
      productId: unlockProduct?.id ?? UNLOCK_FALLBACK.productId,
      productSlug: unlockProduct?.slug ?? UNLOCK_FALLBACK.productSlug,
      productName: unlockProduct?.name ?? UNLOCK_FALLBACK.productName,
      priceInPi: TEST_PI_PRICE,
    });
    writeLocalDeed(next);
    setLocalDeed(next);
  }, [localDeed, restoreOwned, unlockProduct]);

  const refreshUnlockStatus = useCallback(async () => {
    await refreshPurchases();
    setLocalDeed(readLocalDeed());
  }, [refreshPurchases]);

  const purchaseUnlock = useCallback(async (): Promise<OwnershipDeed | null> => {
    if (!sdk) {
      toast("Voice3141 is not available right now.");
      return null;
    }

    const productMeta = unlockProduct ?? {
      id: UNLOCK_FALLBACK.productId,
      slug: UNLOCK_FALLBACK.productSlug,
      name: UNLOCK_FALLBACK.productName,
      price_in_pi: UNLOCK_FALLBACK.priceInPi,
    };

    const resolveOwnedDeed = async (): Promise<OwnershipDeed | null> => {
      await refreshPurchases();
      let qty = 0;
      try {
        const { purchases } = await sdk.state.restore();
        qty = purchaseQtyForUnlock(purchases, unlockProduct, [
          localDeed?.productId,
          localDeed?.productSlug,
          productMeta.id,
          productMeta.slug,
        ]);
      } catch {
        /* restore failed — do not treat local deed as ownership */
      }
      if (qty <= 0) return null;

      const existing = readLocalDeed();
      const deed =
        existing ??
        buildRestoreSealDeed({
          productId: productMeta.id,
          productSlug: productMeta.slug,
          productName: productMeta.name,
          priceInPi: TEST_PI_PRICE,
        });
      if (!existing) writeLocalDeed(deed);
      setLocalDeed(deed);
      setPurchaseConfirmed(true);
      return deed;
    };

    // Already owned — never open a second checkout.
    const already = await resolveOwnedDeed();
    if (already) {
      toast("Already unlocked on this Pi account.");
      return already;
    }

    if (!unlockProduct) {
      toast("Voice3141 is not available right now.");
      return null;
    }
    if (!catalogPriceMatchesUnlock(unlockProduct.price_in_pi)) {
      toast(PAYMENT_ENV.catalogPriceMismatch(unlockProduct.price_in_pi));
      return null;
    }

    try {
      const result = await sdk.makePurchase(unlockProduct.slug);
      if (!result?.ok) {
        const recovered = await resolveOwnedDeed();
        if (recovered) {
          toast("Already unlocked on this Pi account.");
          return recovered;
        }
        toast("Purchase did not complete. Please try again.");
        return null;
      }
      const deed = await sealPurchaseDeed({
        productId: unlockProduct.id,
        productSlug: unlockProduct.slug,
        productName: unlockProduct.name,
        priceInPi: TEST_PI_PRICE,
        paymentId: result.paymentId,
        txid: result.txid,
        sdk,
      });
      setLocalDeed(deed);
      setPurchaseConfirmed(true);
      for (let i = 0; i < 4; i += 1) {
        await refreshPurchases();
        try {
          const { purchases } = await sdk.state.restore();
          if (
            purchaseQtyForUnlock(purchases, unlockProduct, [
              deed.productId,
              deed.productSlug,
            ]) > 0
          ) {
            break;
          }
        } catch {
          /* keep retrying */
        }
        await new Promise((r) => window.setTimeout(r, 700));
      }
      await refreshPurchases();
      toast("Purchase sealed — collection proof saved");
      return deed;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code !== "purchase_cancelled" && code !== "product_not_found") {
        const recovered = await resolveOwnedDeed();
        if (recovered) {
          toast("Already unlocked on this Pi account.");
          return recovered;
        }
      }
      toast(
        code === "purchase_cancelled"
          ? "Purchase cancelled."
          : code === "product_not_found"
            ? "Voice3141 could not be found."
            : "Purchase failed. Please try again.",
      );
      return null;
    }
  }, [localDeed?.productId, localDeed?.productSlug, refreshPurchases, sdk, toast, unlockProduct]);

  const productCatalogIssue = useMemo(() => {
    if (!unlockProduct) return null;
    if (!catalogPriceMatchesUnlock(unlockProduct.price_in_pi)) {
      return PAYMENT_ENV.catalogPriceMismatch(unlockProduct.price_in_pi);
    }
    return null;
  }, [unlockProduct]);

  const productPrice =
    unlockProduct && !productCatalogIssue ? TEST_PI_PRICE : null;

  const favoriteInstruments = useMemo(
    () =>
      favorites
        .map((id) => getInstrument(id))
        .filter((x): x is Instrument => Boolean(x)),
    [favorites],
  );

  const savedInstruments = useMemo(
    () =>
      saved
        .map((id) => getInstrument(id))
        .filter((x): x is Instrument => Boolean(x)),
    [saved],
  );

  const value: VoiceContextValue = {
    ready,
    storageTrouble,
    tab,
    setTab,
    nav,
    setNav,
    favorites,
    favoriteCount: favorites.length,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    favoriteInstruments,
    saved,
    savedCount: saved.length,
    isSaved,
    toggleSave,
    clearSaved,
    savedInstruments,
    openId,
    openInstrument,
    closeInstrument,
    productPrice,
    productCatalogIssue,
    purchasesReady,
    isUnlocked,
    purchaseUnlock,
    refreshUnlockStatus,
    toasts,
    toast,
    discoveries,
    recordAntipodeDiscovery,
  };

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within VoiceProvider");
  return ctx;
}

export const TOTAL_CURATED = INSTRUMENTS.length;
