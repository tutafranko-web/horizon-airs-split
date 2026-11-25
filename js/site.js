/*
 * Horizon Airs Split, home page.
 * Vercel serves /js as immutable for a year: after ANY change raise ?v= in index.html.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var soft = function (v) { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = matchMedia('(max-width: 820px)');

  // ---------- smooth wheel scrolling on computers ----------
  var lenis = null;
  if (!calm && window.Lenis && matchMedia('(pointer: fine)').matches) {
    lenis = new window.Lenis({ lerp: 0.11 });
  }
  function scrollToEl(el, then) {
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.3, onComplete: then });
    else { el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' }); if (then) setTimeout(then, calm ? 0 : 700); }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    closeMenu();
    history.pushState(null, '', a.getAttribute('href'));
    scrollToEl(el);
  });

  // ---------- header ----------
  var top = $('#top'), burger = $('.burger', top);
  function closeMenu() { top.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = top.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // ---------- scroll film ----------
  // data-shots="name:framesOnComputers:framesOnPhones,..."  data-weights="share of the scroll per shot"
  function Film(section) {
    var self = this;
    this.section = section;
    this.box = $('.film', section);
    this.canvas = $('canvas', this.box);
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.most = 1920;                           // widest picture that is drawn; the gliding film lowers it on slow computers
    this.pass = section.dataset.mode === 'pass';
    this.small = phone.matches;
    this.frames = [];
    this.shots = section.dataset.shots.split(',').map(function (s) {
      var p = s.split(':'), n = +(self.small ? p[2] : p[1]), first = self.frames.length;
      for (var i = 1; i <= n; i++) self.frames.push({ src: '/images/film/' + p[0] + '/' + (self.small ? 's' : 'l') + '/' + ('00' + i).slice(-3) + '.avif', img: null });
      return { first: first, n: n };
    });
    var w = section.dataset.weights.split(',').map(Number), sum = w.reduce(function (a, b) { return a + b; }, 0), at = 0;
    this.shots.forEach(function (s, i) { s.from = at; at += w[i] / sum; s.to = at; });
    this.fade = +section.dataset.fade || 0;     // share of the scroll, either side of a join, spent in the cloud between two shots
    this.still = section.dataset.still ? Math.round(+section.dataset.still * (this.frames.length - 1)) : 0;   // the frame shown when motion is off
    this.cur = 0; this.drawn = -1; this.busy = 0; this.shot = 0; this.p = 0; this.near = false;
    new IntersectionObserver(function (en) {
      self.near = en[0].isIntersecting;
      if (self.near && !self.started) self.load();
      if (!self.near) self.frames.forEach(letGo);
    }, { rootMargin: '140% 0px' }).observe(section);
    if (window.ResizeObserver) new ResizeObserver(function () { self.size(); }).observe(this.box);
    this.size();
  }
  Film.prototype.size = function () {
    var r = this.box.getBoundingClientRect(), k = Math.min(window.devicePixelRatio || 1, (this.small ? 900 : this.most) / Math.max(1, r.width));
    k = Math.max(k, 0.5);
    this.canvas.width = Math.round(r.width * k); this.canvas.height = Math.round(r.height * k);
    this.drawn = -1; this.sig = '';
  };
  Film.prototype.load = function () {
    var self = this, order = [], seen = {}, net = navigator.connection || {}, lite = net.saveData || /2g|3g/.test(net.effectiveType || '');
    this.started = true;
    if (this.fade && !calm) [0, 1].forEach(function (k) {
      fetch('/images/film/oblak-' + (k + 1) + '.webp').then(function (r) { return r.blob(); }).then(picture).then(function (im) { (self.mist = self.mist || [])[k] = im; self.ready = (self.ready || 0) + 1; }, function () {});
    });
    // rough first, then fill in, so scrolling works long before everything has arrived
    if (calm && this.still) { seen[this.still] = 1; order.push(this.still); }
    else (calm ? [1000] : lite ? [8, 4] : [8, 4, 2, 1]).forEach(function (step) {
      self.shots.forEach(function (s) { for (var i = 0; i < s.n; i += step) if (!seen[s.first + i]) { seen[s.first + i] = 1; order.push(s.first + i); } });
    });
    var next = function () {
      if (!order.length) return;
      var f = self.frames[order.shift()];
      fetch(f.src).then(function (r) { if (!r.ok) throw new Error(f.src); return r.blob(); }).then(function (b) { f.blob = b; next(); }, next);
    };
    for (var i = 0; i < 6; i++) next();
  };
  // Frames stay compressed in memory. Only those near the one on screen, plus every eighth, are decoded.
  function picture(blob) {
    var plain = function () { var im = new Image(); im.src = URL.createObjectURL(blob); return im.decode().then(function () { return im; }); };
    return window.createImageBitmap ? createImageBitmap(blob).catch(plain) : plain();
  }
  function letGo(f) {
    if (f.img && f.img.close) f.img.close();
    else if (f.img) URL.revokeObjectURL(f.img.src);
    f.img = null;
  }
  Film.prototype.decode = function (f) {
    var self = this;
    if (!f || !f.blob || f.img || f.busy || this.busy > 3) return;
    f.busy = true; this.busy++;
    var done = function () { f.busy = false; self.busy--; };
    picture(f.blob).then(function (im) { f.img = im; done(); if (!self.near) letGo(f); }, function () { f.blob = null; done(); });
  };
  Film.prototype.keep = function () {
    var c = Math.round(this.cur), i, d;
    for (d = 0; d <= 10; d++) { this.decode(this.frames[c + d]); if (d) this.decode(this.frames[c - d]); }
    for (i = 0; i < this.frames.length; i++) {
      if (i % 8 === 0) this.decode(this.frames[i]);
      else if (this.frames[i].img && Math.abs(i - c) > 14) letGo(this.frames[i]);
    }
  };
  Film.prototype.nearest = function (i, s) {
    for (var d = 0; d < s.n; d++) {
      if (i - d >= s.first && this.frames[i - d].img) return i - d;
      if (i + d < s.first + s.n && this.frames[i + d].img) return i + d;
    }
    return -1;
  };
  // The gliding film: the aircraft passes through a cloud between two shots, the picture moves between frames, the camera keeps rising slowly.
  Film.prototype.glide = function (p, dt) {
    var self = this, q, spots = [], layers = [], last = this.shots.length - 1, f = this.frames;
    if (this.q === undefined || Math.abs(p - this.q) > 0.5) this.q = p;
    this.dir = p < this.q - 1e-5 ? -1 : 1;
    q = this.q += (p - this.q) * (1 - Math.exp(-dt / 140));
    this.idle = Math.abs(p - q) < 0.0005 ? (this.idle || 0) + dt : 0;
    var rest = soft((this.idle - 100) / 260);                                // standing still it settles on one sharp frame
    this.shots.forEach(function (s, i) {
      var a = i ? s.from - self.fade : 0, b = i < last ? s.to + self.fade : 1;
      if (q < a || q > b) return;
      var t = clamp((q - a) / (b - a), 0, 1), at = s.first + t * (s.n - 1);
      layers.push({ s: s, at: at, t: t, alpha: i ? soft(((q - s.from) / self.fade + 0.14) / 0.28) : 1 });
      spots.push(Math.round(at));
    });
    if (this.idle === 0 && this.drawn >= 0) {
      this.pace = (this.pace || 16) + (dt - (this.pace || 16)) * 0.04;
      this.slow = this.pace > 25 ? (this.slow || 0) + 1 : 0;
      if (this.slow > 45 && this.most > 1200) { this.most = this.most > 1600 ? 1536 : 1152; this.slow = 0; this.pace = 16; this.size(); }
    }
    var i, d, step = Math.max(8, Math.ceil(f.length / 14));
    // in a fast scroll every second or fourth frame is enough, the blending fills the gaps
    var speed = Math.abs(p - this.was || 0) * f.length * 1000 / Math.max(8, dt);
    this.was = p;
    this.speed = (this.speed || 0) + (speed - (this.speed || 0)) * (1 - Math.exp(-dt / 180));
    var by = this.speed > 90 ? 4 : this.speed > (this.by > 1 ? 16 : 24) ? 2 : 1;
    this.by = by;
    layers.forEach(function (l) {
      var at = l.s.first + Math.floor((l.at - l.s.first) / by) * by, e = l.s.first + l.s.n - 1;
      for (d = 0; d <= 5; d++) { self.decode(f[clamp(at + (self.dir > 0 ? d : 1 - d) * by, l.s.first, e)]); if (d === 1) self.decode(f[clamp(at + (self.dir > 0 ? 0 : 1) * by, l.s.first, e)]); }
    });
    for (i = 0; i < f.length; i++) {
      if (i % step === 0) this.decode(f[i]);
      else if (f[i].img && spots.every(function (c) { return Math.abs(i - c) > 8 + 4 * by; })) letGo(f[i]);
    }
    var sig = '', todo = [], cloud = 9, warm = false;
    this.shots.forEach(function (s, i) { if (i && Math.abs(q - s.from) < self.fade) { cloud = (q - s.from) / self.fade; warm = i === last; } });
    while (layers.length > 1 && layers[1].alpha > 0.996) layers.shift();
    layers.forEach(function (l) {
      if (l.alpha < 0.004) return;
      var e = l.s.first + l.s.n - 1, lo = l.s.first + Math.floor((l.at - l.s.first) / by) * by, up = Math.min(e, lo + by), part = up > lo ? (l.at - lo) / (up - lo) : 0, n = self.nearest(clamp(Math.round(l.at), l.s.first, l.s.first + l.s.n - 1), l.s), z = 1.03 + 0.05 * l.t, y = 0.024 * (l.t - 0.5);
      if (n < 0) return;
      if (!f[lo].img || !f[up].img) { lo = up = n; part = 0; }
      part = Math.round((part + (Math.round(part) - part) * rest) * 24) / 24;
      todo.push([f[lo].img, l.alpha * (1 - part) / Math.max(0.001, 1 - l.alpha * part), z, y]);
      if (part > 0) todo.push([f[up].img, l.alpha * part, z, y]);
      sig += lo + '-' + up + ':' + part.toFixed(2) + ':' + l.alpha.toFixed(3) + ':' + z.toFixed(4) + ' ';
    });
    if (cloud < 2) sig += cloud.toFixed(3);
    if (rest === 1) sig += 'sharp';
    if (!todo.length || sig === this.sig && this.ready !== 2) return;
    todo[0][1] = 1;
    this.sig = sig;
    var c = this.canvas, ctx = this.ctx;
    ctx.imageSmoothingQuality = rest === 1 ? 'high' : 'low';          // the fine scaling is too slow to run while the page moves
    todo.forEach(function (o) {
      var iw = o[0].naturalWidth || o[0].width, ih = o[0].naturalHeight || o[0].height, k = Math.max(c.width / iw, c.height / ih) * o[2], w = iw * k, h = ih * k;
      ctx.globalAlpha = clamp(o[1], 0, 1);
      ctx.drawImage(o[0], (c.width - w) / 2, (c.height - h) / 2 + c.height * o[3], w, h);
    });
    ctx.globalAlpha = 1;
    if (cloud < 2) this.inCloud(cloud, warm);
    else if (this.ready === 2) { this.ready = 3; this.inCloud(0.999, true, 0.006); }      // invisible rehearsal, so that the first real cloud does not stutter
    if (this.drawn < 0) this.box.classList.add('is-live');
    this.drawn = 0;
  };
  // x: -1 the first wisps, 0 in the middle of the cloud, 1 out of it
  Film.prototype.inCloud = function (x, warm, least) {
    var c = this.canvas, ctx = this.ctx, w = Math.max(c.width, c.height * 1.25), self = this, far = 1 - Math.abs(x), thick = Math.max(soft(far * 1.25), least || 0), g;
    ctx.imageSmoothingQuality = 'low';
    function put(im, scale, dy, alpha) {
      alpha = Math.max(alpha, least || 0);
      if (!im || alpha < 0.004) return;
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.drawImage(im, (c.width - w * scale) / 2, (c.height - w * scale) / 2 + dy * c.height, w * scale, w * scale);
    }
    ctx.globalAlpha = Math.max(soft((0.46 - Math.abs(x)) / 0.3), least || 0);
    ctx.fillStyle = '#dfe9f0';
    ctx.fillRect(0, 0, c.width, c.height);
    put(self.mist && self.mist[0], 1.15 + 0.11 * (x + 1), 0.16 * x, thick);
    put(self.mist && self.mist[1], 1.35 + 0.25 * (x + 1), 0.42 * x, soft(far * 1.7));
    if (warm) {                                       // the last shot is the sunset, its side of the cloud is warm
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = thick * soft((x + 0.5) / 0.9);
      ctx.fillStyle = '#f6d9b4';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = thick;                          // keeps the white digits readable on the white cloud
    g = ctx.createLinearGradient(0, c.height, 0, c.height * 0.3);
    g.addColorStop(0, 'rgba(6,35,56,.62)'); g.addColorStop(0.55, 'rgba(6,35,56,.34)'); g.addColorStop(1, 'rgba(6,35,56,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalAlpha = 1;
  };
  Film.prototype.update = function (dt) {
    if (!this.near) return;
    var r = this.section.getBoundingClientRect(), vh = window.innerHeight;
    var p = this.pass ? (vh - r.top) / (vh + r.height * 0.6) : -r.top / Math.max(1, r.height - vh);
    this.p = p = calm ? 0 : clamp(p, 0, 1);
    if (this.fade && !calm) return this.glide(p, dt);
    for (var i = 0; i < this.shots.length; i++) if (p <= this.shots[i].to || i === this.shots.length - 1) break;
    var s = this.shots[i], want = s.first + clamp((p - s.from) / (s.to - s.from), 0, 1) * (s.n - 1);
    if (calm) want = this.still;
    if (i !== this.shot || calm) { this.shot = i; this.cur = want; }       // hard cut between shots
    this.cur += (want - this.cur) * 0.28;
    this.keep();
    var n = this.nearest(clamp(Math.round(this.cur), s.first, s.first + s.n - 1), s);
    if (n >= 0 && n !== this.drawn) this.draw(n);
  };
  Film.prototype.draw = function (n) {
    var img = this.frames[n].img, c = this.canvas, iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, k = Math.max(c.width / iw, c.height / ih);
    var w = iw * k, h = ih * k;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
    if (this.drawn < 0) this.box.classList.add('is-live');
    this.drawn = n;
    if (this.onDraw) this.onDraw(img);
  };
  var films = $$('[data-shots]').map(function (s) { return new Film(s); });
  var by = {}; films.forEach(function (f) { by[f.section.id] = f; });

  // the sky above the film on phones takes the colour of the film's own sky
  var dot = document.createElement('canvas'); dot.width = dot.height = 1;
  var dctx = dot.getContext('2d', { willReadFrequently: true }), skyAt = -9;
  if (by.home) by.home.onDraw = function (img) {
    if (!phone.matches || Math.abs(by.home.drawn - skyAt) < 4) return;
    skyAt = by.home.drawn;
    dctx.drawImage(img, 0, 0, img.naturalWidth || img.width, 14, 0, 0, 1, 1);
    var d = dctx.getImageData(0, 0, 1, 1).data;
    by.home.section.style.setProperty('--sky', 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')');
  };

  // ---------- what else moves with the scroll ----------
  var h1 = $('.hero h1'), opened = calm ? 1 : 0, t0 = 0;
  var waiting = [], steps = $$('.checklist li'), caps = $$('#flight .caps p'), alt = calm ? null : altimeter($('.alt'));
  // canyon: [progress, value]. The headline closes in with the walls and leans with the horizon of the film.
  var canH = $('#canyon h2'), canCaps = $$('#canyon .caps p');
  var CAPS = [0, 0.33, 0.71, 1];     // where each line of the flight section begins
  var WIDE = [[0, 118], [0.06, 112], [0.18, 66], [0.26, 64], [0.7, 64], [0.84, 92], [0.94, 120], [1, 120]];
  var LEAN = [[0, -2.3], [0.09, -6.4], [0.17, -11.5], [0.26, -1.8], [0.35, 12.4], [0.43, 3.7], [0.52, -12.4], [0.6, -1.8], [0.68, 11.5], [0.75, 2.8], [0.82, -8.3], [0.91, -1.8], [0.97, 0], [1, 0]];
  function along(t, p) {
    var i = 1;
    while (i < t.length - 1 && p > t[i][0]) i++;
    var a = t[i - 1], b = t[i], k = clamp((p - a[0]) / (b[0] - a[0]), 0, 1);
    return a[1] + (b[1] - a[1]) * k * k * (3 - 2 * k);
  }
  // The altimeter: digits roll like the drum of the real instrument, the tape beside them runs with the climb.
  function altimeter(el) {
    var b = $('b', el), drums = [], wide = [1, 1], at = -1, shown = 0, still = 0, was = 0, html = '';
    b.textContent = '';
    [8, 11, 1].forEach(function (n) {
      var d = document.createElement('span'), r = document.createElement('span');
      d.className = 'd'; r.className = 'r';
      for (var i = 0; i < n; i++) { var s = document.createElement('span'); s.textContent = n === 8 && !i ? ' ' : i % 10; r.appendChild(s); }
      d.appendChild(r); b.appendChild(d);
      drums.push({ d: d, r: r });
    });
    var tape = document.createElement('em');
    tape.className = 'tape';
    for (var m = 0; m <= 700; m += 10) html += '<i style="--m:' + m + '"' + (m % 100 ? m % 50 ? '' : ' class="half"' : ' class="full"') + '>' + (m % 100 ? '' : '<u>' + m + '</u>') + '</i>';
    tape.innerHTML = '<s>' + html + '</s>';
    var strip = tape.firstChild;
    el.appendChild(tape);
    function measure() {
      var fs = parseFloat(getComputedStyle(b).fontSize) || 1;
      wide = [0, 1].map(function (k) { return drums[k].r.offsetWidth / fs; });
      at = -1;
    }
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener('resize', measure);
    var notch = function (f) { return soft((f - 0.12) / 0.76); };            // each digit rests a moment before the next one
    function set(k, pos, open) {
      var D = drums[k];
      D.r.style.transform = 'translate3d(0,' + (-pos).toFixed(3) + 'em,0)';
      D.d.style.width = open < 1 ? (wide[k] * open).toFixed(3) + 'em' : '';
      D.d.style.opacity = open < 1 ? open.toFixed(2) : '';
    }
    return function (value, dt) {
      still = Math.abs(value - was) < 0.4 ? still + dt : 0;
      was = value;
      var goal = still > 160 ? Math.round(value / 10) * 10 : value;          // at rest it settles on a whole number
      shown += (goal - shown) * (1 - Math.exp(-dt / 110));
      if (Math.abs(goal - shown) < 0.02) shown = goal;
      if (shown === at) return;
      at = shown;
      var t = shown / 10, n = Math.floor(t + 1e-6), h = Math.floor(n / 10), tens = n % 10;
      set(1, tens + notch(t - n), soft(t));
      set(0, h + (tens === 9 ? notch(t - n) : 0), soft((shown - 90) / 10));
      strip.style.setProperty('--at', shown.toFixed(2));
      el.dataset.m = Math.round(shown / 10) * 10;
    };
  }
  var before = 0;
  function tick(time) {
    var dt = Math.min(60, time - before || 16);
    before = time;
    if (lenis) lenis.raf(time);
    top.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.5);
    films.forEach(function (f) { f.update(dt); });
    if (by.home && by.home.near) {
      // the headline widens like the horizon does: once on arrival, then with the scroll
      if (!t0) t0 = time;
      if (opened < 1) { opened = clamp((time - t0) / 1500, 0, 1); }
      var ease = 1 - Math.pow(1 - opened, 4), max = phone.matches ? 112 : 122, start = phone.matches ? 84 : 78;
      var wd = 62 + (start - 62) * ease + (max - start) * clamp(by.home.p * 1.25, 0, 1);
      var v = wd.toFixed(1);
      if (h1.dataset.wd !== v) { h1.dataset.wd = v; h1.style.setProperty('--wd', v); }
    }
    if (by.about && by.about.near && !calm) steps.forEach(function (li, i) {
      li.classList.toggle('is-on', i === by.about.shot);
      li.classList.toggle('is-done', i < by.about.shot);
    });
    if (by.flight && by.flight.near && !calm) {
      var p = by.flight.q || 0, climb = clamp((p - 0.03) / 0.67, 0, 1);
      alt(300 - 300 * Math.cos(Math.PI * climb), dt);
      caps.forEach(function (el, i) {
        // one line leaves before the next one arrives
        var a = CAPS[i], b = CAPS[i + 1], came = i ? soft((p - a) / 0.06) : 1, left = i < 2 ? soft((p - b + 0.06) / 0.06) : 0, o = came * (1 - left);
        el.style.opacity = o.toFixed(3);
        el.style.transform = 'translate3d(0,' + ((1 - came) * 34 - left * 34).toFixed(1) + 'px,0)';
        el.classList.toggle('is-on', o > 0.5);
      });
    }
    if (by.canyon && by.canyon.near && !calm) {
      var cf = by.canyon, ca = clamp(cf.cur / (cf.frames.length - 1), 0, 1), cc = cf.p < 0.33 ? 0 : cf.p < 0.7 ? 1 : 2;
      canH.style.setProperty('--wd', along(WIDE, ca).toFixed(1));
      canH.style.setProperty('--lean', (along(LEAN, ca) * 0.5).toFixed(2));
      canCaps.forEach(function (el, i) { el.classList.toggle('is-on', i === cc); });
    }
    if (waiting.length) waiting = waiting.filter(function (n) {
      if (n.getBoundingClientRect().top > window.innerHeight * 0.88) return true;
      n.classList.add('is-in');
      return false;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ---------- headings and price bars come in once ----------
  $$('h2').forEach(function (h) { if (!h.closest('.stage')) { h.classList.add('rise'); waiting.push(h); } });
  $$('.ruler').forEach(function (r) { waiting.push(r); });

  // ---------- route chart ----------
  var D = window.FAS_CHART, chart = $('#chart'), svg = $('svg', chart), NS = 'http://www.w3.org/2000/svg';
  var lang = function () { return root.lang === 'hr' ? 3 : 2; };
  var X = function (lon) { return (lon - D.w) / (D.e - D.w) * D.W; }, Y = function (lat) { return (D.n - lat) / (D.n - D.s) * D.H; };
  function el(name, attrs, parent) { var n = document.createElementNS(NS, name); for (var k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; }
  var view = null, names = [], current = 'sea-60', layer, anim = 0, fly = 0, sizes = [];
  function buildChart() {
    var i, d = '';
    el('path', { class: 'c-land', d: D.land });
    el('path', { class: 'c-river', d: D.river });
    el('path', { class: 'c-lake', d: D.lake });
    for (i = Math.ceil(D.w * 6); i <= D.e * 6; i++) d += 'M' + X(i / 6).toFixed(1) + ' -60V1060';
    for (i = Math.ceil(D.s * 6); i <= D.n * 6; i++) d += 'M-60 ' + Y(i / 6).toFixed(1) + 'H1140';
    el('path', { class: 'c-grid', d: d });
    [[43.33, 15.75, 'Adriatic Sea', 'Jadransko more', 20, 2], [43.315, 16.66, 'Brač', 'Brač', 14, 1], [43.142, 16.72, 'Hvar', 'Hvar', 13, 1], [43.047, 16.12, 'Vis', 'Vis', 12, 1], [43.375, 16.31, 'Šolta', 'Šolta', 11, 1], [42.965, 16.83, 'Korčula', 'Korčula', 12, 1], [43.88, 16.1, 'Dalmatian hinterland', 'Dalmatinska zagora', 17, 1], [43.56, 16.335, 'Kaštela', 'Kaštela', 10, 1]].forEach(function (g) {
      var n = el('text', { class: 'c-geo' + (g[5] === 1 ? ' is-land' : g[5] ? ' is-sea' : ''), x: X(g[1]), y: Y(g[0]) });
      n.dataset.en = g[2]; n.dataset.hr = g[3]; sizes.push([n, g[4]]); names.push(n);
    });
    [[44.062, 16.383, 1831], [43.797, 16.459, 1508], [43.527, 16.627, 1339], [43.586, 16.47, 779], [43.033, 16.117, 587]].forEach(function (k) {
      var g = el('g', { transform: 'translate(' + X(k[1]) + ' ' + Y(k[0]) + ')' });
      var s = el('path', { class: 'c-peak', d: 'M0-5L5 4H-5z' }, g), n = el('text', { class: 'c-peak-t', x: 0, y: 0, 'text-anchor': 'middle', dy: '1.5em' }, g);
      n.textContent = k[2]; sizes.push([n, 11]); sizes.push([s, 1, 'scale']);
    });
    layer = el('g', {});
    label();
  }
  function label() { names.forEach(function (n) { n.textContent = root.lang === 'hr' ? n.dataset.hr : n.dataset.en; }); }
  function curve(pts) {               // closed, soft turns through every stop
    var n = pts.length, s = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1), t = 0.16;
    for (var i = 0; i < n; i++) {
      var a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n], e = pts[(i + 2) % n];
      var k1 = i === 0 ? 0 : t, k2 = i === n - 1 ? 0 : t;
      var leg = Math.hypot(c[0] - b[0], c[1] - b[1]) * 0.34;   // keeps short legs from looping
      var h1x = (c[0] - a[0]) * k1, h1y = (c[1] - a[1]) * k1, h2x = (e[0] - b[0]) * k2, h2y = (e[1] - b[1]) * k2;
      var f1 = Math.min(1, leg / (Math.hypot(h1x, h1y) || 1)), f2 = Math.min(1, leg / (Math.hypot(h2x, h2y) || 1));
      s += 'C' + [b[0] + h1x * f1, b[1] + h1y * f1, c[0] - h2x * f2, c[1] - h2y * f2, c[0], c[1]].map(function (v) { return v.toFixed(1); }).join(' ');
    }
    return s;
  }
  function setView(v) {
    view = v;
    svg.setAttribute('viewBox', v.map(function (n) { return n.toFixed(2); }).join(' '));
    var u = v[2] / Math.max(1, chart.clientWidth);
    sizes.forEach(function (s) {
      if (s[2] === 'scale') s[0].setAttribute('transform', 'scale(' + u.toFixed(4) + ')');
      else s[0].style.fontSize = (s[1] * u).toFixed(3) + 'px';
    });
    $$('.c-name', layer).forEach(function (n) { n.style.fontSize = (14.5 * u).toFixed(3) + 'px'; n.style.strokeWidth = (4 * u).toFixed(3) + 'px'; n.setAttribute('dx', 11 * u * +n.dataset.side); n.setAttribute('dy', +n.dataset.dy * u); });
    $$('.c-stop', layer).forEach(function (n) { n.setAttribute('r', (5 * u).toFixed(3)); });
    var gy = $('.c-gyro', layer); if (gy) gy.dataset.u = u;
    // scale bar
    var kmPerPx = u / D.H * (D.n - D.s) * 111.2, km = [1, 2, 5, 10, 20, 50].filter(function (k) { return k / kmPerPx < 130; }).pop() || 1;
    $('.scale i', chart).style.width = (km / kmPerPx).toFixed(0) + 'px'; $('.scale span', chart).textContent = km + ' km';
  }
  function fit(pts) {
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
    var ar = chart.clientWidth / Math.max(1, chart.clientHeight), small = phone.matches;
    var w = Math.max(x1 - x0, 60) * (small ? 2.15 : 1.6), h = Math.max(y1 - y0, 60) * (small ? 1.5 : 1.45);
    if (w / h < ar) w = h * ar; else h = w / ar;
    return [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h];
  }
  function show(id, still) {
    current = id;
    var keys = D.routes[id], pts = keys.map(function (k) { return [X(D.places[k][1]), Y(D.places[k][0])]; }), to = fit(pts), d = curve(pts);
    layer.textContent = '';
    el('path', { class: 'c-case', d: d }, layer);
    var line = el('path', { class: 'c-route', d: d }, layer), len = line.getTotalLength(), N = 260, trail = [];
    for (var q0 = 0; q0 <= N; q0++) { var pt = line.getPointAtLength(len * q0 / N); trail.push(pt.x.toFixed(1) + ' ' + pt.y.toFixed(1)); }
    var stops = keys.map(function (k) { return D.places[k][lang()]; });
    names.forEach(function (n) { n.style.display = stops.indexOf(n.textContent) >= 0 ? 'none' : ''; });
    var cx = pts.reduce(function (a, p) { return a + p[0]; }, 0) / pts.length;
    keys.forEach(function (k, i) {
      el('circle', { class: 'c-stop', cx: pts[i][0], cy: pts[i][1], r: 4 }, layer);
      var side = pts[i][0] >= cx ? 1 : -1, near = pts.some(function (q, j) { return j < i && Math.abs(q[1] - pts[i][1]) < to[3] * 0.035 && Math.abs(q[0] - pts[i][0]) < to[2] * 0.2; });
      var n = el('text', { class: 'c-name', x: pts[i][0], y: pts[i][1], 'text-anchor': side > 0 ? 'start' : 'end' }, layer);
      n.dataset.side = side; n.dataset.dy = near ? 19 : 5; n.textContent = D.places[k][lang()];
    });
    var g = el('g', { class: 'c-gyro' }, layer);
    g.innerHTML = '<circle r="21" fill="#fff" fill-opacity=".55"/><path d="M-1.6 6h3.2v11h-3.2zM-8 15h16v4H-8zM0-17c4.6 3 6 8 6 13 0 6-2.6 10-6 11-3.4-1-6-5-6-11 0-5 1.4-10 6-13z" fill="#ffc61a" stroke="#0b1d2a" stroke-width="1.7" stroke-linejoin="round"/><path class="rot" d="M-21 0H21" stroke="#0b1d2a" stroke-width="2.6" stroke-linecap="round"/><circle r="2.6" fill="#0b1d2a"/>';
    var rot = $('.rot', g), casing = $('.c-case', layer);
    cancelAnimationFrame(anim);
    var from = view || to, start = 0, go = still || calm;
    if (go) { setView(to); place(1, 0); return; }
    line.setAttribute('d', 'M' + trail[0]); casing.setAttribute('d', 'M' + trail[0]);
    function place(t, time) {
      var fi = clamp(t * N, 0, N), i0 = Math.min(N - 1, Math.floor(fi)), p0 = trail[i0].split(' ').map(Number), p1 = trail[i0 + 1].split(' ').map(Number), w = fi - i0;
      var a = { x: p0[0] + (p1[0] - p0[0]) * w, y: p0[1] + (p1[1] - p0[1]) * w };
      var ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI + 90, u = view[2] / Math.max(1, chart.clientWidth);
      g.setAttribute('transform', 'translate(' + a.x.toFixed(2) + ' ' + a.y.toFixed(2) + ') rotate(' + ang.toFixed(1) + ') scale(' + (u * 1.15).toFixed(4) + ')');
      rot.setAttribute('transform', 'rotate(' + (time * 0.9 % 360).toFixed(0) + ')');
    }
    function frame(time) {
      if (!start) start = time;
      var z = clamp((time - start) / 900, 0, 1), e = z < 0.5 ? 4 * z * z * z : 1 - Math.pow(-2 * z + 2, 3) / 2;
      if (view !== to) setView(z < 1 ? from.map(function (v, i) { return v + (to[i] - v) * e; }) : to);
      var t = clamp((time - start - 450) / (2600 + keys.length * 260), 0, 1), q = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      var part = 'M' + trail.slice(0, Math.floor(q * N) + 1).join('L');
      line.setAttribute('d', part); casing.setAttribute('d', part);
      place(q, time);
      if (t < 1) anim = requestAnimationFrame(frame);
    }
    anim = requestAnimationFrame(frame);
  }
  function choose(id, focus) {
    $$('.route').forEach(function (li) {
      var on = li.dataset.route === id, b = $('h3 button', li);
      li.classList.toggle('is-on', on); b.setAttribute('aria-expanded', String(on)); $('.r-more', li).hidden = !on;
    });
    show(id);
    if (focus) {
      var li = $('.route[data-route="' + id + '"]');
      if (phone.matches) {            // keep the opened route just below the chart
        var y = li.getBoundingClientRect().top - chart.getBoundingClientRect().bottom - 4;
        if (lenis) lenis.scrollTo(window.scrollY + y); else window.scrollBy({ top: y, behavior: calm ? 'auto' : 'smooth' });
      }
    }
  }
  if (D && chart) {
    buildChart();
    var firstShow = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { firstShow.disconnect(); show(current); } }, { threshold: 0.25 });
    setView(fit([[60, 120], [1020, 900]]));
    firstShow.observe(chart);
    $$('.route h3 button').forEach(function (b) {
      b.addEventListener('click', function () { var id = b.closest('.route').dataset.route; if (id !== current || b.getAttribute('aria-expanded') !== 'true') choose(id, true); });
    });
    $$('[data-goto]').forEach(function (a) {
      a.addEventListener('click', function () {
        var panel = $('.route[data-route="' + a.dataset.goto + '"]').closest('[role=tabpanel]');
        pickTab($('.tabs [aria-controls="' + panel.id + '"]'));
        choose(a.dataset.goto);
      });
    });
    var tabs = $$('.tabs [role=tab]');
    var pickTab = function (t, focus) {
      tabs.forEach(function (o) {
        var on = o === t; o.setAttribute('aria-selected', String(on)); o.tabIndex = on ? 0 : -1;
        document.getElementById(o.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
      var first = $('.route.is-on', document.getElementById(t.getAttribute('aria-controls'))) || $('.route', document.getElementById(t.getAttribute('aria-controls')));
      choose(first.dataset.route);
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pickTab(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { e.preventDefault(); pickTab(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
    var wasW = 0;
    window.addEventListener('resize', function () { if (chart.clientWidth !== wasW) { wasW = chart.clientWidth; if (view) show(current, true); } });
  }

  // ---------- booking ----------
  var form = $('#booking form');
  $$('[data-book]').forEach(function (b) {
    b.addEventListener('click', function () {
      form.elements.tour.value = b.dataset.book;
      scrollToEl($('#booking'), function () { form.elements.name.focus({ preventScroll: true }); });
    });
  });
  var now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  form.elements.date.min = now.toISOString().slice(0, 10);
  form.addEventListener('submit', function () {
    var b = $('button[type=submit]', form);
    b.disabled = true; b.textContent = root.lang === 'hr' ? 'Slanje...' : 'Sending...';
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) { var b = $('button[type=submit]', form); b.disabled = false; setLang(root.lang); } });

  // ---------- photos ----------
  var box = $('#box'), shots = $$('.strip button'), at = 0;
  function photo(i) {
    at = (i + shots.length) % shots.length;
    var im = $('img', shots[at]);
    $('img', box).src = im.src; $('img', box).alt = im.alt; $('p', box).textContent = $('span', shots[at]).textContent;
  }
  shots.forEach(function (b, i) { b.addEventListener('click', function () { photo(i); box.showModal(); if (lenis) lenis.stop(); }); });
  box.addEventListener('close', function () { if (lenis) lenis.start(); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  $('.prev', box).addEventListener('click', function () { photo(at - 1); });
  $('.next', box).addEventListener('click', function () { photo(at + 1); });
  $('.close', box).addEventListener('click', function () { box.close(); });
  box.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') photo(at - 1); if (e.key === 'ArrowRight') photo(at + 1); });

  // ---------- English / Croatian ----------
  var EN = null, btn = $('#lang-toggle');
  function grab() {
    EN = {};
    $$('[data-i18n]').forEach(function (n) { EN[n.dataset.i18n] = n.innerHTML; });
    $$('[data-i18n-ph]').forEach(function (n) { EN['@' + n.dataset.i18nPh] = n.placeholder; });
    $$('[data-i18n-label]').forEach(function (n) { EN['#' + n.dataset.i18nLabel] = n.label; });
  }
  function setLang(l) {
    var T = l === 'hr' ? window.FAS_HR : EN;
    $$('[data-i18n]').forEach(function (n) { if (T[n.dataset.i18n] != null) n.innerHTML = T[n.dataset.i18n]; });
    $$('[data-i18n-ph]').forEach(function (n) { n.placeholder = T['@' + n.dataset.i18nPh]; });
    $$('[data-i18n-label]').forEach(function (n) { n.label = T['#' + n.dataset.i18nLabel]; });
    root.lang = l;
    btn.textContent = l === 'hr' ? 'EN' : 'HR'; btn.lang = l === 'hr' ? 'en' : 'hr';
    btn.setAttribute('aria-label', l === 'hr' ? 'Switch to English' : 'Prebaci na hrvatski');
    if (D && view) { label(); show(current, true); }
  }
  btn.addEventListener('click', function () {
    if (!EN) grab();
    var to = root.lang === 'hr' ? 'en' : 'hr';
    if (to === 'hr' && !window.FAS_HR) {
      var s = document.createElement('script');
      s.src = '/js/hr.js?v=1'; s.onload = function () { setLang('hr'); };
      document.head.appendChild(s);
    } else setLang(to);
  });
})();
