"use client";

// Durable per-user storage via the Pi user-state API, with a debounced, rate-limit-aware
// writer. Falls back to an in-memory store when the SDK isn't available (e.g. preview iframe).

export interface StoreApi {
  get: (key: string) => Promise<{ blob: unknown } | null>;
  set: (key: string, blob: Record<string, unknown>) => Promise<void>;
}

type SdkLike = {
  state?: {
    get?: (key: string) => Promise<unknown>;
    set?: (key: string, blob: Record<string, unknown>) => Promise<void>;
  };
} | null;

export function makeMemStore(): StoreApi {
  const mem = new Map<string, { blob: unknown }>();
  return {
    async get(key) {
      return mem.has(key) ? { blob: mem.get(key)!.blob } : null;
    },
    async set(key, blob) {
      mem.set(key, { blob });
    },
  };
}

export function storeOf(sdk: SdkLike): StoreApi {
  if (sdk && sdk.state && typeof sdk.state.get === "function" && typeof sdk.state.set === "function") {
    return {
      async get(key) {
        const rec = await sdk.state!.get!(key);
        if (rec == null) return null;
        return { blob: rec };
      },
      async set(key, blob) {
        await sdk.state!.set!(key, blob);
      },
    };
  }
  return makeMemStore();
}

// Per-key debounced writer with cross-key throttle + exponential backoff on failure.
export class KeyWriter {
  private store: StoreApi;
  private key: string;
  private debounceMs: number;
  private builder: (() => Record<string, unknown>) | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight = false;
  private backoff = 3000;
  private onTrouble?: (v: boolean) => void;

  private static lastAnyWrite = 0;
  private static readonly MIN_ACROSS = 1100;
  private static readonly MIN_PER_KEY = 5200;
  private lastKeyWrite = 0;

  constructor(
    store: StoreApi,
    key: string,
    debounceMs: number,
    onTrouble?: (v: boolean) => void,
  ) {
    this.store = store;
    this.key = key;
    this.debounceMs = debounceMs;
    this.onTrouble = onTrouble;
  }

  // Debounced queue — for frequent edits.
  queue(builder: () => Record<string, unknown>) {
    this.builder = builder;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.debounceMs);
  }

  // Immediate-ish — still respects throttle, for important mutations.
  now(builder: () => Record<string, unknown>) {
    this.builder = builder;
    if (this.timer) clearTimeout(this.timer);
    this.flush();
  }

  private schedule(delay: number) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), delay);
  }

  private async flush() {
    if (this.builder == null) return;
    if (this.inFlight) {
      this.schedule(400);
      return;
    }
    const now = Date.now();
    const sinceAny = now - KeyWriter.lastAnyWrite;
    const sinceKey = now - this.lastKeyWrite;
    const wait = Math.max(
      KeyWriter.MIN_ACROSS - sinceAny,
      KeyWriter.MIN_PER_KEY - sinceKey,
    );
    if (wait > 0) {
      this.schedule(wait);
      return;
    }

    const builder = this.builder;
    this.builder = null;
    this.inFlight = true;
    KeyWriter.lastAnyWrite = Date.now();
    this.lastKeyWrite = Date.now();
    try {
      await this.store.set(this.key, builder());
      this.backoff = 3000;
      this.onTrouble?.(false);
    } catch {
      // keep last good state; retry with backoff without dropping the pending value
      this.onTrouble?.(true);
      if (this.builder == null) this.builder = builder;
      this.schedule(this.backoff);
      this.backoff = Math.min(Math.round(this.backoff * 1.8), 30000);
    } finally {
      this.inFlight = false;
    }
  }

  flushNow() {
    if (this.builder != null && !this.inFlight) {
      void this.flush();
    }
  }
}
