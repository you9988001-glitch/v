import { INSTRUMENTS } from "../lib/voice/data.ts";
import { resolveVoiceAntipodeTap } from "../lib/voice/antipode-tap.ts";

async function main() {
  console.log("=== Voice3141 resolveVoiceAntipodeTap (lib/voice/antipode-tap.ts) ===\n");
  console.log("INSTRUMENTS count:", INSTRUMENTS.length);

  let n = 0;
  for (const it of INSTRUMENTS) {
    const r = await resolveVoiceAntipodeTap({ countryCode: it.countryCode });
    if (r.tap.kind === "open-detail") n++;
  }
  console.log("Valid open-detail matches:", n);
  console.log("(compare target: 348)\n");

  const g = INSTRUMENTS.find((i) => i.id === "gondang-naposo-id");
  const r = await resolveVoiceAntipodeTap({ countryCode: g?.countryCode });
  console.log("Gondang naposo (gondang-naposo-id):", JSON.stringify(r.tap, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
