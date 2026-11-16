const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Открыть меню');
}));
const dialog = document.querySelector('#photo-dialog');
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
  const img = dialog.querySelector('img');
  img.src = button.dataset.image;
  img.alt = button.querySelector('img').alt;
  dialog.showModal();
}));
dialog.querySelector('button').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

// A single accessible row moves gently back and forth; user interaction pauses it.
const rail = document.querySelector('.product-rail');
if (rail) {
  const pause = document.querySelector('.product-pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let stopped = reduced.matches, hover = false, focused = false, direction = 1, last = 0, resumeAt = 0;
  const updatePause = () => {
    pause.textContent = stopped ? 'Запустить' : 'Пауза';
    pause.setAttribute('aria-pressed', String(stopped));
    pause.setAttribute('aria-label', stopped ? 'Запустить движение товаров' : 'Остановить движение товаров');
  };
  updatePause();
  pause.addEventListener('click', () => { stopped = !stopped; updatePause(); });
  rail.addEventListener('mouseenter', () => { hover = true; });
  rail.addEventListener('mouseleave', () => { hover = false; });
  rail.addEventListener('focusin', () => { focused = true; });
  rail.addEventListener('focusout', () => { focused = false; });
  ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(type => rail.addEventListener(type, () => { resumeAt = performance.now() + 6000; }, {passive:true}));
  const move = delta => { resumeAt = performance.now() + 6000; rail.scrollBy({left:delta,behavior:reduced.matches?'instant':'smooth'}); };
  document.querySelector('.product-prev').addEventListener('click', () => move(-294));
  document.querySelector('.product-next').addEventListener('click', () => move(294));
  reduced.addEventListener('change', () => { stopped = reduced.matches; updatePause(); });
  let position = rail.scrollLeft;
  function tick(now) {
    const dt = Math.min(now - (last || now), 50); last = now;
    if (!stopped && !hover && !focused && now > resumeAt) {
      const max = rail.scrollWidth - rail.clientWidth;
      if (max > 0) {
        position += direction * dt * .028;
        if (position >= max) { position = max; direction = -1; }
        if (position <= 0) { position = 0; direction = 1; }
        rail.scrollLeft = position;
      }
    } else { position = rail.scrollLeft; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
