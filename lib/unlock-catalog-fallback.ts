import type { Product } from "@/lib/sdklite-types";
import { MAINNET_UNLOCK_PI } from "@/lib/payment-env";
import { VOICE_UNLOCK_PRODUCT_ID } from "@/lib/product-config";

/** Mainnet unlock row when App Studio catalog is not used. */
export function fallbackUnlockProducts(): Product[] {
  return [
    {
      id: VOICE_UNLOCK_PRODUCT_ID,
      slug: VOICE_UNLOCK_PRODUCT_ID,
      name: "Voice 3141",
      description: "Mainnet unlock — 3.141 π",
      price_in_pi: MAINNET_UNLOCK_PI,
      total_quantity: 0,
      is_active: true,
      created_at: "1970-01-01T00:00:00.000Z",
    },
  ];
}
