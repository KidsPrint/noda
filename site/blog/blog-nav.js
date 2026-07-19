/* ============================================================
   NODA · Blog — оживление оригинальной шапки сайта на страницах
   блога: переключатель языка и мобильное бургер-меню, один в один
   с реализацией основного сайта (стили — из общего CSS-бандла).
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var nav = document.getElementById('nav');
    var inn = nav && nav.querySelector('.nav-in');
    if (!inn || document.querySelector('.nav-burger')) return;

    /* --- переключатель языка (RU активен; EN ведёт на английскую главную) --- */
    if (!nav.querySelector('.lang-switch')) {
      var sw = document.createElement('div');
      sw.className = 'lang-switch';
      sw.innerHTML = '<a href="' + location.pathname + '" class="on" aria-label="Русский">RU</a>' +
        '<a href="/en/" aria-label="English">EN</a>';
      var right = nav.querySelector('.nav-right');
      if (right) right.insertBefore(sw, right.firstChild);
    }

    /* --- бургер + полноэкранное меню (логика основного сайта) --- */
    var burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Меню');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span><span></span>';
    inn.appendChild(burger);

    var links = Array.prototype.slice.call(nav.querySelectorAll('.nav-links > a'));
    var items = [links[0]].concat(
      Array.prototype.slice.call(nav.querySelectorAll('.nav-sub a')),
      links.slice(1)
    ).filter(Boolean);

    var menu = document.createElement('div');
    menu.className = 'mobile-menu';
    var mmInner = document.createElement('nav');
    mmInner.className = 'mm-inner';
    items.forEach(function (src, i) {
      var a = document.createElement('a');
      a.href = src.getAttribute('href') || '#';
      a.textContent = src.textContent.trim();
      a.style.setProperty('--i', i);
      mmInner.appendChild(a);
    });
    var cta = document.createElement('a');
    cta.href = '/#zayavka';
    cta.className = 'btn btn-primary mm-cta';
    cta.textContent = 'Обсудить проект';
    cta.style.setProperty('--i', items.length);
    mmInner.appendChild(cta);
    menu.appendChild(mmInner);
    document.body.appendChild(menu);

    function toggle(open) {
      document.body.classList.toggle('menu-open', open);
      nav.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    burger.addEventListener('click', function () {
      toggle(!document.body.classList.contains('menu-open'));
    });
    menu.addEventListener('click', function (e) { if (e.target === menu) toggle(false); });
    mmInner.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggle(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
