"""Set the order of the seven project slides in BOTH the HTML deck source and the Word source.

  python -I set_order.py rocket pharma fund semi agri port mine

Keys: rocket, pharma, fund, semi, agri, port, mine. Numbering (Project 01–07), portfolio cards and the
alternating left/right layout follow the order automatically. Rebuild afterwards:
  python -I assemble.py            (HTML deck)
  node ../_source/build.js <out.docx>   (Word file; _source is local only)
"""
import os, re, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
KEYS = {"rocket": ("Aerospace", "A.rocket"), "pharma": ("Pharmaceutical", "B.pharma"), "fund": ("Social services", "A.fund"),
        "semi": ("Semiconductor", "B.silicon"), "agri": ("Agriculture", "B.agri"), "port": ("Logistics and ports", "A.port"),
        "mine": ("Mining and energy", "C.mining")}
order = sys.argv[1:]
assert sorted(order) == sorted(KEYS), f"give all seven keys once: {list(KEYS)}"

# ---- HTML deck: reorder the PROJECTS blocks in assemble.py ----
p = os.path.join(ROOT, "assemble.py"); s = open(p, encoding="utf-8").read()
head = s.index("PROJECTS = [\n") + len("PROJECTS = [\n"); tail = s.index("\n]\n", head)
blocks = re.split(r"(?=^    dict\(id=\"p-)", s[head:tail], flags=re.M)
blocks = [b for b in blocks if b.strip()]
by = {re.match(r'    dict\(id="p-([a-z]+)"', b).group(1): b.rstrip("\n").rstrip(",") + ",\n" for b in blocks}
s = s[:head] + "".join(by[k] for k in order).rstrip(",\n") + s[tail:]
open(p, "w", encoding="utf-8").write(s)

# ---- Word source (optional, local only) ----
src = os.path.join(os.path.dirname(ROOT), "_source")
if os.path.isdir(src):
    num = {KEYS[k][0]: i for i, k in enumerate(order, 1)}
    b = open(os.path.join(src, "build.js"), encoding="utf-8").read()
    b = re.sub(r"A\.portfolio, (?:[ABC]\.\w+, ){6}[ABC]\.\w+, A\.why", "A.portfolio, " + ", ".join(KEYS[k][1] for k in order) + ", A.why", b)
    for ind, i in num.items():
        b = re.sub(r'  \d+: "Project \d\d · ' + re.escape(ind) + '",', f'  {i + 4}: "Project {i:02d} · {ind}",', b)
    lines = b.split("\n"); pstart = next(j for j, l in enumerate(lines) if l.startswith("const purpose = {"))
    seg = [l for l in lines[pstart + 1:pstart + 14]]
    proj = sorted([l for l in seg if "Project 0" in l], key=lambda l: int(l.split(":")[0]))
    others = [l for l in seg if "Project 0" not in l]
    lines[pstart + 1:pstart + 14] = sorted(others + proj, key=lambda l: int(l.strip().split(":")[0]))
    open(os.path.join(src, "build.js"), "w", encoding="utf-8").write("\n".join(lines))
    for f in ("content_a.js", "content_b.js", "content_c.js"):
        fp = os.path.join(src, f); t = open(fp, encoding="utf-8").read()
        for ind, i in num.items():
            t = re.sub(r'kicker: "Project \d\d  ·  ' + re.escape(ind), f'kicker: "Project {i:02d}  ·  {ind}', t)
        open(fp, "w", encoding="utf-8").write(t)
    fp = os.path.join(src, "portfolio.js"); t = open(fp, encoding="utf-8").read().splitlines()
    cards = {next(ind for ind in num if f"·  {ind}\"" in l): l for l in t if l.strip().startswith("{ tag:")}
    seq = iter(re.sub(r'tag: "\d\d  ·', f'tag: "{num[KEYS[k][0]]:02d}  ·', cards[KEYS[k][0]], count=1) for k in order)
    t = [next(seq) if l.strip().startswith("{ tag:") else l for l in t]
    open(fp, "w", encoding="utf-8").write("\n".join(t) + "\n")
print("order set:", " > ".join(order))
