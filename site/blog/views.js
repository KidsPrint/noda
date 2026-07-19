/* ============================================================
   NODA · Blog — счётчик просмотров статей.
   Использует бесплатный счётчик Abacus (abacus.jasoncameron.dev):
   hit — +1 просмотр на странице статьи, get — чтение для карточек.
   Если сервис недоступен, элементы просмотров просто скрываются.
   ============================================================ */
(function () {
  'use strict';
  var NS = 'noda-development-ru';
  var API = 'https://abacus.jasoncameron.dev';

  function fmt(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'K';
    return String(n);
  }

  window.NodaViews = {
    /* страница статьи: засчитать просмотр и показать значение */
    hit: function (slug, el) {
      fetch(API + '/hit/' + NS + '/' + slug)
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && typeof j.value === 'number' && el) {
            el.querySelector('b').textContent = fmt(j.value);
            el.style.display = '';
          }
        })
        .catch(function () { if (el) el.style.display = 'none'; });
    },
    /* список: прочитать значения без инкремента */
    get: function (slug) {
      return fetch(API + '/get/' + NS + '/' + slug)
        .then(function (r) { return r.json(); })
        .then(function (j) { return (j && typeof j.value === 'number') ? j.value : null; })
        .catch(function () { return null; });
    },
    fmt: fmt
  };
})();
