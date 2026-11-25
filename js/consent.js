/*
 * Cookie consent + Google Analytics 4.
 *
 * Google Analytics is not loaded at all until the visitor accepts (Google's
 * "basic consent mode"). Advertising storage always stays denied.
 *
 * Vercel serves /js as immutable for a year, so after ANY change to this file
 * raise the ?v= number in index.html, blog.html and blog-post.html.
 */
(function () {
  'use strict';

  var GA_ID = 'G-H1C6F7HY86';
  var KEY = 'cookie-consent';
  var MAX_AGE = 180 * 24 * 60 * 60 * 1000; // ask again after 6 months

  var TEXT = {
    en: {
      label: 'Cookie consent',
      body: 'May we use Google Analytics cookies to see how visitors use this site? They are only set if you accept.',
      more: 'Details',
      details: [
        '<strong>Cookies:</strong> _ga and _ga_H1C6F7HY86. They tell visitors apart and remember the visit, for up to 2 years.',
        '<strong>Who receives the data:</strong> Google Ireland Limited, which may also process it outside the EU. See the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google privacy policy</a>.',
        '<strong>Advertising:</strong> advertising cookies stay switched off.',
        '<strong>Your choice:</strong> saved in this browser for 6 months. You can change it at any time under “Cookie settings” at the bottom of the page.'
      ],
      accept: 'Accept',
      decline: 'Decline',
      settings: 'Cookie settings'
    },
    hr: {
      label: 'Pristanak na kolačiće',
      body: 'Smijemo li koristiti kolačiće Google Analyticsa da vidimo kako posjetitelji koriste stranicu? Postavljaju se samo ako prihvatite.',
      more: 'Detalji',
      details: [
        '<strong>Kolačići:</strong> _ga i _ga_H1C6F7HY86. Razlikuju posjetitelje i pamte posjet, najdulje 2 godine.',
        '<strong>Tko prima podatke:</strong> Google Ireland Limited, koji ih može obrađivati i izvan EU-a. Pogledajte <a href="https://policies.google.com/privacy?hl=hr" target="_blank" rel="noopener noreferrer">Googleova pravila o privatnosti</a>.',
        '<strong>Oglašavanje:</strong> oglasni kolačići ostaju isključeni.',
        '<strong>Vaš odabir:</strong> sprema se u ovom pregledniku na 6 mjeseci. Možete ga promijeniti u svakom trenutku pod „Postavke kolačića” na dnu stranice.'
      ],
      accept: 'Prihvaćam',
      decline: 'Odbijam',
      settings: 'Postavke kolačića'
    }
  };

  var CSS =
    '.cc{position:fixed;z-index:45;left:0;right:0;bottom:0;max-height:85vh;overflow-y:auto;background:#fff;color:#0B1D2A;' +
      'box-shadow:0 -6px 30px rgba(10,25,60,.22);border-top:3px solid #FFC61A;padding:12px 16px calc(12px + env(safe-area-inset-bottom));' +
      'font-size:14px;line-height:1.45;text-align:left}' +
    '.cc[hidden],.cc ul[hidden]{display:none}' +
    '.cc:focus{outline:none}' +
    '.cc p{margin:0}' +
    '.cc ul{margin:8px 0 0;padding:0;list-style:none;font-size:13.5px;color:#374151}' +
    '.cc li{margin-top:6px;overflow-wrap:anywhere}' +
    '.cc li a{color:#0E4160;text-decoration:underline}' +
    '.cc-actions{display:flex;align-items:center;gap:10px;margin-top:10px}' +
    '.cc button{min-height:44px;border:0;font:inherit;font-weight:600;cursor:pointer}' +
    '.cc-more{padding:0 2px;background:none;color:#0E4160;text-decoration:underline;text-underline-offset:3px}' +
    '.cc-btn{flex:1;padding:0 10px;text-align:center;border-radius:4px;background:#0E4160;color:#fff;transition:background-color .2s ease}' +
    '.cc-btn:hover{background:#0a3049}' +
    '.cc button:focus-visible,.cc a:focus-visible{outline:3px solid #FFC61A;outline-offset:2px}' +
    '@media (min-width:900px){' +
      '.cc{display:flex;flex-wrap:wrap;align-items:center;gap:6px 28px;padding:12px 4vw;font-size:15px}' +
      '.cc p{flex:1 1 380px}.cc ul{flex:1 0 100%;order:3;max-width:900px}.cc-actions{margin:0;min-width:380px}' +
    '}' +
    '@media print{.cc{display:none}}';

  var root = document.documentElement;
  var memory = null;      // fallback when localStorage is blocked
  var banner = null;
  var gaLoaded = false;
  var opener = null;      // element to give focus back to

  // ---------- Stored choice ----------
  function readChoice() {
    var saved = memory;
    try {
      saved = JSON.parse(localStorage.getItem(KEY)) || memory;
    } catch (e) { /* storage blocked or corrupt */ }
    if (!saved || (saved.analytics !== 'granted' && saved.analytics !== 'denied')) return null;
    var age = Date.now() - saved.time;
    return age >= 0 && age < MAX_AGE ? saved.analytics : null;
  }

  function saveChoice(value) {
    memory = { analytics: value, time: Date.now() };
    try {
      localStorage.setItem(KEY, JSON.stringify(memory));
    } catch (e) { /* keep the in-memory choice for this page view */ }
  }

  // ---------- Google Analytics ----------
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function consentState(analytics) {
    return {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: analytics
    };
  }

  gtag('consent', 'default', consentState('denied'));

  function enableAnalytics() {
    window['ga-disable-' + GA_ID] = false;
    gtag('consent', 'update', consentState('granted'));
    if (gaLoaded) return;
    gaLoaded = true;
    gtag('js', new Date());
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function disableAnalytics() {
    window['ga-disable-' + GA_ID] = true;
    if (gaLoaded) gtag('consent', 'update', consentState('denied'));
    deleteAnalyticsCookies();
  }

  function deleteAnalyticsCookies() {
    var parts = location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < parts.length - 1; i++) {
      domains.push('; domain=.' + parts.slice(i).join('.'));
    }
    document.cookie.split(';').forEach(function (pair) {
      var name = pair.split('=')[0].trim();
      if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' + domain;
      });
    });
  }

  function apply(choice) {
    if (choice === 'granted') enableAnalytics();
    else disableAnalytics();
  }

  // ---------- Banner ----------
  function texts() {
    return root.lang === 'hr' ? TEXT.hr : TEXT.en;
  }

  function fill() {
    var t = texts();
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.textContent = t.settings;
      el.hidden = false;
    });
    if (!banner) return;
    banner.setAttribute('aria-label', t.label);
    banner.querySelector('p').textContent = t.body;
    banner.querySelector('.cc-more').textContent = t.more;
    banner.querySelector('ul').innerHTML = t.details.map(function (d) { return '<li>' + d + '</li>'; }).join('');
    banner.querySelector('[data-choice="granted"]').textContent = t.accept;
    banner.querySelector('[data-choice="denied"]').textContent = t.decline;
    measure();
  }

  function measure() {
    if (banner && !banner.hidden) root.style.setProperty('--cc-h', banner.offsetHeight + 'px');
  }

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    banner = document.createElement('section');
    banner.className = 'cc';
    banner.hidden = true;
    banner.tabIndex = -1;
    banner.innerHTML =
      '<p></p><ul id="cc-details" hidden></ul>' +
      '<div class="cc-actions">' +
        '<button type="button" class="cc-more" aria-expanded="false" aria-controls="cc-details"></button>' +
        '<button type="button" class="cc-btn" data-choice="denied"></button>' +
        '<button type="button" class="cc-btn" data-choice="granted"></button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-choice]');
      if (btn) choose(btn.getAttribute('data-choice'));
    });
    var more = banner.querySelector('.cc-more');
    more.addEventListener('click', function () {
      var list = banner.querySelector('ul');
      list.hidden = !list.hidden;
      more.setAttribute('aria-expanded', String(!list.hidden));
      measure();
    });
    window.addEventListener('resize', measure);
    document.body.insertBefore(banner, document.body.firstChild);
  }

  function open() {
    if (!banner) build();
    banner.hidden = false;
    root.classList.add('cc-open');
    fill();
  }

  function close() {
    if (!banner) return;
    banner.hidden = true;
    root.classList.remove('cc-open');
    if (opener) opener.focus({ preventScroll: true });
    opener = null;
  }

  function choose(value) {
    saveChoice(value);
    apply(value);
    close();
  }

  // ---------- Start ----------
  function start() {
    var choice = readChoice();
    if (choice) apply(choice);
    else open();
    fill();

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cookie-settings]');
      if (!btn) return;
      opener = btn;
      open();
      banner.focus({ preventScroll: true });
    });

    // Follow the EN/HR switch in the navigation.
    new MutationObserver(fill).observe(root, { attributes: true, attributeFilter: ['lang'] });

    // A choice made in another tab counts here too.
    window.addEventListener('storage', function (e) {
      if (e.key !== KEY) return;
      var value = readChoice();
      if (value) { apply(value); close(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
