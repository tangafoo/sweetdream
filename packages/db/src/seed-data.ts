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

/**
 * Explicit per-size price list in RM (stored as sen). Sizes a mattress isn't
 * made in are simply omitted — e.g. the Sweet Icesilk 13″ has no Single.
 */
function sizes(rm: {
  single?: number;
  twin?: number;
  queen: number;
  king: number;
}): SizePricing {
  const ladder: Array<[string, number | undefined]> = [
    ["Single", rm.single],
    ["Twin", rm.twin],
    ["Queen", rm.queen],
    ["King", rm.king],
  ];
  return ladder.flatMap(([label, price]) =>
    price === undefined ? [] : [{ label, priceCents: price * 100 }],
  );
}

function product(
  sortOrder: number,
  slug: string,
  name: string,
  tagline: string,
  firmness: number,
  heightInches: number,
  priceRm: { single?: number; twin?: number; queen: number; king: number },
  photos: { hero: string; gallery?: string[] },
  description: string,
  features: string[],
): SeedProduct {
  const sizePricing = sizes(priceRm);
  return {
    slug,
    name,
    tagline,
    description,
    firmness,
    heightInches,
    features,
    sizes: sizePricing,
    basePriceCents: Math.min(...sizePricing.map((s) => s.priceCents)),
    heroImageKey: photos.hero,
    galleryImageKeys: photos.gallery ?? [],
    sortOrder,
  };
}

// Photos live flat in the R2 bucket as `{name}-{variant}.webp`. Cascade:
// `-hero` is the lead shot (fall back to `-front` when there's no hero, as
// with Unity); remaining variants (front/detailed/diagonal/corner/fabric)
// fill the gallery; `-skeleton` goes last in the gallery and is picked up by
// the nav strips via navImageKey(). Products whose photos aren't uploaded
// yet point at the planned `{slug-ish}-hero.webp` name — they render the
// gradient placeholder until an object with that exact name appears, then
// flip to the photo with zero code changes.
export const seedProducts: SeedProduct[] = [
  product(
    0,
    "sweet-luxury-16",
    "Sweet Luxury 16″",
    "Sixteen inches of indulgence",
    4,
    16,
    { single: 7880, twin: 8490, queen: 10990, king: 12880 },
    { hero: "sweet-luxury-hero.webp" }, // not uploaded yet
    "The Sweet Luxury is the tallest, most generous bed in the Sweet range — a deep pillow-top profile that you settle into in stages rather than all at once.\n\nUnderneath the plush surface, a full-height support core keeps the feel composed: soft on arrival, aligned by midnight. This is the one to choose when the bed is allowed to be the centrepiece of the room.",
    [
      "16″ deep pillow-top profile",
      "Layered plush comfort system",
      "Full-height support core",
      "Soft-knit quilted cover",
    ],
  ),
  product(
    1,
    "sweet-comfort-14",
    "Sweet Comfort 14″",
    "Premium comfort, perfectly balanced",
    5,
    14,
    { single: 6280, twin: 6780, queen: 8380, king: 10800 },
    { hero: "sweet-comfort-hero.webp" }, // not uploaded yet
    "The Sweet Comfort sits one step below the Luxury in height and price, and lands squarely in the middle of the feel spectrum — cushioned enough for side sleepers, composed enough for backs.\n\nIt's the pick for couples who can't agree: a true-medium premium bed that flatters most sleeping positions without committing to either extreme.",
    [
      "14″ premium profile",
      "Balanced true-medium feel",
      "Pressure-relieving comfort layers",
      "Breathable quilted cover",
    ],
  ),
  product(
    2,
    "unity-14",
    "Unity 14″",
    "One mattress for every sleeper",
    5,
    14,
    { single: 6180, twin: 6748, queen: 8280, king: 10180 },
    {
      hero: "unity-front.webp", // no -hero shot; front is the lead
      gallery: ["unity-detailed.webp", "unity-diagonal.webp", "unity-skeleton.webp"],
    },
    "The Unity is built around a simple idea: one balanced build that works for the whole household — side, back, or combination sleepers, lighter or heavier frames.\n\nA cushioned surface takes the pressure off shoulders and hips while the core holds everything level, so two very different sleepers can share it without compromise.",
    [
      "14″ balanced hybrid build",
      "Suits all sleeping positions",
      "Even weight distribution",
      "Low motion transfer for couples",
    ],
  ),
  product(
    3,
    "sweet-icesilk-13",
    "Sweet Icesilk 13″",
    "Cool-touch comfort for warm nights",
    6,
    13,
    { twin: 5980, queen: 6780, king: 8380 },
    {
      hero: "alliance-cool-hero.webp",
      gallery: ["all-cool-detailed.webp", "all-cool-diagonal.webp", "all-cool-skeleton.webp"],
    },
    "Also sold as the Alliance Cool 13″. The Icesilk leads with its cover: a cool-touch ice-silk fabric that feels noticeably cooler than skin the moment you lie down — made for our climate.\n\nBeneath it, a clean medium-firm build contours without enveloping, because envelopment is where the heat lives. If you run warm at night, start here.",
    [
      "Cool-touch ice-silk fabric cover",
      "Heat-dissipating comfort layer",
      "Clean medium-firm feel",
      "Also known as Alliance Cool 13″",
    ],
  ),
  product(
    4,
    "sweet-harmony-14",
    "Sweet Harmony 14″",
    "Softness and support in tune",
    5,
    14, // TODO: spec sheet says 15″ but the catalog name says 14″ — confirm
    { single: 4900, twin: 5280, queen: 6580, king: 7880 },
    { hero: "sweet-harm-front.webp" }, // no -hero shot; front is the lead
    "The Harmony is the sweet spot of the range — a 14-inch build that pairs a cushioned top with a steady core at a price that makes it our most recommended bed.\n\nThe feel is a comfortable middle: enough give to cradle shoulders and hips, enough structure that you wake up rested rather than folded.",
    // construction from the spec sheet (foam codes dropped, sizes kept)
    [
      "40mm memory foam comfort layer",
      "12mm natural latex layer",
      "2.3-gauge pocket spring core in a foam box",
      "Best-value pick of the Sweet range",
    ],
  ),
  product(
    5,
    "spine-support-12",
    "Spine Support 12″",
    "Firm, level, dependable",
    8,
    12,
    { single: 4090, twin: 4590, queen: 5390, king: 5880 },
    { hero: "spine-support-hero.webp" }, // not uploaded yet
    "Some backs just want a firm handshake. The Spine Support skips the pillowy theatrics: a slim comfort quilt over a dense support system that keeps back and stomach sleepers level all night.\n\nFirm doesn't mean punishing — the surface gives just enough at the shoulders while staying rock-steady under your lumbar.",
    [
      "True-firm feel (8/10)",
      "Dense lumbar-steady support core",
      "Slim breathable comfort quilt",
      "Ideal for back & stomach sleepers",
    ],
  ),
  product(
    6,
    "sleep-ortho-12",
    "Sleep Ortho 12″",
    "Orthopaedic support, honest price",
    8,
    12,
    { single: 3190, twin: 3690, queen: 4690, king: 5690 },
    { hero: "sleep-ortho-hero.webp" }, // not uploaded yet
    "The Sleep Ortho brings the firm, orthopaedic-style feel down to a friendlier price. A supportive core keeps the spine neutral, with just enough surface padding to take the edge off.\n\nIt's the straightforward choice for sleepers who've been told to go firm — no gimmicks, just a level surface night after night.",
    [
      "Orthopaedic-style firm support",
      "Spine-neutral sleeping surface",
      "Durable high-density core",
      "12″ low-fuss profile",
    ],
  ),
  product(
    7,
    "hotel-spinal-12",
    "Hotel Spinal 12″",
    "The hotel-bed feel, at home",
    7,
    12,
    { single: 2980, twin: 3180, queen: 3980, king: 4780 },
    { hero: "hot-spi-diagonal.webp" }, // no -hero shot; diagonal is the lead
    "The Hotel Spinal is our take on the bed you remember from a good hotel: supportive first, comfortable always — a firmer-side build that stays composed no matter how much the night moves.\n\nIt's a favourite for guest rooms and rentals for the same reason hotels buy this style: it suits nearly everyone who lies on it.",
    // construction from the spec sheet (foam codes dropped, sizes kept)
    [
      "Quilted top with 35mm + 10mm comfort foams",
      "1″ high-density support foam",
      "2.3-gauge pocket spring core in a foam box",
      "12mm base foam layer",
    ],
  ),
  product(
    8,
    "dream-cloud-13",
    "Dream Cloud 13″",
    "Sink-in, cloud-plush softness",
    3,
    13,
    { single: 4180, twin: 4480, queen: 5580, king: 6680 },
    {
      hero: "dream-cloud-hero.webp",
      gallery: ["dream-cloud-front.webp"],
    },
    "The Dream Cloud is unapologetically soft. A deep, cushioned top creates that reading-nook, Sunday-morning softness — the mattress equivalent of a favourite armchair.\n\nWhat keeps it from being a marshmallow is the firm base doing quiet structural work underneath. Soft where you touch it, serious where it counts.",
    // construction from the spec sheet (foam codes dropped, sizes kept)
    [
      "Quilted pillow-top: 25mm + 5mm + 25mm comfort foams",
      "1″ soft foam over 1″ high-resilience foam",
      "2.3-gauge pocket spring core in a foam box",
      "Made for side sleepers",
    ],
  ),
  product(
    9,
    "sleep-care-25cm",
    "Sleep Care 25cm",
    "The dependable essential",
    6,
    10,
    { single: 2480, twin: 2880, queen: 3680, king: 4480 },
    { hero: "sleep-care-hero.webp" }, // not uploaded yet
    "The Sleep Care is the honest workhorse of the lineup: a 25cm build with a balanced medium-firm feel and none of the extras you'd pay for elsewhere.\n\nFirst apartment, kids' room, or fix-my-sleep-this-week — it covers the essentials properly at the friendliest price in the range.",
    [
      "25cm balanced profile",
      "Medium-firm everyday feel",
      "Simple, durable construction",
      "The value pick of the lineup",
    ],
  ),
  product(
    10,
    "sweet-repose-10",
    "Sweet Repose 10″",
    "Low-profile, easy-going comfort",
    6,
    10,
    { single: 2090, twin: 3090, queen: 3790, king: 4590 },
    { hero: "sweet-repose-hero.webp" }, // not uploaded yet
    "The Sweet Repose keeps things simple: a 10-inch profile with a balanced feel that works on platform beds, bunk frames, and anywhere a taller mattress would overwhelm the room.\n\nDon't let the height fool you — the core carries its weight, and the slimmer build makes it the easiest bed in the range to move, rotate, and dress.",
    [
      "Slim 10″ profile",
      "Balanced medium feel",
      "Suits platform & bunk frames",
      "Light and easy to handle",
    ],
  ),
  product(
    11,
    "royal-blue-5-star-40cm",
    "Royal Blue 5 Star 40cm",
    "Our flagship. Nothing held back.",
    5,
    16,
    { single: 9888, twin: 10888, queen: 13888, king: 16888 },
    {
      hero: "5star-hero.webp",
      gallery: ["5star-corner.webp", "5star-skeleton.webp"],
    },
    "The Royal Blue 5 Star is what happens when we ignore the accountants. A towering 40cm build stacks tier upon tier of comfort over a substantial support system — the full five-star-suite experience, delivered to your bedroom.\n\nEvery layer is the best version of itself. The feel is luxury-medium: plush on arrival, supportive by midnight, and unmistakably grand.",
    [
      "Towering 40cm luxury profile",
      "Multi-tier layered comfort system",
      "Five-star-suite plush-medium feel",
      "The flagship of the range",
    ],
  ),
  product(
    12,
    "royal-blue-emporium",
    "Royal Blue Emporium",
    "Grand comfort, one step from the top",
    4,
    15, // TODO: confirm actual height with supplier
    // TODO: Single was listed as RM81,888 — assumed typo, seeded as RM8,188.
    { single: 8188, twin: 8888, queen: 11888, king: 13888 },
    {
      hero: "emporium-hero.webp",
      gallery: [
        "emporium-front.webp",
        "emporium-diagonal.webp",
        "emporium-fabric.webp",
        "emporium-skeleton.webp",
      ],
    },
    "The Emporium shares the Royal Blue flagship's DNA — the deep layered build, the plush-leaning luxury feel — in a slightly trimmer, slightly softer package.\n\nIt's the choice for sleepers who want the grand-hotel experience with a touch more cradle at the surface, and a little left over for the bedframe.",
    [
      "Deep layered luxury build",
      "Plush-leaning (4/10) luxury feel",
      "Royal Blue comfort system",
      "Softer sibling of the 5 Star",
    ],
  ),
];

/**
 * Sample reviews used by `pnpm db:seed --with-reviews`, keyed by product slug.
 * The line-up's best-rated beds (5 Star, Emporium, Unity, Icesilk, Dream
 * Cloud) carry all-5★ (or near) sets; the rest get an organic 3–5★ mix.
 */
export const sampleReviews: Record<
  string,
  Array<{ rating: number; authorName: string; body: string }>
> = {
  "royal-blue-5-star-40cm": [
    {
      rating: 5,
      authorName: "Tan Wei Ming",
      body: "Bought the king size during the home fair at Mid Valley — booth price was way better than the showroom. 40cm is no joke, my old tilam looks like a sports mat next to it. Worth every ringgit.",
    },
    {
      rating: 5,
      authorName: "Nurul Aina",
      body: "SweetDream is the brand my parents slept on for 20 years, so we went straight for the 5 Star for our new place in Kajang. Feels like the hotel beds in Genting. Honestly, better.",
    },
    {
      rating: 5,
      authorName: "Suresh Menon",
      body: "I have L4-L5 issues and was told to get something with proper spine support. Two months on this and I wake up without the usual stiffness. Delivery to Seremban took two days only.",
    },
    {
      rating: 5,
      authorName: "Goh Pei Shan",
      body: "Staff at the showroom were super patient — let us test lying down for almost an hour, zero pressure to buy. The bed itself: you sink in a bit but your back stays straight. Sedap tidur.",
    },
    {
      rating: 5,
      authorName: "Khairul Anuar",
      body: "Sleep with the aircond at 24 and the top layer stays cool the whole night. My wife getting up for work doesn't even shake the mattress anymore. Should have changed years ago.",
    },
    {
      rating: 5,
      authorName: "Kavitha Raj",
      body: "Expensive, yes, but you spend eight hours a day on it. Six months in, zero regrets — still feels like day one and the stitching is very solid.",
    },
    {
      rating: 5,
      authorName: "Sim Li Ping",
      body: "We drove from Puchong to the flagship showroom after spotting SweetDream at a wedding expo, of all places. Staff remembered our names on the second visit. The king size fits our family of four for movie nights.",
    },
    {
      rating: 5,
      authorName: "Firdaus",
      body: "Beli sebab dah penat bangun sakit pinggang. Sekarang tidur sampai alarm pun tak dengar. 40cm memang beza.",
    },
    {
      rating: 5,
      authorName: "Gopal Krishnan",
      body: "After my spine surgery the doctor said invest in a proper mattress, and this was the one he named first. Three months in, no regrets — and the delivery men were careful with my gate and walls.",
    },
    {
      rating: 5,
      authorName: "Chin Sook Fun",
      body: "Genuinely the best big purchase we've made for the house. Cooling, supportive, and the motion isolation is sorcery — my husband wakes at 5am for work and I sleep straight through.",
    },
    {
      rating: 5,
      authorName: "Wan Ahmad",
      body: "Harga tinggi tapi kualiti nampak. Jahitan kemas, bau takde, penghantaran ke Shah Alam cepat. Kalau tahan macam SweetDream lama saya — 14 tahun — murah sebenarnya.",
    },
    {
      rating: 5,
      authorName: "Anusha",
      body: "My parents, my sister and now us — three houses, all on SweetDream. The 5 Star is the one everyone fights to nap on during Deepavali gatherings.",
    },
  ],
  "royal-blue-emporium": [
    {
      rating: 5,
      authorName: "Lim Mei Ling",
      body: "Tried the 5 Star and the Emporium side by side at the expo — Emporium is a touch softer and a few thousand ringgit kinder to the wallet. My shoulder doesn't go numb on my side anymore.",
    },
    {
      rating: 5,
      authorName: "Mohd Hafiz",
      body: "Delivery team called ahead and carried it up three floors of walk-up flat in Wangsa Maju without a single complaint. The mattress memang hotel feel. Guests always ask what brand.",
    },
    {
      rating: 5,
      authorName: "Anand Pillai",
      body: "My wife has a slipped disc and this is the first mattress where she can sleep flat on her back through the night. Got a fair price during the Merdeka promo. Very happy with SweetDream.",
    },
    {
      rating: 5,
      authorName: "Wong Siew Lan",
      body: "Plush, but not the sink-until-you're-stuck kind. With the aircond on it's like a nice hotel every night. The Penang showroom staff even followed up a month later to check on us.",
    },
    {
      rating: 5,
      authorName: "Faizal Rahim",
      body: "Upgraded from a 10-year-old spring mattress and the difference is embarrassing. Back pain gone in about three weeks. Honestly feels like it should cost more.",
    },
    {
      rating: 5,
      authorName: "Low Kah Meng",
      body: "Compared this against two imported brands at nearly double the price — the Emporium matched them layer for layer. The sales uncle printed the spec sheets and let us take our time deciding.",
    },
    {
      rating: 5,
      authorName: "Suraya",
      body: "Masa confinement duduk rumah mak, tidur atas Emporium — terus suruh husband order satu untuk rumah kami. Selesa sangat.",
    },
    {
      rating: 5,
      authorName: "Dinesh Rao",
      body: "Back pain from years of lorry driving, and this mattress is the first thing that's actually helped. Delivery to Butterworth was on time — two men, in and out in fifteen minutes.",
    },
    {
      rating: 4,
      authorName: "Kong Wai Yee",
      body: "Lovely plush feel and it sleeps cool with the aircond. Four stars only because delivery to Kuching took almost two weeks. The mattress itself is a five.",
    },
    {
      rating: 5,
      authorName: "Hakim",
      body: "Servis showroom Melaka terbaik — layan mak saya yang cerewet dengan sabar. Tilam pun sedap, mak dah tak komplen sakit belakang.",
    },
  ],
  "unity-14": [
    {
      rating: 5,
      authorName: "Yap Jia Hui",
      body: "Got a good package deal at the furniture fair in Setia Alam. Firm enough for my dad's back, soft enough that my mum stopped complaining. Whole family sleeps on Unity now.",
    },
    {
      rating: 5,
      authorName: "Zaiton binti Ahmad",
      body: "My son recommended SweetDream because it's a known brand with proper warranty. Very comfortable, and my hip pain has improved a lot. Delivery to Ipoh took three days.",
    },
    {
      rating: 5,
      authorName: "Vignesh K.",
      body: "Middle-firm, no motion transfer, doesn't trap heat even in KL weather. For this price it beats the imported brands I tested at three different malls.",
    },
    {
      rating: 4,
      authorName: "Cheah Y.S.",
      body: "Very solid mattress — my spine feels properly supported for the first time in years. One star off because delivery to Kuantan took longer than promised. The bed itself, no complaints.",
    },
    {
      rating: 5,
      authorName: "Rosnah I.",
      body: "Second SweetDream in the house. The first one lasted 12 years, so we didn't even look at other brands. Unity feels more premium than what we paid.",
    },
    {
      rating: 5,
      authorName: "Teo Han Wei",
      body: "Bought at the expo booth price. Six months later my wife's sciatica flare-ups are noticeably rarer. Should have done this years ago instead of blaming the pillows.",
    },
    {
      rating: 5,
      authorName: "Latifah",
      body: "Unity ni value paling best dalam range SweetDream rasanya. Firm cukup-cukup, tak panas, dan harga masa fair memang berbaloi.",
    },
    {
      rating: 5,
      authorName: "Balan",
      body: "My father is 78 with a bad back and refuses soft mattresses. Unity passed his inspection in one afternoon nap. That's the highest rating our house gives.",
    },
    {
      rating: 5,
      authorName: "Beh Siew Kim",
      body: "No fancy marketing, just a properly built mattress. Motion transfer is almost zero. Aircond at 24 plus this equals the best sleep of my adult life.",
    },
    {
      rating: 5,
      authorName: "Ridzuan",
      body: "Penghantaran ke Alor Setar cepat, abang lori tolong angkat sampai tingkat atas. Tilam padu, tak melendut walaupun saya berat sikit.",
    },
  ],
  "sweet-icesilk-13": [
    {
      rating: 5,
      authorName: "Lee Chee Keong",
      body: "The IceSilk top is not a gimmick — it actually feels cold to the touch when the fan is on. First mattress where I don't wake up sweaty in Malaysian weather.",
    },
    {
      rating: 5,
      authorName: "Farhana Musa",
      body: "Bought during the home expo at Mid Valley, booth price was very good. The cooling feel with aircond is shiok. My husband's tossing doesn't wake me anymore.",
    },
    {
      rating: 5,
      authorName: "Prakash a/l Muniandy",
      body: "I run hot at night, always kicking off the blanket. This with the aircond at 25 is perfect. Bonus: my lower back doesn't ache in the mornings anymore.",
    },
    {
      rating: 5,
      authorName: "Ng Boon Huat",
      body: "Showroom staff explained every layer without rushing us — pleasant experience from testing to delivery. Sleeps cool and supportive. Great value for a local brand with this quality.",
    },
    {
      rating: 4,
      authorName: "Shalini Nair",
      body: "Love the cool surface, very comfortable for side sleeping. Only gripe is my warranty registration took almost two weeks to be confirmed. The mattress itself is excellent.",
    },
    {
      rating: 5,
      authorName: "Hazwan",
      body: "Tidur dengan aircond memang sejuk. Best purchase this year — sakit belakang pun dah kurang.",
    },
    {
      rating: 5,
      authorName: "Foo Chee Seng",
      body: "I sweat like nobody's business and have tried every 'cooling' mattress in the mall. IceSilk is the only one still cool at 3am after the aircond timer cuts off.",
    },
    {
      rating: 5,
      authorName: "Puteri",
      body: "Sejuk bila baru baring, macam cadar hotel. Sakit bahu saya pun berkurang sebab tak asyik pusing-pusing malam.",
    },
    {
      rating: 5,
      authorName: "Naresh",
      body: "Penang humidity is no joke. This mattress plus the ceiling fan is enough most nights — we barely switch on the aircond now, saving on the bill somemore.",
    },
    {
      rating: 5,
      authorName: "Liew Mei Fong",
      body: "Second one we've bought — first for us, now one for my in-laws. The cooling layer is the real deal, and the staff at the fair gave us a repeat-customer discount without us even asking.",
    },
  ],
  "dream-cloud-13": [
    {
      rating: 5,
      authorName: "Aina Sofea",
      body: "Accurately named — it really is like sleeping on a cloud but with support underneath. My physio asked what changed because my posture improved.",
    },
    {
      rating: 5,
      authorName: "Chong Kar Wai",
      body: "My wife and I tested eight mattresses at the Cheras showroom. Staff were friendly, zero hard-sell. Dream Cloud won, and four months later we still talk about how well we sleep.",
    },
    {
      rating: 5,
      authorName: "Devi S.",
      body: "Quick delivery to JB, arrived earlier than promised. The plush top plus aircond combo is heavenly after a long shift.",
    },
    {
      rating: 5,
      authorName: "Azlan H.",
      body: "SweetDream memang tak mengecewakan. Beli masa promo raya, harga berbaloi. Sakit belakang saya dah banyak kurang.",
    },
    {
      rating: 5,
      authorName: "Khoo S.L.",
      body: "Six months in — no sagging, no noise, and my shoulder ache from side-sleeping is gone. Local brand but the quality is export-grade.",
    },
    {
      rating: 5,
      authorName: "Chan Kok Leong",
      body: "Plush without the quicksand feeling. My chiropractor was skeptical until she pressed on it herself at the showroom — now she recommends SweetDream to her patients.",
    },
    {
      rating: 5,
      authorName: "Mastura",
      body: "Dah setahun guna, masih macam baru. Sakit pinggang lepas bersalin pun hilang perlahan-lahan. Memang jenama yang boleh dipercayai.",
    },
    {
      rating: 5,
      authorName: "Jeyaram",
      body: "Delivery to Skudai came within the week. The bed is so comfortable my teenage son stopped falling asleep on the sofa. That alone is worth the money.",
    },
    {
      rating: 4,
      authorName: "Soo Pei Ling",
      body: "Very comfortable, truly cloud-like. Minus one star because the warranty registration website was down for days when we bought it. The mattress itself? Faultless.",
    },
    {
      rating: 5,
      authorName: "Danial",
      body: "Tidur macam kat hotel bintang lima setiap malam. Kawan datang rumah pun tanya tilam apa. SweetDream lah apa lagi.",
    },
  ],
  "sweet-luxury-16": [
    {
      rating: 5,
      authorName: "Muralitharan",
      body: "Thick like a presidential suite bed. Very comfortable, and the staff at the fair threw in pillows with the package. Good experience overall.",
    },
    {
      rating: 4,
      authorName: "Nadia Zulkifli",
      body: "Very plush, sleeps cool with the aircond. Just note it is TALL — get fitted sheets made for 16-inch mattresses, the normal ones won't stretch over.",
    },
    {
      rating: 3,
      authorName: "Ooi Beng Chin",
      body: "Comfortable mattress, but my warranty claim for a zipper defect took over a month to settle. Bed is good; the after-sales process needs to be faster.",
    },
    {
      rating: 5,
      authorName: "Saraswathy",
      body: "Bought for our master bedroom after testing it at the PWTC home fair. Feels like the suites in the fancy hotels my company puts me up in. Delivery to Nilai was quick and polite.",
    },
    {
      rating: 4,
      authorName: "Ang Boon Keat",
      body: "Grand, tall, very comfortable. Just make sure your bed frame can take the height — with our old frame the bed is now almost chest level. Not the mattress's fault lah.",
    },
    {
      rating: 5,
      authorName: "Zulhilmi",
      body: "Tinggi macam katil raja. Selesa sangat sampai susah nak bangun subuh. Staff kedai pun ramah, tak push langsung.",
    },
    {
      rating: 4,
      authorName: "Letchumi",
      body: "Comfortable mattress but heavy to rotate on my own, and my warranty query about a loose thread took three weeks to get a reply. Product good, service so-so.",
    },
  ],
  "sweet-comfort-14": [
    {
      rating: 4,
      authorName: "Siti Mariam",
      body: "Good balance of soft and support, and delivery to Klang was quick. My morning back stiffness improved after the first month.",
    },
    {
      rating: 5,
      authorName: "Daniel Foo",
      body: "Best value in the range if you ask me. Comfortable, cool, and SweetDream is a name my whole family already trusts.",
    },
    {
      rating: 3,
      authorName: "Ravi Chandran",
      body: "Comfortable, but somehow firmer than the showroom unit. Customer service was polite when I called to ask. Acceptable for the expo price I paid.",
    },
    {
      rating: 5,
      authorName: "Ho Jia Le",
      body: "Simple, solid, and my backache from WFH marathons has eased a lot. For the roadshow price this is honestly a steal.",
    },
    {
      rating: 4,
      authorName: "Aminah",
      body: "Selesa, sejuk dengan aircond, harga okay. Empat bintang sebab tepi tilam sikit lembut bila duduk. Selain tu semua bagus.",
    },
    {
      rating: 5,
      authorName: "Sivakumar",
      body: "Middle child of the range but nothing middle about the sleep. Fast delivery to Sungai Petani and the drivers called ahead like they promised.",
    },
    {
      rating: 3,
      authorName: "Chew Lai Fun",
      body: "Decent mattress for the price. Mine arrived with a small stain on the cover — they did exchange it, but the back-and-forth took longer than it should have.",
    },
  ],
  "sweet-harmony-14": [
    {
      rating: 5,
      authorName: "Wan Nor Asiah",
      body: "Comfortable, and my husband turning over no longer wakes me. Fast delivery too. Just wish the pillow-top was slightly thicker.",
    },
    {
      rating: 4,
      authorName: "Jason Liew",
      body: "Solid mid-range choice. Supports my back well and the roadshow price was very reasonable. Two months in, no complaints.",
    },
    {
      rating: 5,
      authorName: "Nor Azman",
      body: "Tilam pertama yang saya beli sendiri lepas kahwin. Harga masuk akal masa promo, kualiti tak rasa murah langsung. Tidur lena, isteri pun sama.",
    },
    {
      rating: 4,
      authorName: "Meena",
      body: "Good support for the price and it doesn't sleep hot. My mother visited from Ipoh, slept a week on it, and asked me to order one for her too.",
    },
    {
      rating: 4,
      authorName: "Bong Kee Chuan",
      body: "Shipped all the way to Kuching in reasonable time for once. Comfortable, balanced feel. Would be five stars if the East Malaysia delivery fee wasn't so steep.",
    },
    {
      rating: 4,
      authorName: "Fauziah",
      body: "Okay je. Selesa tapi taklah istimewa mana. Untuk bilik tetamu memang cukup.",
    },
    {
      rating: 5,
      authorName: "Intan Baizura",
      body: "Survey punya survey, akhirnya settle dengan Harmony masa pameran hujung minggu. Staff terangkan elok-elok, tak paksa-paksa. Sebulan pakai, tidur memang lena.",
    },
  ],
  "spine-support-12": [
    {
      rating: 5,
      authorName: "Ganesh S.",
      body: "My physio recommended a firmer mattress for my slipped disc. This keeps my spine aligned and I wake up with much less pain. Worth it.",
    },
    {
      rating: 4,
      authorName: "Noraini",
      body: "Firm, very good for back sleepers. Took a week to adjust after years on a soft mattress — now I cannot go back.",
    },
    {
      rating: 3,
      authorName: "Eric Tan",
      body: "The back support is genuinely good, but the fabric pilled a bit after four months and the warranty response was slow — weeks before I got a proper reply.",
    },
    {
      rating: 5,
      authorName: "Loo Teck Seng",
      body: "I stand eight hours a day at the clinic and this mattress resets my back overnight. Firm, stable, and the edges hold when you sit. Exactly what it says on the label.",
    },
    {
      rating: 4,
      authorName: "Syazwani",
      body: "Beli untuk ayah yang ada masalah tulang belakang. Dia kata tidur lebih selesa dan bangun tak keras badan. Empat bintang sebab tunggu stok dua minggu.",
    },
  ],
  "sleep-ortho-12": [
    {
      rating: 5,
      authorName: "Amirul",
      body: "Bought it for my mother's back problem. She says her spine feels supported and she finally sleeps through the night. The delivery team even helped dispose of the old tilam.",
    },
    {
      rating: 5,
      authorName: "Grace Loh",
      body: "Ortho-firm but not hard like a plank. My chiropractor approves. Got a good price at the PJ warehouse sale somemore.",
    },
    {
      rating: 3,
      authorName: "Kumar V.",
      body: "Does the job for back support, but a bit too firm for side sleeping and the edge could be stronger. Showroom staff were helpful though.",
    },
    {
      rating: 5,
      authorName: "Ikhwan",
      body: "Fisio saya sendiri guna SweetDream, sebab tu saya beli. Sebulan pertama rasa keras, lepas tu badan dah sesuai — sekarang sakit pagi dah takde.",
    },
    {
      rating: 4,
      authorName: "Puvaneswari",
      body: "Bought for my husband's slipped disc on our doctor's advice, and he sleeps much better now. The Klang showroom staff were lovely and explained everything patiently.",
    },
    {
      rating: 4,
      authorName: "Shahrul",
      body: "Sokongan bagus tapi memang keras — sesiapa suka tilam lembut jangan ambil yang ni. Penghantaran okay, servis okay, cuma bukan untuk semua orang.",
    },
  ],
  "hotel-spinal-12": [
    {
      rating: 4,
      authorName: "Melissa Chin",
      body: "We furnished our small homestay in Melaka with these and guests keep complimenting the beds. Firm, durable, and the bulk pricing was fair.",
    },
    {
      rating: 4,
      authorName: "Roslan M.",
      body: "Comfortable enough and delivery was quick, but my warranty enquiry took two weeks to get an answer. Mattress is fine — the process needs work.",
    },
    {
      rating: 5,
      authorName: "Voon Siew Hua",
      body: "We run a 12-room guesthouse in Taiping and switched every bed to Hotel Spinal during the trade promo. Guests mention the beds in their booking reviews now — that's free marketing.",
    },
    {
      rating: 4,
      authorName: "Balqis",
      body: "Beli dua untuk rumah sewa. Tahan lasak, penyewa tak komplen, harga borong pun okay. Empat bintang sebab cover cepat berbulu sikit.",
    },
    {
      rating: 3,
      authorName: "Loh Wei Jian",
      body: "Does the hotel-firm thing well, but our second unit arrived with a dented corner and the replacement took a while to arrange. The first unit is perfectly fine.",
    },
    {
      rating: 3,
      authorName: "Dayang Nur",
      body: "Mattress okay, but my warranty claim for a sagging spot has been 'in process' for almost two months now. Very frustrating for an otherwise good brand. Will update if they settle it.",
    },
  ],
  "sleep-care-25cm": [
    {
      rating: 4,
      authorName: "Pei Wen",
      body: "Simple and comfortable, no frills. Good starter mattress for my rental room, and the fair price made it an easy yes.",
    },
    {
      rating: 4,
      authorName: "Hafizah",
      body: "Okay for the price. A bit thin if you're used to premium beds, but back support is decent and it doesn't trap heat.",
    },
    {
      rating: 5,
      authorName: "Jothi",
      body: "Furnished three rooms of my student rental in Cyberjaya with these. Cheap, decent support, zero complaints from tenants two semesters in.",
    },
    {
      rating: 4,
      authorName: "Nabil",
      body: "Untuk harga ni memang tak boleh komplen. Selesa, ringan, senang nak alih. Beli masa clearance sale kedai Rawang.",
    },
    {
      rating: 3,
      authorName: "Sim Yee Ling",
      body: "Basic but honest. You feel the springs a bit if you're on the heavier side, but for a kid's room it's perfectly fine.",
    },
  ],
  "sweet-repose-10": [
    {
      rating: 5,
      authorName: "Thivya",
      body: "Bought it for my daughter's room. She used to crawl into our bed every night — not anymore. Great budget option from a brand we trust.",
    },
    {
      rating: 4,
      authorName: "Zul",
      body: "Basic but does the job lah. More than enough for the guest room. Delivery was fast and the packaging was solid.",
    },
    {
      rating: 5,
      authorName: "Hema",
      body: "Bought two for my twins' bunk beds. Light enough to flip the covers weekly, and they've survived a year of children jumping. SweetDream quality even at the budget end.",
    },
    {
      rating: 4,
      authorName: "Amir Hamzah",
      body: "Tilam bujang yang bagus. Ringan, boleh angkut dalam kereta sendiri. Empat bintang sebab takde pilihan warna cover.",
    },
    {
      rating: 3,
      authorName: "Grace Wong",
      body: "It's a basic mattress and it behaves like one. Fine for the guest room, wouldn't put it in the master. Delivery was quick though.",
    },
  ],
};
