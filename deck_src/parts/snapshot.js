/* ================= ARK chapter interactions ================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- snapshot tabs (auto-cycle until touched) ---- */
  (() => {
    const id = 'ark-snapshot', sl = document.getElementById(id);
    const tabs = $$('.snap-tab', sl), panes = $$('.snap-panel .pane', sl), bar = $('.snap-prog i', sl);
    let k = 0, manual = false;
    const show = i => {
      k = i;
      tabs.forEach((t, j) => t.classList.toggle('on', j === i));
      panes.forEach((p, j) => p.classList.toggle('on', j === i));
      bar.classList.remove('run'); void bar.offsetWidth; if (!manual) bar.classList.add('run');
    };
    tabs.forEach((t, i) => t.onclick = () => { manual = true; show(i); });
    deck.on(id, {
      enter() { manual = false; show(0); deck.iv(id, () => { if (!manual) show((k + 1) % tabs.length); }, 6000); },
      leave() { bar.classList.remove('run'); }
    });
  })();
})();

