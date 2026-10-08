# Kali Kali by ABIN: two website concepts

Two alternative seven-page websites for ABIN Snack Food's Kali Kali crunchy corn sticks, so the client can pick a direction. Both use the same real content and differ in look, motion and personality.

This round is tuned for desktop and laptop screens (1280 to 1920 px wide). Phone layouts exist but have not been checked yet; that work follows once a concept is chosen.

## Live

- **Chooser (both concepts):** <https://23f3000111.github.io/abin-concepts/>
- **Concept A, Kali Nak Lagi!:** <https://23f3000111.github.io/abin-concepts/site-a-kali-nak-lagi/>
- **Concept B, Jagung Rangup:** <https://23f3000111.github.io/abin-concepts/site-b-jagung-rangup/>

## Open it locally

- Double-click `index.html` in this folder. It is a chooser page that links to both concepts.
- Or open a concept directly: `site-a-kali-nak-lagi/index.html` and `site-b-jagung-rangup/index.html`.
- Everything is local, including the fonts, so the sites work offline and straight from disk. Only the Google map on the contact pages and the outbound links (WhatsApp, Shopee, socials) need the internet. No build step.
- For the smoothest result in a meeting, serve the folder instead of double-clicking: `python -m http.server 8811`, then open <http://127.0.0.1:8811/>.

## The two concepts

| | Concept A: Kali Nak Lagi! | Concept B: Jagung Rangup |
|---|---|---|
| Feel | Playful flavour-pop: chunky cartoon outlines, loud and fun like the crunch | Sharp and vibrant: bold colour blocks that change with every flavour |
| Palette | Corn silk, ABIN yellow, orange, sign blue, chocolate ink | ABIN sky blue with chilli red, cheddar orange, corn-husk green and nori cobalt, plus ABIN yellow and navy ink |
| Type | Anton, Rubik and Caveat Brush | Archivo (wide), Geist, and Geist Mono for real data such as barcodes |
| Hero | The four packs fanned out while corn sticks fall across the page; tap a stick to crunch it, with a sound you can mute | A giant KALI KALI wordmark around one pack with orbiting sticks; the flavour picker swaps the pack and recolours the page |
| Signature scroll | Pinned flavour scene that turns the page red, cheddar, cream or blue | One pack travels down the home page, turning as you scroll, and bursts into corn sticks at "Taste the crunch"; "A day with Kali Kali" scrolls sideways |
| Extras | Kali the corn-stick mascot with tips, a flavour quiz, popcorn loader, circle-wipe page transitions | Shop modes for snackers and for businesses (EAN-13 barcodes, carton sizes, enquiry list), label zoom, yellow veil page transitions, ring cursor |
| Folder | `site-a-kali-nak-lagi/` | `site-b-jagung-rangup/` |

Pages in each concept: Home, Shop, Product (one template: `product.html?f=spicy&s=60`, with `f` = spicy, cheese, original or seaweed and `s` = 30 or 60), Our story, Benefits ("Why Kali Kali" in A, "The formula" in B), FAQ and Contact. Every important card opens a pop-up, a lightbox or a page. The bag, checkout and forms work as demos: they compose a WhatsApp message (or an e-mail) that the visitor sends themselves. Nothing is charged or posted anywhere.

## What is real

Taken from ABIN's packs, `ABIN PACKAGING.pdf`, the 2024 catalogue, the Facebook page, Linktree and the HIP article:

- The four flavours with their Malay and Chinese names, taglines, calories per 30 g serving (Spicy 158, Cheese 167, Original 174, Seaweed 162) and diets (Spicy and Cheese vegetarian, Original and Seaweed vegan-friendly).
- The claims printed on the packs: plant-based, gluten-free, no preservatives, 0% trans fat, non-GMO corn, halal (JAKIM, MS1500); MeSTI, Produk Malaysia and the MyIPO trademark.
- EAN-13 barcodes, shelf life and carton sizes for both pack sizes, and RM 8.90 for 60 g (from a Malaysian shelf tag).
- The company, factory address in Rawang, phone, e-mail, delivery areas, about 90 kg (1,500 packs) a day, the five expos, bulk orders to the UAE, 98% recommend from 28 Facebook reviews, the trade channels and the 15% affiliate programme.
- Their own photos, posters, catalogue and packaging sheet (B offers both as downloads) and the six video ads.

## Placeholders to replace

- The 30 g price (RM 4.50) and the Variety 4-pack with its price (RM 16.90). The sites mark these prices with an asterisk and say ABIN confirms the total on WhatsApp.
- All six customer reviews are written samples, and the sites say so.
- The WhatsApp number used for prefilled orders (+60 19-976 1857).
- The 60 g shelf life, carton size and barcodes come from the 2024 catalogue; confirm them for the new pack.
- Allergen information and the full ingredient list (printed on the pack, not on the sites yet), plus delivery and payment terms for WhatsApp orders.
- Concept A's mascot, Kali, is our proposal, not an ABIN character.

Each concept's `README.md` has a click-through demo script, and its `CREDITS.md` lists every image source.

## Notes

- The ABIN logo is cut from their artwork and upscaled 4x. Swap in the vector logo when the client sends it.
- Packs are cut from ABIN's own pack renders; ingredient cut-outs come from the same renders. Two stock photos (a café and a gift box, both from Unsplash) illustrate the HORECA and corporate-gift trade channels.
- All copy, prices and facts live in `shared/js/data.js`, so they change in one place for both sites.
- Ready for GitHub Pages: `.nojekyll` is included, and `.gitignore` keeps `ui images/` and the two source PDFs out of the repo.

## Folder map

```
index.html               chooser page: start here
assets/                  chooser previews, logo and favicon
site-a-kali-nak-lagi/    Concept A, ready to open (built pages and assets)
site-b-jagung-rangup/    Concept B, ready to open
src/site-a, src/site-b   page sources: layout, partials and page bodies
shared/js/               content (data.js), cart and message logic (core.js), shared UI (ui.js, shop.js, forms.js, icons.js)
tools/                   page builder, shared-script sync, asset pipeline, font downloader
tests/                   automated checks for content, logic, pages and sync
docs/superpowers/        design spec and implementation plan
```

## Commands

Run from this folder.

```
node tools/pages.js        rebuild every page from src/ (run after editing src/)
node tools/sync.js         copy shared/js into both sites (run after editing shared/js)
node --test tests/         check content, cart maths, messages, barcodes and built pages
python tools/assets.py     regenerate images, video and PDFs (needs 'ui images/' and the two PDFs)
python tools/fonts.py      re-download the self-hosted fonts
```

`tools/assets.py` needs Python 3 with Pillow, NumPy, PyMuPDF and rembg, plus ffmpeg on the path. Pass section names to run only part of it, for example `python tools/assets.py packs orbs`.
