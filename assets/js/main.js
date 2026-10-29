(() => {
  const PHONE = '+46768517107';

  // Header: dölj topbaren och gör menyn solid vid scroll
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobilmeny
  const burger = document.querySelector('.burger');
  const mobileNav = document.getElementById('mobile-nav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Stäng meny' : 'Öppna meny');
    mobileNav.classList.toggle('open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // Öppet/stängt just nu (vardagar 07–16, svensk tid)
  try {
    const parts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = get('weekday');
    const mins = Number(get('hour')) * 60 + Number(get('minute'));
    const weekday = !['lör', 'sön'].some((d) => day.startsWith(d));
    const open = weekday && mins >= 7 * 60 && mins < 16 * 60;
    document.querySelectorAll('[data-open-status]').forEach((el) => {
      el.textContent = open ? 'Öppet nu · till 16.00' : weekday && mins < 7 * 60 ? 'Öppnar 07.00' : 'Stängt · öppnar vardag 07.00';
    });
    document.querySelectorAll('[data-open-dot]').forEach((el) => el.classList.toggle('closed', !open));
    const dayIdx = ['mån', 'tis', 'ons', 'tor', 'fre', 'lör', 'sön'].findIndex((d) => day.startsWith(d));
    const row = document.querySelector(`.hours tr[data-day="${dayIdx}"]`);
    if (row) row.classList.add('today');
  } catch (e) { /* behåll standardtext */ }

  // Bakgrundsvideo: paus/play och respektera "reducera rörelse"
  document.querySelectorAll('[data-video-toggle]').forEach((btn) => {
    const video = document.getElementById(btn.getAttribute('aria-controls'));
    if (!video) return;
    const sync = () => {
      btn.classList.toggle('paused', video.paused);
      btn.setAttribute('aria-label', video.paused ? 'Spela bakgrundsvideo' : 'Pausa bakgrundsvideo');
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause();
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    btn.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
    sync();
  });

  // Scroll-animationer
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('in'));
  }

  // Offertformulär -> färdigskrivet sms
  const form = document.getElementById('quote-form');
  if (form) {
    const err = document.getElementById('form-error');
    const preset = new URLSearchParams(location.search).get('tjanst');
    if (preset) {
      const opt = [...form.service.options].find((o) => o.value.toLowerCase() === preset.toLowerCase());
      if (opt) opt.selected = true;
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      if (!d.name.trim() || !d.phone.trim() || !d.message.trim()) { err.hidden = false; return; }
      err.hidden = true;
      const where = d.place && d.place.trim() ? `\nOrt: ${d.place}` : '';
      const body = `Offertförfrågan – ${d.service}\nNamn: ${d.name}\nTel: ${d.phone}${where}\n\n${d.message}`;
      const sep = /iPhone|iPad|Mac/.test(navigator.userAgent) ? '&' : '?';
      window.location.href = `sms:${PHONE}${sep}body=${encodeURIComponent(body)}`;
    });
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
