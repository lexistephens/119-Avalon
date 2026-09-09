/* ─────────────────────────────────────────────────────────
   119 Avalon — site behaviour
   CONFIGURE THESE TWO LINES BEFORE GOING LIVE:
     OWNER_EMAIL  the address inquiries should reach
     FORM_ENDPOINT a POST endpoint (Formspree, Basin, Netlify Forms…).
                   Leave empty and the form falls back to opening the
                   visitor's mail client with everything pre-filled.
   ───────────────────────────────────────────────────────── */
const OWNER_EMAIL   = 'REPLACE-ME@example.com';
const FORM_ENDPOINT = '';

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

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      run(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.6 });

  nodes.forEach((n) => io.observe(n));
})();

/* ── inquiry form ───────────────────────────────────────── */
(function inquiry(){
  const form   = document.getElementById('inquiry-form');
  if (!form) return;
  const status = document.getElementById('form-status');

  const showError = (input, errId, on) => {
    const err = document.getElementById(errId);
    if (err) err.hidden = !on;
    input.setAttribute('aria-invalid', on ? 'true' : 'false');
  };

  const validate = () => {
    const el     = form.elements;
    const name   = el['name'];
    const email  = el['email'];
    const arrive = el['arrive'];
    const depart = el['depart'];
    let firstBad = null;

    const badName = !name.value.trim();
    showError(name, 'name-err', badName);
    if (badName) firstBad = firstBad || name;

    const badEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    showError(email, 'email-err', badEmail);
    if (badEmail) firstBad = firstBad || email;

    const badDates = arrive.value && depart.value && depart.value <= arrive.value;
    showError(depart, 'depart-err', badDates);
    if (badDates) firstBad = firstBad || depart;

    return firstBad;
  };

  const say = (msg, state) => {
    status.textContent = msg;
    if (state) status.setAttribute('data-state', state);
    else status.removeAttribute('data-state');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (form.elements['company'].value) return;            // honeypot tripped — silently drop

    const bad = validate();
    if (bad) { say('Please fix the highlighted fields.', 'error'); bad.focus(); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    delete data.company;

    if (FORM_ENDPOINT) {
      say('Sending…');
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        say('Thank you — your inquiry is on its way. We’ll be in touch.');
      } catch (err) {
        say('That didn’t send. Please email ' + OWNER_EMAIL + ' directly.', 'error');
      }
      return;
    }

    // No endpoint configured: hand off to the visitor's mail client.
    const body = [
      'Name: '     + data.name,
      'Email: '    + data.email,
      'Arriving: ' + (data.arrive || '—'),
      'Leaving: '  + (data.depart || '—'),
      'Guests: '   + (data.guests || '—'),
      '',
      data.message || ''
    ].join('\n');

    window.location.href =
      'mailto:' + OWNER_EMAIL +
      '?subject=' + encodeURIComponent('119 Avalon — booking inquiry from ' + data.name) +
      '&body='    + encodeURIComponent(body);

    say('Opening your email app with the inquiry ready to send.');
  });
})();
