# BRASA — deck script for the 7-slide demo

Canva build sheet. Russian instructions on what to capture and where to put it, English copy to paste as-is.
Source of truth for numbers: the live app, `docs/SUBMISSION.md`, `pipeline/out/*/report.json`.

---

## 0. The hard gate, read this first

The 2025 Judging Guidelines, Step 1: if a project fails **any** minimum requirement it is scored **1 (Poor)** and not evaluated further. The list:

- primarily in English;
- responds to the challenge;
- **demo does not exceed 7 slides, including title and ending slides,** or is ≤30 s;
- all project links accessible, no password;
- NASA open data and resources used;
- AI usage declared;
- no NASA branding (logo, flags, mission identifiers) in generated content;
- AI images/videos carry a visible watermark; AI code/audio/text declared.

Consequences for you:

1. **Exactly 7 slides. Not 8.** Title counts, closing counts. Five content slides is the whole budget.
2. No NASA logo anywhere. Write `data: NASA FIRMS` in plain text.
3. Every image is a screenshot of the real app, so no watermark needed. If you drop in any AI picture, put "AI-generated" on it.
4. The deck must open with the title and close with the link — a judge who stops after 10 seconds still got the pitch.

## 1. How the scoring actually works

Five criteria, holistic 1–5, and global judging explicitly says "be selective, 5 only for truly exemplary". One in ten advances. The 5-descriptors, compressed:

| Criterion | What a 5 literally says | What makes a judge write it |
|---|---|---|
| Impact | exceptional impact, extensive reach, high standard for others | named users, scale, "who stops making mistakes" |
| Creativity | groundbreaking, challenges conventional methods | an explicit "standard approach vs ours" contrast |
| Validity | scientifically sound, feasible, **fully developed**, usable | held-out numbers, a live working app |
| Relevance | NASA data integral, method depends on it | "remove FIRMS and there is no product" |
| Presentation | polished, confident, structured, audience grasps it | one idea per slide, 25 words max |

The deck's job is to hand the judge a sentence for each row. Below, every slide names the criterion it feeds.

## 2. The offer you are actually making

Not "a dashboard". The offer is: **a fire history you can finally compare across sensors and years, per cell, with error bars, free, in the browser, no account.** The pain it kills is concrete: today anyone comparing 2015 VIIRS to 2020 VIIRS is reading a sensor artefact as a trend.

Devices used, keep them honest:

- **Loss framing** (slide 2): what goes wrong without the fix.
- **Anchoring** (slide 2–3): 5.09 M raw detections → 1.05 M comparable ones.
- **Authority** (slide 4): leave-one-year-out, R², NASA FIRMS as sole input.
- **Concreteness** (everywhere): 0.1°, 18 929 cells, −1.29 %.
- **Fluency** (layout): high contrast, ≤25 words, one message.
- **Commitment** (slide 5): "open it, drag a box" — effort creates ownership.
- **Peak–end** (slide 7): the last line is the one they repeat in the judging form.

## 3. Visual system

- 16:9, dark canvas `#0B0B12`, text `#F2F2F7`, accent `#FF6B35` (inferno orange), secondary `#7B8794`.
- Type: Inter or Rubik. Headline 54–64 px, body 24–26 px, caption 16 px.
- Screenshots: crop tight, **72 % opacity on the background, 100 % where circled**.
- Circles/arrows: 4 px `#FF6B35`, nothing else. Max two marks per screenshot.
- Every slide: headline top-left, one-line kicker under it, screenshot mid, caption strip bottom.
- Footer on slides 2–7, 14 px, `#7B8794`: `BRASA · theexotech.github.io/brasa`.

---

# SLIDE 1 — Title

**Feeds:** nothing directly, it sets the frame. Judge decides in ~10 s whether to keep reading.

**Capture:** one screenshot of the calendar, Argentina, whole period, dark basemap, no AOI. Full-bleed right half, overlay a 55 % dark scrim so text stays readable.
`https://theexotech.github.io/brasa/#r=argentina&from=2000-01&to=2026-11&b=2003-2022&u=viirs&lang=en`

**Compose:** left 55 % is text. No logo row, no "UNIVERSAL CHALLENGE" pill.

**English copy, exactly:**

> # BRASA
> ### A harmonized fire calendar
> MODIS and VIIRS disagree by up to 9×. BRASA corrects it per 0.1° cell, with error bars, so burning activity can finally be compared across sensors and years.
>
> Live app: theexotech.github.io/brasa
> Challenge: MODIS and VIIRS Hot Spots · Andrei Tsygankov, Andrei Tsygankov Sr.

**Why it works:** the title states the defect and the fix in one breath. The number (9×) does the hooking; the URL sits on the title slide so a lazy judge never has to hunt for it.

**Do not** put "NASA Space Apps Challenge 2026" as the biggest element — it is context, not content.

---

# SLIDE 2 — The problem

**Feeds:** Impact (loss framing), Creativity (sets up the contrast).

**Capture:** the Annual totals panel, Argentina, 2000-01 → 2026-11, VIIRS units. It plots harmonized bars against raw sensor lines, so the artefact is visible without any edit.
`https://theexotech.github.io/brasa/#r=argentina&from=2000-01&to=2026-11&b=2003-2022&u=viirs&lang=en`

Crop to the chart only, full width. **Circle the 2023→2024 jump** in the raw line and label it `+67 % — sensor change, not fire`.

**Compose:** headline, then one line, then chart, then a 2-row caption.

**English copy:**

> ## Every year-on-year fire comparison in use today is wrong
> VIIRS and MODIS count the same fire differently. Splice the series and the record appears to explode while the ground does not change.

Bottom caption, two short lines:
> Raw VIIRS pixels, Argentina: **5.13 M** detections → **+428.6 %** bias against MODIS on held-out years
> Same fires, harmonized: **1.05 M** comparable detections (MODIS-equivalent)

**Why it works:** loss framing plus anchoring. The judge now has a problem to solve, and the size of it (429 %) is memorable.

**Do not** put the solution on this slide. Problem only.

---

# SLIDE 3 — The method, and why it is not "a coefficient"

**Feeds:** Creativity. This is the slide that decides 5 vs 3 — the rubric asks whether you challenge conventional methods, so name the conventional method and break it.

**Capture A:** the Units toggle showing `MODIS-equivalent` / `VIIRS-equivalent` live, cropped to the control plus a calendar corner behind it.
**Capture B:** `https://theexotech.github.io/brasa/method.html`, the calibration section, top half, readable.

Side by side, A small right, B large left.

**English copy:**

> ## The standard fix is one ratio per sensor. That is why it fails.
> A single global multiplier assumes one sensor is uniformly wrong. It is not: bias moves with biome, season and view angle. BRASA estimates the correction **per 0.1° cell**, shrinks thin cells toward their neighbourhood with an empirical-Bayes prior, and publishes a 90 % interval on every number.

Three micro-cards under, 6 words each:
> `Per-cell multiplier` — replaces the global ratio
> `Empirical-Bayes shrinkage` — stabilises sparse cells
> `90 % intervals` — uncertainty is visible, not hidden

**Why it works:** "conventional method, stated, then refuted" is the literal 5-descriptor for Creativity. Empirical Bayes and per-cell units are specific enough to read as real engineering rather than as a claim.

**Do not** call it "AI". It is statistics, and the AI declaration slide-policy gets simpler if you keep them separate.

---

# SLIDE 4 — Proof

**Feeds:** Validity. "Fully developed, ready for real-world implementation" is the 5.

**Capture:** validation table from `method.html`, crop the leave-one-year-out block. **Circle the harmonized error column.**

**English copy:**

> ## Held-out year, two countries, one shot

Table, big type, three rows:

> | | Raw VIIRS | BRASA |
> |---|---|---|
> | Argentina bias | **+428.6 %** | **−1.29 %** |
> | Philippines bias | **+896.0 %** | **+0.58 %** |
> | R² vs MODIS, region-month log | — | **0.984 / 0.967** |

Footer line:
> Method frozen each run: no year in the test set is used in calibration. Pipeline, tables and tests are in the repo.

**Why it works:** a held-out design is what separates "we computed something" from "it generalises". Two countries, opposite hemispheres, both pass — that is the strongest single fact you own. Say the design out loud in one line: judges reward it and it costs six words.

**Do not** show a screenshot of code. Code is unreadable at 16:9.

---

# SLIDE 5 — The product

**Feeds:** Validity (usability), Presentation (this is where "polished" is decided), and it is the commitment ask.

**Capture, four tiles, 2×2:**

1. Calendar heatmap, Philippines, dark basemap, anomaly view:
`https://theexotech.github.io/brasa/#r=philippines&from=2000-01&to=2026-11&b=2003-2022&u=viirs&v=anomaly&lang=en`
2. AOI drawn as a polygon over a burning corridor, calendar narrowed to three months, with the point count visible:
`https://theexotech.github.io/brasa/#r=argentina&from=2000-01&to=2026-11&b=2003-2022&u=viirs&sel=2024-09&lang=en` (draw the box by hand)
3. Downloads panel open — CSV, analytics CSV, PNG, SVG, JSON.
4. Live NRT panel with "Fetch last 3 days".

Number the tiles 1–4 in the corner so you can talk them in order.

**English copy:**

> ## Ten seconds to a defensible answer for your own area
> Draw a box or upload GeoJSON. Get the calendar, the anomaly against the baseline, and a 90 % interval. Export CSV, PNG, SVG or JSON, or share the exact view as a link.

Caption under the tiles:
> Zero install, no account, works on a phone. English and Spanish. The key for live data is optional — it ships pre-configured.

**Why it works:** the judge is asked to do something small (open, drag). Effort converts a viewer into a user, and a user scores usability high. Naming the exports also pre-empts "it is just a visualisation".

**Do not** show empty states. Every tile must have data on screen.

---

# SLIDE 6 — Who it is for, and where the edges are

**Feeds:** Impact (reach, named users), Validity (honesty about limits raises credibility).

**Capture:** one side-by-side pair — Argentina and Philippines calendars on the same months, so the hemispheric offset is visible at a glance.

**English copy:**

> ## Two hemispheres, one comparable series
> Built for the people who currently cannot compare: civil defence and fire agencies (CONAE, INPE), land managers choosing where to burn, insurers pricing a season, researchers who need a series that survives peer review. Adding a region is a config entry and one pipeline run.

Limits block, 3 short lines, smaller type, `#7B8794`:
> 0.1° grid — large fires, not smallholder burns
> Two regions today; the remaining three are pipeline runs, not new code
> Sensor physics still differ — the interval widens where they disagree most

**Why it works:** "adding a region is a config entry" answers Relevance's "complete solution" question. The limits block reads as confidence, not as apology, because it is followed by the fix for each limit.

---

# SLIDE 7 — Close

**Feeds:** Presentation (peak–end), and it is the only slide with a call to action.

**Capture:** none, or a thin strip of the calendar at 30 % opacity. Big type, dark.

**English copy:**

> # The fire record is fixed.
> ### Point it at your region.
> **theexotech.github.io/brasa**
> Code, method, validation, references: github.com/TheExotech/brasa
>
> Data: NASA FIRMS (MODIS C6.1, VIIRS S-NPP 375 m). Not an official NASA product.
> AI: Claude Code used for scaffolding and documentation; data, method and analysis our own.

**Why it works:** short, imperative, second person. The AI declaration and the NASA disclaimer live here so they are on the last slide a judge sees and easy to find in the form too.

---

## 4. Pre-flight checklist before export

- [ ] 7 slides total, counting this title and this close.
- [ ] Every word on every slide is English.
- [ ] No NASA logo, no mission patch, no flag.
- [ ] No human faces and no voice track.
- [ ] All links typed out as text, not hidden behind "click here".
- [ ] Slide 5 tiles all contain real data.
- [ ] Every number matches `docs/SUBMISSION.md` and the live app.
- [ ] Export as PDF, upload to Drive, sharing = anyone with the link, no password.
- [ ] Open the exported PDF on a phone once: if the headline is unreadable at that size, raise the type.

## 5. Two traps

**Screenshot purism.** Take screenshots at 1440 px width, browser zoom 100 %, dark basemap, language English. Canva will scale them down; a phone screenshot upscaled looks mushy and costs Presentation points.

**Over-claiming on slide 2.** The splice jump is real and reproduced in the app. Do not add a number you cannot reproduce from the app or `report.json` in the next ten minutes.
