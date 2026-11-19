/* ---- icon colour variety: brand-tinted icons get a rotating palette instead of all pink/violet ---- */
(() => {
  const PAL = ['blue', 'violet', 'teal', 'pink', 'amber', 'sky', 'emerald', 'indigo'];
  // interactive states, buttons, recreated app screens and live feeds keep their own styling
  const SKIP = '.film, [data-c], .chrome-top, .chrome-bot, .cctv, .iph, .app, .btn, .toast, .pill, .tabs, .jd-gen, .call-av, .call-ctl, .cap-node, .fx, .kicker, .tb, .overlay, .snap-tab, .acc-i, .wa-msg, .lb';
  const hue = c => {
    const m = (c || '').match(/\d+(\.\d+)?/g); if (!m || m.length < 3) return null;
    const [r, g, b] = m.slice(0, 3).map(Number), mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn < 45) return null;
    let h = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
    h *= 60; return h < 0 ? h + 360 : h;
  };
  const brand = c => { const h = hue(c); return h != null && (h > 250 || h < 12); };
  const brandBg = cs => brand(cs.backgroundColor) || /(219, 39, 119|162, 28, 175|124, 58, 237|236, 72, 153|190, 24, 93|109, 40, 217|241, 235, 254|253, 234, 244)/.test(cs.backgroundImage + cs.backgroundColor);
  deck.slides.forEach(sl => {
    let k = 0;
    sl.querySelectorAll('.vp-st').forEach(el => { el.dataset.c = PAL[k++ % PAL.length]; });
    k = 0;
    sl.querySelectorAll('.ico, svg.i').forEach(el => {
      if (el.closest(SKIP) || (el.matches('svg.i') && el.closest('.ico'))) return;
      const cs = getComputedStyle(el);
      const chip = el.matches('.ico') ? brandBg(cs) || brand(cs.color) : brand(cs.color) || brandBg(cs);
      if (!chip) return;
      if (el.matches('svg.i') && (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none')) el.classList.add('chipbg');
      el.dataset.c = PAL[k++ % PAL.length];
    });
  });
})();

