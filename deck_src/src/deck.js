/* ================= Ba0 Ba0 showcase interactions ================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sfx = n => window.sfx && window.sfx.play(n);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---- cards that jump to a slide by id (portfolio) ---- */
  $$('[data-go]').forEach(c => c.addEventListener('click', e => {
    e.stopPropagation();
    const i = deck.slides.findIndex(s => s.id === c.dataset.go);
    if (i >= 0) { sfx('tick'); deck.go(i); }
  }));

  /* ---- live concept scenes: trucks travel their routes while the slide is on screen ---- */
  const SHAPES = {
    lorry: '<circle class="hl" r="16"/><rect class="tb" x="-11" y="-5" width="17" height="10" rx="2"/><rect class="tl" x="-10" y="-4" width="15" height="8" rx="1.5"/><rect class="tc" x="7" y="-4.5" width="6" height="9" rx="2"/>',
    haul: '<circle class="hl" r="18"/><rect class="tb" x="-13" y="-6.5" width="19" height="13" rx="3"/><rect class="tl" x="-11.5" y="-5" width="16" height="10" rx="2.5"/><rect class="tc" x="7" y="-5.5" width="7" height="11" rx="2.2"/>'
  };
  function Scene(svgId, slideId, cfg) {
    const svg = document.getElementById(svgId); if (!svg) return null;
    const stage = svg.parentElement, layer = svg.querySelector(cfg.layer);
    const trucks = cfg.trucks.map(t => {
      const path = svg.querySelector('#' + t.path), L = path.getTotalLength();
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'trk ' + (t.cls || ''));
      g.innerHTML = SHAPES[cfg.shape];
      layer.appendChild(g);
      const T = 2 * L / t.speed + 2 * t.dwell;
      return { ...t, path, L, g, T };
    });
    let raf = 0, last = 0, clock = 0, mode = 0;
    const speedK = () => (cfg.slow && cfg.slow.mode === mode ? cfg.slow.k : 1);
    function draw() {
      trucks.forEach(tr => {
        const ph = ((clock + tr.offset * tr.T) % tr.T + tr.T) % tr.T, run = tr.L / tr.speed;
        let d, back = false, state;
        if (ph < tr.dwell) { d = 0; state = tr.out; }
        else if (ph < tr.dwell + run) { d = (ph - tr.dwell) * tr.speed; state = tr.out; }
        else if (ph < 2 * tr.dwell + run) { d = tr.L; back = true; state = tr.back; }
        else { d = tr.L - (ph - 2 * tr.dwell - run) * tr.speed; back = true; state = tr.back; }
        const a = tr.path.getPointAtLength(Math.max(0, Math.min(tr.L, d - 1))), b = tr.path.getPointAtLength(Math.max(0, Math.min(tr.L, d + 1)));
        const p = tr.path.getPointAtLength(d);
        let ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; if (back) ang += 180;
        tr.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
        tr.g.classList.toggle('empty', state === 'empty');
        tr.g.classList.toggle('hb', state === 'hb');
        tr.g.classList.toggle('waste', state === 'waste');
      });
    }
    function frame(ts) {
      const dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts;
      clock += dt * speedK();
      draw();
      raf = requestAnimationFrame(frame);
    }
    function seq(box) {
      const steps = $$('.vz-steps span', box); steps.forEach(s => s.classList.remove('done'));
      steps.forEach((s, i) => deck.t(slideId, () => { s.classList.add('done'); if (i === steps.length - 1) sfx('done'); }, reduce ? 0 : 450 + i * 620));
    }
    const api = {
      start() { if (raf) return; last = 0; draw(); if (!reduce) raf = requestAnimationFrame(frame); },
      stop() { cancelAnimationFrame(raf); raf = 0; },
      mode(m) {
        mode = m; svg.dataset.mode = m;
        $$('.vz-call', stage).forEach(c => { const on = +c.dataset.m === m; c.classList.toggle('on', on); if (on) seq(c); });
        $$('.m' + m + ' .ring', svg).forEach(r => { r.classList.remove('go'); r.getBoundingClientRect(); r.classList.add('go'); });
      }
    };
    svg.__scene = api;
    return api;
  }

  const scenes = {
    vzPort: Scene('vzPort', 'p-port', {
      layer: '#vzPortTrucks', shape: 'lorry',
      trucks: [
        { path: 'pR1', speed: 40, dwell: 1.2, offset: .05, out: 'ld', back: 'hb', cls: 'ha' },
        { path: 'pR2', speed: 44, dwell: 1.0, offset: .32, out: 'ld', back: 'hb', cls: 'hx' },
        { path: 'pR3', speed: 46, dwell: 1.1, offset: .58, out: 'ld', back: 'empty', cls: 'r3 ha' },
        { path: 'pR4', speed: 38, dwell: 1.4, offset: .18, out: 'ld', back: 'hb', cls: 'hx' },
        { path: 'pR5', speed: 50, dwell: .9, offset: .72, out: 'ld', back: 'empty', cls: 'ha track' },
        { path: 'pR2', speed: 42, dwell: 1.2, offset: .84, out: 'empty', back: 'ld', cls: 'hx' },
        { path: 'pR5', speed: 48, dwell: 1.0, offset: .26, out: 'hb', back: 'ld', cls: 'hx' },
        { path: 'pR3b', speed: 50, dwell: 1.0, offset: .1, out: 'ld', back: 'hb', cls: 'alt ha' }
      ]
    }),
    vzMine: Scene('vzMine', 'p-mine', {
      layer: '#vzMineTrucks', shape: 'haul', slow: { mode: 6, k: .5 },
      trucks: [
        { path: 'pHaul', speed: 30, dwell: 1.4, offset: 0, out: 'ld', back: 'empty' },
        { path: 'pHaul', speed: 30, dwell: 1.4, offset: .25, out: 'ld', back: 'empty' },
        { path: 'pHaul', speed: 30, dwell: 1.4, offset: .5, out: 'ld', back: 'empty', cls: 'fuel' },
        { path: 'pHaul', speed: 30, dwell: 1.4, offset: .75, out: 'ld', back: 'empty' },
        { path: 'pWaste', speed: 32, dwell: 1.4, offset: .4, out: 'waste', back: 'empty' },
        { path: 'pShop', speed: 26, dwell: 2.2, offset: .2, out: 'empty', back: 'empty', cls: 'alt alert' },
        { path: 'pOut', speed: 20, dwell: 1.6, offset: .1, out: 'hb', back: 'empty' }
      ]
    })
  };

  /* ---- project slides: features advance on their own; a click takes over for a while ---- */
  const DUR = 6000;
  $$('.slide.pj').forEach(sl => {
    const id = sl.id, feats = $$('.pj-f', sl), shots = $$('.pj-shot', sl);
    const capWrap = $('.pj-cap', sl), cap = capWrap && $('b', capWrap);
    const vz = $('.vz', sl), scene = vz ? scenes[vz.id] : null;
    const stackWin = $('.pj-stack .browser', sl);
    let k = 0, hold = 0;
    sl.style.setProperty('--dur', DUR + 'ms');
    const show = (i, manual, first) => {
      k = i;
      if (stackWin && !first) { stackWin.classList.remove('shuffle'); void stackWin.offsetWidth; stackWin.classList.add('shuffle'); }
      feats.forEach((f, j) => { f.classList.toggle('on', j === i); f.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
      const bar = $('.pj-pb i', feats[i]); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      shots.forEach(s => s.classList.toggle('on', +s.dataset.k === i));
      if (capWrap) {
        capWrap.classList.add('swap');
        deck.t(id, () => { cap.textContent = $('b', feats[i]).textContent; capWrap.classList.remove('swap'); }, 240);
      }
      scene && scene.mode(i);
      sl.classList.toggle('manual', !!manual);
    };
    feats.forEach((f, i) => f.addEventListener('click', e => { e.stopPropagation(); hold = Date.now() + 15000; show(i, true); sfx('tick'); }));
    deck.on(id, {
      enter() {
        hold = 0; show(0, false, true); scene && scene.start();
        deck.iv(id, () => { if (Date.now() > hold) show((k + 1) % feats.length); }, DUR);
      },
      leave() { scene && scene.stop(); }
    });
  });

  /* ---- how we deliver: the five steps light up in turn ---- */
  (() => {
    const id = 'how', sl = document.getElementById(id); if (!sl) return;
    const st = $$('.hw-st', sl), line = $('.hw-line', sl);
    let k = 0;
    const show = i => {
      k = i;
      st.forEach((s, j) => { s.classList.toggle('on', j === i); s.classList.toggle('done', j < i); });
      line.style.setProperty('--p', i / (st.length - 1));
    };
    st.forEach((s, i) => s.addEventListener('click', e => { e.stopPropagation(); show(i); sfx('tick'); }));
    deck.on(id, { enter() { show(0); deck.iv(id, () => show((k + 1) % st.length), 2400); } });
  })();
})();
