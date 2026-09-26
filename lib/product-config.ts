export const PRODUCT_CONFIG = {
  PRODUCT_6aa5223667d5d60637da77c3: "6aa5223667d5d60637da77c3",
} as const;

/** Primary paid unlock for Voice 3141 (override after new Portal app). */
export const VOICE_UNLOCK_PRODUCT_ID =
  process.env.NEXT_PUBLIC_VOICE_UNLOCK_PRODUCT_ID?.trim() ||
  PRODUCT_CONFIG.PRODUCT_6aa5223667d5d60637da77c3;
