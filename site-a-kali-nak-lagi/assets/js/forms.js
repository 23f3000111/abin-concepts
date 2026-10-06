/* ABIN · forms, FAQ and quiz for both concepts.
   form[data-form="hello|trade|affiliate"] validates inline and opens a ready-made WhatsApp (or e-mail) message;
   nothing is posted anywhere. [data-faq-list] renders data.faqs with live search and category chips.
   [data-quiz] runs "Which Kali Kali are you?" (Concept A). */
(function () {
  'use strict';
  var A = window.ABIN, $ = A.$, $$ = A.$$, core = A.core, data = A.data, text = A.setText;
  var doc = document;
  var MAP = core.skuMap(data), IDS = Object.keys(MAP);

  /* -------------------------------------------------------------- forms */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var fieldError = function (input, msg) {
    var wrap = input.closest('.field') || input.parentElement;
    var err = $('.field-error', wrap);
    if (!err) { err = doc.createElement('p'); err.className = 'field-error'; err.id = (input.id || input.name) + '-error'; wrap.appendChild(err); }
    err.textContent = msg || '';
    err.hidden = !msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
  };
  var validate = function (form) {
    var first = null;
    $$('input, select, textarea', form).forEach(function (el) {
      if (el.type === 'checkbox' || el.type === 'radio' || el.type === 'hidden' || el.disabled) return;
      var v = el.value.trim(), msg = '';
      if (el.required && !v) msg = 'Please fill this in.';
      else if (v && el.type === 'email' && !EMAIL.test(v)) msg = 'That e-mail address does not look right.';
      else if (v && el.type === 'tel' && v.replace(/\D/g, '').length < 7) msg = 'Please enter a phone number we can reach.';
      fieldError(el, msg);
      if (msg && !first) first = el;
    });
    var group = $('[data-require-one]', form);
    if (group) {
      var any = $$('input[type="checkbox"]:checked', group).length > 0;
      var note = $('[data-require-one-error]', form);
      if (note) note.hidden = any;
      if (!any && !first) first = $('input[type="checkbox"]', group);
    }
    if (first) { first.focus(); return false; }
    return true;
  };
  var val = function (form, name) { var el = form.elements[name]; return el && el.value ? String(el.value).trim() : ''; };
  var build = {
    hello: function (f) { return { subject: 'Hello from the website', body: core.helloMessage({ name: val(f, 'name'), message: [val(f, 'message'), val(f, 'phone') && 'Phone: ' + val(f, 'phone'), val(f, 'email') && 'E-mail: ' + val(f, 'email')].filter(Boolean).join('\n') }) }; },
    affiliate: function (f) {
      return { subject: 'Kali Kali affiliate sign-up', body: core.affiliateMessage({ name: val(f, 'name'), platform: val(f, 'platform'), handle: val(f, 'handle'), followers: val(f, 'followers'), phone: val(f, 'phone') }) };
    },
    trade: function (f) {
      var items = $$('input[name="sku"]:checked', f).map(function (cb) {
        var n = f.elements['cartons-' + cb.value];
        return { label: MAP[cb.value].label, cartons: Math.max(1, Number(n && n.value) || 1) };
      });
      return { subject: 'Trade enquiry: ' + (val(f, 'business') || 'Kali Kali'), body: core.tradeMessage({ business: val(f, 'business'), type: val(f, 'type'), location: val(f, 'location'), name: val(f, 'name'), phone: val(f, 'phone'), email: val(f, 'email'), items: items, note: val(f, 'note') }) };
    }
  };
  $$('form[data-form]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') fieldError(e.target, ''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var kind = form.getAttribute('data-form'), msg = build[kind](form);
      var channel = (form.elements.channel && form.elements.channel.value) || 'whatsapp';
      var href = channel === 'email' ? core.mailtoLink(data.brand.email, msg.subject, msg.body) : core.waLink(data.links.waNumber, msg.body);
      var done = $('[data-form-done]', form);
      if (done) {
        done.hidden = false;
        var again = $('a', done);
        if (again) again.href = href;
      }
      form.classList.add('is-sent');
      form.dispatchEvent(new CustomEvent('abin:sent', { bubbles: true, detail: { kind: kind, href: href } }));
      if (channel === 'email') window.location.href = href;
      else window.open(href, '_blank', 'noopener');
    });
  });
  // Concept B: the trade enquiry list from the shop arrives as ?enquiry=spicy-30:5,... on the contact page
  var trade = $('form[data-form="trade"]');
  if (trade) {
    var pre = core.enquiryParse(new URLSearchParams(location.search).get('enquiry'), IDS);
    pre.forEach(function (x) {
      var cb = $('input[name="sku"][value="' + x.id + '"]', trade), n = trade.elements['cartons-' + x.id];
      if (cb) cb.checked = true;
      if (n) n.value = x.cartons;
    });
    if (pre.length) {
      var note = $('[data-prefilled]', trade);
      if (note) { note.hidden = false; text($('[data-prefilled-count]', note) || note, pre.length + (pre.length === 1 ? ' product' : ' products') + ' from your enquiry list'); }
    }
  }

  /* ---------------------------------------------------------------- FAQ */
  var CATS = { product: 'The snack', diet: 'Diet & halal', order: 'Ordering', trade: 'Wholesale & export', affiliate: 'Affiliates' };
  A.faqCats = CATS;
  $$('[data-faq-list]').forEach(function (list) {
    var tpl = $('#tpl-faq');
    if (!tpl) return;
    var only = list.getAttribute('data-cat');
    var limit = Number(list.getAttribute('data-limit')) || 0;
    var faqs = data.faqs.filter(function (f) { return !only || f.cat === only; });
    if (limit) faqs = faqs.slice(0, limit);
    var nodes = faqs.map(function (f, i) {
      var node = tpl.content.firstElementChild.cloneNode(true);
      node.setAttribute('data-cat', f.cat);
      node.style.setProperty('--i', i);
      text($('[data-slot="q"]', node), f.q);
      text($('[data-slot="a"]', node), f.a);
      text($('[data-slot="cat"]', node), CATS[f.cat]);
      text($('[data-slot="n"]', node), ('0' + (i + 1)).slice(-2));
      list.appendChild(node);
      return node;
    });
    if (A.hydrateIcons) A.hydrateIcons(list);
    var root = list.closest('[data-faq]') || doc;
    var search = $('[data-faq-search]', root), empty = $('[data-faq-empty]', root), count = $('[data-faq-count]', root);
    var cat = 'all';
    var apply = function () {
      var hits = core.faqSearch(faqs, search ? search.value : '', cat);
      nodes.forEach(function (n, i) { n.hidden = hits.indexOf(faqs[i]) === -1; });
      if (empty) empty.hidden = hits.length > 0;
      if (count) text(count, hits.length + (hits.length === 1 ? ' answer' : ' answers'));
      if (search && search.value && hits.length === 1) { var only1 = nodes[faqs.indexOf(hits[0])]; if (!only1.open) only1.open = true; }
    };
    if (search) search.addEventListener('input', apply);
    $$('[data-faq-cat]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-faq-cat');
        $$('[data-faq-cat]', root).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        apply();
      });
    });
    var reset = $('[data-faq-reset]', root);
    if (reset) reset.addEventListener('click', function () { if (search) search.value = ''; cat = 'all'; $$('[data-faq-cat]', root).forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-faq-cat') === 'all')); }); apply(); });
    apply();
  });

  /* --------------------------------------------------------------- quiz */
  $$('[data-quiz]').forEach(function (root) {
    var stage = $('[data-quiz-stage]', root), result = $('[data-quiz-result]', root), dots = $('[data-quiz-dots]', root);
    if (!stage) return;
    var picks = [];
    var showStep = function (i) {
      var q = data.quiz[i];
      while (stage.firstChild) stage.removeChild(stage.firstChild);
      var kicker = doc.createElement('p'); kicker.className = 'quiz__kicker'; kicker.textContent = 'Question ' + (i + 1) + ' of ' + data.quiz.length;
      var h = doc.createElement('h3'); h.className = 'quiz__q'; h.textContent = q.q;
      var opts = doc.createElement('div'); opts.className = 'quiz__opts';
      q.options.forEach(function (o, k) {
        var b = doc.createElement('button');
        b.type = 'button'; b.className = 'quiz__opt'; b.style.setProperty('--i', k);
        var l = doc.createElement('strong'); l.textContent = o.label;
        var s = doc.createElement('span'); s.textContent = o.sub;
        b.appendChild(l); b.appendChild(s);
        b.addEventListener('click', function () {
          picks[i] = o.score;
          if (i + 1 < data.quiz.length) showStep(i + 1); else finish();
        });
        opts.appendChild(b);
      });
      stage.appendChild(kicker); stage.appendChild(h); stage.appendChild(opts);
      stage.hidden = false;
      if (result) result.hidden = true;
      if (dots) $$('i', dots).forEach(function (d, k) { d.classList.toggle('is-on', k <= i); });
      root.dispatchEvent(new CustomEvent('abin:quiz-step', { bubbles: true, detail: { step: i } }));
    };
    var finish = function () {
      var id = core.quizResult(picks, data), f = data.flavours.filter(function (x) { return x.id === id; })[0];
      stage.hidden = true;
      if (!result) return;
      result.hidden = false;
      if (A.shop) A.shop.themeVars(result, f);
      text($('[data-qr="name"]', result), f.name);
      text($('[data-qr="bm"]', result), f.bm);
      text($('[data-qr="tagline"]', result), f.tagline);
      text($('[data-qr="blurb"]', result), f.blurb);
      var img = $('[data-qr="img"]', result);
      if (img) { img.src = f.img[60]; img.alt = 'Kali Kali ' + f.name + ' 60 g pack'; }
      var add = $('[data-qr-add]', result);
      if (add) add.setAttribute('data-add', f.id + '-60');
      var link = $('[data-qr-link]', result);
      if (link) link.href = 'product.html?f=' + f.id + '&s=60';
      if (dots) $$('i', dots).forEach(function (d) { d.classList.add('is-on'); });
      root.dispatchEvent(new CustomEvent('abin:quiz', { bubbles: true, detail: { flavour: f.id } }));
    };
    $$('[data-quiz-restart]', root).forEach(function (b) { b.addEventListener('click', function () { picks = []; showStep(0); }); });
    showStep(0);
  });
}());
