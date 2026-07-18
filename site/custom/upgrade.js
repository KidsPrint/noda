/* ============================================================
   NODA · site upgrade layer
   1) removes the legacy price calculator  → beautiful lead form
   2) removes the AI chat widget           → pulsing social FAB
   3) adds "Блог" link to nav & footer
   Idempotent + MutationObserver-guarded (survives hydration).
   ============================================================ */
(function () {
  'use strict';

  var EN = location.pathname.indexOf('/en') === 0;

  var LINKS = {
    tg:   'https://t.me/noda_development',
    wa:   'https://wa.me/79096860799',
    max:  'https://max.ru/u/f9LHodD0cOJGfW3zVbVkGUEQ1LOr394J8fSu2yMsS-q0I3xNV85OXhCz2Xg',
    tel:  'tel:+79096860799',
    mail: 'mailto:noda_development@mail.ru'
  };

  var T = EN ? {
    navLead: 'Request', navBlog: 'Blog',
    eyebrow: 'Leave a request',
    h2: 'Tell us about your task',
    sub: '<b style="color:var(--ink)">We reply within an hour</b> during business hours. One short call — and you get a plan, timeline and a fixed quote.',
    fName: 'Your name', fNamePh: 'John',
    fContact: 'Phone or Telegram', fContactPh: '+7 900 000-00-00 or @username',
    fService: 'What do you need?',
    fBudget: 'Approximate budget',
    fMsg: 'About the task', fMsgPh: 'A couple of sentences: what should we build and what problem does it solve?',
    services: ['Telegram bot', 'AI integration', 'Website / web-app', 'CRM', 'Analytics', 'Not sure yet'],
    budgets: ['under 50k ₽', '50–150k ₽', '150–300k ₽', '300k+ ₽', 'need advice'],
    sendTg: 'Send via Telegram', sendWa: 'Send via WhatsApp',
    consent: 'By sending the request you agree to the <a href="/en/politika-konfidencialnosti/">privacy policy</a>.',
    badge: '−30% off · until July 31',
    sideTitle: 'What happens next',
    sideSub: 'No calls from “managers” — the founders answer personally.',
    steps: [
      ['We reply within an hour', 'In Telegram, WhatsApp or by phone — wherever it suits you.'],
      ['15-minute brief', 'We clarify the task and immediately suggest a solution.'],
      ['Prototype & quote', 'You see a working prototype before committing to full development.']
    ],
    previewLbl: 'Your request',
    previewEmpty: 'pick a service and budget above',
    okTitle: 'The request is ready!',
    okTextTg: 'We opened the Telegram chat — the request text is already copied. Just paste it and press “Send”.',
    okTextWa: 'We opened WhatsApp with your request prefilled. Just press “Send”.',
    again: 'Fill in again',
    errContact: 'Please leave a phone number or @username so we can reply.',
    copied: 'Request text copied — paste it into the chat',
    inReq: 'In request', addLbl: 'Add',
    socTg: 'Telegram', socWa: 'WhatsApp', socMax: 'MAX', socTel: 'Call us', socMail: 'Email',
    fabAria: 'Contact us',
    addonsSub: 'Options most often taken with this service. Tap a module — we will add it to your request below.',
    reqTitle: 'Website request · NODA',
    lService: 'Service', lBudget: 'Budget', lTask: 'Task', lPage: 'Page', lAddons: 'Add-ons'
  } : {
    navLead: 'Заявка', navBlog: 'Блог',
    eyebrow: 'Оставить заявку',
    h2: 'Расскажите о задаче',
    sub: '<b style="color:var(--ink)">Отвечаем в течение часа</b> в рабочее время. Один короткий созвон — и у вас на руках план, сроки и зафиксированная смета.',
    fName: 'Ваше имя', fNamePh: 'Иван',
    fContact: 'Телефон или Telegram', fContactPh: '+7 900 000-00-00 или @username',
    fService: 'Что нужно сделать?',
    fBudget: 'Примерный бюджет',
    fMsg: 'О задаче', fMsgPh: 'Пара предложений: что хотим построить и какую проблему это решает?',
    services: ['Telegram-бот', 'Внедрение ИИ', 'Сайт / приложение', 'CRM', 'Аналитика', 'Пока не знаю'],
    budgets: ['до 50 тыс ₽', '50–150 тыс ₽', '150–300 тыс ₽', '300+ тыс ₽', 'нужен совет'],
    sendTg: 'Отправить в Telegram', sendWa: 'Отправить в WhatsApp',
    consent: 'Нажимая кнопку, вы соглашаетесь с <a href="/politika-konfidencialnosti/">политикой конфиденциальности</a>.',
    badge: 'Скидка −30% · до 31 июля',
    sideTitle: 'Что будет дальше',
    sideSub: 'Никаких «менеджеров по продажам» — отвечают сами разработчики.',
    steps: [
      ['Отвечаем в течение часа', 'В Telegram, WhatsApp или по телефону — как вам удобнее.'],
      ['Бриф на 15 минут', 'Уточняем задачу и сразу предлагаем решение.'],
      ['Прототип и смета', 'Сначала показываем работающий прототип — потом договариваемся о полной разработке.']
    ],
    previewLbl: 'Ваша заявка',
    previewEmpty: 'выберите услугу и бюджет выше',
    okTitle: 'Заявка готова!',
    okTextTg: 'Мы открыли чат в Telegram — текст заявки уже скопирован. Просто вставьте его и нажмите «Отправить».',
    okTextWa: 'Мы открыли WhatsApp с заполненной заявкой. Останется нажать «Отправить».',
    again: 'Заполнить ещё раз',
    errContact: 'Оставьте телефон или @username, чтобы мы могли ответить.',
    copied: 'Текст заявки скопирован — вставьте его в чат',
    inReq: 'В заявке', addLbl: 'Добавить',
    socTg: 'Telegram', socWa: 'WhatsApp', socMax: 'MAX', socTel: 'Позвонить', socMail: 'Почта',
    fabAria: 'Связаться с нами',
    addonsSub: 'Опции, которые чаще всего берут в этой услуге. Нажмите на модуль — добавим его в заявку ниже.',
    reqTitle: 'Заявка с сайта NODA',
    lService: 'Услуга', lBudget: 'Бюджет', lTask: 'Задача', lPage: 'Страница', lAddons: 'Допы'
  };

  var state = { services: [], budget: '', addons: [] };

  /* ---------- svg icons ---------- */
  var IC = {
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="#2AABEE"><path d="M21.9 4.6 18.9 19c-.2 1-.8 1.2-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-.9.5l.3-4.6L18.2 6c.4-.3-.1-.5-.6-.2L7.3 12.3 2.9 11c-1-.3-1-1 .2-1.4l17.5-6.7c.8-.3 1.5.2 1.3 1.7z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 13.9c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 .9-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.3.4c-.1.2-.2.3 0 .6.2.3.9 1.5 1.9 2.4 1.3 1.2 2.4 1.5 2.8 1.7.3.1.5.1.7-.1l1-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.7-.1 1.4z"/></svg>',
    max: '<svg viewBox="0 0 24 24" fill="none"><rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6" fill="#8b7cff"/><path d="M6.8 16V8.6l3.2 4 3.2-4V16m2-7.4h2.2M17.4 12h1.8M17.4 15.4h2.2" stroke="#0c0c14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    tel: '<svg viewBox="0 0 24 24" fill="none" stroke="#3be0e0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h3l2 5-2.2 1.5a14 14 0 0 0 5.7 5.7L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff5ca8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="url(#nxCkGrad)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="nxCkGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b7cff"/><stop offset=".5" stop-color="#5ac8ff"/><stop offset="1" stop-color="#ff79c0"/></linearGradient></defs><path d="M4 12.5l5.5 5.5L20 6.5"/></svg>'
  };

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function toast(msg) {
    var t = document.querySelector('.nx-toast');
    if (!t) { t = el('<div class="nx-toast" role="status"></div>'); document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('show'); }, 4200);
  }

  function ymGoal(name) {
    try { if (typeof ym === 'function') ym(110366569, 'reachGoal', name); } catch (e) {}
  }

  /* =====================================================
     1. SOCIAL FAB
     ===================================================== */
  function buildFab() {
    if (document.querySelector('.nx-fab-root')) return;
    var socials = [
      { k: 'tg',   href: LINKS.tg,   label: T.socTg,   d: 5 },
      { k: 'wa',   href: LINKS.wa,   label: T.socWa,   d: 4 },
      { k: 'max',  href: LINKS.max,  label: T.socMax,  d: 3 },
      { k: 'tel',  href: LINKS.tel,  label: T.socTel,  d: 2 },
      { k: 'mail', href: LINKS.mail, label: T.socMail, d: 1 }
    ];
    var root = el('<div class="nx-fab-root"></div>');
    var stack = el('<div class="nx-socials" aria-hidden="true"></div>');
    socials.forEach(function (s) {
      var ext = s.k === 'tel' || s.k === 'mail' ? '' : ' target="_blank" rel="noopener"';
      stack.appendChild(el(
        '<a class="nx-soc nx-soc--' + s.k + '" style="--d:' + s.d + '" href="' + s.href + '"' + ext + ' aria-label="' + s.label + '">' +
          '<span class="nx-soc-label">' + s.label + '</span>' +
          '<span class="nx-soc-btn">' + IC[s.k] + '</span>' +
        '</a>'
      ));
    });
    var btn = el('<button type="button" class="nx-fab" aria-expanded="false" aria-label="' + T.fabAria + '">' +
      '<span class="nx-ic-wrap">' + IC.spark.replace('<svg', '<svg class="nx-ic-open"') + IC.close.replace('<svg', '<svg class="nx-ic-close"') + '</span></button>');
    btn.addEventListener('click', function () {
      var open = root.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      stack.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) ymGoal('fab_open');
    });
    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) { root.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') root.classList.remove('open');
    });
    root.appendChild(stack);
    root.appendChild(btn);
    document.body.appendChild(root);
  }

  /* =====================================================
     2. LEAD FORM (replaces the calculator)
     ===================================================== */
  function chipRow(items, multi, onPick) {
    var wrap = el('<div class="nx-chips"></div>');
    items.forEach(function (name) {
      var c = el('<button type="button" class="nx-chip">' + name + '</button>');
      c.addEventListener('click', function () {
        if (multi) {
          c.classList.toggle('on');
        } else {
          wrap.querySelectorAll('.nx-chip').forEach(function (x) { x.classList.remove('on'); });
          c.classList.add('on');
        }
        onPick();
      });
      wrap.appendChild(c);
    });
    return wrap;
  }

  function buildLeadSection() {
    if (document.getElementById('zayavka')) return;
    var calcSec = document.getElementById('calc');
    var anchor = calcSec || document.getElementById('contact');
    if (!anchor) return;

    var sec = el('<section class="pad nx-lead-sec" id="zayavka"><div class="wrap">' +
      '<div class="shead">' +
        '<span class="eyebrow" style="opacity:1;transform:none">' + T.eyebrow + '</span>' +
        '<h2 class="disp" style="opacity:1;transform:none">' + T.h2 + '</h2>' +
        '<p style="opacity:1;transform:none">' + T.sub + '</p>' +
      '</div>' +
      '<div class="nx-lead">' +
        '<div class="nx-card nx-card--form">' +
          '<div class="nx-form-inner"></div>' +
          '<div class="nx-success" role="status"></div>' +
        '</div>' +
        '<div class="nx-card nx-card--side"></div>' +
      '</div>' +
    '</div></section>');

    var form = sec.querySelector('.nx-form-inner');
    var lead = sec.querySelector('.nx-lead');

    /* --- fields --- */
    var row = el('<div class="nx-row2"></div>');
    var gName = el('<div class="nx-f-group"><label class="nx-f-label">' + T.fName + '</label></div>');
    var iName = el('<input class="nx-input" type="text" autocomplete="name" placeholder="' + T.fNamePh + '">');
    gName.appendChild(iName);
    var gContact = el('<div class="nx-f-group"><label class="nx-f-label">' + T.fContact + '</label></div>');
    var iContact = el('<input class="nx-input" type="text" autocomplete="tel" placeholder="' + T.fContactPh + '">');
    gContact.appendChild(iContact);
    row.appendChild(gName); row.appendChild(gContact);
    form.appendChild(row);

    var gSvc = el('<div class="nx-f-group"><label class="nx-f-label">' + T.fService + '</label></div>');
    var svcChips = chipRow(T.services, true, sync);
    gSvc.appendChild(svcChips);
    form.appendChild(gSvc);

    var gBud = el('<div class="nx-f-group"><label class="nx-f-label">' + T.fBudget + '</label></div>');
    var budChips = chipRow(T.budgets, false, sync);
    gBud.appendChild(budChips);
    form.appendChild(gBud);

    var gMsg = el('<div class="nx-f-group"><label class="nx-f-label">' + T.fMsg + '</label></div>');
    var iMsg = el('<textarea class="nx-textarea" rows="3" placeholder="' + T.fMsgPh + '"></textarea>');
    gMsg.appendChild(iMsg);
    form.appendChild(gMsg);

    var subRow = el('<div class="nx-submit-row"></div>');
    var bTg = el('<button type="button" class="nx-btn nx-btn--primary">' + IC.send + T.sendTg + '</button>');
    var bWa = el('<button type="button" class="nx-btn nx-btn--ghost">' + IC.wa + T.sendWa + '</button>');
    subRow.appendChild(bTg); subRow.appendChild(bWa);
    form.appendChild(subRow);
    form.appendChild(el('<div class="nx-form-note" aria-live="polite"></div>'));
    form.appendChild(el('<p class="nx-consent">' + T.consent + '</p>'));

    /* --- side panel --- */
    var side = sec.querySelector('.nx-card--side');
    side.appendChild(el('<span class="nx-side-badge"><i></i>' + T.badge + '</span>'));
    side.appendChild(el('<h3 class="nx-side-title">' + T.sideTitle + '</h3>'));
    side.appendChild(el('<p class="nx-side-sub">' + T.sideSub + '</p>'));
    var steps = el('<div class="nx-steps"></div>');
    T.steps.forEach(function (s, i) {
      steps.appendChild(el('<div class="nx-step"><span class="nx-step-num">0' + (i + 1) + '</span><div><b>' + s[0] + '</b><span>' + s[1] + '</span></div></div>'));
    });
    side.appendChild(steps);
    var preview = el('<div class="nx-side-preview"><span class="lbl">' + T.previewLbl + '</span><div class="nx-ptags"></div></div>');
    side.appendChild(preview);
    var ptags = preview.querySelector('.nx-ptags');

    /* --- success --- */
    var succ = sec.querySelector('.nx-success');
    succ.appendChild(el('<span class="nx-check">' + IC.check + '</span>'));
    succ.appendChild(el('<h3>' + T.okTitle + '</h3>'));
    var okP = el('<p></p>');
    succ.appendChild(okP);
    var bAgain = el('<button type="button" class="nx-btn nx-btn--ghost">' + T.again + '</button>');
    bAgain.addEventListener('click', function () { lead.classList.remove('done'); });
    succ.appendChild(bAgain);

    function sync() {
      state.services = [].map.call(svcChips.querySelectorAll('.nx-chip.on'), function (c) { return c.textContent; });
      var b = budChips.querySelector('.nx-chip.on');
      state.budget = b ? b.textContent : '';
      renderPreview();
    }

    function renderPreview() {
      ptags.innerHTML = '';
      var items = state.services.concat(state.addons).concat(state.budget ? [state.budget] : []);
      if (!items.length) {
        ptags.appendChild(el('<span class="nx-ptag dim">' + T.previewEmpty + '</span>'));
        return;
      }
      items.forEach(function (t) { ptags.appendChild(el('<span class="nx-ptag">' + t + '</span>')); });
    }

    function compose() {
      var L = [T.reqTitle];
      if (iName.value.trim()) L.push((EN ? 'Name: ' : 'Имя: ') + iName.value.trim());
      if (iContact.value.trim()) L.push((EN ? 'Contact: ' : 'Контакт: ') + iContact.value.trim());
      if (state.services.length) L.push(T.lService + ': ' + state.services.join(', '));
      if (state.addons.length) L.push(T.lAddons + ': ' + state.addons.join(', '));
      if (state.budget) L.push(T.lBudget + ': ' + state.budget);
      if (iMsg.value.trim()) L.push(T.lTask + ': ' + iMsg.value.trim());
      L.push(T.lPage + ': ' + location.origin + location.pathname);
      return L.join('\n');
    }

    function validate() {
      var note = form.querySelector('.nx-form-note');
      if (!iContact.value.trim()) {
        note.classList.add('err');
        note.textContent = T.errContact;
        iContact.focus();
        iContact.style.borderColor = 'rgba(255,138,138,.7)';
        setTimeout(function () { iContact.style.borderColor = ''; }, 2500);
        return false;
      }
      note.classList.remove('err');
      note.textContent = '';
      return true;
    }

    function copyText(txt) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(txt).then(function () { return true; }, function () { return false; });
      }
      return Promise.resolve(false);
    }

    bTg.addEventListener('click', function () {
      if (!validate()) return;
      var txt = compose();
      ymGoal('lead');
      copyText(txt).then(function (ok) {
        okP.textContent = T.okTextTg;
        lead.classList.add('done');
        if (ok) toast(T.copied);
        window.open(LINKS.tg, '_blank', 'noopener');
      });
    });

    bWa.addEventListener('click', function () {
      if (!validate()) return;
      var txt = compose();
      ymGoal('lead');
      okP.textContent = T.okTextWa;
      lead.classList.add('done');
      window.open(LINKS.wa + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
    });

    renderPreview();

    if (calcSec) {
      calcSec.parentNode.insertBefore(sec, calcSec);
      calcSec.parentNode.removeChild(calcSec);
    } else {
      anchor.parentNode.insertBefore(sec, anchor);
    }
    sec._sync = function (addons) { state.addons = addons; renderPreview(); };
  }

  /* =====================================================
     2b. latest blog posts on the home page
     ===================================================== */
  var MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  function fdateRu(iso) {
    var p = String(iso || '').split('-');
    if (p.length !== 3) return iso || '';
    return (+p[2]) + ' ' + MONTHS_RU[+p[1] - 1] + ' ' + p[0];
  }
  var NXB_NODES = '<svg viewBox="0 0 200 140" fill="none" aria-hidden="true"><g stroke="rgba(255,255,255,.55)" stroke-width="1.4"><line x1="30" y1="110" x2="80" y2="40"/><line x1="80" y1="40" x2="150" y2="80"/><line x1="150" y1="80" x2="185" y2="25"/><line x1="30" y1="110" x2="150" y2="80"/></g><circle cx="30" cy="110" r="6" fill="rgba(255,255,255,.85)"/><circle cx="80" cy="40" r="8" fill="rgba(255,255,255,.9)"/><circle cx="150" cy="80" r="5" fill="rgba(255,255,255,.8)"/><circle cx="185" cy="25" r="7" fill="rgba(255,255,255,.85)"/></svg>';

  var blogSecRequested = false;
  function buildBlogSection() {
    if (EN) return; /* статьи пока только на русском */
    var path = location.pathname;
    if (path !== '/' && path !== '/index.html') return;
    if (document.getElementById('blog-home')) return;
    var anchor = document.getElementById('zayavka') || document.getElementById('contact');
    if (!anchor) return;

    if (!window.NODA_BLOG) {
      if (blogSecRequested) return;
      blogSecRequested = true;
      var s = document.createElement('script');
      s.src = '/blog/articles.js';
      s.onload = buildBlogSection;
      document.head.appendChild(s);
      return;
    }

    var posts = window.NODA_BLOG.slice(0, 4);
    if (!posts.length) return;

    var cards = posts.map(function (a) {
      return '<a class="nxb-card" href="/blog/' + a.slug + '/">' +
        '<span class="nxb-cover"><i class="nxb-g' + (a.grad || 1) + '"></i>' + NXB_NODES +
          '<span class="nxb-tag">' + a.tag + '</span></span>' +
        '<span class="nxb-body">' +
          '<span class="nxb-meta"><span>' + fdateRu(a.date) + '</span><i></i><span>' + a.mins + ' мин</span></span>' +
          '<h3>' + a.title + '</h3>' +
          '<span class="nxb-more">Читать <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
        '</span></a>';
    }).join('');

    var sec = el('<section class="pad nxb-sec" id="blog-home"><div class="wrap">' +
      '<div class="shead">' +
        '<span class="eyebrow" style="opacity:1;transform:none">Блог</span>' +
        '<h2 class="disp" style="opacity:1;transform:none">Читайте, как это<br>работает на практике</h2>' +
        '<p style="opacity:1;transform:none">Внедрение ИИ, боты и CRM — без воды: только то, что можно применить в своём бизнесе уже завтра.</p>' +
      '</div>' +
      '<div class="nxb-grid">' + cards + '</div>' +
      '<div class="nxb-all-row"><a class="nx-btn nx-btn--ghost" href="/blog/">Смотреть все статьи ' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>' +
    '</div></section>');

    anchor.parentNode.insertBefore(sec, anchor);
  }

  /* =====================================================
     3. add-on modules feed the form instead of the calc
     ===================================================== */
  var addonHooked = false;
  function hookAddons() {
    var subEl = document.querySelector('.addons-sec .shead p');
    if (subEl && subEl.textContent.indexOf(EN ? 'request' : 'заявку') === -1) subEl.textContent = T.addonsSub;
    document.querySelectorAll('.addon .lbl-on').forEach(function (n) { n.textContent = T.inReq; });
    if (addonHooked) return;
    addonHooked = true;
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.addon');
      if (!a) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      a.classList.toggle('sel');
      a.classList.toggle('on');
      var names = [].map.call(document.querySelectorAll('.addon.sel'), function (x) {
        return x.getAttribute('aria-label') || (x.querySelector('.addon-name') ? x.querySelector('.addon-name').textContent : '');
      }).filter(Boolean);
      var sec = document.getElementById('zayavka');
      if (sec && sec._sync) sec._sync(names);
      if (a.classList.contains('sel')) {
        var z = document.getElementById('zayavka');
        // gentle hint that the module landed in the request
        if (z) toast((EN ? 'Added to your request: ' : 'Добавили в заявку: ') + (a.getAttribute('aria-label') || ''));
      }
    }, true);
  }

  /* =====================================================
     4. nav / footer rewiring  (+ Blog link)
     ===================================================== */
  function fixLinks() {
    var blogHref = '/blog/';
    document.querySelectorAll('a[href*="#calc"]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').replace('#calc', '#zayavka'));
      var t = (a.textContent || '').trim();
      if (/^(Калькулятор|Calculator)$/i.test(t)) a.textContent = T.navLead;
    });
    document.querySelectorAll('.nav-links, .foot-links').forEach(function (nav) {
      if (nav.querySelector('a[href="' + blogHref + '"]')) return;
      var blog = document.createElement('a');
      blog.href = blogHref;
      blog.textContent = T.navBlog;
      var contacts = [].find.call(nav.querySelectorAll('a'), function (a) {
        return /контакт|contact/i.test(a.textContent || '');
      });
      if (contacts) nav.insertBefore(blog, contacts);
      else nav.appendChild(blog);
    });
    /* FAQ / body texts that referenced the calculator */
    document.querySelectorAll('.faq-a, .faq-q').forEach(function (n) {
      var h = n.innerHTML;
      if (/калькулятор/i.test(h)) {
        n.innerHTML = h
          .replace(/из калькулятора/gi, 'из заявки')
          .replace(/в калькуляторе/gi, 'в заявке')
          .replace(/калькулятором/gi, 'заявкой')
          .replace(/калькулятора/gi, 'заявки')
          .replace(/калькулятор/gi, 'заявка');
      }
      if (/calculator/i.test(h)) {
        n.innerHTML = h.replace(/the calculator/gi, 'the request form').replace(/calculator/gi, 'request form');
      }
    });
  }

  /* =====================================================
     5. remove legacy chat widget
     ===================================================== */
  function killLegacy() {
    var w = document.getElementById('chatWidget');
    if (w) w.parentNode.removeChild(w);
    document.querySelectorAll('.chat-widget').forEach(function (n) { n.parentNode && n.parentNode.removeChild(n); });
  }

  /* =====================================================
     boot (idempotent, hydration-proof)
     ===================================================== */
  var applyTimer = null;
  function apply() {
    killLegacy();
    buildLeadSection();
    buildBlogSection();
    buildFab();
    hookAddons();
    fixLinks();
  }
  function scheduleApply() {
    clearTimeout(applyTimer);
    applyTimer = setTimeout(apply, 120);
  }

  function boot() {
    apply();
    /* re-apply if hydration re-renders parts of the page */
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n.nodeType !== 1) continue;
          if (n.id === 'calc' || n.id === 'chatWidget' ||
              (n.querySelector && (n.querySelector('#calc') || n.querySelector('#chatWidget')))) {
            scheduleApply();
            return;
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    /* late re-check after hydration settles */
    setTimeout(apply, 1200);
    setTimeout(apply, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
