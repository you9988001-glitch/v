"use client";

import type { ComponentType } from "react";
import { useVoice } from "@/contexts/voice-context";
import type { TabId } from "@/lib/voice/data";
import { IconHeart, IconLibrary, IconSearch, cx } from "./ui";

const TABS: Array<{ id: TabId; label: string; Icon: ComponentType<{ size?: number }> }> = [
  { id: "collection", label: "Regions", Icon: IconLibrary },
  { id: "catalog", label: "Catalog", Icon: IconSearch },
  { id: "favorites", label: "Favorites", Icon: IconHeart },
];

export function BottomNav() {
  const { tab, setTab, favoriteCount } = useVoice();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[80] v-safe-bottom">
      <div className="mx-auto w-full max-w-md border-t border-[color:var(--v-line)] bg-[color:color-mix(in_oklch,var(--v-panel)_92%,transparent)] px-2 pt-1.5 backdrop-blur md:max-w-2xl">
        <div className="flex items-stretch justify-around">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            const badge = id === "favorites" ? favoriteCount : 0;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="v-press relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cx(
                    "relative inline-flex items-center justify-center",
                    active
                      ? "text-[color:var(--v-brass-deep)]"
                      : "text-[color:var(--v-faint)]",
                  )}
                >
                  <Icon size={22} />
                  {badge > 0 ? (
                    <span className="absolute -right-2.5 -top-1.5 min-w-[16px] rounded-full bg-[color:var(--v-heart)] px-1 text-center text-[10px] font-bold leading-4 text-white">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cx(
                    "text-[10.5px] font-semibold tracking-tight",
                    active
                      ? "text-[color:var(--v-brass-deep)]"
                      : "text-[color:var(--v-faint)]",
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
