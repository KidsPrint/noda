/* ============================================================
   NODA · парольный замок для служебных страниц.
   Пароль не хранится в коде — только его SHA-256 отпечаток.
   После входа доступ запоминается в этом браузере.
   ============================================================ */
(function () {
  'use strict';
  var HASH = 'affa59303972ae5f03d063df4a44413db0578fe87471f3ebe809ac020278f06d';
  var KEY = 'nx_admin_ok';

  try {
    if (localStorage.getItem(KEY) === HASH) return; /* уже входили */
  } catch (e) {}

  /* спрятать страницу до ввода пароля (до первой отрисовки) */
  var st = document.createElement('style');
  st.textContent = 'html.nx-locked body>*:not(.nx-gate){display:none!important}' +
    '.nx-gate{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#060608;font-family:Inter,system-ui,sans-serif}' +
    '.nx-gate-card{width:min(92vw,380px);text-align:center;padding:40px 32px;border-radius:22px;border:1px solid rgba(255,255,255,.09);background:linear-gradient(160deg,rgba(255,255,255,.045),rgba(255,255,255,.015))}' +
    '.nx-gate-ic{width:56px;height:56px;border-radius:16px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background:linear-gradient(120deg,#8b7cff,#5ac8ff 45%,#ff79c0)}' +
    '.nx-gate-ic svg{width:26px;height:26px}' +
    '.nx-gate h1{font:600 19px/1.3 Unbounded,sans-serif;color:#ececf1;margin:0 0 8px}' +
    '.nx-gate p{color:#9a9aac;font-size:13.5px;line-height:1.55;margin:0 0 22px}' +
    '.nx-gate input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#ececf1;font:500 15px/1.4 Inter,sans-serif;padding:13px 15px;outline:none;text-align:center;letter-spacing:.08em;margin-bottom:12px;transition:border-color .2s}' +
    '.nx-gate input:focus{border-color:rgba(139,124,255,.65)}' +
    '.nx-gate input.err{border-color:rgba(255,138,138,.75);animation:nx-shake .35s}' +
    '@keyframes nx-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}' +
    '.nx-gate button{width:100%;border:0;cursor:pointer;border-radius:999px;padding:14px;font:700 15px/1 Inter,sans-serif;color:#0c0c14;background:linear-gradient(120deg,#8b7cff,#5ac8ff 45%,#ff79c0);box-shadow:0 8px 26px rgba(123,92,255,.4)}' +
    '.nx-gate .msg{min-height:18px;font:600 12.5px/1.4 Inter,sans-serif;color:#ff8a8a;margin-top:12px}';
  document.head.appendChild(st);
  document.documentElement.classList.add('nx-locked');

  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  function build() {
    var g = document.createElement('div');
    g.className = 'nx-gate';
    g.innerHTML = '<div class="nx-gate-card">' +
      '<div class="nx-gate-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#0a0a12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.6" fill="#0a0a12" stroke="none"/></svg></div>' +
      '<h1>Служебная страница</h1>' +
      '<p>Доступ только для команды NODA. Введите пароль.</p>' +
      '<input type="password" autocomplete="current-password" placeholder="Пароль" aria-label="Пароль">' +
      '<button type="button">Войти</button>' +
      '<div class="msg" role="alert"></div></div>';
    document.body.appendChild(g);
    var inp = g.querySelector('input');
    var msg = g.querySelector('.msg');
    function attempt() {
      var v = inp.value;
      if (!v) return;
      sha256(v).then(function (h) {
        if (h === HASH) {
          try { localStorage.setItem(KEY, HASH); } catch (e) {}
          g.remove();
          document.documentElement.classList.remove('nx-locked');
        } else {
          msg.textContent = 'Неверный пароль';
          inp.value = '';
          inp.classList.remove('err');
          void inp.offsetWidth;
          inp.classList.add('err');
        }
      });
    }
    g.querySelector('button').addEventListener('click', attempt);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') attempt(); });
    inp.focus();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
