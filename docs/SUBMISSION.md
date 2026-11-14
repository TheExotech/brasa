# Space Apps submission kit (ready to paste)

## Project name
BRASA: Burning Records Across Satellites, Aligned

## High-level summary (≈ 150 words)
Fire managers need to know whether this month's burning is normal. The satellite record that should answer this is split across two sensors. MODIS has watched fires since 2000 but is retiring. VIIRS detects 5–10× more hotspots, so splicing the records creates a fake +430 % to +900 % surge in fire activity. BRASA harmonizes NASA FIRMS MODIS and VIIRS hotspots into one consistent series, from 2000 to today, in Aqua-MODIS-equivalent units. It uses footprint deduplication, reference-satellite calibration with empirical-Bayes cell ratios, and NOAA-20 continuity as S-NPP retires. Leave-one-year-out validation shows ≈1 % bias and R² ≈ 0.97–0.98, versus R² < 0 for naive splicing. The web app lets anyone draw an area and get a burning-activity calendar with anomalies against the historical median. It also shows the fire season, trends and a plain-language situation summary, and offers CSV/PNG downloads. It is bilingual, colour-blind safe and open source.

## Links
- Final project: `https://<github-user>.github.io/<repo>/` (live app) and `https://github.com/<github-user>/<repo>` (code)
- Demo: 7-slide deck, ready in `docs/demo-slides.pdf` (upload to Google Slides/Drive, link sharing set to "anyone with the link")

## Project details (what it does, how it works, benefits)
- **What is new here.** Existing harmonization stops at one global or regional ratio per platform. BRASA adds (a) cell-level empirical-Bayes multipliers with day/night seasonal terms, (b) published 90 % prediction intervals per converted month from leave-one-year-out residuals, (c) per-platform outage detection against each sensor's own climatology, and (d) an explicit NOAA-20 hand-over path so the record survives S-NPP retirement. All four are shipped, not proposed, and the whole thing runs for any country from one config line.
- **Who it is for.** Early-warning and emergency-response agencies, land managers, firefighters and scientists, such as CONAE, INPE, provincial fire services and the Philippine DENR / NDRRMC.
- **What it does.**
  - Pick a region, then draw a polygon, enter coordinates and a radius, or upload a GeoJSON.
  - See a year × month burning calendar from 2000 to now, with the median row, annual totals, era markers and uncertainty marks.
  - Switch between counts and anomaly view.
  - Read KPIs: latest month vs median (including month-to-date vs the same days in past years), fire season, most active years, and trend with significance.
  - Read an auto-written situation summary in English or Spanish.
  - Click a month to map its hotspots over NASA GIBS imagery. Pull the last 3 days live from FIRMS.
  - Download the hotspot CSV, monthly analytics CSV with intervals, calendar PNG/SVG and a JSON report. Share the exact view by URL.
- **How it works.** Python pipeline (polars) → compact static binaries → TypeScript/MapLibre/D3 static site on GitHub Pages: no server, no login, loads in seconds. Full algorithm in `docs/METHODOLOGY.md`.
- **Benefits.**
  - Removes a sensor artefact that would otherwise show up as a false alarm.
  - Turns 26 years of satellite data into one picture readable in seconds.
  - Quantifies uncertainty instead of hiding it.
  - Continues to work after MODIS and S-NPP retire.
- **Tools.** Python, polars, NumPy, Shapely, TypeScript, Vite, MapLibre GL JS, D3, Vitest, pytest, GitHub Actions/Pages.

## Use of NASA data
- **NASA FIRMS MODIS Collection 6.1 active fires** (Terra, Aqua). Standard Processing yearly archives 2000–2025 and the Area API for 2026, SP and NRT.
- **NASA FIRMS VIIRS 375 m active fires.** S-NPP: archives 2012–2025 and API for 2026. NOAA-20: API, 2024 to present.
- **NASA FIRMS Area API (live).** Supplies the in-app last-3-days layer.
- **NASA GIBS.** VIIRS S-NPP Corrected Reflectance true-colour basemap, matched to the selected month.

## Use of space agency partner data
Challenge context from CONAE (Argentina), the photo credit on the challenge page. Argentina is the primary showcase region, and the interface is in Spanish.

## References
See `docs/METHODOLOGY.md` §5 and the Method page: Schroeder 2014, Giglio 2016, Giglio 2006, Csiszar 2014, Li 2018, Fu 2020, Vadrevu & Lasko 2018, White 2023, Clayton & Kaldor 1987, Marshall 1991, and INPE Programa Queimadas. Libraries: MapLibre GL JS (BSD-3), D3 (ISC), polars (MIT). Basemap © OpenStreetMap contributors via OpenFreeMap. Boundaries: Natural Earth.

## Use of AI (SI) tools
We used an AI coding assistant (Claude) to:
- speed up the literature search;
- scaffold code (pipeline modules, web components);
- draft documentation.

The harmonization design, parameter choices and every reported number come from the open-source pipeline run on NASA data, and the team reviewed them. No AI-generated images, video or voice are used. Any that were added to the demo would be labelled.

---

## 30-second demo video script
| Time | Visual | Voice-over / caption |
|---|---|---|
| 0–3 s | Title card: team + "BRASA" | "Team ___ presents BRASA." |
| 3–9 s | Annual chart, raw lines: VIIRS line jumps 5× above MODIS | "Satellites have tracked fires for 25 years, but the new VIIRS sensor sees five to ten times more hotspots. Spliced, the record shows a fake fire surge." |
| 9–14 s | Toggle to harmonized bars: smooth record | "BRASA harmonizes MODIS and VIIRS: one consistent series, about 1 % bias in cross-validation." |
| 14–22 s | Draw a polygon over Córdoba → calendar fills, anomaly view, KPI "+85 % vs median" | "Draw any area and get its burning calendar: critical months, record years, and how this month compares with the historical median." |
| 22–27 s | Click Sep 2020 → hotspots on GIBS imagery; click "Download CSV" | "Drill into any month, map the hotspots, download everything." |
| 27–30 s | Logo + URL + "NASA FIRMS · open source" | "BRASA: one fire record, whatever satellite saw it." |

## 7-slide deck outline
1. **Title.** BRASA: team names, challenge name, one-line value.
2. **Problem.** Raw MODIS vs VIIRS annual counts (the jump), with the "5–10× more pixels" stat.
3. **Users and need.** Emergency managers ask: is this month unusual? What is coming? Show the KPI tiles.
4. **Method.** Pipeline diagram: filter → 1 km dedup → reference-satellite calibration (EB) → assembly (Terra | Aqua | VIIRS | NOAA-20) → intervals.
5. **Validation.** Table N0 vs M3 (bias +429 % → −1.3 %, R² −2.1 → 0.98), plus the drift diagnostic.
6. **Product.** Calendar + map + summary screenshots, downloads, accessibility, EN/ES.
7. **Impact and next steps.** Any country via the pipeline, NOAA-21 nesting, alerts. Link and QR code.
