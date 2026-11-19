"""Extract the reusable engine, styles, icons and the partners/awards slide from the HCSA deck.
Writes parts/*.{css,js,html} with base64 media replaced by __B64_n__ keys, and parts/b64.json with the keys used."""
import re, json, os, sys
SRC = r"W:\BAO BAO\DOCS\HCSA\5. PPT\ARK_HCSA_Programme_Update.html"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "parts")
s = open(SRC, encoding="utf-8", newline="").read().replace("\r\n", "\n")
store, n = {}, [0]
def sub(m):
    n[0] += 1; k = f"__B64_{n[0]}__"; store[k] = m.group(0); return k
t = re.sub(r"data:[a-zA-Z0-9/+.\-]+;base64,[A-Za-z0-9+/=]+", sub, s)

styles = re.findall(r"<style[^>]*>\n?(.*?)</style>", t, flags=re.S)
script = re.search(r"<script>\n?(.*?)</script>", t, flags=re.S).group(1)
body = t[t.index("<body>"):]

def between(text, a, b, inclusive_a=True):
    i = text.index(a); j = text.index(b, i + len(a))
    return text[i if inclusive_a else i + len(a):j]

fonts_css = styles[0]
main_css = styles[1].replace('url("__B64_7__")', 'none')   # film-intro backdrop (unused here)
sprite = between(body, '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute', '\n\n<div id="stage"') 
partners = between(body, '<section class="slide" id="ark-partners"', '<!-- ===================== ARK 04')
js_sfx = between(script, "/* ================= Sound effects", "/* ============================================================\n   Presentation engine")
js_engine = between(script, "/* ============================================================\n   Presentation engine", "/* ================= ARK chapter interactions")
js_snap = between(script, "/* ================= ARK chapter interactions", "/* ================= Programme hub")
js_icons = between(script, "/* ---- icon colour variety", "/* ================= VA · the experience film")
js_partners = between(script, "/* ================= ARK 03 / 04 · partners", "\n</script>" if "\n</script>" in script else script[-20:]) if False else script[script.index("/* ================= ARK 03 / 04 · partners"):]

parts = {"fonts.css": fonts_css, "main.css": main_css, "sprite.svg": sprite, "partners.html": partners,
         "sfx.js": js_sfx, "engine.js": js_engine, "snapshot.js": js_snap, "icons.js": js_icons, "partners.js": js_partners}
used = set()
for name, txt in parts.items():
    open(os.path.join(OUT, name), "w", encoding="utf-8", newline="\n").write(txt)
    used |= set(re.findall(r"__B64_\d+__", txt))
json.dump({k: store[k] for k in sorted(used, key=lambda x: int(x[6:-2]))}, open(os.path.join(OUT, "b64.json"), "w"))
for name, txt in parts.items(): print(f"{name:14s} {len(txt):>9,d} chars")
print("media kept:", len(used), "of", len(store), "| bytes:", sum(len(store[k]) for k in used))
