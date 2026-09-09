/* ─────────────────────────────────────────────────────────
   Flamingo Destination — site behaviour.
   Booking is handled off-site by Beach Reunion, so there is no
   form to wire up here.
   ───────────────────────────────────────────────────────── */

/* ── intro curtain ──────────────────────────────────────────
   Covers the viewport in palm fronds and flamingos, then drops them
   away left to right. Never built when the visitor asks for reduced
   motion, and only once per browsing session. Everything below waits
   on AVALON_REVEAL so nothing animates behind the curtain.
   ───────────────────────────────────────────────────────── */
window.AVALON_REVEAL = (function curtain(){
  const force   = location.hash === '#hold';   // replay the intro on demand
  const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen    = (() => { try { return sessionStorage.getItem('fd-intro') === '1'; } catch (e) { return false; } })();
  // reduced motion always wins; #hold only bypasses the once-a-session guard
  if (reduce || (!force && seen)) return Promise.resolve();
  try { sessionStorage.setItem('fd-intro', '1'); } catch (e) {}

  const GREENS = ['#1d5c47','#24694e','#2f7d57','#154c3b','#367f59','#12736c'];
  const PINKS  = ['#e8618c','#ef8aab','#d64878'];
  const rand   = (a, b) => a + Math.random() * (b - a);
  const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // one leaflet: a teardrop from (x,y) pointing along ang for len
  function leaflet(x, y, ang, len, wid) {
    const r = ang * Math.PI / 180;
    const cx = Math.cos(r), cy = Math.sin(r);
    const nx = -cy, ny = cx;
    const tx = x + cx * len, ty = y + cy * len;
    const ax = x + cx * len * .38, ay = y + cy * len * .38;
    return `M${x.toFixed(1)},${y.toFixed(1)} Q${(ax+nx*wid).toFixed(1)},${(ay+ny*wid).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}`
         + ` Q${(ax-nx*wid).toFixed(1)},${(ay-ny*wid).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}Z`;
  }

  // a whole frond: leaflets marching up a bowed stem, tapering at the tip
  function frond(colour) {
    const bow   = rand(-26, 26);
    const pairs = Math.round(rand(9, 13));
    const spread= rand(46, 66);
    let d = '', stem = `M50,196 Q${(50 + bow).toFixed(1)},110 ${(50 + bow * 1.7).toFixed(1)},18`;
    for (let i = 0; i < pairs; i++) {
      const t  = .10 + (i / pairs) * .88;
      const x  = 50 + bow * (2 * t * (1 - t) * 2) + bow * .7 * t * t;
      const y  = 196 - t * 178;
      const taper = Math.sin((1 - t) * Math.PI * .5 + .35);
      const len   = rand(30, 46) * taper;
      const wid   = len * rand(.20, .30);
      const droop = t * 16;
      d += leaflet(x, y, -90 - spread + droop, len, wid);
      d += leaflet(x, y, -90 + spread - droop, len, wid);
    }
    return `<svg viewBox="0 0 100 200" fill="none" aria-hidden="true">
      <path d="${stem}" stroke="${colour}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="${d}" fill="${colour}"/></svg>`;
  }

  // banana leaf: a blade with torn notches along both edges and a midrib
  function bananaLeaf(colour) {
    const steps = 13;
    const halfW = (t) => 33 * Math.sin(Math.pow(t, .72) * Math.PI);
    const left = [], right = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = 188 - t * 172;
      const w = halfW(t) * (i % 2 ? .58 : 1);   // every other point tears inward
      left.push(`${(50 - w).toFixed(1)},${y.toFixed(1)}`);
      right.unshift(`${(50 + w).toFixed(1)},${y.toFixed(1)}`);
    }
    const outline = `M50,190 L${left.join(' L')} L50,14 L${right.join(' L')} Z`;
    return `<svg viewBox="0 0 100 200" aria-hidden="true">
      <path d="${outline}" fill="${colour}"/>
      <path d="M50,190 V16" stroke="#fdf6f2" stroke-width="2.6" opacity=".38" stroke-linecap="round"/>
    </svg>`;
  }

  // Twemoji flamingo carries its own colours; vary hue slightly so the flock
  // does not look stamped from one die.
  const bird = () =>
    `<svg viewBox="0 0 36 36" style="filter:hue-rotate(${rand(-14, 14).toFixed(0)}deg)" aria-hidden="true"><use href="#flamingo"/></svg>`;

  const el = document.createElement('div');
  el.className = 'curtain';
  el.setAttribute('aria-hidden', 'true');

  // innerWidth can be 0 if we run before the viewport is laid out; never
  // let that collapse the grid to a single leaf.
  const de = document.documentElement;
  const vw = Math.max(window.innerWidth  || 0, de.clientWidth  || 0, 360);
  const vh = Math.max(window.innerHeight || 0, de.clientHeight || 0, 640);
  // Density comes from the viewport guess above, but placement and size are
  // expressed in % and vmin so coverage is correct even if that guess was off.
  const cols = Math.max(6, Math.min(11, Math.round(vw / (vw < 620 ? 105 : 145))));
  const rows = Math.max(5, Math.min(9, Math.round(vh / (vw < 620 ? 120 : 145))));
  const bits = [];

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const jitter = 0.34;
      const xPct = ((c + 0.5 + rand(-jitter, jitter)) / cols) * 100;
      const yPct = ((r + 0.5 + rand(-jitter, jitter)) / rows) * 100;
      const roll = Math.random();
      const isBird = roll > .84;
      const size = isBird ? rand(18, 26) : rand(38, 56);   // vmin
      const colour = isBird ? pick(PINKS) : pick(GREENS);
      const d = document.createElement('div');
      d.className = isBird ? 'curtain-bit is-bird' : 'curtain-bit';
      d.style.cssText =
        `left:${xPct.toFixed(2)}%;top:${yPct.toFixed(2)}%;width:${size.toFixed(1)}vmin;` +
        `--rot:${(isBird ? rand(-16, 16) : rand(-180, 180)).toFixed(1)}deg;` +
        `--dx:${rand(-9, 9).toFixed(1)}vw;` +
        `--dr:${(isBird ? rand(-40, 40) : rand(-150, 150)).toFixed(0)}deg;` +
        `--d:${(xPct / 100 * 700 + rand(0, 190)).toFixed(0)}ms;`;
      d.innerHTML = isBird ? bird() : (roll > .60 ? bananaLeaf(colour) : frond(colour));
      bits.push(d);
    }
  }
  // birds last so they sit above the foliage instead of behind it
  bits.sort((a, b) => a.classList.contains('is-bird') - b.classList.contains('is-bird'));
  bits.forEach(b => el.appendChild(b));
  (document.body || document.documentElement).prepend(el);
  const root = document.documentElement;
  root.style.overflow = 'hidden';
  root.classList.add('pre-reveal');   // holds the page back so it can ease in

  return new Promise((resolve) => {
    let done = false;
    // Let the page start easing in while the leaves are still clearing, so the
    // two motions overlap instead of the site popping in after a dead beat.
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      root.classList.remove('pre-reveal');
      root.classList.add('revealing');
      // Drop the class once the entrance is over: from then on the page is
      // styled normally, so nothing can leave content stuck invisible.
      setTimeout(() => root.classList.remove('revealing'), 1800);
    };
    const finish = () => {
      if (done) return;
      done = true;
      reveal();
      root.style.overflow = '';
      el.remove();
      window.removeEventListener('keydown', skip, true);
      window.removeEventListener('pointerdown', skip, true);
      resolve();
    };
    const drop = (fast) => {
      el.classList.add('is-out');
      setTimeout(reveal, fast ? 90 : 380);
      setTimeout(finish, fast ? 780 : 2000);
    };
    const skip = () => { el.classList.add('is-fast'); drop(true); };
    window.addEventListener('keydown', skip, true);
    window.addEventListener('pointerdown', skip, true);
    setTimeout(() => drop(false), force ? 999999 : 340);
    // Watchdog: if anything above throws or never fires, never strand the
    // visitor on a blank page.
    if (!force) setTimeout(finish, 8000);
  });
})();

/* ── count-up stats ─────────────────────────────────────── */
(function counters(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes  = document.querySelectorAll('[data-count]');
  if (reduce || !('IntersectionObserver' in window)) return;

  const run = (el) => {
    const target = Number(el.dataset.count);
    const plain  = el.hasAttribute('data-plain');
    const dur    = 900;
    const t0     = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = plain ? String(v) : v.toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const start = () => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      run(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.6 });

  nodes.forEach((n) => io.observe(n));
  };
  (window.AVALON_REVEAL || Promise.resolve()).then(start);
})();


/* ── gallery + lightbox ─────────────────────────────────── */
(function gallery(){
  const photos = window.AVALON_PHOTOS || [];
  const grid   = document.querySelector('.gallery');
  const box    = document.getElementById('lightbox');
  if (!grid || !box || !photos.length) return;

  const img     = document.getElementById('lb-img');
  const cap     = document.getElementById('lb-cap');
  const btnPrev = box.querySelector('.lb-prev');
  const btnNext = box.querySelector('.lb-next');
  const btnClose= box.querySelector('.lb-close');
  const showAll = document.getElementById('show-all');
  let i = 0, lastFocus = null;

  const render = () => {
    const p = photos[i];
    img.src = 'assets/photos/full/' + p.f + '.webp';
    img.alt = p.a;
    cap.textContent = p.a + '  ·  ' + (i + 1) + ' of ' + photos.length;
  };

  const open = (n) => {
    i = n; lastFocus = document.activeElement;
    render();
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  };

  const close = () => {
    box.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  const step = (d) => { i = (i + d + photos.length) % photos.length; render(); };

  grid.addEventListener('click', (e) => {
    const shot = e.target.closest('.shot');
    if (shot) open(Number(shot.dataset.i));
  });

  btnPrev.addEventListener('click', () => step(-1));
  btnNext.addEventListener('click', () => step(1));
  btnClose.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });

  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape')     { close(); }
    if (e.key === 'ArrowLeft')  { step(-1); }
    if (e.key === 'ArrowRight') { step(1); }
    if (e.key === 'Tab') {                       // keep focus inside the dialog
      const f = [...box.querySelectorAll('button')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  if (showAll) showAll.addEventListener('click', () => {
    grid.classList.add('is-open');
    showAll.hidden = true;
    grid.querySelector('.shot[data-extra]')?.focus();
  });
})();
