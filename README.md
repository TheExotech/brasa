# BRASA

**Burning Records Across Satellites, Aligned.** A harmonized MODIS + VIIRS burning activity calendar, 2000 to today, for any area you draw.

Live app: https://theexotech.github.io/brasa/ · Method and validation: https://theexotech.github.io/brasa/method.html

Entry for the NASA Space Apps Challenge 2026 challenge *Harmonization of MODIS and VIIRS Hot Spots*. Team BRASA Dynamics, Universal Event.

<img src="docs/img/cordoba-calendar.jpg" alt="Córdoba, September 2020, in the live app: calendar, anomaly strip and hotspot map" width="880">

## For judges: a 60-second tour

The app keeps its state in the URL, so every claim in the deck opens on the exact area, month and view it refers to. No account, no setup.

1. **April 2026, 60 km around Angeles City: 102 hotspots against a median of 38, or 2.7×.** [Open it](https://theexotech.github.io/brasa/#r=philippines&v=anomaly&sel=2026-04&aoi=c:120.59,15.15,60). The calendar switches to anomaly colours against the 2003–2022 median, and the strip underneath lists the months at twice the median or more, this one among them.
2. **Córdoba, September 2020. The hotspots on the map.** [Open it](https://theexotech.github.io/brasa/#r=argentina&sel=2020-09&aoi=c:-64.40,-31.20,90). Click a cell to see the detections that produced the count, or pull the last three days live from FIRMS.
3. **Raw record against harmonized.** [The Method page](https://theexotech.github.io/brasa/method.html#r=argentina) puts both series on one axis and prints the leave-one-year-out table the deck quotes: +429 % → −1.3 % total bias for Argentina, and +896 % → +0.6 % when you switch the page to the Philippines.
4. **The deck.** [Seven slides as PDF](https://theexotech.github.io/brasa/deck/BRASA-Dynamics-demo.pdf), every figure taken from the running app.

If one of those links lands somewhere that does not match the sentence above it, that is a bug worth reporting, and it is the kind of bug I would rather hear about than not.

## Why this exists

Two satellites, one record, and a hole in the middle of it.

MODIS (Terra from 2000, Aqua from 2002) is the only active-fire record long enough to say what "normal" looks like. Both platforms are at end of mission. VIIRS (S-NPP from 2012, then NOAA-20/21) flies the same 13:30 orbit with 375 m pixels, so it sees five to ten times more hotspots. Anyone who splices the two together gets a fire surge that never happened: +429 % in Argentina, +896 % in the Philippines against Aqua over the same months.

That jump is not academic. In April 2026 a 60 km circle around Angeles City, Pampanga, was running 2.7× its April median (102 detections against 38). On the raw record every month after 2012 looks roughly ten times worse than the 2000s, so a duty officer comparing 2026 to 2003 reads a fake doubling on top of a real one.

BRASA takes the jump out. Fire managers get one calendar where the sensor stops mattering, and the anomalies are about fires.

## What it does

- **Year × month calendar**, Nov 2000 to the current month, with annual totals, the baseline median row, the data-source era, uncertainty marks and incomplete-data marks.
- **Any AOI.** Draw a polygon or rectangle, type lat/lon and a radius, upload GeoJSON, or pick a whole region. Counts are area-weighted on a 0.1° grid, so an odd shape still works.
- **Anomalies** against a multi-year median (default baseline 2003–2022, target year excluded from its own baseline): percentile rank, robust z-score, colour-blind-safe diverging ramp.
- **"Is this month unusual?"** answers for the current month even when only days 1–N exist, by comparing the same days across past years.
- **Indicators**: fire-season window (80 % of activity), peak month, most active years, Theil–Sen trend with a Mann–Kendall test.
- **Situation summary** written in plain English or Spanish.
- **Map** (MapLibre) with the harmonized grid, the clicked month's hotspots, and NASA GIBS true colour underneath.
- **Live layer**: last 3 days straight from the FIRMS API (bring a free MAP_KEY).
- **Downloads**: hotspot CSV clipped exactly to the AOI with a `used_in_harmonized_series` column, monthly analytics CSV with 90 % intervals, calendar PNG/SVG, JSON report, shareable URL.
- **Accessible**: CVD-safe ramps, keyboard-navigable calendar, table view, dark mode, mobile layout, EN/ES.

## The method in one paragraph

Filter to vegetation fires at nominal/high confidence. Snap every detection to a 1 km cell, one count per cell × day × day-night × platform, which kills the 375 m pixel multiplicity. Calibrate to Aqua MODIS, the reference satellite INPE already uses for Brazil's official series, over the stable 2012–2021 overlap, with day/night seasonal ratios and empirical-Bayes multipliers per 0.5° cell. Terra carries the record back to 2000; VIIRS carries it past Aqua's orbit drift in 2021; NOAA-20 takes over as S-NPP retires. Platform outages are detected against each sensor's own climatology and replaced. Converted months carry a 90 % prediction interval from leave-one-year-out residuals. Tables, references and the caveats are in [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md) and on the in-app Method page.

| Leave-one-year-out, region × month | Argentina | Philippines |
|---|---|---|
| Raw VIIRS/Aqua pixel ratio | 5.09× | 9.73× |
| Bias if spliced raw | +429 % | +896 % |
| **BRASA bias** | **−1.3 %** | **+0.6 %** |
| **BRASA R² (log counts)** | **0.984** | **0.967** |
| Spearman ρ | 0.985 | 0.973 |

## Two things that shaped the design

**We labelled 2020 a sensor artefact.** It is the biggest year in the raw series and it lands just after the overlap ends, so our first deck put "SENSOR SWAP" on it — another splice, not a real year. The cross-validation said otherwise. 2020 and 2021 stay at the top of the harmonized series (71,818 and 32,666 detections, against 38,382 in 2013), and the year that actually breaks is 2012, where the raw count jumps ×3.7 while Aqua does not move. The annotation was rewritten and the label came off.

**The calibration grid is 0.5°, not the 0.1° grid the app draws.** At 0.1° most cells in Argentina hold a couple of counts a month, the shrinkage pulls every one of them back to the regional ratio and the cell term stops doing any work. 0.5° keeps 2,164 cells with enough signal to be worth fitting; the app still aggregates on 0.1°.

And one result we did not enjoy: a single global ratio on raw pixels (our model N1) is very close to us at cell level, MAE 0.436 against our 0.444. We kept the heavier model because at the level the app actually reports, region × month, it cuts error 29 % (0.134 → 0.095), but N1 is the honest simple baseline and it is in the validation table.

## Team

Two people, and a real split of work.

- **Andrei Tsygankov** ([@theexotech](https://github.com/TheExotech)): found the challenge, read the FIRMS record, built the method, the pipeline, the app and the validation, registered the team, uploaded everything.
- **Andrei Tsygankov Sr.** ([@andreirss](https://github.com/andreirss)): scope and deadline, reviewed every draft before it went public, pushed back on claims, second pair of eyes on the numbers. Not a coder — he did not write the Python, he is the reason it ships finished.

We have the same name and two accounts. Mine is `@theexotech` (team owner, registration, uploads), his is `@andreirss` (joined to the team). Separate accounts, one household.

## Build log

- 14 Nov, evening: challenge picked, FIRMS archive pulls started, first calibration.
- 14 Nov, late: dedup added after the pixel-ratio test (5.09× → 3.19× in Argentina), first honest validation table.
- 15 Nov, morning: 0.5° cell fit, outage detection, NOAA-20 chain, interval estimation.
- 15 Nov: app polish, method page, submission.

## Repository layout

```
pipeline/            Python data pipeline (polars)
  fetch.py           FIRMS yearly archives + API for the current year
  fill_years.py      backfill slow archive years through parallel API windows
  fill_range.py      download a date range for one sensor (e.g. NOAA-20)
  process.py         normalize, clip to country, NRT static-source flags
  harmonize.py       dedup, calibration, validation, uncertainty, outages
  export_web.py      compact binary/JSON files for the web app
  test_harmonize.py  synthetic-data tests
  regions.json       regions to build
web/                 Vite + TypeScript + MapLibre + D3 static app
  public/data/       generated data, committed so Pages can serve it
docs/                methodology, references, validation protocol
.github/workflows/   Pages deployment
```

## Run it locally

```bash
cd web
npm install
npm run dev
```

Then http://localhost:5173. Prebuilt data for Argentina and the Philippines is in `web/public/data`.

On Windows, double-click **`start.bat`** instead. It installs on first run, starts the server and opens the browser; closing the console stops it. `start.bat prod` serves the production build on 4173.

## Rebuild the data

```bash
cd pipeline
pip install -r requirements.txt
echo FIRMS_MAP_KEY=your_key > .env
python fetch.py --countries Argentina:-73.6,-55.1,-53.6,-21.7
python process.py Argentina
python harmonize.py Argentina
python export_web.py
```

Free FIRMS key: https://firms.modaps.eosdis.nasa.gov/api/map_key/. The archive part needs none. To add a country, put it in `regions.json` and in `--countries`, spelled as FIRMS spells it.

## Deploy

Push, then set Pages to *Source: GitHub Actions*. `deploy.yml` runs the tests, builds, deploys. Setting the `FIRMS_MAP_KEY` repository secret pre-fills the live layer; the key ends up visible in the public bundle.

## Tests

```bash
cd web && npm test
cd pipeline && python -m pytest -q
```

## Data, credits, disclaimer

Fire data: NASA FIRMS, MODIS Collection 6.1 and VIIRS 375 m (S-NPP, NOAA-20), Standard Processing and NRT. *We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS), part of NASA's Earth Science Data and Information System (ESDIS).* Imagery: NASA GIBS. Basemaps: OpenFreeMap / © OpenStreetMap contributors. Boundaries: Natural Earth.

Not an official NASA product, no endorsement implied. A hotspot is a satellite detection of a fire pixel, not a confirmed fire and not burned area.

## Use of AI

The problem, the calibration design, the choice of Aqua as reference, the deduplication step, the cell size, the model ladder and the interval construction are mine — thought through, argued against and redesigned where they lost. So is the app: what it shows, screen by screen, and what it deliberately refuses to show. The code itself was written with AI assistants doing the typing, the way a library or a compiler does work you did not type out; every number in `report.json` came out of the pipeline and was re-read by me, not accepted from a model.

Assistance, per tool:

- **Claude Code** scaffolded the modules and the app shell, ran literature search and typed the first drafts of the prose here, in the METHODOLOGY and on the Method page. The drafts were argued over and rewritten after; the two "what we got wrong" sections exist because those were our own turns, not a model's.
- **Hermes Agent** for repository mechanics: commit-message cleanup, deploy checks, deck build.
- **Slides**: the deck is mine in the argument it makes. I decided the opening claim, which figure earns a slide and what each one has to prove, the order they run in, and what got cut when the flow dragged. Claude Code built the template and set the type from that brief and from screenshots of the running app; the layout went through several passes before it held, and the passes were mine to call. No AI imagery, video or voice anywhere, so there is nothing synthetic to label inside the app.

Every claim in this repository is reproducible from `pipeline/` and the public NASA data listed above.

## License

MIT, see [LICENSE](LICENSE).
