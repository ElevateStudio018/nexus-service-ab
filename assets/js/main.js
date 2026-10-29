(() => {
  const PHONE = '+46768517107';

  // Header blir solid vid scroll
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
  const statusEl = document.getElementById('open-status');
  const dotEl = document.getElementById('open-dot');
  try {
    const parts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = get('weekday');
    const mins = Number(get('hour')) * 60 + Number(get('minute'));
    const weekday = !['lör', 'sön'].some((d) => day.startsWith(d));
    const open = weekday && mins >= 7 * 60 && mins < 16 * 60;
    statusEl.textContent = open ? 'Öppet · stänger 16' : weekday && mins < 7 * 60 ? 'Öppnar 07' : 'Stängt · öppnar vardag 07';
    dotEl.classList.toggle('closed', !open);
  } catch (e) { /* behåll standardtext */ }

  // Scroll-animationer
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('in'));
  }

  // Offertformulär -> färdigskrivet sms
  const form = document.getElementById('quote-form');
  const err = document.getElementById('form-error');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim() || !d.phone.trim() || !d.message.trim()) { err.hidden = false; return; }
    err.hidden = true;
    const body = `Offertförfrågan – ${d.service}\nNamn: ${d.name}\nTel: ${d.phone}\n\n${d.message}`;
    const sep = /iPhone|iPad|Mac/.test(navigator.userAgent) ? '&' : '?';
    window.location.href = `sms:${PHONE}${sep}body=${encodeURIComponent(body)}`;
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
