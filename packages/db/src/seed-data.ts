import type { SizePricing } from "./types";

export interface SeedProduct {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  firmness: number; // 1 (plush) – 10 (firm)
  heightInches: number;
  features: string[];
  sizes: SizePricing;
  basePriceCents: number;
  heroImageKey: string;
  galleryImageKeys: string[];
  sortOrder: number;
}

/** Price ladder derived from the queen price; every price ends in 9. */
function sizes(queenDollars: number): SizePricing {
  const steps: Array<[string, number]> = [
    ["Single", 0.6],
    ["Twin", 0.72],
    ["Queen", 1],
    ["King", 1.3],
  ];
  return steps.map(([label, multiplier]) => ({
    label,
    priceCents: (Math.round((queenDollars * multiplier) / 10) * 10 - 1) * 100,
  }));
}

function images(slug: string) {
  return {
    heroImageKey: `products/${slug}/hero.webp`,
    galleryImageKeys: [1, 2, 3, 4].map((n) => `products/${slug}/gallery-${n}.webp`),
  };
}

function product(
  sortOrder: number,
  slug: string,
  name: string,
  tagline: string,
  firmness: number,
  heightInches: number,
  queenDollars: number,
  description: string,
  features: string[],
): SeedProduct {
  const sizePricing = sizes(queenDollars);
  return {
    slug,
    name,
    tagline,
    description,
    firmness,
    heightInches,
    features,
    sizes: sizePricing,
    basePriceCents: sizePricing[0].priceCents,
    ...images(slug),
    sortOrder,
  };
}

export const seedProducts: SeedProduct[] = [
  product(
    0,
    "aurora-cloud",
    "Aurora Cloud",
    "Weightless, cloud-plush comfort",
    3,
    14,
    1299,
    "The Aurora Cloud is built for sleepers who want to disappear into their mattress. Three inches of aerated comfort foam sit over a plush transition layer, cradling shoulders and hips without the quicksand feel cheaper plush beds are known for.\n\nUnderneath, a dense support core keeps your spine honest, so you wake up rested rather than folded. If you sleep on your side — or just want your bed to feel like a held breath — start here.",
    [
      "3\" aerated cloud-foam comfort layer",
      "Pressure-relieving plush transition foam",
      "High-density support core",
      "Breathable knit cover, fully removable",
      "100-night trial · 10-year warranty",
    ],
  ),
  product(
    1,
    "nimbus-one",
    "Nimbus One",
    "The essential memory foam",
    4,
    10,
    749,
    "One mattress, no gimmicks. The Nimbus One distills memory foam down to what matters: a responsive comfort layer that contours without trapping heat, over a supportive base that holds its shape for years.\n\nIt is the best first mattress, guest mattress, or fix-my-sleep-this-week mattress we know how to make — at a price that doesn't require a spreadsheet.",
    [
      "Open-cell memory foam, low heat retention",
      "Balanced medium-soft feel",
      "CertiPUR-US certified foams",
      "Ships compressed, sets up in hours",
      "100-night trial · 10-year warranty",
    ],
  ),
  product(
    2,
    "drift-hybrid",
    "Drift Hybrid",
    "Coils and foam in perfect balance",
    5,
    12,
    1099,
    "The Drift pairs individually wrapped coils with a contouring foam top — the buoyant, easy-to-move-on feel that hybrid fans swear by. Coils flex where you press and stay quiet where you don't.\n\nA true middle-of-the-road feel that suits couples who can't agree: soft enough for side sleepers, supportive enough for back sleepers, and edge-reinforced so the whole surface is usable.",
    [
      "Up to 1,024 individually wrapped coils",
      "Contouring gel-foam comfort layer",
      "Reinforced perimeter edge support",
      "Motion-isolating coil design",
      "100-night trial · 10-year warranty",
    ],
  ),
  product(
    3,
    "solace-firm",
    "Solace Firm",
    "Steadfast support, night after night",
    8,
    11,
    949,
    "Some backs just want a firm handshake. The Solace skips the pillowy theatrics: a thin comfort quilt over a high-density support system that keeps stomach and back sleepers level all night.\n\nFirm doesn't mean punishing — a zoned surface gives just enough at the shoulders while staying rock-steady under your lumbar. It's the mattress physical therapists keep recommending to their patients.",
    [
      "True-firm feel (8/10)",
      "Zoned lumbar reinforcement",
      "Slim breathable comfort quilt",
      "Ideal for stomach & back sleepers",
      "100-night trial · 10-year warranty",
    ],
  ),
  product(
    4,
    "meridian-luxe",
    "Meridian Luxe",
    "Hotel luxury, at home",
    6,
    15,
    1899,
    "The Meridian is our love letter to the best hotel bed you've ever slept in. A hand-tufted euro top floats over five layers of graduated foam and micro-coils, landing at that unmistakable luxury-medium feel — plush on arrival, supportive by midnight.\n\nDetails matter here: a cashmere-blend cover, ventilated side panels, and a coil count that borders on excessive. You'll stop hitting snooze just to stay in it. Mostly.",
    [
      "Hand-tufted cashmere-blend euro top",
      "Micro-coil comfort layer over wrapped coils",
      "Five-layer graduated foam system",
      "Ventilated side panels",
      "100-night trial · lifetime warranty",
    ],
  ),
  product(
    5,
    "haven-organic",
    "Haven Organic",
    "Certified organic latex & wool",
    5,
    13,
    1699,
    "The Haven is made from things you can pronounce: GOLS-certified organic latex, GOTS-certified wool and cotton, and nothing else. Wool wicks moisture and regulates temperature naturally; latex lifts and responds instantly.\n\nNo polyurethane foams, no fiberglass, no chemical flame retardants — wool does that job on its own. The greenest bed we make, and one of the most comfortable.",
    [
      "GOLS-certified organic latex core",
      "GOTS-certified organic wool & cotton",
      "No polyfoam, fiberglass, or chemical FRs",
      "Naturally temperature-regulating",
      "100-night trial · 25-year warranty",
    ],
  ),
  product(
    6,
    "atlas-support",
    "Atlas Support",
    "Engineered for heavier sleepers",
    9,
    15,
    1499,
    "Most mattresses are tested for a 170-pound sleeper. The Atlas is built and tested for sleepers up to 500 pounds — with a dual coil system, high-resilience foams, and an edge you can sit on for a decade without a slope forming.\n\nExpect a firm, lifted, durable feel that doesn't hammock or trap heat. Support is a structural problem; the Atlas treats it like one.",
    [
      "Rated for sleepers up to 500 lbs",
      "Dual-layer coil-on-coil support system",
      "High-resilience comfort foams",
      "Commercial-grade edge reinforcement",
      "100-night trial · 15-year warranty",
    ],
  ),
  product(
    7,
    "lumen-cool",
    "Lumen Cool",
    "Sleeps cool. Stays cool.",
    6,
    13,
    1399,
    "If you run hot, everything else is secondary. The Lumen attacks heat from every layer: a phase-change cover that feels cool to the touch, copper-infused foam that pulls warmth away from your body, and an airflow coil base that vents it out.\n\nThe feel is a clean medium — contouring but never enveloping, because envelopment is where the heat lives. Hot sleepers, welcome home.",
    [
      "Cool-touch phase-change cover",
      "Copper-infused open-cell foam",
      "Airflow-channel coil base",
      "Clean medium (6/10) feel",
      "100-night trial · 10-year warranty",
    ],
  ),
  product(
    8,
    "ember-plush",
    "Ember Plush",
    "Sink-in softness with a warm heart",
    3,
    13,
    1199,
    "The Ember is unapologetically soft. A deep quilted top and two plush comfort layers create that reading-nook, Sunday-morning softness — the mattress equivalent of a favorite armchair.\n\nWhat keeps it from being a marshmallow is the firm base layer doing quiet structural work underneath. Soft where you touch it, serious where it counts.",
    [
      "Deep-quilted plush pillow top",
      "Dual plush comfort layers",
      "Firm structural base layer",
      "Great for side sleepers under 200 lbs",
      "100-night trial · 10-year warranty",
    ],
  ),
  product(
    9,
    "tidal-balance",
    "Tidal Balance",
    "The one for combination sleepers",
    5,
    12,
    1149,
    "Side at 11pm, back at 2am, stomach by dawn — if that's you, the Tidal was designed around your night. A responsive latex-foam blend makes position changes effortless, while wrapped coils adapt support to whatever shape you land in.\n\nNo memory-foam lag, no stuck feeling. The Tidal meets you where you are, all night long.",
    [
      "Fast-response latex-foam blend",
      "Adaptive wrapped-coil support",
      "Balanced true-medium feel",
      "Low motion transfer for couples",
      "100-night trial · 10-year warranty",
    ],
  ),
  product(
    10,
    "sierra-latex",
    "Sierra Latex",
    "Responsive natural latex lift",
    7,
    12,
    1599,
    "Latex sleeps different: buoyant, springy, alive. The Sierra layers two densities of natural Talalay latex over a supportive core for a lifted, floating feel that foam simply can't imitate.\n\nIt's naturally cool, naturally durable — latex outlasts foam by years — and firm enough (7/10) to keep back sleepers aligned while the surface stays lively.",
    [
      "Dual-density natural Talalay latex",
      "Buoyant, fast-response surface",
      "Naturally cool and antimicrobial",
      "Exceptional durability",
      "100-night trial · 20-year warranty",
    ],
  ),
  product(
    11,
    "velvet-night",
    "Velvet Night",
    "Quilted euro-top indulgence",
    4,
    16,
    1799,
    "Sixteen inches of ceremony. The Velvet Night stacks a diamond-quilted euro top, silk-blend fibers, and cascading comfort foams into the tallest, most theatrical bed in our lineup.\n\nThe feel is medium-soft with real depth — you settle in stages, like a good bath. Pair it with low bedding and let the mattress be the statement.",
    [
      "16\" profile with diamond-quilted euro top",
      "Silk-blend fiber comfort layer",
      "Cascading multi-density foams",
      "Medium-soft (4/10) layered feel",
      "100-night trial · 15-year warranty",
    ],
  ),
  product(
    12,
    "polaris-elite",
    "Polaris Elite",
    "Zoned precision for spine alignment",
    7,
    14,
    2099,
    "The Polaris divides the bed into five ergonomic zones, each tuned to a different part of you: softer under shoulders, firmer under hips, calibrated through the lumbar. The result is a spine that stays neutral in any position.\n\nIt's the mattress we build for people who track their sleep and read the studies. Precise, technical, and remarkably comfortable for something this smart.",
    [
      "5-zone ergonomic coil mapping",
      "Lumbar-calibrated support band",
      "Pressure-mapped comfort foams",
      "Neutral spine alignment in any position",
      "100-night trial · 15-year warranty",
    ],
  ),
  product(
    13,
    "onyx-reserve",
    "Onyx Reserve",
    "Our flagship. Nothing held back.",
    6,
    17,
    2899,
    "The Onyx Reserve is what happens when we ignore the accountants. Seventeen inches: hand-tufted organic cotton and cashmere, two tiers of micro-coils, natural latex, zoned wrapped coils, and a solid perimeter you could sit on forever.\n\nEvery material is the best version of itself, assembled by hand in small batches. There is a waitlist sometimes. It's worth it.",
    [
      "Hand-tufted cashmere & organic cotton top",
      "Double micro-coil comfort tiers",
      "Natural latex over zoned wrapped coils",
      "Hand-built in small batches",
      "200-night trial · lifetime warranty",
    ],
  ),
];

/** Sample reviews used by `pnpm db:seed --with-reviews` for visual development. */
export const sampleReviews: Array<{
  rating: number;
  authorName: string;
  body: string;
}> = [
  {
    rating: 5,
    authorName: "Maya R.",
    body: "Three weeks in and my lower back pain is just... gone? I was skeptical about buying a mattress online but the trial made it easy to commit. Delivery was fast and setup took ten minutes.",
  },
  {
    rating: 4,
    authorName: "Devon K.",
    body: "Really comfortable and sleeps cooler than my old memory foam. Only reason for 4 stars is the off-gassing smell the first two days — open a window and it disappears.",
  },
  {
    rating: 5,
    authorName: "Priya S.",
    body: "My partner tosses and turns all night and I finally can't feel any of it. Best sleep purchase we've made. The edge support is better than expected too.",
  },
  {
    rating: 3,
    authorName: "Tom H.",
    body: "Good mattress but firmer than I expected from the description. If you're a strict side sleeper, size up on the softness. Customer service was helpful when I asked.",
  },
  {
    rating: 5,
    authorName: "Alba M.",
    body: "Bought this after trying a friend's. It feels like a much more expensive mattress. Six months in, zero sagging, still looks brand new.",
  },
];
