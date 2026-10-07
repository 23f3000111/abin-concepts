# Concept A: Kali Nak Lagi!

Playful flavour-pop for Kali Kali corn sticks: corn-silk canvas, ABIN yellow and orange, chunky cartoon outlines and corn sticks raining down the page. Open `index.html` (or the chooser one folder up).

Tuned for desktop and laptop screens. Phone layouts exist but have not been checked yet.

## Pages

| Page | What is on it |
|---|---|
| `index.html` | Falling-stick hero, flavour marquee, pinned flavour scene, six promises, ABIN in numbers, featured packs, "Snack o'clock" moments, video ads, flavour quiz, shelf photos, affiliate promo, trade band, reviews, posters |
| `shop.html` | Filters (flavour, spicy or not, vegan-friendly, size, bundles), sort, nine product cards with quick view, how ordering works |
| `product.html?f=spicy&s=60` | One template for all eight packs: pack, size switch, quantity, add to bag, Shopee, taste notes, moment pairing, flavour clip, nutrition and pack facts, other flavours, next flavour |
| `about.html` | The story, values, the crew, the journey from Rawang to Tokyo and the UAE, certifications, numbers |
| `benefits.html` | Six promises as tabs, cob to crunch in four steps, calories per serving, diet questions |
| `faq.html` | Search and topics across 20 answers |
| `contact.html` | WhatsApp, call, e-mail and visit cards; forms for hello, wholesale and affiliates; map and socials |

## Try this in a demo

1. First visit: the popcorn loader, then the hero. Tap a falling corn stick to crunch it (the speaker button in the header mutes the sound).
2. Click any pack in the hero for a quick view, then "Add to bag". The pack flies into the bag.
3. Scroll through the flavour scene: the page changes colour for each flavour.
4. Tap Kali, the mascot in the bottom corner, for snack tips.
5. Take the "Which Kali Kali are you?" quiz on the home page.
6. Open the bag, add a name and area, and press "Order on WhatsApp": the order arrives as a ready-made message.
7. On the shop page, try "Vegan-friendly" and "Price, high to low". `shop.html#seaweed-30` opens that pack's quick view directly.
8. On the contact page, fill in the wholesale form: it checks the fields, then opens WhatsApp with the enquiry.

## Editing

- Copy, prices and facts: `../shared/js/data.js`, then `node tools/sync.js` from the project root.
- Page markup: `../src/site-a/` (layout, partials, pages), then `node tools/pages.js`. The `.html` files in this folder are generated; edit `src/` instead.
- Styles: `assets/css/base.css` (tokens, type, buttons), `chrome.css` (header, menu, footer, pop-ups, bag), `pages.css` (sections).
- Motion: `assets/js/fx.js` (loader, page transitions, reveals, sounds, mascot), `crunch.js` (falling sticks), `scenes.js` (flavour scene and inner-page moments). Shared behaviour is in `ui.js`, `shop.js` and `forms.js`.

## Placeholders

See `CREDITS.md`. In short: the 30 g and Variety 4-pack prices, all six reviews, the WhatsApp number for prefilled orders, the 60 g specs from the 2024 catalogue, allergen and ingredient detail, and Kali the mascot.
