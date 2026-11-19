"""Convert captured portal screenshots (PNG) into compact WebP files for the deck.

  python -I prepare_shots.py <shots_png_dir>

<shots_png_dir>/<project>/NN-slug.png  ->  assets/shots/<project>/NN.webp  (1440 px wide)
                                          assets/shots/<project>/thumb.webp (from 00, 820 px wide)
NN = 00 for the overview screen, then 01, 02 ... in feature order.
"""
import os, re, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
try:
    from PIL import Image          # pip install pillow
except ImportError:
    sys.exit("Pillow is required: pip install pillow")

src_root = sys.argv[1]
for proj in sorted(os.listdir(src_root)):
    sdir = os.path.join(src_root, proj)
    if not os.path.isdir(sdir): continue
    ddir = os.path.join(ROOT, "assets", "shots", proj); os.makedirs(ddir, exist_ok=True)
    for f in os.listdir(ddir): os.remove(os.path.join(ddir, f))
    made = []
    for f in sorted(os.listdir(sdir)):
        m = re.match(r"^(\d\d)-.*\.png$", f, re.I)
        if not m: continue
        im = Image.open(os.path.join(sdir, f)).convert("RGB")
        w, h = im.size
        if abs(w / h - 1.6) > 0.02:            # keep the 16:10 frame: crop from the top
            nh = round(w / 1.6)
            im = im.crop((0, 0, w, min(h, nh))) if h >= nh else im.resize((w, nh))
        out = im.resize((1440, 900), Image.LANCZOS) if im.size != (1440, 900) else im
        out.save(os.path.join(ddir, f"{m.group(1)}.webp"), "WEBP", quality=84, method=6)
        if m.group(1) == "00":
            im.resize((820, 512), Image.LANCZOS).save(os.path.join(ddir, "thumb.webp"), "WEBP", quality=80, method=6)
        made.append(m.group(1))
    size = sum(os.path.getsize(os.path.join(ddir, x)) for x in os.listdir(ddir)) / 1e6
    print(f"{proj:8s} {len(made)} screens {made}  {size:.2f} MB")
