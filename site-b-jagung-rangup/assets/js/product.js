/* ABIN · Concept B "Jagung Rangup" · product page extras: the flavour clip opens with sound in the lightbox, the
   giant flavour word fits the stage, and the pack, sticks and panel make their entrance. shop.js renders the data. */
(function () {
  'use strict';
  var A = window.ABIN, $ = A.$, $$ = A.$$, fx = A.fx || {};
  var html = document.documentElement;
  var reduce = A.env.reduce, hasGSAP = !!window.gsap;
  var FLAV = {};
  A.data.flavours.forEach(function (f) { FLAV[f.id] = f; });
  var stage = $('.pp-hero__stage'), word = $('.pp-hero__word'), clip = $('[data-pp-clip]');
  if (!stage) return;

  /* size the giant flavour word to the stage: measure it at 100px, then scale */
  var fitWord = function () {
    if (!word) return;
    word.style.fontSize = '100px';
    var w = word.scrollWidth || 1;
    word.style.fontSize = Math.min(240, 100 * stage.clientWidth * 0.98 / w).toFixed(1) + 'px';
  };
  var sync = function () {
    var f = FLAV[html.getAttribute('data-flavour')];
    if (!f) return;
    if (clip) {
      clip.setAttribute('data-lightbox', f.img.clip);
      clip.setAttribute('data-poster', f.img.clipPoster);
      clip.setAttribute('data-caption', 'Kali Kali ' + f.name + ', from ABIN’s ad');
    }
    fitWord();
  };
  sync();
  html.addEventListener('abin:product', function () {
    sync();
    if (hasGSAP && !reduce) gsap.fromTo('.pp-hero__pack img', { rotate: -8, scale: 0.92 }, { rotate: 0, scale: 1, duration: 0.8, ease: 'back.out(2)' });
  });
  window.addEventListener('resize', fitWord);

  if (!hasGSAP || reduce) return;
  Promise.all([fx.ready, fx.fontsReady]).then(function () {
    fitWord();
    var tl = gsap.timeline();
    tl.from('.pp-hero__word', { yPercent: 40, opacity: 0, duration: 1.1, ease: 'power4.out' }, 0)
      .from('.pp-hero__pack', { y: 120, opacity: 0, duration: 1.1, ease: 'back.out(1.4)' }, 0.1)
      .from('.pp-hero__stick, .pp-hero__ing', { scale: 0, opacity: 0, duration: 0.9, ease: 'back.out(2.2)', stagger: 0.1 }, 0.5)
      .from('.pp-panel', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.25)
      .from('.pp-panel > *', { y: 18, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05 }, 0.4);
    $$('.pp-hero__stick, .pp-hero__ing').forEach(function (el, i) {
      gsap.to(el, { y: i % 2 ? 14 : -14, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });
    });
  });
}());
