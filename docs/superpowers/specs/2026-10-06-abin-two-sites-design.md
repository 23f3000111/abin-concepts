# ABIN Snack Food: two website concepts — design spec

Date: 2026-10-06 · Status: approved by the user (design and all follow-on steps pre-approved)

## 1. Goal

Two complete, alternative multi-page websites for **ABIN Snack Food** (ABIN Manufacturing Sdn. Bhd., Rawang,
Selangor), maker of **Kali Kali crunchy corn sticks**, so the client can pick a direction. Both use the same real
content and differ in look, motion and personality.

User requirements (verbatim intent):

1. Professional
2. Colourful and playful; show crunchy corn sticks; each flavour's colour becomes part of the feeling
3. Sharp design
4. Clickable cards and buttons; important cards and images open a pop-up or go somewhere
5. Cool animations throughout; **animation like the user's bloopsbaby project** (same motion vocabulary)
6. Follow the logo colour (ABIN yellow)
7. **No dark theme**
8. Style references: snaxxco.webflow.io (home-01, about, benefits, shop-all, faq), kitpro-forsa.webflow.io,
   sayian-drinks.webflow.io/homepage/home-03

Chosen direction: **two looks, same brand** — A playful flavour-pop, B sharp and premium on a light canvas.

## 2. Deliverable structure

```
index.html                     chooser page (both concepts side by side)
site-a-kali-nak-lagi/          Concept A (self-contained)
site-b-jagung-rangup/          Concept B (self-contained)
tests/                         node --test unit tests for the shared logic of both sites
docs/superpowers/              this spec + the build plan
README.md                      how to open, folder map, placeholders
.nojekyll, .gitignore          GitHub Pages ready; client source material stays out of git
```

Each site folder:

```
index.html shop.html product.html about.html benefits.html faq.html contact.html
assets/css/style.css
assets/js/vendor/  gsap.min.js ScrollTrigger.min.js SplitText.min.js lenis.min.js   (GSAP 3.13, from bloopsbaby)
assets/js/data.js   all content (flavours, SKUs, prices, claims, FAQs, contact, channels)
assets/js/core.js   pure logic (cart maths, WhatsApp message builders, EAN-13, FAQ search) — UMD so node can test it
assets/js/app.js    UI wiring (nav, bag drawer, dialogs, filters, forms, product template)
assets/js/fx.js     motion (Lenis, transitions, loader, signature toy, pinned scenes, reveals)
assets/fonts/       self-hosted woff2
assets/img/ assets/video/
README.md CREDITS.md
```

Static HTML/CSS/JS, no build step, opens by double-click (also works served over HTTP). Approach alternatives
rejected: React/Vite (build step, no animation benefit), single long pages (loses the Snaxx page set).

## 3. Verified content (single source: data.js)

Sources: client files in `ui images/`, `ABIN PACKAGING.pdf`, `Catalogue aBin Corn Stick.pdf`, Facebook page,
Linktree, HIP article (hip.hdcglobal.com).

**Company.** ABIN Manufacturing Sdn. Bhd. (202401028301 / 1574148-D), trading as ABIN Snack Food (also
"ABIN Snack Food Supplier Enterprise" on the catalogue). Factory sign: "Kilang Makanan Ringan ABIN".
No. 22 (Ground Floor), Jalan BJ 2, Taman Perindustrian Belmas Johan, 48000 Rawang, Selangor, Malaysia.
Phone +60 19-976 1857 · abinsnackfood@gmail.com. Facebook "ABIN Snack Food - HQ": 3.4K followers,
**98% recommend (28 reviews)**. Serves Kepong, Petaling Jaya, Puchong, Kuala Lumpur.

**Channels.** Shopee `shopee.com.my/abin_snack` · WhatsApp `wa.me/message/GPFMZ6A6OSM6G1` · Facebook
`facebook.com/profile.php?id=100068376395220` · Instagram `@abin_snackfood` · TikTok `@abinsnackfood`
(Linktree also lists `@abinsnackfood.my`) · LinkedIn `abin-corn-stick-559017340` · Xiaohongshu · Lemon8 ·
Linktree `linktr.ee/aBinCornStick`. Order messages use `wa.me/60199761857?text=…` (confirm this is the WhatsApp
number; placeholder flag).

**Flavours (current pillow-pack range).**

| id | Name | Malay | 中文 | Tagline (their video) | kcal / 30 g (% daily) | Diet (packaging sheet) | Badge (2024 catalogue) |
|---|---|---|---|---|---|---|---|
| spicy | Spicy | Pedas | 香辣味 | Bold & exciting | 158 (8%) | Vegetarian | Best seller |
| cheese | Cheese | Keju | 芝士味 | Creamy & yummy | 167 (8%) | Vegetarian | — |
| original | Original (Classic) | Asli | 原味 | Crispy & delicious | 174 (9%) | Vegan-friendly | — |
| seaweed | Seaweed | Rumpai Laut | 海苔味 | Light & savoury | 162 (8%) | Vegan-friendly | Signature |

**Sizes and trade specs.**
- 30 g: shelf life 18 months, 36 packs per carton. Barcodes: Cheese 9555083708110, Spicy 9555083708103,
  Original 9555083708080, Seaweed 9555083708097 (all valid EAN-13).
- 60 g: from the 2024 catalogue: shelf life 12 months, 20 packs per carton. Barcodes Spicy 9555083708202,
  Cheese 9555083708219, Original 9555083708172, Seaweed 9555083708189 (flag: confirm for the new 60 g pack).
- Legacy flavour Oat Salted Egg is not shown (not in the current range).

**Prices.** RM 8.90 for 60 g (seen on a Malaysian shelf tag). Everything else is a placeholder: 30 g RM 4.50,
Variety 4-pack (4 × 30 g) RM 16.90. Trade prices: on enquiry.

**Claims (printed on packs and posters).** Plant-based · Gluten-free (recipe uses gluten-free corn) · No
preservatives · 0% trans fat · Non-GMO corn · Halal (JAKIM, MS1500) · "Made from corn, not deep-fried" (their
3 PM poster) · Suitable for vegetarians.

**Certifications.** Halal JAKIM (MS1500) · MeSTI (Ministry of Health food-safety scheme) · Produk Malaysia /
Buatan Malaysia · trademark registered with MyIPO (®).

**Company facts (HIP article).** Daily capacity 90 kg (about 1,500 units). Exhibited 2024: Japan Malaysia Fair
(Tokyo), Maroi Festival (Thailand), MIHAS (Kuala Lumpur), First International B2B SIAL Exhibition (MITEC),
First Malaysia Fest (Singapore). Bulk orders from the UAE. Seeking international distributors and retailers.
HIP PLUS member.

**Business channels (their banner).** Supermarkets & hypermarkets · Convenience stores · Food service & HORECA ·
Corporate gifts & promotions · Distributors & export partners. "Let's grow together. Reliable partner for local
& international markets." "Good snacks, brighter lives."

**Affiliate programme (their poster).** 15% commission per successful sale. For content creators, food
reviewers and food lovers, people wanting side income, online sellers and entrepreneurs. Register on WhatsApp:
"Mudah, pantas dan percuma!" (easy, fast and free).

**Their lines.** "Kali cuba, kali nak lagi!" · "Rangup setiap gigitan! / Crunchy in every bite!" · "Snek jagung
rangup & lazat untuk semua!" · "Healthy snacking for a better tomorrow" · "It's 3PM, time for ABIN Kali Kali!" ·
"#MyEverydaySnack" · "Good game, great snack, better together!" · "Super crispy!!! Made from corn" ·
"Makanan snek yang sihat untuk anak anda" · "Rangup, pedas, ketagih!".

**Placeholders (listed in READMEs).** Prices except RM 8.90/60 g, written reviews (the 98% figure is real),
allergen/ingredient detail, production-process detail, delivery and payment terms for WhatsApp orders, the
WhatsApp number used for prefilled orders, 60 g barcodes/shelf life, mascot "Kali" (a proposal).

## 4. Assets pipeline (Python: Pillow, rembg, PyMuPDF, ffmpeg)

- Pack cut-outs: rembg on the 8 renders (4 flavours × 30 g / 60 g) → transparent WebP, large + small.
- Corn stick sprites: the single stick on catalogue page 2 (2595 × 984) cut out; tinted variants per flavour.
- Photography: catalogue cover and back photos (bowls of sticks), team photo, shelf photos, posters → WebP.
- Video: the 6 vertical ads → web MP4 (H.264, faststart) + poster frames; per-flavour clips cut from the
  flavour video; stills for the "moments" content.
- Ingredient cut-outs (chilli, cheese, corn, nori) from the pack renders or free stock (Unsplash/Pexels), credited.
- Logo: ABIN wordmark cut from a high-resolution pack render; LOGO.jpg (150 px) only for the favicon.
- Catalogue PDF recompressed for download (Concept B trade section).
- Icons: inline SVG (Lucide-style), social icons as inline SVG.

## 5. Concept A — "Kali Nak Lagi!" (playful flavour-pop)

**Feel.** Snaxx + Sayian look with bloopsbaby Concept A motion. Loud, joyful, Malaysian, still well organised.

**Palette.** Cream dotted-grid canvas `#FFF8E6`; ABIN yellow `#FFD21E`, amber `#F6A800`, team orange `#FF7A1A`,
sign blue `#1F45C8`, plant green `#5DB33A`, ink `#2B1408` (chocolate brown, text). Flavour section colours, all
bright: Spicy chilli `#E8402A`, Cheese cheddar `#FFC21A`, Original sweetcorn `#FFE7A3`, Seaweed ocean `#2F6FE4`
(with nori green `#8BD449`). No dark sections.

**Type.** Anton (pack-style condensed capitals, display) · Rubik (body/UI) · Caveat Brush (handwritten notes).

**Shapes.** Wavy section edges, stickers with white borders, squiggle underlines, sparkles, glossy "jelly"
buttons, flavour-coloured cards with rounded corners, tape on tilted cards.

**Motion (bloopsbaby A vocabulary).**
- Lenis smooth scroll + GSAP ticker.
- First-visit loader: logo elastic pop, "popping corn" bar with kernels bouncing, circle clip-path exit.
- Page transitions: ABIN-yellow circle wipe from the click point with the logo, reverse on arrival.
- **Crunch Field (signature, replaces the bubble field):** canvas of real corn-stick sprites and kernels that
  drift and tumble; hover or tap snaps a stick into two halves + crumbs + comic word ("KRAP!", "RANGUP!",
  "CRUNCH!", "SEDAP!"); tap empty space drops a new stick; synthesized crunch sound (filtered noise burst) with a
  mute toggle (remembered); pauses off-screen; static under reduced motion.
- Hero entrance: Anton letters drop with elastic ease and random tilt; packs rise; sticker orbs pop and float;
  pointer parallax on the stage.
- **Pinned "Pick your flavour" scene (4 states, replaces Team Green/Purple):** page colour morphs Spicy → Cheese
  → Original → Seaweed; pack 3D-flips (rotateY, elastic); ingredient orbs pop in; giant outlined word behind
  ("PEDAS", "KEJU", "ASLI", "RUMPAI LAUT"); per-flavour progress bars; jelly tab switch jumps to a state.
  Below 900 px: unpinned tabs.
- Reveals: `[data-pop]` batch (back.out scale-up), `[data-split]` char drops.
- Claim "kernels" pop in with elastic stagger and float; each opens a pop-up.
- Counters with elastic scale; marquees skew with scroll velocity; fanned photo cards rise; taped moment cards.
- "It's 3PM" clock hand rotates with scroll to 3:00.
- Fly-to-bag arc; bag jelly bump; burst particles on add.
- Mascot **Kali** (the corn stick from the logo's "I", inline SVG) peeks bottom-right, wiggles, gives tips;
  appears in the quiz and empty bag.

**Pages.**
- **Home:** hero (Crunch Field, "KALI CUBA, KALI NAK LAGI!", CTAs, trust row, fanned packs + orbs, tap hint) ·
  two-row marquee (EN / BM / 中文) · pinned Pick-your-flavour · claim kernels · counters · product cards
  (size toggle, quick add, quick view) · snack-o'clock moments (3PM, game night, lunchbox, family) · reels (6
  videos, hover play, lightbox) · "Which Kali Kali are you?" quiz · "Spotted on shelves" photo fan · affiliate
  15% · wholesale channel band · reviews (98% recommend) · Instagram grid → lightbox · footer.
- **Shop:** yellow hero card "4 FLAVOURS. 1 CRUNCH." · filter pills (All, Spicy, Not spicy, Vegan-friendly,
  Vegetarian, 30 g, 60 g, Bundles) + sort · flavour-coloured cards → quick-view pop-up / add · variety pack ·
  trade carton card → wholesale form · how ordering works.
- **Product** (`product.html?f=spicy&s=60`): page themed in the flavour colour · big pack with pointer tilt ·
  names (EN/BM/中文), tagline, size switch, price, qty, add, Shopee · ingredient orbs · flavour video clip ·
  nutrition card · claim chips · pairs-with cards · next-flavour colour wipe.
- **About:** "MADE IN RAWANG. LOVED KALI KALI." hero with pack between words · story with fanned photos ·
  numbered values accordion · team photo with stickers · 2024–2026 journey · certifications (pop-ups) · counters.
- **Benefits:** giant "BENEFITS" with tilted pack row · tabbed claims panel (6) · "From cob to crunch" steps with
  a drawn path · kcal per flavour bars · snack moments · FAQ teaser.
- **FAQ:** spilling-sticks hero · live search · category chips · animated accordion · WhatsApp CTA.
- **Contact:** contact cards (WhatsApp, call, email, visit + map) · tabbed forms (Hello/order, Wholesale,
  Affiliate) building WhatsApp/email messages · socials · service areas.

## 6. Concept B — "Jagung Rangup" (sharp and premium, light)

**Feel.** Forsa's product storytelling on a warm light canvas with bloopsbaby Concept B motion. Calm, precise,
export-ready, still appetising.

**Palette.** Paper `#F6F3EC`, white `#FFFFFF`, ink `#15120E`, muted `#5B554D`, hairline `#DDD6C8`; ABIN yellow
`#FFD21E` is the single sharp accent (marquee, numbers, buttons, highlights, footer panel). Flavour colours only as
soft tints behind packs: Spicy `#F6DCD6`, Cheese `#FBEBC2`, Original `#F2ECDB`, Seaweed `#DCE5F2`; true pack colours
(`#8E1B1B`, `#E9A91E`, `#C9B98F`, `#14284B`) for small dots and labels. No dark sections.

**Type.** Archivo variable (expanded for the giant KALI KALI wordmark, normal width for headings) · Geist (body) ·
Geist Mono (labels) · Instrument Serif italic (one accent word per headline at most).

**Shapes.** Thin grid lines, square-ish 14–20 px radii, pill tags, hairline callouts, numbered index labels.

**Motion (bloopsbaby B vocabulary + Forsa).**
- Lenis + GSAP; header hides on scroll down, shows on scroll up.
- Veil page transitions (yellow, clip-path inset) with the logo; first visit: veil + 000→100 counter.
- Ring cursor (fine pointers only) that grows with a label: View / Play / Add / Drag.
- Reveals: `[data-rise]` blur-up, `[data-unmask]` arch clip reveal, `[data-lines]` line/word mask rise.
- **Travelling pack (signature, replaces the travelling WebGL bubble):** a fixed-layer pack moves between slot
  elements down the home page as you scroll (interpolated position, scale, 3D turn, velocity tilt, soft shadow),
  with corn sticks orbiting it in the hero; at the "Taste the crunch" slot it bursts open and sticks spill out;
  reforms when you scroll back. Mobile: hero and final slot only.
- Scroll-lit statement with inline image pills (words light up with scrub).
- Pack anatomy: hairline callouts draw in (SVG stroke), dots pulse, each opens a pop-up.
- Full-bleed image reveal (clip-path from inset card to full width).
- Nutrition stats around the pack; flavour switch rolls the numbers.
- Yellow claims marquee strip.
- **Pinned horizontal "A day with Kali Kali":** 10:00 lunchbox · 15:00 the 3 PM break · 17:30 after school ·
  21:00 game night; background tint shifts per panel; timeline segments fill; each card "Pair with …".
- Numbered method cards 01–04 (big yellow numbers).
- Trade channel list with a hover image that follows the cursor.
- Quote cycle for reviews; counters; parallax.

**Pages.**
- **Home:** hero (corner mono labels, orbiting sticks, travelling pack, giant KALI KALI wordmark, vertical flavour
  selector that swaps pack + tint) · "Built for the crunch." scroll-lit statement · pack anatomy · full-bleed
  photo reveal "Super crispy. Made from corn." · nutrition stats · claims marquee · the range (4 cards) · pinned
  day timeline · method 01–04 · "Taste the crunch" (pack bursts) · partner with ABIN (channel list, stats,
  catalogue download, enquiry) · reels · reviews · expos marquee · yellow footer panel with wordmark.
- **Shop:** "The range." · Retail/Trade switch · Retail: filter chips, size, sort, cards (tint, pack, specs, add,
  view) · Trade: per-SKU spec cards with an SVG EAN-13 barcode, weight, shelf life, carton qty, "Add to enquiry"
  list → send enquiry · quick-view pop-up with label zoom.
- **Product:** split hero (pack on tint panel with zoom lens, details, size, qty, add, Shopee) · specs table with
  barcode · nutrition card · flavour clip · moment pairing · other flavours · next flavour.
- **About:** "Made in Rawang. Built for everywhere." · arch-unmasked team photo · scroll-lit story · timeline ·
  counters · certifications · full-bleed crew photo · trade CTA.
- **Benefits ("The formula"):** "What's in. What's not." (animated strike-throughs) · flavour ingredient circles ·
  sticky claims deep-dive · kcal bars · who it's for · FAQ teaser.
- **FAQ:** sticky left column (title, search, categories) · hairline accordion · CTA.
- **Contact ("Let's grow together."):** contact cards · segmented forms (Trade enquiry with SKU checklist and
  cartons, Affiliate, Hello) · map · socials.

## 7. Shared behaviour (both concepts)

- **Clickable everything that matters:** product cards → quick-view pop-up → product page; images, posters,
  shelf photos → lightbox; videos → lightbox with sound; claims, certifications, callouts → info pop-ups;
  moment cards → pop-up with the matching ad; channel items → enquiry form. Deep links: `shop.html#spicy`
  opens that quick view.
- **Pop-ups** use `<dialog>` with focus return, Esc/backdrop close, scroll lock, animated in/out.
- **Bag:** localStorage (`abin-a-bag` / `abin-b-bag`), qty steppers, live RM subtotal, fly-to-bag; checkout
  composes a WhatsApp message (items, sizes, quantities, subtotal) and offers Shopee. Nothing is charged.
- **Forms** (wholesale/trade, affiliate, hello) validate inline and compose WhatsApp or email (mailto) messages.
- **FAQ search** filters by words across question and answer, case/diacritic-insensitive.
- **Accessibility:** semantic landmarks, keyboard reachable controls, visible focus, alt text describing what
  each photo shows, `prefers-reduced-motion` collapses all motion (canvas static, no pins, instant reveals),
  content readable with JS off (`.js` class gates hidden-until-animated states).
- **Responsive:** designed at 1440 and 390; pinned/horizontal scenes degrade to stacked layouts below 900 px.
- **Performance:** WebP images with sizes, lazy loading below the fold, videos `preload="none"` with posters,
  canvas pauses off-screen and when the tab is hidden, DPR capped at 2.

## 8. Testing and verification

- `node --test tests/`: EAN-13 validity of all barcodes; data integrity (4 flavours, 2 sizes each, prices are
  numbers, every flavour has kcal/diet/colours/images); cart maths (add, merge, qty clamp, remove, subtotal
  rounding); WhatsApp order message (encoding, line items, total); trade enquiry message; FAQ search.
- Playwright: screenshot every page of both sites at 1440 × 900 and 390 × 844; no console errors; open and close
  a quick view, add to bag, open the bag, build a WhatsApp link, open a lightbox, use FAQ search, switch
  Retail/Trade; reduced-motion pass.

## 9. Out of scope

Real payments or order submission, CMS, translations beyond the BM/中文 touches in copy, pushing to GitHub
(only on request), Oat Salted Egg flavour.
