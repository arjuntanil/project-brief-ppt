/* ================= Project signature widgets (telemetry, journey, ring, scan, survey) ================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slideOf = el => el.closest('.slide');
  const fmt = (v, d = 0) => v.toLocaleString('en-SG', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---- rocket: live telemetry with sparklines (simulated values, labelled as such) ---- */
  $$('[data-fx="tele"]').forEach(box => {
    const sl = slideOf(box);
    const rows = $$('.tl', box).map((r, i) => ({ base: +r.dataset.base, amp: +r.dataset.amp, unit: r.dataset.unit, b: $('b', r), pl: $('polyline', r), pts: [], ph: i * 1.7 }));
    $$('.tl', box).forEach((r, i) => rows[i].pl.setAttribute('stroke', r.dataset.col));
    let t = 0;
    const tick = () => {
      t++;
      rows.forEach((o, i) => {
        const v = o.base + o.amp * (Math.sin(t / 8 + o.ph) * .55 + Math.sin(t / 2.6 + i) * .25 + (Math.random() - .5) * .4);
        o.pts.push(v); if (o.pts.length > 48) o.pts.shift();
        o.b.innerHTML = fmt(v) + '<small>' + o.unit + '</small>';
        const mn = o.base - o.amp * 1.3, mx = o.base + o.amp * 1.3;
        o.pl.setAttribute('points', o.pts.map((p, j) => (j / 47 * 240).toFixed(1) + ',' + (20 - (p - mn) / (mx - mn) * 18).toFixed(1)).join(' '));
      });
    };
    for (let i = 0; i < 48; i++) tick();
    deck.on(sl.id, { enter() { if (!reduce) deck.iv(sl.id, tick, 160); } });
  });

  /* ---- pharma: an order travels the ten pipeline stages; documents build up; cold chain stays in range ---- */
  $$('[data-fx="journey"]').forEach(box => {
    const sl = slideOf(box), nodes = $$('.jn', box), labels = $$('.jl span', box), track = $('.jt', box), docs = $('.jd', box);
    const cold = $('[data-fx="cold"] b', sl);
    let i = -1, hold = 0;
    const step = () => {
      if (hold > 0) { hold--; return; }
      i = (i + 1) % nodes.length;
      nodes.forEach((n, j) => { n.classList.toggle('done', j < i); n.classList.toggle('on', j === i); });
      labels.forEach((l, j) => l.classList.toggle('on', j === i));
      track.style.setProperty('--p', i / (nodes.length - 1));
      docs.textContent = Math.round(15 * (i + 1) / nodes.length);
      if (cold) cold.textContent = (4.3 + Math.random() * .9).toFixed(1) + ' °C';
      if (i === nodes.length - 1) hold = 2;
    };
    deck.on(sl.id, { enter() { i = -1; hold = 0; step(); deck.iv(sl.id, step, 1100); } });
  });

  /* ---- fund: the seven-stage lifecycle ring ---- */
  $$('[data-fx="ring"]').forEach(box => {
    const sl = slideOf(box), segs = $$('.seg', box), names = box.dataset.names.split('|'), t2 = $('.rc2', box), t3 = $('.rc3', box);
    let i = -1;
    const step = () => {
      i = (i + 1) % segs.length;
      segs.forEach((s, j) => { s.classList.toggle('done', j < i); s.classList.toggle('on', j === i); });
      t2.textContent = names[i]; t3.textContent = 'STAGE ' + (i + 1) + ' OF ' + segs.length;
    };
    step();
    deck.on(sl.id, { enter() { i = -1; step(); deck.iv(sl.id, step, 1400); } });
  });

  /* ---- semiconductor: a beam scans a production panel; edge defects light up ---- */
  $$('[data-fx="scan"]').forEach(box => {
    const sl = slideOf(box), cv = $('canvas', box), g = cv.getContext('2d'), st = $('.st span', box), dot = $('.st i', box);
    const C = 16, R = 10, W = cv.width, H = cv.height, pad = 16, cw = (W - pad * 2) / C, ch = (H - pad * 2) / R;
    const heat = [], defect = new Set();
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const edge = Math.min(r, c, R - 1 - r, C - 1 - c);
      heat.push(Math.min(1, Math.max(.05, .78 - edge * .24) + ((r * 7 + c * 13) % 10) / 45));
      if (edge === 0 && (r * 5 + c * 3) % 4 === 0) defect.add(r * C + c);
    }
    const MSG = [['Scanning panel P-0412…', '#38bdf8'], ['Edge cluster found · 6 units', '#f59e0b'], ['Root cause ranked · tool · recipe · batch', '#a78bfa']];
    let raf = 0, t0 = 0, last = -1;
    function render(t) {
      const cyc = 4.4, p = reduce ? 1 : (t % cyc) / cyc, x = pad + p * (W - pad * 2), n = Math.floor(t / cyc);
      g.fillStyle = '#0b1220'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(125,211,252,.35)'; g.lineWidth = 2; g.strokeRect(pad - 6, pad - 6, W - pad * 2 + 12, H - pad * 2 + 12);
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const k = r * C + c, cx = pad + c * cw, cy = pad + r * ch, seen = cx + cw / 2 < x, h = heat[k];
        g.fillStyle = seen ? `hsla(${225 - h * 200},85%,${30 + h * 30}%,.95)` : 'rgba(56,72,110,.45)';
        g.fillRect(cx + 1.5, cy + 1.5, cw - 3, ch - 3);
        if (seen && defect.has(k)) { g.strokeStyle = '#fbbf24'; g.lineWidth = 2.4; g.strokeRect(cx + 1, cy + 1, cw - 2, ch - 2); }
      }
      if (!reduce) {
        const grd = g.createLinearGradient(x - 46, 0, x, 0); grd.addColorStop(0, 'rgba(56,189,248,0)'); grd.addColorStop(1, 'rgba(56,189,248,.5)');
        g.fillStyle = grd; g.fillRect(x - 46, pad - 6, 46, H - pad * 2 + 12); g.fillStyle = '#bae6fd'; g.fillRect(x - 1.5, pad - 8, 3, H - pad * 2 + 16);
      }
      const m = reduce ? 2 : p < .62 ? 0 : (n % 2 ? 2 : 1);
      if (m !== last) { last = m; st.textContent = MSG[m][0]; dot.style.background = MSG[m][1]; }
    }
    const loop = ts => { if (!t0) t0 = ts; render((ts - t0) / 1000); raf = requestAnimationFrame(loop); };
    render(reduce ? 0 : 2.4);
    deck.on(sl.id, { enter() { t0 = 0; cancelAnimationFrame(raf); if (!reduce) raf = requestAnimationFrame(loop); }, leave() { cancelAnimationFrame(raf); raf = 0; } });
  });

  /* ---- agriculture: a drone flies a survey pattern over the management zones ---- */
  $$('[data-fx="survey"]').forEach(box => {
    const sl = slideOf(box), path = $('.sv-path', box), done = $('.sv-done', box), drone = $('.sv-drone', box), pct = $('.sv', box);
    const L = path.getTotalLength() || 1300;
    done.style.strokeDasharray = L + ' ' + L;
    let raf = 0, t0 = 0;
    const render = p => {
      const pt = path.getPointAtLength(p * L);
      drone.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
      done.style.strokeDashoffset = (L * (1 - p)).toFixed(1);
      pct.textContent = Math.round(p * 100) + '%';
    };
    const loop = ts => { if (!t0) t0 = ts; const T = 16, s = (ts - t0) / 1000 % (T + 2.5); render(Math.min(1, s / T)); raf = requestAnimationFrame(loop); };
    render(.62);
    deck.on(sl.id, { enter() { t0 = 0; cancelAnimationFrame(raf); if (!reduce) raf = requestAnimationFrame(loop); }, leave() { cancelAnimationFrame(raf); raf = 0; } });
  });

  /* ---- dark project slides: switch the deck chrome to light text while they are on screen ---- */
  const stage = document.getElementById('stage');
  $$('.slide.pj-dark').forEach(sl => deck.on(sl.id, { enter() { stage.classList.add('on-dark'); }, leave() { stage.classList.remove('on-dark'); } }));

  /* ---- port: swipe from the live animation to the film (muted, full screen on request) ---- */
  $$('.pj-viz[data-pages]').forEach(wrap => {
    const sl = slideOf(wrap), pages = $('.vz-pages', wrap), track = $('.vz-track', wrap), swipe = $('.vz-swipe', wrap);
    const dots = $$('.vz-dots button', wrap), title = $('.vz-title', wrap), tag = $('.vz-tag', wrap);
    const film = $('.vz-film', wrap), v = $('video', film), play = $('.vf-play', film), full = $('.vf-full', film);
    const bar = $('.vf-bar', film), fill = $('.vf-bar i', film), tcur = $('.vf-time', film), tdur = $('.vf-dur', film), back = $('.vf-back', film);
    const svg = $('svg.vz', wrap);
    const scene = () => svg && svg.__scene;
    const fmtT = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    let page = 0, lastDrag = 0, idleT = 0;
    v.muted = true; v.defaultMuted = true; v.volume = 0;
    const setPage = p => {
      page = p; wrap.dataset.page = p;
      track.style.transform = 'translateX(' + (-50 * p) + '%)';
      dots.forEach((d, i) => { d.classList.toggle('on', i === p); d.setAttribute('aria-current', i === p ? 'true' : 'false'); });
      title.textContent = title.dataset['t' + p]; tag.textContent = tag.dataset['t' + p];
      if (p === 1) {
        if (!v.getAttribute('src')) { film.classList.add('loading'); v.src = v.dataset.src; }
        v.muted = true; const pr = v.play(); if (pr) pr.catch(() => {});
        scene() && scene().stop();
      } else {
        v.pause();
        if (document.fullscreenElement === film) document.exitFullscreen().catch(() => {});
        if (deck.slides[deck.cur] === sl) scene() && scene().start();
      }
    };
    swipe.addEventListener('click', e => { e.stopPropagation(); setPage(1); window.sfx && sfx.play('tick'); });
    back.addEventListener('click', e => { e.stopPropagation(); setPage(0); });
    dots.forEach((d, i) => d.addEventListener('click', e => { e.stopPropagation(); setPage(i); }));

    // drag / swipe with mouse, pen or touch; either direction flips the page
    let drag = null;
    pages.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button, .vf-bar, a')) return;
      drag = { x: e.clientX, dx: 0, id: e.pointerId, moved: false };
    });
    pages.addEventListener('pointermove', e => {
      if (!drag) return;
      const k = wrap.getBoundingClientRect().width / wrap.offsetWidth, W = pages.offsetWidth;
      drag.dx = (e.clientX - drag.x) / k;
      if (!drag.moved && Math.abs(drag.dx) > 8) { drag.moved = true; pages.setPointerCapture(drag.id); pages.classList.add('dragging'); track.style.transition = 'none'; }
      if (!drag.moved) return;
      let off = -page * W + drag.dx;
      if (off > 0) off *= .3; if (off < -W) off = -W + (off + W) * .3;
      track.style.transform = 'translateX(' + off.toFixed(1) + 'px)';
    });
    const end = () => {
      if (!drag) return; const d = drag; drag = null;
      pages.classList.remove('dragging'); track.style.transition = '';
      if (d.moved) { lastDrag = Date.now(); setPage(Math.abs(d.dx) > 70 ? 1 - page : page); }
    };
    pages.addEventListener('pointerup', end); pages.addEventListener('pointercancel', end);
    ['touchstart', 'touchmove', 'touchend'].forEach(t => pages.addEventListener(t, e => e.stopPropagation(), { passive: true }));

    // film controls
    const sync = () => play.classList.toggle('playing', !v.paused);
    const toggle = () => { if (v.paused) { const pr = v.play(); if (pr) pr.catch(() => {}); } else v.pause(); };
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
    v.addEventListener('loadedmetadata', () => { tdur.textContent = fmtT(v.duration); });
    v.addEventListener('timeupdate', () => { tcur.textContent = fmtT(v.currentTime); fill.style.transform = 'scaleX(' + (v.duration ? v.currentTime / v.duration : 0) + ')'; });
    ['waiting', 'loadstart'].forEach(t => v.addEventListener(t, () => film.classList.add('loading')));
    ['playing', 'canplay', 'pause', 'error'].forEach(t => v.addEventListener(t, () => film.classList.remove('loading')));
    v.addEventListener('volumechange', () => { if (!v.muted) v.muted = true; });
    v.addEventListener('click', e => { e.stopPropagation(); if (Date.now() - lastDrag > 300) toggle(); });
    play.addEventListener('click', e => { e.stopPropagation(); toggle(); });
    bar.addEventListener('pointerdown', e => {
      e.stopPropagation(); const r = bar.getBoundingClientRect();
      if (v.duration) v.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * v.duration;
    });
    full.addEventListener('click', e => {
      e.stopPropagation();
      if (document.fullscreenElement === film) document.exitFullscreen().catch(() => {});
      else if (film.requestFullscreen) film.requestFullscreen().catch(() => {});
    });
    const wake = () => { film.classList.remove('idle'); clearTimeout(idleT); if (document.fullscreenElement === film) idleT = setTimeout(() => film.classList.add('idle'), 2600); };
    film.addEventListener('pointermove', wake);
    document.addEventListener('fullscreenchange', () => { film.classList.toggle('is-full', document.fullscreenElement === film); wake(); });
    // while the film is full screen the keys control the film, never the slides
    addEventListener('keydown', e => {
      if (document.fullscreenElement !== film) return;
      e.stopPropagation();
      if (e.key === ' ' || e.key === 'k' || e.key === 'K') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); v.currentTime = Math.min(v.duration || 0, v.currentTime + 5); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 5); }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); document.exitFullscreen().catch(() => {}); }
      wake();
    }, true);

    deck.on(sl.id, { enter() { setPage(0); }, leave() { v.pause(); if (document.fullscreenElement === film) document.exitFullscreen().catch(() => {}); } });
  });
})();
