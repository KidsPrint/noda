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
    sendMain: 'Send request', sending: 'Sending…',
    orDirect: 'or message us directly:',
    okAutoTitle: 'Request sent!',
    okAutoText: 'It has already reached us — we will reply within an hour during business hours.',
    errAuto: 'Sending failed — please check your connection and try again, or message us via the links below.',
    mailSubject: 'Website request — NODA',
    legacyOk: 'Request sent! We will reply within an hour.',
    legacyErr: 'Sending failed — please email us at noda_development@mail.ru (the request text is copied).',
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
    again: 'Fill in again',
    errContact: 'Please leave a phone number or @username so we can reply.',
    copied: 'Request text copied — paste it into the chat',
    inReq: 'In request', addLbl: 'Add',
    socTg: 'Telegram', socWa: 'WhatsApp', socMax: 'MAX', socTel: 'Call us', socMail: 'Email',
    fabAria: 'Contact us',
    fabTag: 'Message us',
    casesHint: 'Swipe to browse',
    addonsSub: 'Options most often taken with this service. If something catches your eye — just mention it in your request and we will include it in the quote.',
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
    sendMain: 'Отправить заявку', sending: 'Отправляем…',
    orDirect: 'или напишите напрямую:',
    okAutoTitle: 'Заявка отправлена!',
    okAutoText: 'Мы уже получили её и ответим в течение часа в рабочее время.',
    errAuto: 'Не получилось отправить — проверьте интернет и попробуйте ещё раз, или напишите нам по ссылкам ниже.',
    mailSubject: 'Заявка с сайта NODA',
    legacyOk: 'Заявка отправлена! Ответим в течение часа.',
    legacyErr: 'Не получилось отправить — напишите нам на noda_development@mail.ru (текст заявки скопирован).',
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
    again: 'Заполнить ещё раз',
    errContact: 'Оставьте телефон или @username, чтобы мы могли ответить.',
    copied: 'Текст заявки скопирован — вставьте его в чат',
    inReq: 'В заявке', addLbl: 'Добавить',
    socTg: 'Telegram', socWa: 'WhatsApp', socMax: 'MAX', socTel: 'Позвонить', socMail: 'Почта',
    fabAria: 'Связаться с нами',
    fabTag: 'Напишите нам',
    casesHint: 'Тяните и листайте',
    addonsSub: 'Опции, которые чаще всего берут в этой услуге. Что-то приглянулось — просто упомяните это в заявке, и мы включим его в смету.',
    reqTitle: 'Заявка с сайта NODA',
    lService: 'Услуга', lBudget: 'Бюджет', lTask: 'Задача', lPage: 'Страница', lAddons: 'Допы'
  };

  var state = { services: [], budget: '', addons: [] };

  /* ---------- svg icons ---------- */
  var IC = {
    bubble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.3c0 4-4 7.2-9 7.2-.9 0-1.9-.1-2.7-.3L4.5 20l1-3.2C4 15.5 3 13.5 3 11.3 3 7.3 7 4 12 4s9 3.3 9 7.3z"/><circle cx="8.2" cy="11.4" r="1.15" fill="currentColor" stroke="none"/><circle cx="12" cy="11.4" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.8" cy="11.4" r="1.15" fill="currentColor" stroke="none"/></svg>',
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

  /* ---------- automatic lead delivery via Telegram bot ---------- */
  function leadCfg() {
    var c = window.NX_LEAD_CONFIG || {};
    return (c.tgToken && c.tgChatId) ? c : null;
  }
  function sendToBot(text) {
    var c = leadCfg();
    if (!c) return Promise.reject(new Error('no-config'));
    return fetch('https://api.telegram.org/bot' + c.tgToken + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: c.tgChatId, text: text, disable_web_page_preview: true })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok) throw new Error('tg-api');
      return true;
    });
  }
  var MAIL_TO = 'noda_development@mail.ru';
  /* primary channel: our own PHP endpoint (same domain — ad-blockers and
     ISPs don't cut it, unlike third-party services) */
  function sendToPhp(text) {
    return fetch('/mail.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, _subject: T.mailSubject })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || String(j.success) !== 'true') throw new Error('php-mail');
      return true;
    });
  }
  /* FormSubmit — temporarily disabled; kept so it can be re-enabled in one line */
  function sendToMail(text) {
    return fetch('https://formsubmit.co/ajax/' + MAIL_TO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ message: text, _subject: T.mailSubject, _template: 'box', _captcha: 'false' })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || String(j.success) !== 'true') throw new Error('mail-api');
      return true;
    });
  }
  /* delivery chain: our PHP mailer → Telegram bot as silent backup;
     rejects only if both fail */
  function deliverLead(text) {
    return sendToPhp(text).catch(function () { return sendToBot(text); });
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
    var row = el('<div class="nx-fab-row"></div>');
    var btn = el('<button type="button" class="nx-fab" aria-expanded="false" aria-label="' + T.fabAria + '">' +
      IC.bubble.replace('<svg', '<svg class="nx-ic-open"') + IC.close.replace('<svg', '<svg class="nx-ic-close"') + '</button>');
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
    row.appendChild(btn);
    root.appendChild(stack);
    root.appendChild(row);
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
    var bSend = el('<button type="button" class="nx-btn nx-btn--primary">' + T.sendMain + '</button>');
    var direct = el('<span class="nx-direct">' + T.orDirect +
      ' <a href="' + LINKS.tg + '" target="_blank" rel="noopener">Telegram</a><i>·</i><a href="' + LINKS.wa + '" target="_blank" rel="noopener">WhatsApp</a><i>·</i><a href="' + LINKS.mail + '">' + T.socMail + '</a></span>');
    subRow.appendChild(bSend); subRow.appendChild(direct);
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
    var okH = el('<h3>' + T.okTitle + '</h3>');
    succ.appendChild(okH);
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

    bSend.addEventListener('click', function () {
      if (!validate()) return;
      var note = form.querySelector('.nx-form-note');
      bSend.disabled = true;
      note.classList.remove('err');
      note.textContent = T.sending;
      deliverLead(compose()).then(function () {
        bSend.disabled = false;
        note.textContent = '';
        ymGoal('lead');
        okH.textContent = T.okAutoTitle;
        okP.textContent = T.okAutoText;
        lead.classList.add('done');
      }, function () {
        bSend.disabled = false;
        note.classList.add('err');
        note.textContent = T.errAuto;
      });
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
    var onHome = path === '/' || path === '/index.html';
    if (!onHome && path.indexOf('/uslugi') !== 0) return;
    if (document.getElementById('blog-home')) return;
    var anchor = document.getElementById('zayavka') || document.getElementById('contact');
    if (!anchor) {
      /* pages without a form (uslugi hub): the anchor is the React-managed
         footer — wait until hydration settles before touching that tree */
      if (!window.__nxLoadDone) return;
      anchor = document.querySelector('footer');
    }
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
      var art = a.cover
        ? '<i class="nxb-img" style="background:url(\'' + a.cover.replace(/'/g, '%27') + '\') center/cover no-repeat"></i>'
        : '<i class="nxb-g' + (a.grad || 1) + '"></i>' + NXB_NODES;
      return '<a class="nxb-card" href="/blog/' + a.slug + '/">' +
        '<span class="nxb-cover">' + art +
          '<span class="nxb-tag">' + a.tag + '</span></span>' +
        '<span class="nxb-body">' +
          '<span class="nxb-meta"><span>' + fdateRu(a.date) + '</span><i></i><span>' + a.mins + ' мин</span></span>' +
          '<h3>' + a.title + '</h3>' +
          '<span class="nxb-more">Читать <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
        '</span></a>';
    }).join('');

    /* final carousel slide (mobile only): "all articles" card */
    cards += '<a class="nxb-card nxb-card--all" href="/blog/">' +
      '<span class="nxb-all-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
      '<b>Все статьи</b><span>практика, цифры, разборы</span></a>';
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
    /* the add-ons section is informational now: no prices, no "add" toggles */
    var subEl = document.querySelector('.addons-sec .shead p');
    if (subEl && subEl.textContent !== T.addonsSub) subEl.textContent = T.addonsSub;
    document.querySelectorAll('.addon').forEach(function (a) {
      a.removeAttribute('role');
      a.removeAttribute('tabindex');
    });
    /* the cards use a scroll-reveal animation; force all six visible so none
       of them can get stuck transparent on real devices */
    document.querySelectorAll('.addons-sec [data-reveal]').forEach(function (n) { n.classList.add('in'); });
    if (addonHooked) return;
    addonHooked = true;
    /* swallow clicks so the legacy calculator handlers never fire */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.addon');
      if (!a) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);
  }

  /* =====================================================
     3a2. "С чем мы дружим" — integrations grid (2 pages)
     ===================================================== */
  var FRIENDS = {
    '/uslugi/sajty-i-prilozheniya/': {
      sub: 'Сайт, бот и CRM работают одной связкой: подключаем сервисы, которыми вы уже пользуетесь, — заявки, оплаты и аналитика в одном контуре',
      note: 'Нет вашего сервиса в списке? Если у него есть API — подключим. Просто упомяните его в заявке.',
      mobSub: 'Заявки, оплаты и аналитика — в одном контуре',
      mobNote: 'Нет вашего сервиса в списке? Если у него есть API — подключим. Просто упомяните его в заявке.',
      groups: [
        ['CRM', ['amoCRM', 'Битрикс24']],
        ['Мессенджеры', ['Telegram', 'WhatsApp', 'MAX']],
        ['Оплата', ['ЮKassa', 'СБП', 'Robokassa']],
        ['Данные и учёт', ['1С', 'Google Sheets']],
        ['Аналитика', ['Яндекс Метрика', 'Roistat']]
      ],
      items: [
        ['amoCRM', 'CRM', 'amocrm'],
        ['Битрикс24', 'CRM', 'bitrix24'],
        ['Telegram', 'мессенджеры', 'telegram'],
        ['WhatsApp', 'мессенджеры', 'whatsapp'],
        ['MAX', 'мессенджеры', 'max'],
        ['ЮKassa', 'оплата', 'yookassa'],
        ['СБП', 'оплата', 'sbp'],
        ['Robokassa', 'оплата', 'robokassa'],
        ['1С', 'учёт', '1c'],
        ['Google Sheets', 'данные', 'gsheets'],
        ['Яндекс Метрика', 'аналитика', 'metrika'],
        ['Roistat', 'сквозная аналитика', 'roistat']
      ]
    },
    '/uslugi/vnedrenie-ii/': {
      sub: 'Подбираем нейросеть под задачу и бюджет — и встраиваем туда, где уже живут ваши клиенты и данные: в мессенджеры, на сайт и в CRM',
      note: 'Какая модель подойдёт именно вам — российская, когда важно хранение данных в РФ, или зарубежная, когда нужен максимум качества, — скажем прямо на первом созвоне.',
      mobSub: 'Подбираем нейросеть под задачу — и встраиваем туда, где живут ваши клиенты',
      mobNote: 'Какая модель подойдёт именно вам — российская или зарубежная — скажем прямо на первом созвоне.',
      groups: [
        ['Нейросети', ['GigaChat', 'YandexGPT', 'ChatGPT', 'Claude', 'DeepSeek']],
        ['Каналы', ['Telegram', 'WhatsApp', 'MAX']],
        ['CRM и учёт', ['amoCRM', 'Битрикс24', '1С']],
        ['Автоматизация', ['n8n']]
      ],
      items: [
        ['GigaChat', 'нейросети · данные в РФ', 'gigachat'],
        ['YandexGPT', 'нейросети · данные в РФ', 'yandexgpt'],
        ['ChatGPT', 'нейросети', 'chatgpt'],
        ['Claude', 'нейросети', 'claude'],
        ['DeepSeek', 'нейросети', 'deepseek'],
        ['Telegram', 'каналы', 'telegram'],
        ['WhatsApp', 'каналы', 'whatsapp'],
        ['MAX', 'каналы', 'max'],
        ['amoCRM', 'CRM', 'amocrm'],
        ['Битрикс24', 'CRM', 'bitrix24'],
        ['1С', 'данные и учёт', '1c'],
        ['n8n', 'автоматизация', 'n8n']
      ]
    }
  };
  function pageKey() {
    var p = location.pathname.replace(/index\.html$/, '');
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }
  function buildFriends() {
    var cfg = FRIENDS[pageKey()];
    if (!cfg || document.getElementById('friends')) return;
    var hero = document.querySelector('section.hero');
    if (!hero || !hero.parentNode) return;
    var byName = {};
    cfg.items.forEach(function (it) { byName[it[0]] = it; });
    var cards = cfg.items.map(function (it) {
      return '<div class="nx-fr-card">' +
        '<span class="nx-fr-logo"><img src="/custom/logos/' + it[2] + '.svg" alt="' + it[0] + '" width="40" height="40" loading="lazy"></span>' +
        '<span class="nx-fr-txt"><b>' + it[0] + '</b><i>' + it[1] + '</i></span></div>';
    }).join('');
    /* mobile variant: chips grouped by category (shown < 768px) */
    var groups = cfg.groups.map(function (g) {
      var chips = g[1].map(function (name) {
        var it = byName[name];
        return '<span class="nx-fr-chip"><img src="/custom/logos/' + it[2] + '.svg" alt="' + it[0] + '" width="16" height="16" loading="lazy"><span>' + it[0] + '</span></span>';
      }).join('');
      return '<div class="nx-fr-group"><p class="nx-fr-glabel">' + g[0] + '</p><div class="nx-fr-chips">' + chips + '</div></div>';
    }).join('');
    var sec = el('<section class="pad nx-fr" id="friends"><div class="wrap">' +
      '<div class="shead">' +
        '<span class="eyebrow" style="opacity:1;transform:none">Интеграции</span>' +
        '<h2 class="disp" style="opacity:1;transform:none">С чем мы дружим</h2>' +
        '<p class="nx-fr-sub" style="opacity:1;transform:none">' + cfg.sub + '</p>' +
        '<p class="nx-fr-mobsub">' + cfg.mobSub + '</p>' +
      '</div>' +
      '<div class="nx-fr-grid">' + cards + '</div>' +
      '<div class="nx-fr-groups">' + groups + '</div>' +
      '<p class="nx-fr-note nx-fr-note--d">' + cfg.note + '</p>' +
      '<p class="nx-fr-note nx-fr-note--m">' + cfg.mobNote + '</p>' +
    '</div></section>');
    hero.parentNode.insertBefore(sec, hero.nextElementSibling);
  }

  /* 7th add-on card «ИИ-чат консультант» on the websites page */
  function addAiAddon() {
    if (pageKey() !== '/uslugi/sajty-i-prilozheniya/') return;
    var box = document.querySelector('.addons-sec .addons');
    if (!box || box.querySelector('.nx-ai-addon')) return;
    /* drop the weakest card so the grid stays two clean rows of three */
    box.querySelectorAll('.addon h3').forEach(function (h) {
      if (h.textContent.trim() === 'Анимации и вау-эффекты') {
        var card = h.closest('.addon');
        if (card) card.remove();
      }
    });
    box.insertBefore(el('<article class="addon nx-ai-addon in" aria-label="ИИ-чат консультант">' +
      '<span class="addon-node"></span>' +
      '<div class="addon-top"><span class="addon-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.4c0 3.8-3.7 6.9-8.3 6.9-.9 0-1.9-.1-2.7-.4L6 19.4l1.1-3A6.8 6.8 0 0 1 4 11.4C4 7.6 7.7 4.5 12.4 4.5S21 7.6 21 11.4z"/><path d="M12.4 8.2l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8z" fill="currentColor" stroke="none"/></svg></span><span class="addon-idx">01</span></div>' +
      '<h3>ИИ-чат консультант</h3><p>Отвечает посетителям круглосуточно, помогает выбрать и доводит до заявки — пока менеджеры спят.</p>' +
      '</article>'), box.firstElementChild);
    /* renumber all cards after inserting at the top */
    var idx = 0;
    box.querySelectorAll('.addon .addon-idx').forEach(function (n) {
      idx += 1;
      n.textContent = (idx < 10 ? '0' : '') + idx;
    });
  }

  /* =====================================================
     3a3. tech marquee: compact strip between FAQ and CTA,
     2x faster, CSS-driven (hover pause + reduced motion)
     ===================================================== */
  var AI_STACK = ['Python', 'FastAPI', 'LangChain', 'LlamaIndex', 'RAG', 'Qdrant', 'Pinecone', 'Hugging Face', 'Whisper', 'Эмбеддинги', 'Fine-tuning', 'Vision'];
  function reworkTech() {
    var tech = document.querySelector('.pad-tech');
    if (!tech || tech.getAttribute('data-nx-done')) return;
    var tracks = [].slice.call(tech.querySelectorAll('.mq-track'));
    if (!tracks.length) return;
    var isAiPage = pageKey() === '/uslugi/vnedrenie-ii/';
    tracks.forEach(function (t, ti) {
      /* detach from the site's rAF marquee before it initializes */
      t.classList.remove('mq-track');
      t.classList.add('nx-mqt');
      if (ti === 1) t.classList.add('rev');
      t.removeAttribute('data-dir');
      t.removeAttribute('data-speed');
      t.style.transform = '';
      var names;
      if (isAiPage) {
        names = ti === 0 ? AI_STACK : AI_STACK.slice().reverse();
      } else {
        var spans = [].slice.call(t.querySelectorAll('.s'));
        names = spans.slice(0, Math.ceil(spans.length / 2)).map(function (s) { return s.innerHTML; });
      }
      var half = names.map(function (n, i) {
        var inner = /</.test(n) ? n : (i % 3 === 1 ? '<b>' + n + '</b>' : n);
        return '<span class="s">' + inner + '</span>';
      }).join('');
      t.innerHTML = '<div class="nx-half">' + half + '</div><div class="nx-half" aria-hidden="true">' + half + '</div>';
    });
    var eye = tech.querySelector('.shead .eyebrow');
    if (eye) eye.textContent = EN ? 'Technologies' : 'Технологии';
    tech.setAttribute('data-nx-done', '1');
    /* move: between the FAQ section and the closing CTA */
    var faq = document.querySelector('.faq');
    var faqSec = faq && faq.closest('section');
    if (faqSec && faqSec.parentNode) {
      faqSec.parentNode.insertBefore(tech, faqSec.nextElementSibling);
    }
  }

  /* =====================================================
     3b. themed artwork inside the case panels
     ===================================================== */
  function decorateCases() {
    var track = document.getElementById('htrack');
    if (!track || track.querySelector('.nx-case-art')) return;
    var panels = track.querySelectorAll('.h-panel');
    for (var i = 0; i < panels.length && i < 5; i++) {
      panels[i].insertBefore(el('<span class="nx-case-art nx-ca-' + (i + 1) + '" aria-hidden="true"></span>'), panels[i].firstChild);
    }
  }

  /* =====================================================
     3c. language pill: any tap toggles the language
     ===================================================== */
  var langHooked = false;
  function hookLangSwitch() {
    if (langHooked) return;
    langHooked = true;
    document.addEventListener('click', function (e) {
      var sw = e.target.closest && e.target.closest('.lang-switch');
      if (!sw) return;
      e.preventDefault();
      e.stopPropagation();
      var other = sw.querySelector('a:not(.on)');
      if (other) location.href = other.getAttribute('href');
    }, true);
  }

  /* =====================================================
     3d. cases slider on mobile: hint + working counter
     ===================================================== */
  function fixCasesMobile() {
    var track = document.getElementById('htrack');
    var cases = document.getElementById('cases');
    if (!track || !cases || document.querySelector('.nx-chint')) return;
    var n = track.children.length;
    if (!n) return;
    var hint = el('<div class="nx-chint" aria-hidden="true">' +
      '<span class="nx-chint-ic"><i></i><i></i><i></i></span>' +
      '<span class="nx-chint-txt">' + T.casesHint + '</span>' +
      '<span class="nx-chint-bar"><b></b></span>' +
      '<span class="nx-chint-count"><em>01</em>&nbsp;/&nbsp;' + String(n).padStart(2, '0') + '</span></div>');
    cases.appendChild(hint);
    var bar = hint.querySelector('.nx-chint-bar b');
    var cnt = hint.querySelector('.nx-chint-count em');
    function upd() {
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      cnt.textContent = String(Math.min(n, 1 + Math.round(p * (n - 1)))).padStart(2, '0');
    }
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
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
     4b. legacy "Обсудить проект" modal → same Telegram bot
     ===================================================== */
  var legacyHooked = false;
  function hookLegacyLead() {
    if (legacyHooked) return;
    legacyHooked = true;
    document.addEventListener('submit', function (e) {
      var f = e.target;
      if (!f || f.id !== 'leadForm') return;
      e.preventDefault();
      e.stopPropagation();
      var fd = new FormData(f);
      var sum = document.getElementById('leadSum');
      var L = [T.reqTitle];
      if (fd.get('name')) L.push((EN ? 'Name: ' : 'Имя: ') + fd.get('name'));
      if (fd.get('contact')) L.push((EN ? 'Contact: ' : 'Контакт: ') + fd.get('contact'));
      if (fd.get('comment')) L.push(T.lTask + ': ' + fd.get('comment'));
      if (sum && sum.textContent.trim() && sum.style.display !== 'none') L.push(sum.textContent.trim());
      L.push(T.lPage + ': ' + location.origin + location.pathname);
      var txt = L.join('\n');
      var st = f.querySelector('#leadStatus') || f.querySelector('.lead-status');
      if (st) { st.style.color = 'var(--cyan)'; st.textContent = T.sending; }
      deliverLead(txt).then(function () {
        ymGoal('lead');
        if (st) { st.style.color = 'var(--cyan)'; st.textContent = T.legacyOk; }
        f.reset();
        setTimeout(function () {
          var m = f.closest('.lead-modal');
          if (m) m.classList.remove('on');
        }, 1900);
      }, function () {
        if (st) { st.style.color = '#ff8a8a'; st.textContent = T.legacyErr; }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(function () {});
      });
    }, true);
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
    /* pages built from static HTML blocks (they carry the calculator/chat markup)
       tolerate pre-hydration edits; fully React-rendered pages (uslugi hub,
       privacy policy) must not be touched until hydration settles */
    var staticPage = !!(document.getElementById('calc') || document.getElementById('chatWidget') ||
      document.querySelector('.chat-widget') || document.getElementById('zayavka'));
    if (!staticPage && !window.__nxLoadDone) return;
    killLegacy();
    buildLeadSection();
    buildBlogSection();
    buildFab();
    hookAddons();
    buildFriends();
    addAiAddon();
    reworkTech();
    decorateCases();
    hookLangSwitch();
    fixCasesMobile();
    fixLinks();
  }
  function scheduleApply() {
    clearTimeout(applyTimer);
    applyTimer = setTimeout(apply, 120);
  }

  function boot() {
    /* lead delivery config (token + chat id) */
    if (!window.NX_LEAD_CONFIG) {
      var cfg = document.createElement('script');
      cfg.src = '/custom/lead-config.js';
      document.head.appendChild(cfg);
    }
    hookLegacyLead();
    if (document.readyState === 'complete') {
      window.__nxLoadDone = true;
    } else {
      window.addEventListener('load', function () {
        setTimeout(function () { window.__nxLoadDone = true; apply(); }, 450);
      });
    }
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
