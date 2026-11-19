/* ================= ARK 03 / 04 · partners & Why ARK ================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sfx = n => window.sfx && window.sfx.play(n);

  /* ---- partners: full article overlay ---- */
  (() => {
    const art = $('#paArt'), open = $('#paOpen'); if (!art) return;
    open.onclick = e => { e.stopPropagation(); art.classList.add('show'); sfx('tick'); };
    art.onclick = e => { e.stopPropagation(); art.classList.remove('show'); };
    addEventListener('keydown', e => { if (e.key === 'Escape' && art.classList.contains('show')) { e.stopPropagation(); art.classList.remove('show'); } }, true);
    deck.on('ark-partners', { leave() { art.classList.remove('show'); } });
  })();

  /* ---- partners: inline article scroller (wheel / touch / keys) ---- */
  (() => {
    const view = $('#paView'), sc = $('#paScroll'), art = $('#paArt'), open = $('#paOpen');
    if (!view || !sc) return;
    const img = $('img', sc), rail = $('.pa-rail', view), thumb = $('i', rail);
    if (art && img) $('img', art).src = img.src;            // one copy of the article bytes serves both views
    let idle, quiet = false, drag = null;
    const range = () => Math.max(0, sc.scrollHeight - sc.clientHeight);
    const sync = () => {
      const max = range(), y = sc.scrollTop, rh = rail.clientHeight;
      const th = max ? Math.max(34, rh * sc.clientHeight / sc.scrollHeight) : 0;
      thumb.style.setProperty('--th', th + 'px');
      thumb.style.setProperty('--ty', (max ? (rh - th) * y / max : 0) + 'px');
      view.dataset.top = y > 4 ? '1' : '0';
      view.dataset.end = y < max - 4 ? '0' : '1';
    };
    const reset = () => {
      if (sc.scrollTop) { quiet = true; sc.scrollTop = 0; }
      view.classList.remove('touched', 'scrolling', 'dragging');
      sync();
    };
    sc.addEventListener('scroll', () => {
      sync();
      if (quiet) { quiet = false; return; }
      view.classList.add('scrolling', 'touched');
      clearTimeout(idle); idle = setTimeout(() => view.classList.remove('scrolling'), 1000);
    }, { passive: true });
    new ResizeObserver(sync).observe(sc);

    // click the page (not a drag) -> the existing full-page reader
    sc.addEventListener('click', e => { if (open && e.target.closest('.pa-sheet')) open.click(); });

    // keyboard focus (Tab only): arrows / space / page keys scroll the article instead of changing slide.
    // A mouse press never focuses the scroller, so after clicking the article the deck keys keep working.
    sc.addEventListener('mousedown', e => e.preventDefault());
    sc.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) e.stopPropagation();
    });

    // slim rail: drag the thumb, or click the track to page toward the click
    thumb.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      thumb.setPointerCapture(e.pointerId);
      drag = { y: e.clientY, top: sc.scrollTop };
      view.classList.add('dragging', 'touched');
    });
    thumb.addEventListener('pointermove', e => {
      if (!drag) return;
      const room = rail.getBoundingClientRect().height - thumb.getBoundingClientRect().height;
      if (room > 0) sc.scrollTop = drag.top + (e.clientY - drag.y) / room * range();
    });
    const end = () => { drag = null; view.classList.remove('dragging'); };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => thumb.addEventListener(t, end));
    rail.addEventListener('pointerdown', e => {
      if (e.target === thumb) return;
      e.stopPropagation();
      const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
      sc.scrollBy({ top: (e.clientY < thumb.getBoundingClientRect().top ? -1 : 1) * sc.clientHeight * .85, behavior: calm ? 'auto' : 'smooth' });
    });

    deck.on('ark-partners', { enter: reset });
    sync();
  })();

  /* ---- Why ARK: cycle the three reasons, click to focus ---- */
  (() => {
    const id = 'ark-why', sl = document.getElementById(id); if (!sl) return;
    const wrap = $('.wy', sl), cards = $$('.wy-c', sl), eq = $$('.wy-eq span', sl);
    let k = 0, hold = 0;
    const show = i => {
      k = i; wrap.classList.add('hasOn');
      cards.forEach((c, j) => c.classList.toggle('on', j === i));
      eq.forEach(e => e.classList.toggle('on', +e.dataset.k === i));
    };
    cards.forEach((c, i) => c.onclick = () => { hold = Date.now() + 12000; show(i); sfx('tick'); });
    eq.forEach(e => e.onclick = () => { hold = Date.now() + 12000; show(+e.dataset.k); });
    deck.on(id, {
      enter() { wrap.classList.remove('hasOn'); cards.forEach(c => c.classList.remove('on')); eq.forEach(e => e.classList.remove('on'));
        deck.t(id, () => show(0), 1400); deck.iv(id, () => { if (Date.now() > hold) show((k + 1) % cards.length); }, 4200); }
    });
  })();
})();

