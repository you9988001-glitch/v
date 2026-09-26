"use client";

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  SVGProps,
} from "react";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- icons ---------------- */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function S({ size = 20, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconLibrary = (p: IconProps) => (
  <S {...p}>
    <path d="M4 5v14" />
    <path d="M8 5v14" />
    <rect x="11" y="4" width="4" height="16" rx="1" />
    <path d="m17 6 3 12" />
  </S>
);
export const IconCompass = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15 9-2 5-5 2 2-5 5-2Z" />
  </S>
);
export const IconBookmark = (p: IconProps) => (
  <S {...p}>
    <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
  </S>
);
export const IconList = (p: IconProps) => (
  <S {...p}>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <path d="M4 6h.01M4 12h.01M4 18h.01" />
  </S>
);
export const IconGrid = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
  </S>
);
export const IconSearch = (p: IconProps) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </S>
);
export const IconClose = (p: IconProps) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </S>
);
export const IconBack = (p: IconProps) => (
  <S {...p}>
    <path d="M15 5l-7 7 7 7" />
  </S>
);
export const IconChevron = (p: IconProps) => (
  <S {...p}>
    <path d="m9 6 6 6-6 6" />
  </S>
);
export const IconHeart = (p: IconProps) => (
  <S {...p}>
    <path d="M12 20s-7-4.6-9.2-9C1.4 8 3 4.8 6.2 4.8c2 0 3.2 1.2 3.8 2.2.6-1 1.8-2.2 3.8-2.2C17 4.8 18.6 8 21.2 11 19 15.4 12 20 12 20Z" />
  </S>
);
export const IconHeartFilled = (p: IconProps) => (
  <S {...p} fill="currentColor" stroke="none">
    <path d="M12 20.5s-7.3-4.7-9.6-9.2C.9 8 2.6 4.3 6.2 4.3c2.1 0 3.4 1.2 4 2.3.6-1.1 1.9-2.3 4-2.3 3.6 0 5.3 3.7 3.8 7-2.3 4.5-9.6 9.2-9.6 9.2Z" />
  </S>
);
export const IconFilter = (p: IconProps) => (
  <S {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </S>
);
export const IconCheck = (p: IconProps) => (
  <S {...p}>
    <path d="m5 12 4.5 4.5L19 7" />
  </S>
);
export const IconSparkle = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
    <path d="M12 8.5 13.4 11 16 12l-2.6 1L12 15.5 10.6 13 8 12l2.6-1L12 8.5Z" fill="currentColor" stroke="none" />
  </S>
);
export const IconTrash = (p: IconProps) => (
  <S {...p}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </S>
);
export const IconGlobe = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.4 2.6 15.6 0 18M12 3c-2.6 2.4-2.6 15.6 0 18" />
  </S>
);

/* family glyphs for instrument art */
export function FamilyGlyph({
  family,
  size = 28,
  ...props
}: IconProps & { family: string }) {
  switch (family) {
    case "string":
      return (
        <S size={size} {...props}>
          <path d="M8 3c-2 5-2 13 0 18M16 3c2 5 2 13 0 18" />
          <path d="M10 3h4M9 21h6M10 8h4M10 13h4" />
        </S>
      );
    case "wind":
      return (
        <S size={size} {...props}>
          <path d="M4 8h16l-1.5 9a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 8Z" />
          <path d="M8 11.5h.01M11 11.5h.01M14 11.5h.01M8 15h.01M12 15h.01" />
        </S>
      );
    case "percussion":
      return (
        <S size={size} {...props}>
          <ellipse cx="12" cy="7" rx="8" ry="3" />
          <path d="M4 7v6c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
          <path d="M6 14l-2 6M18 14l2 6" />
        </S>
      );
    case "keyboard":
      return (
        <S size={size} {...props}>
          <rect x="3" y="6" width="18" height="12" rx="1.5" />
          <path d="M8 6v7M12 6v7M16 6v7M3 13h18" />
        </S>
      );
    case "freereed":
      return (
        <S size={size} {...props}>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M8 6v12M12 6v12M16 6v12" />
        </S>
      );
    case "lamellophone":
      return (
        <S size={size} {...props}>
          <path d="M5 5h14v14H5z" />
          <path d="M8 7v10M11 7v10M14 7v10M17 7v10" />
        </S>
      );
    case "electronic":
      return (
        <S size={size} {...props}>
          <path d="M3 12h3l2-6 4 12 2-6h4" />
          <path d="M21 12h.01" />
        </S>
      );
    default:
      return (
        <S size={size} {...props}>
          <circle cx="12" cy="12" r="8" />
        </S>
      );
  }
}

/* ---------------- buttons ---------------- */

type Variant = "primary" | "solid" | "outline" | "ghost" | "danger";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "text-[color:var(--v-on-brass)] v-hero-grad shadow-sm hover:opacity-95",
  solid:
    "bg-[color:var(--v-panel-2)] text-[color:var(--v-ink)] border border-[color:var(--v-line)] hover:bg-[color:var(--v-line-soft)]",
  outline:
    "bg-transparent text-[color:var(--v-ink)] border border-[color:var(--v-line)] hover:bg-[color:var(--v-panel-2)]",
  ghost:
    "bg-transparent text-[color:var(--v-muted)] hover:bg-[color:var(--v-panel-2)]",
  danger:
    "bg-transparent text-[color:var(--v-heart)] border border-[color:color-mix(in_oklch,var(--v-heart)_35%,transparent)] hover:bg-[color:color-mix(in_oklch,var(--v-heart)_10%,transparent)]",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cx(
        "v-press inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-45 disabled:pointer-events-none",
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        "v-press inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--v-ink)] hover:bg-[color:var(--v-panel-2)] disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------- surfaces ---------------- */

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-[color:var(--v-line)] bg-[color:var(--v-panel)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cx(
        "text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--v-faint)]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "brass" | "family";
  className?: string;
}) {
  const toneClass =
    tone === "brass"
      ? "bg-[color:var(--v-brass-soft)] text-[color:var(--v-brass-deep)]"
      : "bg-[color:var(--v-panel-2)] text-[color:var(--v-muted)]";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function FamilyTag({
  hueVar,
  softVar,
  children,
  className,
}: {
  hueVar: string;
  softVar: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        className,
      )}
      style={{
        backgroundColor: `var(${softVar})`,
        color: `var(${hueVar})`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: `var(${hueVar})` }}
      />
      {children}
    </span>
  );
}

export function Spinner({ size = 22 }: { size?: number }) {
  return (
    <span
      className="anim-spin inline-block rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size, opacity: 0.5 }}
      aria-hidden="true"
    />
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--v-panel-2)] text-[color:var(--v-faint)]">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-lg text-[color:var(--v-ink)]">{title}</p>
      {hint ? (
        <p className="max-w-[16rem] text-sm leading-relaxed text-[color:var(--v-muted)]">
          {hint}
        </p>
      ) : null}
      {action}
    </div>
  );
}
