# BRASA methodology

| | |
|---|---|
| Version | 1.1 · 15 November 2026 |
| Team | BRASA Dynamics: Andrei Tsygankov (@theexotech), Andrei Tsygankov Sr. (@andreirss) |
| Roles | AT: challenge research, data reading, method, pipeline, app, validation, team registration. AT Sr.: scope and focus, read every draft before it went public, second pair of eyes on the numbers |
| Live app | https://theexotech.github.io/brasa/ |
| Source | https://github.com/TheExotech/brasa |
| Scope | Universal Challenge, NASA Space Apps Challenge 2026 |
| Data | NASA FIRMS (MODIS C6.1, VIIRS S-NPP/NOAA-20/21), NASA GIBS, Natural Earth, all open |
| Reproduce | `README.md` → *Run locally* |
| Written by | ours, with named tools · §8 |

This document explains how BRASA turns raw NASA FIRMS hotspots into one harmonized monthly fire record. The numbers quoted come from `pipeline/out/<Region>/report.json`, which the pipeline regenerates on every run. They are also shown live on the app's *Method & validation* page.

## 0. How this was built, including the dead ends

Short version, because a method section that only shows the final design hides where the decisions came from.

The first thing built was not the harmonization, it was the deduplication. The raw ratio between VIIRS and Aqua in Argentina is 5.09×; after snapping detections to 1 km cell-days it is 3.19×. Most of the "new fires" were the same fire counted in seven pixels, so no calibration is meaningful before that step.

Calibration is not fitted on the 0.1° grid the app draws. At that size most cells in Argentina hold a couple of counts a month, the shrinkage term pulls every one of them back to the regional ratio and the cell multiplier becomes decoration. The fitted grid is 0.5°, which keeps 2,164 cells with enough signal to be worth fitting; the app still aggregates on 0.1°.

For a while we read 2020 as a sensor artefact. It is the largest year in the raw series and it lands just after the overlap ends, so the first deck labelled it "SENSOR SWAP" - a splice, not a real year. Leave-one-year-out settled it the other way: in the harmonized series 2020 and 2021 stay on top (71,818 and 32,666 detections, against 38,382 in 2013), and the year that actually breaks is 2012, where the raw count jumps ×3.7 while Aqua does not move. The chart annotation was rewritten after that, and 2020 is now labelled a real record year.

Two models that lost are still in §3. N1, one global ratio on raw pixels, lands close to the adopted model at cell level (MAE 0.436 vs 0.444) and further away at region-month. We kept M3 and report N1.

## 1. Problem
FIRMS records are fire **pixels**. Their count depends on pixel size, sensor sensitivity, overpass time and swath geometry as much as on fire activity:

| | MODIS (Terra, Aqua) | VIIRS I-band (S-NPP, NOAA-20/21) |
|---|---|---|
| Pixel at nadir | ~1 km | 375 m (~7× smaller area) |
| Record | Terra 2000-11 →, Aqua 2002-07 → (both retiring 2026–27) | S-NPP 2012-01 →, NOAA-20 2018 →, NOAA-21 2023 → |
| Equator crossing | Terra ~10:30 / 22:30, Aqua ~13:30 / 01:30 (drifting since 2021) | ~13:30 / 01:30 |
| Raw pixel ratio vs Aqua (overlap) | 1 | **5.09× Argentina, 9.73× Philippines** |

Published raw VIIRS/MODIS ratios range 2.8–11× and depend on biome, season, day/night and fire size (White 2023; Vadrevu & Lasko 2018; Fu et al. 2020). A single global factor is therefore not enough.

## 2. Algorithm
1. **Inputs.**
   - FIRMS yearly country archives (Standard Processing) for MODIS C6.1 and VIIRS S-NPP.
   - FIRMS Area API for the current year, SP then NRT.
   - FIRMS Area API for NOAA-20 from 2024 onward.
   - API points are clipped to the Natural Earth country polygon.
2. **Filters.**
   - `type = 0` (presumed vegetation fire).
   - MODIS confidence ≥ 30; VIIRS confidence `n` or `h`.
   - NRT records have no `type` field, so they inherit static-source flags (types 1/2) from SP records within the same 0.01° cell.
3. **Deduplication.** Each detection is snapped to a 0.01° (~1 km) cell, with one record per cell × day × day/night × platform. This unit is the *active-fire cell-day* (AFCD). Deduplication lowers the VIIRS/Aqua ratio from 5.09× to 3.19× in Argentina, which shows how much of the raw difference is pixel multiplicity.
4. **Outage detection.** For each platform and month, the number of days with any detection is compared with that platform's own median for that calendar month. A month counts as an outage when the platform saw < 40 % of its usual detection days while another platform saw ≥ 80 % of its own. Outage months are excluded from calibration and replaced in assembly.
5. **Calibration** (reference = Aqua MODIS; stable overlap 2012-02 … 2021-06):
   - Regional day and night ratios: `r_dn = ΣAqua / ΣVIIRS`.
   - Seasonal ratios shrunk to the annual ratio: `r_dn,m = (ΣAqua_m + 50·r_dn) / (ΣVIIRS_m + 50)`.
   - Empirical-Bayes multiplier per 0.5° cell (Marshall 1991 global EB estimator):
     - `O_k = ΣAqua` and `E_k = Σ r_dn,m · VIIRS`.
     - `θ_k = (O_k + α) / (E_k + α / z̄)`, with α estimated from the between-cell variance.
   - Prediction: `Aqua-eq = r_dn,m · θ_k · VIIRS`, summed over day and night.
   - Terra → Aqua is calibrated the same way over 2003–2019.
   - NOAA-20 → S-NPP is calibrated over 2024 → present. It is chained with S-NPP → Aqua when S-NPP data are missing, because NASA LANCE is transitioning from S-NPP to NOAA-20/21.
6. **Assembly.**

   | Period | Source |
   |---|---|
   | 2000-11 … 2002-06 | Terra → Aqua-eq |
   | 2002-07 … 2021-06 | Aqua observed |
   | 2021-07 → | S-NPP → Aqua-eq (NOAA-20 or observed Aqua in S-NPP outage months, flagged) |

   Units are **Aqua-MODIS-equivalent hotspots**. The app can rescale to VIIRS-equivalent units with the seasonal overlap ratio.
7. **Uncertainty.** Leave-one-year-out residuals (observed / predicted, at region-month and 0.5° cell-month level) are binned by predicted magnitude. Their 5–95 % quantiles give the 90 % prediction interval of each converted month. Intervals are therefore wider for small AOIs and low counts.
8. **AOI aggregation.** The harmonized grid is 0.1°. Each data cell is weighted by the fraction of its area inside the AOI, estimated from a 4×4 sub-sample. Hotspot CSV exports use the exact polygon.
9. **Anomalies and indicators.**
   - Baseline: per-calendar-month median over the chosen baseline years (default 2003–2022), with the target year excluded.
   - Anomaly measures: log2 ratio, percentile rank, and robust z-score (MAD).
   - Low-signal months (value and median < 3) are not coloured as anomalies.
   - Fire season: the shortest circular window holding 80 % of the climatological activity.
   - Trend: Theil–Sen slope with a Mann–Kendall test on complete years.
   - Month-to-date: compared with the same day span in past years, using a separately computed history.

## 3. Validation
- **Design.** Leave-one-year-out cross-validation over the overlap. Every model is scored against the same deduplicated Aqua target.
- **Models compared:**

  | Code | Model |
  |---|---|
  | N0 | Raw VIIRS, no harmonization |
  | N1 | Single ratio on raw pixels |
  | M1 | Deduplicated regional ratio |
  | M2 | M1 + seasonal ratio |
  | M3 | M2 + empirical-Bayes cell multipliers (adopted) |

- **Argentina, VIIRS → Aqua (region-month, n = 113 months).**

  | Model | Bias | MAE (log1p) | R² (log1p) | Spearman |
  |---|---|---|---|---|
  | N0 raw splice | +428.6 % | 1.716 | −2.09 | 0.968 |
  | N1 single ratio, raw pixels | +4.2 % | 0.134 | 0.972 | 0.983 |
  | M1 dedup regional | +0.0 % | 0.146 | 0.966 | 0.983 |
  | M2 dedup seasonal | −0.1 % | 0.099 | 0.981 | 0.981 |
  | **M3 adopted** | **−1.3 %** | **0.095** | **0.984** | **0.985** |

- **Results for the Philippines**, and the Terra tables, are on the Method page and in `report.json`.
- **Read the cell-level scores before trusting the headline.** At 0.5° cell-month level the adopted model is *not* the best: N1 scores MAE 0.436 and R² 0.761 against our 0.444 and 0.759. It wins where the app reports, region × month, and loses slightly per cell. If your use case is a single small cell, N1 is the better model and the app's wide intervals for small AOIs say the same thing.
- **Aqua drift diagnostic** (observed Aqua ÷ VIIRS-derived Aqua-eq after 2021-07): this ratio wanders by up to ±20 %. Observed Aqua is no longer a stable reference after its orbit drift, which is why BRASA switches to VIIRS.

## 4. Limitations
- Hotspots are not fires or burned area. Cloud and smoke cause omissions.
- Cell-level skill is weak. The model is tuned for regions; a 0.5° cell prediction can be 50 % off and the interval is what carries the information.
- Calibration is regional. Very small AOIs rely on shrunken cell ratios and have wide intervals.
- Two regions are precomputed (Argentina, Philippines). The pipeline is country-agnostic, but a third country needs a run, not a click.
- The Terra → Aqua conversion is good at region level (R² 0.96 Argentina) but weak at cell level, because of the diurnal cycle. It only affects Nov 2000 – Jun 2002.
- Aqua itself becomes unusable as a reference after 2021-07, and both MODIS platforms end in 2026–27. The 2000–2002 and post-2021 stretches are conversions, not observations, and they are the two weakest parts of the series.
- 2026 is a partial year and is scored against the same days in past years only; the annual total for 2026 is not comparable to a full year.

## 5. References
- Schroeder et al. (2014) *RSE* 143:85–96, doi:10.1016/j.rse.2013.12.008
- Giglio, Schroeder & Justice (2016) *RSE* 178:31–41, doi:10.1016/j.rse.2016.02.054
- Giglio, Csiszar & Justice (2006) *JGR* 111:G02016, doi:10.1029/2005JG000142
- Csiszar et al. (2014) *JGR Atmos* 119:803–816, doi:10.1002/2013JD020453
- Li et al. (2018) *JGR Atmos* 123:4545–4563, doi:10.1029/2017JD027823
- Fu et al. (2020) *Remote Sens.* 12:2870, doi:10.3390/rs12182870
- Vadrevu & Lasko (2018) *Remote Sens.* 10:978, doi:10.3390/rs10070978
- White (2023) *J. Hyperspectral Remote Sens.* 12(6), doi:10.29150/jhrs.v12.6.p379-390
- Clayton & Kaldor (1987) *Biometrics* 43:671–681
- Marshall (1991) *Appl. Stat.* 40:283–294
- INPE Programa Queimadas: reference-satellite (AQUA_M-T) methodology

## 6. Data access

- FIRMS archive: https://firms.modaps.eosdis.nasa.gov/download/
- FIRMS Area API: https://firms.modaps.eosdis.nasa.gov/api/area/
- GIBS basemaps: https://nasa.github.io/gibs-api-docs/
- Natural Earth: https://www.naturalearthdata.com/

## 7. Version history

| Version | Date | Change |
|---|---|---|
| 1.0 | 15 Nov 2026 | Initial public release, built during the event |
| 1.1 | 15 Nov 2026 | Added §0 (build history and dead ends), cell-level caveat, expanded limitations, AI section |

## 8. Who wrote what, and where the assistants sat

Worth stating plainly, because a two-person team shipping this in a weekend invites the question.

**How the team worked.** I found the challenge in the list, read what NASA actually publishes (26 years of FIRMS hotspots, two sensor generations, a retirement date), and worked out that the splice was the thing to fix. The method, the pipeline, the app and the validation are mine, and I wrote them. My father kept me pointed at something finishable: he cut the scope when it grew, asked what a fire officer does with the number on screen, made me re-run the validation when I liked a result too much, and read every draft before it went public. His part shows up in a repo that is finished rather than promising, and in claims smaller than the evidence could have been stretched to carry.

Registration is mine as well: the team, the event entry and the uploads were done from `@theexotech`. `@andreirss` is his own account, joined to the team. Same name, two accounts, one household.

Mine: the problem reading, the calibration design, the choice of Aqua as reference (from INPE's practice), the dedup step, the cell size, the model ladder, the interval construction, the outage rule, the app's information design, and every number in this document and in `report.json`. Those were designed and thought through here, argued against each other before one of them survived, and the numbers come out of `pipeline/` on NASA data - they were not written down by a model and then trusted.

What the tools actually did: they wrote the code that follows the design, and they typed the prose that carried it, from the design and from the run history given to them.

- **Claude Code** typed the pipeline modules to a spec argued out beforehand (dedup unit, reference choice, grid, model ladder), scaffolded the Vite shell, ran literature search and typed the first drafts of the prose in this file, in the README and on the Method page. Each draft was then cut, re-ordered or rewritten here. §0 is not a draft: it is the record of our own wrong turns, and it is the part a model would not have arrived at on its own.
- **Hermes Agent** did the repository mechanics: repository housekeeping, deploy checks, deck build.
- **Deck**: conceived and structured here. The argument, the slide order, the single figure each slide is built around and what that figure has to prove were laid out first; Claude Code then built the template from that outline and from screenshots of the app, and the result was cut back twice for density. So the deck's decisions are mine and can be answered for slide by slide - what was assisted is the construction, not the reasoning behind it.

If a claim here is wrong, it is wrong in the code too, and the code is what the numbers are reproduced from.
