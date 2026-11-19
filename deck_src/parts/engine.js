/* ============================================================
   Presentation engine
   ============================================================ */
(() => {
  const W = 1920, H = 1080;
  const stage = document.getElementById('stage');
  const slides = [...stage.querySelectorAll('.slide')];
  const N = slides.length;
  const CH = {
    ark: { label: 'ARK', c: '#0ea5e9' },
    hub: { label: 'Programme', c: '#7c3aed' },
    hr:  { label: 'HR', c: '#db2777' },
    fin: { label: 'Finance', c: '#9333ea' },
    va:  { label: 'Video AI', c: '#0284c7' },
    end: { label: 'Impact', c: '#c026d3' }
  };
  let cur = -1, scale = 1;
  const hooks = {};
  const timers = new Map();

  /* ---------- scale to fit ---------- */
  function fit() {
    scale = Math.min(innerWidth / W, innerHeight / H);
    const x = (innerWidth - W * scale) / 2, y = (innerHeight - H * scale) / 2;
    stage.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
  }
  addEventListener('resize', fit); fit();

  /* ---------- prep: reveal order, split words ---------- */
  slides.forEach(s => {
    s.querySelectorAll('.rv').forEach((el, k) => { if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', k); });
    s.querySelectorAll('.split').forEach(splitWords);
  });
  function splitWords(root) {
    let wi = 0;
    const walk = (node, cls) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = p;
            if (cls) inner.className = cls;
            inner.style.setProperty('--wi', wi++);
            w.appendChild(inner); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.classList.contains('hacc')) {
          const w = document.createElement('span'); w.className = 'w';
          const inner = document.createElement('span'); inner.style.setProperty('--wi', wi++);
          inner.className = 'hacc'; inner.textContent = n.textContent; n.replaceWith(w); w.appendChild(inner);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (n.children.length === 0 && n.className) {
            const c = n.className; walk(n, c);
            n.replaceWith(...n.childNodes);
          } else walk(n, cls);
        }
      });
    };
    walk(root, '');
  }

  /* ---------- chrome ---------- */
  const chapBar = document.getElementById('chapters');
  const prog = document.getElementById('prog');
  const counter = document.getElementById('counter');
  const here = document.getElementById('here');
  const firstOf = {};
  slides.forEach((s, i) => { const c = s.dataset.ch; if (firstOf[c] === undefined) firstOf[c] = i; });
  Object.keys(CH).forEach(k => {
    if (firstOf[k] === undefined) return;
    const b = document.createElement('button');
    b.dataset.ch = k; b.style.setProperty('--c', CH[k].c);
    b.innerHTML = `<i></i>${CH[k].label}`;
    b.onclick = () => go(firstOf[k]);
    chapBar.appendChild(b);
  });
  slides.forEach((s, i) => {
    const sp = document.createElement('span');
    sp.style.setProperty('--c', CH[s.dataset.ch]?.c || '#fff');
    sp.innerHTML = `<em class="tip">${String(i + 1).padStart(2, '0')} · ${s.dataset.title || ''}</em>`;
    sp.onclick = e => { e.stopPropagation(); go(i); };
    prog.appendChild(sp);
  });
  function updateChrome() {
    const s = slides[cur], ch = s.dataset.ch;
    stage.dataset.ch = ch;
    [...chapBar.children].forEach(b => b.classList.toggle('on', b.dataset.ch === ch));
    [...prog.children].forEach((sp, i) => { sp.classList.toggle('past', i < cur); sp.classList.toggle('now', i === cur); });
    counter.innerHTML = `<b>${String(cur + 1).padStart(2, '0')}</b> / ${String(N).padStart(2, '0')}`;
    here.innerHTML = `<i></i><b>${CH[ch]?.label || ''}</b><span>${s.dataset.title || ''}</span>`;
    document.getElementById('prevBtn').disabled = cur === 0;
    document.getElementById('nextBtn').disabled = cur === N - 1;
  }

  /* ---------- navigation ---------- */
  function clearTimers(id) { (timers.get(id) || []).forEach(t => { clearTimeout(t); clearInterval(t); }); timers.set(id, []); }
  function go(i, instant) {
    i = Math.max(0, Math.min(N - 1, i));
    if (i === cur) return;
    stage.dataset.dir = i > cur ? 'fwd' : 'back';
    const old = slides[cur];
    if (old) {
      clearTimers(old.id);
      hooks[old.id]?.leave?.(old);
      old.classList.remove('active');
      if (!instant) { old.classList.add('leaving'); setTimeout(() => old.classList.remove('leaving'), 720); }
    }
    cur = i;
    const s = slides[cur];
    s.classList.add('active');
    runCounters(s);
    hooks[s.id]?.enter?.(s);
    updateChrome();
    try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) {}
  }
  const next = () => go(cur + 1), prev = () => go(cur - 1);
  document.getElementById('nextBtn').onclick = next;
  document.getElementById('prevBtn').onclick = prev;
  document.getElementById('brandBtn').onclick = () => go(0);

  /* ---------- counters ---------- */
  function runCounters(s) {
    s.querySelectorAll('[data-to]').forEach(el => {
      const to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
      const dur = +(el.dataset.dur || 1800), delay = +(el.dataset.delay || 350);
      const pre = el.dataset.pre || '', suf = el.dataset.suf || '';
      const fmt = v => pre + v.toLocaleString('en-SG', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      el.textContent = fmt(0);
      const t0 = performance.now() + delay;
      const tick = t => {
        if (!s.classList.contains('active')) return;
        const p = Math.min(1, Math.max(0, (t - t0) / dur));
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(to * e);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- keyboard / touch ---------- */
  const overlays = () => stage.querySelector('.overlay.show');
  addEventListener('keydown', e => {
    if (e.target.matches('input,textarea,select')) return;
    const k = e.key;
    if (k === 'F5') { e.preventDefault(); if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); return; }
    if (overlays()) { if (k === 'Escape' || k === 'o' || k === 'O') closeOverlays(); return; }
    if (['ArrowRight', 'PageDown', ' ', 'ArrowDown'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'ArrowUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(N - 1);
    else if (k === 'o' || k === 'O' || k === 'g' || k === 'G') openOverview();
    else if (k === 'f' || k === 'F') toggleFull();
    else if (k === 'l' || k === 'L') stage.classList.toggle('laser-on');
    else if (k === 't' || k === 'T') toggleTheme();
    else if (k === '?' || k === 'h' || k === 'H') document.getElementById('keys').classList.toggle('show');
    else if (k === 'Escape') { document.getElementById('keys').classList.remove('show'); stage.classList.remove('laser-on'); }
    else if (/^[1-6]$/.test(k)) { const c = Object.keys(CH)[+k - 1]; if (firstOf[c] !== undefined) go(firstOf[c]); }
  });
  let tx = null, ty = null;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4 && !overlays()) { dx < 0 ? next() : prev(); }
    tx = null;
  });

  /* ---------- pointer: spotlight, parallax, laser, idle cursor ---------- */
  const laser = document.getElementById('laser');
  let idle;
  addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    const sx = (e.clientX - r.left) / scale, sy = (e.clientY - r.top) / scale;
    laser.style.left = sx + 'px'; laser.style.top = sy + 'px';
    stage.style.setProperty('--px', ((sx / W) - .5) * 2);
    stage.style.setProperty('--py', ((sy / H) - .5) * 2);
    const sp = e.target.closest && e.target.closest('.spot');
    if (sp) { const b = sp.getBoundingClientRect(); sp.style.setProperty('--mx', ((e.clientX - b.left) / b.width * 100) + '%'); sp.style.setProperty('--my', ((e.clientY - b.top) / b.height * 100) + '%'); }
    document.body.classList.remove('hide-cursor'); clearTimeout(idle);
    idle = setTimeout(() => document.body.classList.add('hide-cursor'), 4000);
  });

  /* ---------- theme (dark default, light optional) ---------- */
  const root = document.documentElement;
  function setTheme(t, from) {
    const apply = () => root.setAttribute('data-theme', t);   // session only: every load starts in light
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) { apply(); return; }
    const r = from && from.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : innerWidth - 80, y = r ? r.top + r.height / 2 : 48;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 850, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
  }
  function toggleTheme(from) { setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light', from || document.querySelector('.chrome-top [data-theme-toggle]')); }
  document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); toggleTheme(b); }));

  /* ---------- fullscreen ---------- */
  function toggleFull() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  }
  document.getElementById('fullBtn').onclick = toggleFull;

  /* ---------- overview: a live, frozen miniature of every slide ---------- */
  const ov = document.getElementById('overview');
  // copy a slide's DOM without starting any media: <video>/<canvas> become canvases holding their current picture
  function snap(n) {
    if (n.nodeType === 3) return n.cloneNode(false);
    if (n.nodeType !== 1) return null;
    const tag = n.tagName;
    if (tag === 'SCRIPT' || tag === 'AUDIO' || tag === 'IFRAME') return null;
    if (tag === 'VIDEO' || tag === 'CANVAS') {
      const c = document.createElement('canvas');
      ['id', 'class', 'style'].forEach(a => n.hasAttribute(a) && c.setAttribute(a, n.getAttribute(a)));
      const w = tag === 'VIDEO' ? n.videoWidth : n.width, h = tag === 'VIDEO' ? n.videoHeight : n.height;
      let drew = false;
      c.width = w || 2; c.height = h || 2;
      try { if (w && h && (tag === 'CANVAS' || n.readyState >= 2)) { c.getContext('2d').drawImage(n, 0, 0, w, h); drew = true; } } catch (e) {}
      if (!drew && tag === 'VIDEO') {   // clip not loaded yet (slide not visited): a quiet video panel with a play mark
        const cw = c.width = Math.max(2, n.clientWidth), ch = c.height = Math.max(2, n.clientHeight), x = c.getContext('2d');
        const g = x.createLinearGradient(0, 0, 0, ch); g.addColorStop(0, '#111827'); g.addColorStop(1, '#05070d'); x.fillStyle = g; x.fillRect(0, 0, cw, ch);
        const r = Math.min(cw, ch) * .085, cx = cw / 2, cy = ch / 2;
        x.fillStyle = 'rgba(255,255,255,.16)'; x.beginPath(); x.arc(cx, cy, r * 1.7, 0, Math.PI * 2); x.fill();
        x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.moveTo(cx - r * .5, cy - r * .75); x.lineTo(cx + r * .8, cy); x.lineTo(cx - r * .5, cy + r * .75); x.closePath(); x.fill();
      }
      return c;
    }
    const c = n.cloneNode(false);
    for (const ch of n.childNodes) { const k = snap(ch); if (k) c.appendChild(k); }
    return c;
  }
  function paintThumb(t) {
    const s = slides[+t.dataset.i], st = document.createElement('div'); st.className = 'oc-stage';
    const clone = snap(s); clone.classList.remove('active', 'leaving'); clone.classList.add('ov-snap');
    st.appendChild(clone); st.style.setProperty('--k', t.clientWidth / W);
    t.appendChild(st); t.classList.add('ready');
  }
  let thumbIO = null;
  function openOverview() {
    const wrap = ov.querySelector('.ov-in'); wrap.innerHTML = '';
    thumbIO?.disconnect();
    thumbIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { thumbIO.unobserve(e.target); paintThumb(e.target); } }), { root: wrap, rootMargin: '240px 0px' });
    const groups = {};
    slides.forEach((s, i) => { (groups[s.dataset.ch] = groups[s.dataset.ch] || []).push([s, i]); });
    Object.keys(CH).forEach(k => {
      if (!groups[k]) return;
      const g = document.createElement('div'); g.className = 'grp'; g.style.setProperty('--c', CH[k].c);
      g.innerHTML = `<h3><i></i>${CH[k].label}</h3><div class="cards"></div>`;
      groups[k].forEach(([s, i]) => {
        const b = document.createElement('button'); b.className = 'oc' + (i === cur ? ' cur' : '');
        b.innerHTML = `<div class="oc-thumb" data-i="${i}" inert aria-hidden="true"></div><div class="oc-meta"><span>${String(i + 1).padStart(2, '0')}</span><b>${s.dataset.title || ''}</b></div>`;
        b.onclick = () => { closeOverlays(); go(i); };
        g.querySelector('.cards').appendChild(b);
        thumbIO.observe(b.firstElementChild);
      });
      wrap.appendChild(g);
    });
    ov.classList.add('show');
    requestAnimationFrame(() => wrap.querySelector('.oc.cur')?.scrollIntoView({ block: 'center' }));
    // after the visible ones, paint the rest while the browser is idle so fast scrolling never meets a blank card
    const idle = f => window.requestIdleCallback ? requestIdleCallback(f, { timeout: 90 }) : setTimeout(f, 40);
    const fill = () => { if (!ov.classList.contains('show')) return; const t = wrap.querySelector('.oc-thumb:not(.ready)'); if (!t) return; thumbIO.unobserve(t); paintThumb(t); idle(fill); };
    setTimeout(() => idle(fill), 350);
  }
  document.getElementById('gridBtn').onclick = openOverview;
  function closeOverlays() {
    stage.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show'));
    thumbIO?.disconnect(); ov.querySelector('.ov-in').innerHTML = '';   // previews hold copies of every slide; drop them
  }
  stage.querySelectorAll('.ov-close').forEach(b => b.onclick = closeOverlays);

  /* ---------- lightbox ---------- */
  const lb = document.getElementById('lightbox');
  stage.addEventListener('click', e => {
    const z = e.target.closest('.zoomable');
    if (!z || e.target.closest('button,.nozoom')) return;
    const inner = lb.querySelector('.lb-in'); inner.innerHTML = '';
    const w = z.offsetWidth, h = z.offsetHeight;
    const clone = z.cloneNode(true);
    clone.classList.remove('zoomable', 'tilt', 'tilt-r', 'rv', 'rv-l', 'rv-r', 'rv-s');
    clone.removeAttribute('id');
    const k = Math.min(1680 / w, 880 / h);
    clone.style.cssText = `width:${w}px;height:${h}px;transform:scale(${k});transform-origin:center;flex:none;position:relative;margin:0;left:auto;top:auto;right:auto;bottom:auto`;
    inner.appendChild(clone);
    lb.querySelector('.lb-cap').textContent = z.dataset.cap || 'Click anywhere or press Esc to close';
    lb.classList.add('show');
  });
  lb.addEventListener('click', e => { if (!e.target.closest('button:not(.ov-close)')) closeOverlays(); });

  /* ---------- public API for slide scripts ---------- */
  window.deck = {
    go, next, prev, get cur() { return cur; }, slides,
    on(id, h) { const p = hooks[id]; hooks[id] = p ? { enter(s) { p.enter?.(s); h.enter?.(s); }, leave(s) { p.leave?.(s); h.leave?.(s); } } : h; },
    t(id, fn, ms) { const t = setTimeout(fn, ms); (timers.get(id) || timers.set(id, []).get(id)).push(t); return t; },
    iv(id, fn, ms) { const t = setInterval(fn, ms); (timers.get(id) || timers.set(id, []).get(id)).push(t); return t; },
    clear: clearTimers,
    counters: runCounters
  };

  /* ---------- start ---------- */
  const h = parseInt((location.hash || '').slice(1), 10);
  window.addEventListener('load', () => {
    // no intro screen: open on the linked slide, or on slide 1 with its entrance animation
    if (h >= 1 && h <= N) go(h - 1, true); else go(0);
  });
})();

