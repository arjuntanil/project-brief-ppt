/* ================= Sound effects (synthesised, no files) ================= */
(() => {
  let ctx = null, master = null, noiseBuf = null, on = true;
  try { on = localStorage.getItem('ark-hcsa-sfx') !== 'off'; } catch (e) {}
  const btns = () => document.querySelectorAll('[data-sfx-toggle]');
  function paint() { btns().forEach(b => { b.classList.toggle('muted', !on); b.title = on ? 'Sound effects on (M)' : 'Sound effects off (M)'; }); }
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = .55;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * .5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  ['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, () => init(), { passive: true }));

  function tone(f, t, dur, { type = 'sine', vol = .3, f2 = null, attack = .005, dest = master } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .02);
  }
  function noise(t, dur, { vol = .2, type = 'highpass', freq = 2000, q = .7, f2 = null } = {}) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .3); s.stop(t + dur + .02);
  }
  const SOUNDS = {
    // urgent two-tone alert
    crit(t) { [0, .16].forEach((o, i) => { tone(i ? 740 : 988, t + o, .14, { type: 'triangle', vol: .26 }); tone(i ? 1480 : 1976, t + o, .1, { vol: .05 }); }); tone(988, t + .34, .22, { type: 'triangle', vol: .2 }); },
    // soft warning chime
    warn(t) { tone(784, t, .35, { type: 'sine', vol: .26 }); tone(1175, t + .09, .45, { type: 'sine', vol: .14 }); },
    // gentle info blip
    info(t) { tone(1320, t, .12, { vol: .16 }); tone(1760, t + .07, .16, { vol: .1 }); },
    // pleasant resolve
    ok(t) { tone(659, t, .22, { vol: .2 }); tone(880, t + .1, .26, { vol: .18 }); tone(1319, t + .2, .4, { vol: .12 }); },
    // messaging-app style incoming pop
    msg(t) { tone(1560, t, .08, { vol: .22, f2: 1180 }); tone(2080, t + .085, .12, { vol: .18, f2: 1640 }); },
    // AI scan start: airy rising sweep
    scan(t) { noise(t, .5, { vol: .06, type: 'bandpass', freq: 600, f2: 3200, q: 2 }); tone(420, t, .45, { vol: .06, f2: 900 }); },
    // AI result ready
    done(t) { tone(1046, t, .1, { vol: .12 }); tone(1568, t + .06, .18, { vol: .1 }); },
    // camera shutter / freeze-frame
    shutter(t) { noise(t, .05, { vol: .35, freq: 3000 }); noise(t + .07, .09, { vol: .25, freq: 1800 }); },
    // single keystroke
    key(t) { const p = 1 + Math.random() * .5; noise(t, .025, { vol: .12 + Math.random() * .06, type: 'bandpass', freq: 2600 * p, q: 1.2 }); tone(180 * p, t, .02, { type: 'square', vol: .025 }); },
    // tiny UI tick (step lights up)
    tick(t) { tone(2400, t, .035, { vol: .06 }); },
    // typing indicator dots
    typing(t) { [0, .12, .24].forEach(o => tone(900, t + o, .05, { vol: .035 })); }
  };
  let lastKey = 0;
  window.sfx = {
    play(name) {
      if (!on || !SOUNDS[name]) return;
      if (!init() || ctx.state !== 'running') return;
      const t = ctx.currentTime + .01;
      if (name === 'key') { if (t - lastKey < .035) return; lastKey = t; }
      try { SOUNDS[name](t); } catch (e) {}
    },
    get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem('ark-hcsa-sfx', on ? 'on' : 'off'); } catch (e) {} paint(); if (on) { init(); setTimeout(() => sfx.play('ok'), 60); } }
  };
  document.addEventListener('DOMContentLoaded', paint); paint();
  addEventListener('keydown', e => { if ((e.key === 'm' || e.key === 'M') && !e.target.matches('input,textarea')) sfx.toggle(); });
  document.addEventListener('click', e => { const b = e.target.closest('[data-sfx-toggle]'); if (b) { e.stopPropagation(); sfx.toggle(); } }, true);
})();

