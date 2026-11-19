# Ba0 Ba0 Project Showcase: deck source

The deck is a single self-contained file, `../Ba0Ba0_Project_Showcase.html`, with all fonts, images and screenshots embedded. To host it, rename it to `index.html` and publish it as a static site (Render, Netlify, S3, etc.). It also opens straight from disk in any modern browser.

It uses the same design system, motion engine and presenter controls as the ARK × HCSA deck.

## Rebuild

```
python -I prepare_shots.py <folder with <project>/NN-name.png screenshots>   # only when screenshots change
python -I assemble.py
```

## Where things live

| Path | What it holds |
|---|---|
| `assemble.py` | **All project-slide text** (`PROJECTS`), portfolio cards and the build. Edit wording here. |
| `src/slides_intro.html` | Slides 1–4: opening, company, partners/awards placeholder, portfolio |
| `src/slides_outro.html` | Slides 12–13, plus the top/bottom chrome and overlays |
| `src/scene_port.html`, `src/scene_mining.html` | Animated concept scenes for the two projects without a deployment |
| `src/deck.css`, `src/deck.js` | Styles and interactions for the new slides |
| `parts/` | Extracted from the HCSA deck by `extract_hcsa.py`: engine, design system, icons, partners/awards slide |
| `assets/` | Ba0 Ba0 logo variants and `shots/<project>/NN.webp` screenshots (00 = overview, 01… = features in order) |

## Presenter keys

- → ← Space: next and previous slide
- 1–4: jump to a chapter
- O: all slides
- F or F5: full screen
- L: laser pointer
- T: light or dark theme
- M: sound on or off
- Esc: close

Clicking a feature on a project slide shows its screen. The features also advance on their own every 6 seconds.
