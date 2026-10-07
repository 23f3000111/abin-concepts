# Concept B: Jagung Rangup

Sharp and vibrant for Kali Kali corn sticks: ABIN sky blue, a saturated colour for every flavour, wide confident type and one pack that travels down the home page. Open `index.html` (or the chooser one folder up).

Tuned for desktop and laptop screens. Phone layouts exist but have not been checked yet.

## Pages

| Page | What is on it |
|---|---|
| `index.html` | KALI KALI hero with the flavour picker, the statement, "Read the pack" callouts, full-bleed photo, nutrition that rolls per flavour, claims marquee, the range, "A day with Kali Kali", how it's made, "Taste the crunch", trade channels, video ads, reviews, expos |
| `shop.html` | "For me" mode: filters, sort and nine product cards with quick view and label zoom. "For my business" mode: eight spec cards with EAN-13 barcodes, shelf life and carton size, an enquiry list and PDF downloads |
| `product.html?f=spicy&s=60` | One template for all eight packs, in the flavour's colour: label zoom, size switch, quantity, add to bag, Shopee, specs table with barcode, nutrition, taste notes, moment pairing, the flavour's ad clip, other flavours, next flavour |
| `about.html` | Team photo, the story, a timeline from MIHAS to the UAE, numbers, certifications, the crew |
| `benefits.html` | "What's in. What's not.", the four flavour ingredients, six promises explained, energy per serving, who it's for, diet questions |
| `faq.html` | Search and topics across 20 answers |
| `contact.html` | Contact cards; forms for trade enquiries, affiliates and hello; map and socials |

## Try this in a demo

1. First visit: the yellow veil counts 000 to 100, then lifts onto the hero.
2. Pick a flavour in the hero. The pack turns to the new flavour and the page takes its colour.
3. Scroll slowly: the pack travels from the hero to "Read the pack" and the nutrition section, then bursts into corn sticks at "Taste the crunch". Scroll back up and it comes back.
4. Keep scrolling through "A day with Kali Kali": it moves sideways and the page colour follows each moment.
5. Hover a trade channel in "Let's grow together": a photo follows the cursor. Click it for the details.
6. In the shop, switch to "For my business", add a few cartons and press "Send enquiry". The contact page opens with those packs already ticked.
7. Open any pack's quick view or product page and hover the pack: the lens magnifies the label.
8. Open the bag and press "Order on WhatsApp": the order arrives as a ready-made message.

## Editing

- Copy, prices and facts: `../shared/js/data.js`, then `node tools/sync.js` from the project root.
- Page markup: `../src/site-b/` (layout, partials, pages), then `node tools/pages.js`. The `.html` files in this folder are generated; edit `src/` instead.
- Colours: the canvases (sky, yellow and one per flavour) are defined at the top of `assets/css/base.css`. A section picks its canvas with `data-bg` in the page source.
- Styles: `base.css` (tokens, type, buttons), `chrome.css` (header, footer, pop-ups, bag, veil, cursor), `pages.css` (sections).
- Motion: `assets/js/fx.js` (transitions, reveals, cursor, page colour), `travel.js` (the travelling pack and hero), `scenes.js` (home and inner-page scenes), `product.js` (product page). Shared behaviour is in `ui.js`, `shop.js` and `forms.js`.

## Placeholders

See `CREDITS.md`. In short: the 30 g and Variety 4-pack prices, all six reviews, the WhatsApp number for prefilled orders, the 60 g specs from the 2024 catalogue, and allergen and ingredient detail.
