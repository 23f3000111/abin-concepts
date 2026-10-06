/* ABIN · content shared by both concepts. Edit copy and prices here, then run: node tools/sync.js
   Sources: ABIN's packs and posters, ABIN PACKAGING.pdf, the 2024 product catalogue, their Facebook page and
   Linktree, and the HIP (hip.hdcglobal.com) article. Anything marked placeholder or confirm still needs ABIN's OK. */
(function (root) {
  'use strict';
  var A = root.ABIN = root.ABIN || {};

  A.data = {
    brand: {
      name: 'ABIN Snack Food',
      legal: 'ABIN Manufacturing Sdn. Bhd.',
      reg: '202401028301 (1574148-D)',
      product: 'Kali Kali Crunchy Corn Stick',
      address: ['No. 22 (Ground Floor), Jalan BJ 2', 'Taman Perindustrian Belmas Johan', '48000 Rawang, Selangor, Malaysia'],
      phone: '+60 19-976 1857',
      email: 'abinsnackfood@gmail.com',
      areas: ['Kuala Lumpur', 'Kepong', 'Petaling Jaya', 'Puchong']
    },

    links: {
      shopee: 'https://shopee.com.my/abin_snack',
      whatsapp: 'https://wa.me/message/GPFMZ6A6OSM6G1',
      waNumber: '60199761857', /* confirm: used for prefilled order messages */
      facebook: 'https://www.facebook.com/profile.php?id=100068376395220',
      instagram: 'https://www.instagram.com/abin_snackfood/',
      tiktok: 'https://www.tiktok.com/@abinsnackfood',
      linkedin: 'https://www.linkedin.com/in/abin-corn-stick-559017340',
      xiaohongshu: 'https://www.xiaohongshu.com/user/profile/652f81d1000000002a028840',
      lemon8: 'https://s.lemon8-app.com/s/GgUMFmFwb',
      linktree: 'https://linktr.ee/aBinCornStick',
      map: 'https://www.google.com/maps/search/?api=1&query=Jalan+BJ+2+Taman+Perindustrian+Belmas+Johan+48000+Rawang+Selangor',
      mapEmbed: 'https://maps.google.com/maps?q=Jalan%20BJ%202%2C%20Taman%20Perindustrian%20Belmas%20Johan%2C%2048000%20Rawang%2C%20Selangor&z=15&output=embed'
    },

    lines: {
      main: 'Kali cuba, kali nak lagi!',
      mainEn: 'Try it once, you will want it again!',
      crunch: 'Rangup setiap gigitan!',
      crunchEn: 'Crunchy in every bite!',
      forAll: 'Snek jagung rangup & lazat untuk semua!',
      forAllEn: 'Delicious & nutritious corn snack for everyone!',
      tomorrow: 'Healthy snacking for a better tomorrow',
      brighter: 'Good snacks, brighter lives',
      grow: 'Let’s grow together',
      threePm: 'It’s 3PM, time for ABIN Kali Kali!',
      tag: '#MyEverydaySnack',
      game: 'Good game, great snack, better together!',
      crispy: 'Super crispy!!! Made from corn',
      kids: 'Makanan snek yang sihat untuk anak anda',
      spicy: 'Rangup, pedas, ketagih!'
    },

    stats: { dailyKg: 90, dailyUnits: 1500, recommendPct: 98, reviewCount: 28, followers: '3.4K', expos: 5, flavours: 4, shelfMonths: 18, cartonPacks: 36 },

    sizes: [
      { g: 30, shelfMonths: 18, cartonPacks: 36, price: 4.5, placeholder: true },
      { g: 60, shelfMonths: 12, cartonPacks: 20, price: 8.9, placeholder: false,
        confirm: '60 g shelf life, carton size and barcodes are from the 2024 catalogue; RM 8.90 is from a Malaysian shelf tag' }
    ],

    flavours: [
      {
        id: 'spicy', name: 'Spicy', bm: 'Pedas', zh: '香辣味', word: 'PEDAS',
        tagline: 'Bold & exciting', line: 'Rangup, pedas, ketagih!',
        blurb: 'Golden corn sticks rolled in a red chilli seasoning that builds with every bite. Our best seller, and properly pedas.',
        notes: ['Red chilli heat', 'Savoury corn crunch', 'Slow-building spice'],
        kcal: 158, daily: 8, diet: 'vegetarian', badge: 'Best seller', heat: 3, tags: ['spicy'],
        color: { pack: '#8E1B1B', pop: '#E8402A', deep: '#9E1C1C', tint: '#F6DCD6', on: '#FFFFFF' },
        barcode: { 30: '9555083708103', 60: '9555083708202' },
        ingredient: 'Red chilli',
        img: {
          30: 'assets/img/packs/spicy-30.webp', 60: 'assets/img/packs/spicy-60.webp',
          stick: 'assets/img/sticks/stick-spicy.webp', orb: 'assets/img/orbs/chilli.webp',
          clip: 'assets/video/flavour-spicy.mp4', clipPoster: 'assets/video/flavour-spicy.jpg'
        }
      },
      {
        id: 'cheese', name: 'Cheese', bm: 'Keju', zh: '芝士味', word: 'KEJU',
        tagline: 'Creamy & yummy', line: 'Cheesy crunch, every time.',
        blurb: 'A rich, creamy cheese seasoning on a crunchy corn twist. The one the kids reach for first.',
        notes: ['Creamy cheese', 'Buttery corn', 'Mellow and moreish'],
        kcal: 167, daily: 8, diet: 'vegetarian', badge: null, heat: 0, tags: ['mild'],
        color: { pack: '#E9A91E', pop: '#FFC21A', deep: '#B86E00', tint: '#FBEBC2', on: '#2B1408' },
        barcode: { 30: '9555083708110', 60: '9555083708219' },
        ingredient: 'Cheese',
        img: {
          30: 'assets/img/packs/cheese-30.webp', 60: 'assets/img/packs/cheese-60.webp',
          stick: 'assets/img/sticks/stick-cheese.webp', orb: 'assets/img/orbs/cheese.webp',
          clip: 'assets/video/flavour-cheese.mp4', clipPoster: 'assets/video/flavour-cheese.jpg'
        }
      },
      {
        id: 'original', name: 'Original', bm: 'Asli', zh: '原味', word: 'ASLI',
        tagline: 'Crispy & delicious', line: 'Simply delicious, perfectly crunchy.',
        blurb: 'Just the corn, done right: a light, golden twist with a clean sweetcorn taste. Vegan-friendly.',
        notes: ['Sweet corn', 'Light and crispy', 'Lightly salted'],
        kcal: 174, daily: 9, diet: 'vegan', badge: null, heat: 0, tags: ['mild', 'vegan'],
        color: { pack: '#C9B98F', pop: '#FFE7A3', deep: '#B07A00', tint: '#F2ECDB', on: '#2B1408' },
        barcode: { 30: '9555083708080', 60: '9555083708172' },
        ingredient: 'Sweet corn',
        img: {
          30: 'assets/img/packs/original-30.webp', 60: 'assets/img/packs/original-60.webp',
          stick: 'assets/img/sticks/stick-original.webp', orb: 'assets/img/orbs/corn.webp',
          clip: 'assets/video/flavour-original.mp4', clipPoster: 'assets/video/flavour-original.jpg'
        }
      },
      {
        id: 'seaweed', name: 'Seaweed', bm: 'Rumpai Laut', zh: '海苔味', word: 'RUMPAI LAUT',
        tagline: 'Light & savoury', line: 'Ocean-fresh nori on golden corn.',
        blurb: 'Toasted nori seaweed on a crunchy corn stick: light, savoury and seriously snackable. Our signature, and vegan-friendly.',
        notes: ['Toasted nori', 'Light sea salt', 'Savoury umami'],
        kcal: 162, daily: 8, diet: 'vegan', badge: 'Signature', heat: 0, tags: ['mild', 'vegan'],
        color: { pack: '#14284B', pop: '#2F6FE4', deep: '#14284B', tint: '#DCE5F2', on: '#FFFFFF' },
        barcode: { 30: '9555083708097', 60: '9555083708189' },
        ingredient: 'Nori seaweed',
        img: {
          30: 'assets/img/packs/seaweed-30.webp', 60: 'assets/img/packs/seaweed-60.webp',
          stick: 'assets/img/sticks/stick-seaweed.webp', orb: 'assets/img/orbs/nori.webp',
          clip: 'assets/video/flavour-seaweed.mp4', clipPoster: 'assets/video/flavour-seaweed.jpg'
        }
      }
    ],

    bundles: [
      { id: 'variety-4', name: 'Variety 4-pack', label: '4 × 30 g, one of each', price: 16.9, placeholder: true,
        img: 'assets/img/packs/variety.webp', contains: ['spicy-30', 'cheese-30', 'original-30', 'seaweed-30'],
        blurb: 'Can’t decide? One of each flavour: Spicy, Cheese, Original and Seaweed.' }
    ],

    claims: [
      { id: 'plant', title: 'Plant-based', bm: 'Berasaskan tumbuhan', icon: 'leaf',
        short: 'Made from corn and plant ingredients.',
        long: 'Kali Kali is made from corn and plant-based ingredients. Original and Seaweed are vegan-friendly, and Spicy and Cheese are suitable for vegetarians.' },
      { id: 'gluten', title: 'Gluten-free', bm: 'Bebas gluten', icon: 'wheat-off',
        short: 'The recipe now uses gluten-free corn.',
        long: 'ABIN moved the recipe to gluten-free corn so more people can enjoy it, and every pack is labelled gluten-free.' },
      { id: 'preservatives', title: 'No preservatives', bm: 'Tanpa pengawet', icon: 'flask-off',
        short: 'Nothing added to stretch the shelf life.',
        long: 'There are no added preservatives. The packs are sealed fresh instead, with an 18-month shelf life on the 30 g pack.' },
      { id: 'transfat', title: '0% trans fat', bm: 'Lemak trans sifar', icon: 'heart',
        short: 'Zero trans fat, made from corn.',
        long: 'Every pack is labelled 0% trans fat, and ABIN describes Kali Kali as made from corn, not deep-fried.' },
      { id: 'nongmo', title: 'Non-GMO corn', bm: 'Jagung bukan GMO', icon: 'corn',
        short: 'Quality corn you can trust.',
        long: 'It all starts with non-GMO corn, the same promise ABIN prints on its packs and trade banners.' },
      { id: 'halal', title: 'Halal certified', bm: 'Halal diperakui', icon: 'halal',
        short: 'Certified by JAKIM (MS1500).',
        long: 'ABIN is halal-certified by JAKIM, Malaysia’s halal authority. Look for MS1500 and the halal logo on every pack.' }
    ],

    certs: [
      { id: 'halal', title: 'Halal JAKIM', body: 'Jabatan Kemajuan Islam Malaysia', img: 'assets/img/certs/halal.webp',
        short: 'MS1500 halal certification',
        long: 'Kali Kali is certified halal by JAKIM under the MS1500 standard, and the halal logo is printed on every pack.' },
      { id: 'mesti', title: 'MeSTI', body: 'Ministry of Health Malaysia', img: 'assets/img/certs/mesti.webp',
        short: 'Food-safety assurance',
        long: 'MeSTI (Makanan Selamat Tanggungjawab Industri) is the Ministry of Health’s food-safety certification for manufacturers. ABIN holds it, which also matters to trade buyers.' },
      { id: 'myipo', title: 'MyIPO registered', body: 'Intellectual Property Corporation of Malaysia', img: null,
        short: 'Registered trademark',
        long: 'The ABIN name and Kali Kali are registered with MyIPO, so the brand on the shelf is the real thing.' },
      { id: 'produk', title: 'Produk Malaysia', body: 'Buatan Malaysia', img: 'assets/img/certs/produk.webp',
        short: 'Made in Malaysia',
        long: 'Every pack is made at ABIN’s own factory in Rawang, Selangor, and carries the Buatan Malaysia mark.' }
    ],

    faqs: [
      { cat: 'product', q: 'What is Kali Kali?',
        a: 'Kali Kali is ABIN’s crunchy twisted corn stick. It is made from corn, plant-based, gluten-free and halal, and it is made by ABIN Snack Food in Rawang, Selangor.' },
      { cat: 'product', q: 'Which flavours are there?',
        a: 'Four: Spicy (our best seller), Cheese, Original and Seaweed (our signature). Each comes in a 30 g and a 60 g pack, and the Variety 4-pack has one of each.' },
      { cat: 'product', q: 'Is Kali Kali fried?',
        a: 'ABIN describes Kali Kali as made from corn, not deep-fried, and every pack is labelled 0% trans fat.' },
      { cat: 'product', q: 'How long does a pack keep?',
        a: 'Unopened 30 g packs have an 18-month shelf life; check the date on 60 g packs. Store them somewhere cool and dry, and finish an opened pack quickly so it stays crunchy.' },
      { cat: 'product', q: 'How many calories are in a serving?',
        a: 'One 30 g serving has 158 kcal (Spicy), 167 kcal (Cheese), 174 kcal (Original) or 162 kcal (Seaweed). That is 8 to 9% of a 2,000 kcal day.' },
      { cat: 'diet', q: 'Is Kali Kali halal?',
        a: 'Yes. ABIN is halal-certified by JAKIM (MS1500), and the halal logo is on every pack.' },
      { cat: 'diet', q: 'Is it gluten-free?',
        a: 'Yes. The recipe uses gluten-free corn and every pack is labelled gluten-free.' },
      { cat: 'diet', q: 'Is it vegan or vegetarian?',
        a: 'All four flavours are plant-based. Original and Seaweed are vegan-friendly; Spicy and Cheese are suitable for vegetarians.' },
      { cat: 'diet', q: 'Does it contain preservatives?',
        a: 'No. Kali Kali has no added preservatives and 0% trans fat.' },
      { cat: 'diet', q: 'Is it suitable for kids?',
        a: 'Kali Kali is made for everyone, and ABIN’s own posters call it a healthy snack for your kids. Spicy really is spicy, so little ones may prefer Cheese or Original. Check the pack for the full ingredient and allergen list.' },
      { cat: 'order', q: 'Where can I buy Kali Kali?',
        a: 'On ABIN’s Shopee store, by WhatsApp, and on the snack shelves of selected supermarkets and convenience stores.' },
      { cat: 'order', q: 'How does ordering on this website work?',
        a: 'Add packs to your bag, then tap “Order on WhatsApp”. Your order arrives as a ready-made message, and ABIN confirms the total, payment and delivery with you there. Prefer a marketplace? Buy on Shopee.' },
      { cat: 'order', q: 'Do you deliver?',
        a: 'Shopee orders are delivered across Malaysia. For WhatsApp orders, ABIN arranges delivery or pick-up with you in the chat.' },
      { cat: 'trade', q: 'Can I stock Kali Kali in my shop?',
        a: 'Yes. 30 g packs come 36 to a carton with an 18-month shelf life, and every pack carries an EAN-13 barcode. Send a trade enquiry and ABIN will reply with trade prices.' },
      { cat: 'trade', q: 'Do you export?',
        a: 'Yes. ABIN already ships bulk orders to the UAE and has exhibited in Tokyo, Thailand and Singapore. Distributors and importers are welcome to get in touch.' },
      { cat: 'trade', q: 'Do you do corporate gifts and events?',
        a: 'Yes, corporate gifts and promotions are one of ABIN’s channels. Send a trade enquiry with your quantity and date.' },
      { cat: 'trade', q: 'How much can ABIN make?',
        a: 'The Rawang factory makes about 90 kg of Kali Kali a day, roughly 1,500 packs.' },
      { cat: 'affiliate', q: 'How does the affiliate programme work?',
        a: 'Share Kali Kali and earn a 15% commission on every successful sale. Joining is free.' },
      { cat: 'affiliate', q: 'Who can join?',
        a: 'Content creators, food reviewers and food lovers, anyone after a side income, and online sellers. Mudah, pantas dan percuma: easy, fast and free.' },
      { cat: 'affiliate', q: 'How do I sign up?',
        a: 'Fill in the affiliate form on the contact page or message ABIN on WhatsApp, and the team will set you up.' }
    ],

    quiz: [
      { q: 'How hot do you like it?', options: [
        { label: 'Bring the heat', sub: 'Pedas sangat!', score: { spicy: 3 } },
        { label: 'A little kick', sub: 'Just enough', score: { spicy: 1, seaweed: 1, cheese: 1 } },
        { label: 'No heat, thanks', sub: 'Keep it mellow', score: { original: 2, cheese: 1 } } ] },
      { q: 'When do you snack?', options: [
        { label: 'The 3 PM break', sub: 'Recharge time', score: { seaweed: 2, original: 1 } },
        { label: 'Game night', sub: 'With the gang', score: { spicy: 2, cheese: 1 } },
        { label: 'Lunchbox or after school', sub: 'For the kids', score: { cheese: 2, original: 1 } } ] },
      { q: 'Pick a vibe', options: [
        { label: 'Classic and simple', sub: 'Pure corn crunch', score: { original: 3 } },
        { label: 'Creamy and comforting', sub: 'Cheesy all the way', score: { cheese: 3 } },
        { label: 'Light and savoury', sub: 'Ocean-fresh nori', score: { seaweed: 3 } } ] }
    ],

    moments: [
      { id: 'recess', time: '10:30', ampm: 'am', title: 'Recess crunch', pair: 'spicy',
        text: 'The Spicy pack is the playground favourite. Prefer it mild? Cheese is the lunchbox hero.',
        img: 'assets/img/stills/recess.webp', video: 'assets/video/reel-5.mp4' },
      { id: 'threepm', time: '3:00', ampm: 'pm', title: 'It’s 3PM!', pair: 'seaweed',
        text: 'Time for ABIN Kali Kali: a light, savoury recharge for your afternoon break, perfect with your coffee.',
        img: 'assets/img/posters/its-3pm.webp', video: null },
      { id: 'family', time: '5:30', ampm: 'pm', title: 'Family snack time', pair: 'original',
        text: 'Bowls on the table, everyone digging in. Original is pure corn crunch that the whole family agrees on.',
        img: 'assets/img/stills/family.webp', video: 'assets/video/reel-4.mp4' },
      { id: 'gamenight', time: '9:00', ampm: 'pm', title: 'Game night', pair: 'cheese',
        text: 'Good game, great snack, better together! Creamy Cheese and fiery Spicy, gone by half-time.',
        img: 'assets/img/posters/game-night.webp', video: null }
    ],

    channels: [
      { id: 'supermarkets', title: 'Supermarkets & hypermarkets', img: 'assets/img/channels/supermarket.webp',
        text: 'Shelf-ready 30 g and 60 g packs with EAN-13 barcodes, packed 36 to a carton (30 g).' },
      { id: 'convenience', title: 'Convenience stores', img: 'assets/img/channels/convenience.webp',
        text: 'A bright, compact pack for the snack rack. Already on Malaysian shelves at RM 8.90 for 60 g.' },
      { id: 'horeca', title: 'Food service & HORECA', img: 'assets/img/channels/horeca.webp',
        text: 'Café counters, bar snacks and hotel minibars: a halal, gluten-free crunch that suits every table.' },
      { id: 'gifts', title: 'Corporate gifts & promotions', img: 'assets/img/channels/gifts.webp',
        text: 'Variety packs for hampers, events and festive gifting. Tell us your quantity and date.' },
      { id: 'export', title: 'Distributors & export', img: 'assets/img/channels/export.webp',
        text: 'Bulk orders already ship to the UAE. Halal and MeSTI certified, with an 18-month shelf life (30 g).' }
    ],

    expos: [
      { year: '2024', name: 'MIHAS', place: 'Kuala Lumpur, Malaysia', note: 'Malaysia International Halal Showcase' },
      { year: '2024', name: 'Japan Malaysia Fair', place: 'Tokyo, Japan', note: 'Kali Kali’s first trip to Japan' },
      { year: '2024', name: 'Maroi Festival', place: 'Thailand', note: 'Meeting snack lovers across the border' },
      { year: '', name: 'SIAL B2B Exhibition', place: 'MITEC, Kuala Lumpur', note: 'The first international B2B SIAL show in Malaysia' },
      { year: '', name: 'First Malaysia Fest', place: 'Singapore', note: 'Malaysian brands in Singapore' }
    ],

    reviews: [
      { name: 'Aina R.', place: 'Shah Alam', flavour: 'spicy', stars: 5, sample: true,
        text: 'Rangup gila and the spice keeps building. The Spicy pack never makes it home unopened.' },
      { name: 'Mei Ling T.', place: 'Petaling Jaya', flavour: 'seaweed', stars: 5, sample: true,
        text: 'The seaweed one is my 3 PM thing now. Light, savoury and not oily at all.' },
      { name: 'Priya K.', place: 'Puchong', flavour: 'cheese', stars: 5, sample: true,
        text: 'My kids fight over the Cheese pack. I like that it is halal, gluten-free and has no preservatives.' },
      { name: 'Hafiz M.', place: 'Kepong', flavour: 'original', stars: 5, sample: true,
        text: 'Original is pure corn crunch. Perfect with a teh tarik.' },
      { name: 'Daniel L.', place: 'Kuala Lumpur', flavour: 'spicy', stars: 5, sample: true,
        text: 'Bought a box for football night. Gone by half-time.' },
      { name: 'Nurul H.', place: 'Rawang', flavour: 'cheese', stars: 5, sample: true,
        text: 'Local, halal and the new packs look great on the shelf. Proud of this Rawang brand!' }
    ],

    media: {
      reels: [
        { src: 'assets/video/reel-1.mp4', poster: 'assets/video/reel-1.jpg', title: 'Four flavours, one crunch' },
        { src: 'assets/video/reel-2.mp4', poster: 'assets/video/reel-2.jpg', title: 'Spicy, Cheese, Original, Seaweed' },
        { src: 'assets/video/reel-3.mp4', poster: 'assets/video/reel-3.jpg', title: 'Which flavour will you choose?' },
        { src: 'assets/video/reel-4.mp4', poster: 'assets/video/reel-4.jpg', title: 'Snack time, family time' },
        { src: 'assets/video/reel-5.mp4', poster: 'assets/video/reel-5.jpg', title: 'The Spicy fan' },
        { src: 'assets/video/reel-6.mp4', poster: 'assets/video/reel-6.jpg', title: 'Try ABIN Kali Kali today' }
      ],
      posters: [
        { src: 'assets/img/posters/four-flavours-en.webp', alt: 'ABIN Kali Kali poster in English: four flavour packs in a corn field, “Delicious & nutritious corn snack for everyone!”' },
        { src: 'assets/img/posters/four-flavours-bm.webp', alt: 'ABIN Kali Kali poster in Bahasa Malaysia: “Snek jagung rangup & lazat untuk semua!” with the four packs' },
        { src: 'assets/img/posters/four-flavours-zh.webp', alt: 'ABIN Kali Kali poster in Chinese with the four flavour packs and corn sticks on a wooden table' },
        { src: 'assets/img/posters/banner.webp', alt: 'ABIN trade banner: “Corn Stick, healthy snacking for a better tomorrow” with the four packs, claims and business channels' },
        { src: 'assets/img/posters/its-3pm.webp', alt: 'Poster: “It’s 3PM, time for ABIN Kali Kali!” with a bowl of seaweed corn sticks and a coffee' },
        { src: 'assets/img/posters/game-night.webp', alt: 'Poster: friends cheering at a football match on TV with Kali Kali packs and bowls on the table' },
        { src: 'assets/img/posters/affiliate.webp', alt: 'Poster in Bahasa Malaysia: “Jom jadi affiliate bersama kami”, 15% commission for every successful sale' },
        { src: 'assets/img/posters/bold-flavour.webp', alt: 'Poster: “Bold flavor, crispy satisfaction! Spicy, savory, addictive!” with a Spicy pack and chilli' }
      ],
      shelves: [
        { src: 'assets/img/photo/shelf-1.webp', alt: 'Kali Kali packs on a Malaysian supermarket rack next to other snacks, priced RM 8.99' },
        { src: 'assets/img/photo/shelf-2.webp', alt: 'Kali Kali Spicy and Cheese packs on a Malaysian store shelf with a RM 8.90 price tag and a healthy-snack sign' },
        { src: 'assets/img/photo/shelf-3.webp', alt: 'Kali Kali packs on a supermarket shelf overseas between imported crisps' },
        { src: 'assets/img/photo/shelf-4.webp', alt: 'A close-up of Kali Kali packs on an overseas supermarket shelf' }
      ],
      team: { src: 'assets/img/photo/team.webp', alt: 'The ABIN team in orange shirts, arms crossed, in front of the ABIN snack factory sign in Rawang' },
      bowlHero: { src: 'assets/img/photo/bowl-hero.webp', alt: 'Spicy Kali Kali corn sticks heaped in a wooden bowl on linen, with red chillies' },
      bowlCrispy: { src: 'assets/img/photo/bowl-crispy.webp', alt: 'A wooden bowl of crinkly, chilli-dusted Kali Kali corn sticks with more sticks on the plate' }
    }
  };
}(typeof window !== 'undefined' ? window : globalThis));
