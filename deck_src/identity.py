"""Per-project identity: layout side, frame, signature widget and background motif.
Imported by assemble.py."""
import math

IDENTITY = {
    #           layout    dark   frame      fx         ambient
    "rocket":  ("mirror", True,  "cinema",  "tele",    "space"),
    "pharma":  ("split",  False, "browser", "journey", None),
    "fund":    ("mirror", False, "stack",   "ring",    None),
    "silicon": ("split",  False, "browser", "scan",    "trace"),
    "agri":    ("mirror", False, "tablet",  "survey",  "topo"),
    "port":    ("split",  False, "viz",     None,      "waves"),
    "mining":  ("mirror", False, "viz",     None,      "forge"),
}

def spark():
    return '<svg viewBox="0 0 240 22" preserveAspectRatio="none" aria-hidden="true"><polyline points=""/></svg>'

FX = {
    "tele": lambda: f'''<div class="fx-tele" data-fx="tele" aria-label="Simulated live telemetry"><h6><i></i>Live telemetry<em>Simulated</em></h6>
  <div class="tl" data-base="2316" data-amp="7" data-unit="kN" data-col="#f472b6"><span>Thrust · vacuum</span><b>2,316<small>kN</small></b>{spark()}</div>
  <div class="tl" data-base="300" data-amp="1.4" data-unit="bar" data-col="#c4b5fd"><span>Chamber pressure</span><b>300<small>bar</small></b>{spark()}</div>
  <div class="tl" data-base="650" data-amp="2.6" data-unit="kg/s" data-col="#7dd3fc"><span>Propellant flow</span><b>650<small>kg/s</small></b>{spark()}</div></div>''',
    "journey": lambda: '''<div class="fx-cold" data-fx="cold"><svg class="i"><use href="#i-activity"/></svg>Cold chain <b>4.8 °C</b><small>IN RANGE</small></div>
<div class="fx-journey" data-fx="journey"><div class="jh">Order journey · <b>RFQ-2611</b><span>Documents ready <b class="jd">0</b> / 15</span></div>
  <div class="jt"><i class="jf"></i>''' + '<span class="jn"></span>' * 10 + '''</div>
  <div class="jl"><span>Intake</span><span>Data prep</span><span>Check</span><span>RFQ</span><span>Costing</span><span>Price</span><span>Quote</span><span>Decision</span><span>Validity</span><span>Archive</span></div></div>''',
    "ring": lambda: ring_svg(),
    "scan": lambda: '''<div class="fx-scan" data-fx="scan"><h6>Panel scan · Line 3<em>Live</em></h6><canvas width="476" height="300"></canvas>
  <div class="st"><i></i><span>Scanning panel P-0412…</span></div></div>''',
    "survey": lambda: survey_svg(),
}

def ring_svg():
    names = ["Apply", "Award", "Kick-off", "Deliver", "Claim", "Reconcile", "Close"]
    cx = cy = 98; r = 76; n = len(names); gap = 5
    segs = []
    for i in range(n):
        a0 = -90 + i * 360 / n + gap / 2; a1 = -90 + (i + 1) * 360 / n - gap / 2
        x0, y0 = cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0))
        x1, y1 = cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1))
        segs.append(f'<path class="seg" d="M{x0:.1f} {y0:.1f} A{r} {r} 0 0 1 {x1:.1f} {y1:.1f}"/>')
    return (f'<div class="fx-ring" data-fx="ring" data-names="{"|".join(names)}"><svg viewBox="0 0 196 196" aria-label="Seven-stage fund lifecycle">'
            '<defs><linearGradient id="ringGrad" x1="0" x2="1"><stop offset="0" stop-color="#db2777"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>'
            + "".join(segs) +
            '<text class="rc1" x="98" y="74">LIFECYCLE</text><text class="rc2" x="98" y="98">Apply</text><text class="rc3" x="98" y="122">STAGE 1 OF 7</text></svg></div>')

def survey_svg():
    greens = ["#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#a7f3d0", "#6ee7b7", "#34d399", "#d9f99d", "#bef264", "#a3e635"]
    cells = []
    k = 0
    for row in range(4):
        for col in range(6):
            g = greens[(row * 7 + col * 3) % len(greens)]
            cells.append(f'<rect x="{2 + col * 35}" y="{2 + row * 31}" width="33" height="29" rx="3" fill="{g}" opacity=".85"/>')
            k += 1
    path = "M10 12 H202 V40 H10 V68 H202 V96 H10 V122 H202"
    return (f'<div class="fx-survey" data-fx="survey"><h6>Drone AC-03 · survey<em class="sv">0%</em></h6>'
            f'<svg viewBox="0 0 214 130" aria-label="Drone survey path over management zones"><rect width="214" height="130" rx="6" fill="#ecfdf5"/>'
            + "".join(cells) +
            f'<path class="sv-path" d="{path}" fill="none" stroke="#0f766e" stroke-width="1.3" stroke-dasharray="3 4" opacity=".7"/>'
            f'<path class="sv-done" d="{path}" fill="none" stroke="#0f766e" stroke-width="2.2" stroke-linecap="round"/>'
            '<g class="sv-drone"><circle r="7" fill="rgba(15,118,110,.18)"/><g stroke="#0f172a" stroke-width="1.2"><path d="M-4 -4 L4 4 M4 -4 L-4 4"/></g>'
            '<circle cx="-4" cy="-4" r="2" fill="#0f172a"/><circle cx="4" cy="-4" r="2" fill="#0f172a"/><circle cx="-4" cy="4" r="2" fill="#0f172a"/><circle cx="4" cy="4" r="2" fill="#0f172a"/>'
            '<circle r="1.8" fill="#14b8a6"/></g></svg></div>')

# ---------------------------------------------------------------- ambient backgrounds
def topo_paths():
    out = []
    for i in range(9):
        r = 120 + i * 62; pts = []
        for s in range(0, 361, 6):
            a = math.radians(s)
            rr = r * (1 + 0.08 * math.sin(3 * a + i * .7) + 0.05 * math.sin(5 * a + i))
            pts.append(f"{650 + rr * math.cos(a):.0f} {650 + rr * 0.82 * math.sin(a):.0f}")
        out.append('<path d="M' + " L".join(pts) + 'Z"/>')
    return "".join(out)

def wave_svg(amp, y0, period=480):
    paths = []
    for j, (a, y) in enumerate([(amp, y0), (amp * .7, y0 + 40), (amp * .5, y0 + 80)]):
        d = [f"M0 {y}"]
        for x in range(0, 3841, period // 2):
            d.append(f"Q{x + period / 4:.0f} {y - a if (x // (period // 2)) % 2 == 0 else y + a} {x + period / 2:.0f} {y}")
        paths.append(f'<path d="{" ".join(d)}"/>')
    return '<svg viewBox="0 0 3840 260" preserveAspectRatio="none" aria-hidden="true">' + "".join(paths) + "</svg>"

TRACES = [
    "M0 180 H260 Q280 180 280 200 V300 Q280 320 300 320 H420", "M1920 120 H1640 Q1620 120 1620 140 V230 Q1620 250 1600 250 H1500",
    "M0 760 H140 Q160 760 160 780 V900 Q160 920 180 920 H360", "M1920 980 H1700 Q1680 980 1680 960 V900 Q1680 880 1660 880 H1560",
    "M900 1080 V1010 Q900 990 920 990 H1080", "M60 0 V70 Q60 90 80 90 H210", "M1300 0 V60 Q1300 80 1320 80 H1460",
]
def trace_svg():
    base = "".join(f'<path d="{d}"/>' for d in TRACES)
    pulses = "".join(f'<path class="pulse" d="{d}" style="animation-delay:-{i * 1.3:.1f}s"/>' for i, d in enumerate(TRACES))
    dots = "".join(f'<circle cx="{d.split()[-2] if False else 0}" cy="0" r="0"/>' for d in [])
    return ('<div class="pj-trace" aria-hidden="true"><svg viewBox="0 0 1920 1080" preserveAspectRatio="none"><defs><linearGradient id="traceGrad">'
            '<stop offset="0" stop-color="#0ea5e9" stop-opacity="0"/><stop offset=".6" stop-color="#0ea5e9"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>'
            + base + pulses + dots + "</svg></div>")

AMBIENT = {
    "space": lambda: ('<div class="pj-space" aria-hidden="true"><div class="stars"></div><div class="stars2"></div>'
                      '<svg viewBox="0 0 1500 1500"><ellipse cx="750" cy="750" rx="700" ry="250" transform="rotate(-18 750 750)"/>'
                      '<ellipse cx="750" cy="750" rx="560" ry="190" transform="rotate(-18 750 750)"/><ellipse cx="750" cy="750" rx="420" ry="140" transform="rotate(-18 750 750)"/></svg></div>'
                      '<div class="pj-glow" aria-hidden="true"></div>'),
    "trace": trace_svg,
    "topo": lambda: '<div class="pj-topo" aria-hidden="true"><svg viewBox="0 0 1300 1300">' + topo_paths() + '</svg></div>',
    "waves": lambda: '<div class="pj-waves" aria-hidden="true">' + wave_svg(18, 150) + wave_svg(12, 190, 640) + '</div>',
    "forge": lambda: ('<div class="pj-forge" aria-hidden="true"><svg viewBox="0 0 1920 300" preserveAspectRatio="none">'
                      '<path class="belt" d="M-20 286 L1940 196"/><path class="ore" d="M-20 280 L1940 190"/><path class="belt" d="M-20 274 L1940 184"/></svg></div>'),
}
