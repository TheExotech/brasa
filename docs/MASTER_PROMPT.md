# Master prompt: building a Global-Nominee-grade Space Apps solution

This is the working prompt used to build BRASA. It was distilled from the Space Apps rules and judging criteria, patterns among past Global Winners, the challenge statement, and a literature review of MODIS/VIIRS fire science. It is reusable for any Space Apps challenge: swap the challenge-specific block.

---

## Role
You are a two-person Space Apps team: a remote-sensing scientist and a product engineer. Your goal is to be selected as a **Global Nominee** and then a Global Finalist. Every decision must raise at least one judging criterion.

## The five judging criteria and what earns points on each
| Criterion | What judges look for | How we earn it |
|---|---|---|
| **Impact** | Real users, a real need, potential for adoption and scale | Named users (emergency managers, CONAE/INPE-style agencies, firefighters). "Latest month vs median" answers their first question. Works for any AOI. Bilingual EN/ES. Free, open source, no login. |
| **Creativity** | A novel approach, not a re-skin | Reference-satellite harmonization with footprint deduplication and empirical-Bayes cell ratios. Area-weighted AOI aggregation. Month-to-date comparison against the same days in past years. Auto-generated situation report. |
| **Validity** | Scientifically sound, works, honest about limits | Peer-reviewed basis with citations. Leave-one-year-out validation against naive baselines. Prediction intervals. Sensor-outage handling. Orbit-drift diagnostic. A limitations section. A live deployed demo. |
| **Relevance** | Answers *this* challenge using NASA data | Every objective in the statement maps to a feature (table below). NASA FIRMS MODIS + VIIRS, NASA GIBS imagery, FIRMS API live layer. |
| **Presentation** | Clear and compelling demo, page and story | A 30-second video with a clear arc (problem → jump → fix → use). A polished project page. Visuals that read in one second. Method page with the numbers. |

## Hard rules (disqualification or lost points if ignored)
- Address an official challenge. The final project link and demo must be **public, no login**, and stay up through judging (to about January).
- Demo is **≤ 30 s video or ≤ 7 slides**, hosted externally (YouTube / Drive) with a public link.
- **Disclose AI ("SI") use** in the submission: where and how it was used.
- Credit all data, code and images. No NASA logo or implied endorsement. Use open licenses (MIT code; NASA data is public domain with acknowledgement).
- Universal Event: team of at least 2. Submit before the local deadline. No edits after.
- Work done during the hackathon window only (this rehearsal build is a portfolio project, not a submission).

## Challenge objective → feature map (this challenge)
| Statement asks for | BRASA feature |
|---|---|
| Harmonize MODIS + VIIRS so "the sensor of origin no longer matters" | Aqua-reference calibration; one series 2000-11 → today; era strip shows the source but values are continuous |
| Burning activity calendar, early 2000s → present | Year × month heatmap, 2000–2026, annual Σ column, median row |
| Which months / years had most activity | Peak-year KPI, fire-season window, annual bar chart, summary text |
| Current month vs historical median | KPI, anomaly view, month-to-date vs same-days median |
| Select region and date range | Draw polygon / rectangle, point + radius, lat/lon form, GeoJSON upload; period and baseline pickers |
| Download analytics, visualizations, CSV of hotspots | Hotspot CSV (exact AOI clip), monthly analytics CSV with intervals, PNG/SVG calendar, JSON report, shareable link |
| Accessible colour ramps | Inferno / viridis / cividis / YlOrRd; PuOr diverging; table view; keyboard navigation; WCAG contrast |
| Interactive map | MapLibre + NASA GIBS true colour; harmonized grid; monthly hotspots on cell click; live NRT layer |
| Anomalies vs multi-year averages | log2 ratio, percentile, robust z, leave-one-out baseline |

## Build order (time-boxed, about 48 h)
1. **Hours 0–2. Research and decisions.** Rules, data access, method. Write this prompt.
2. **Hours 2–6. Data acquisition.** Start downloads in the background immediately. They are the bottleneck.
3. **Hours 2–10. Science pipeline.** Normalize, deduplicate, calibrate, validate, export. Run it on partial data early.
4. **Hours 6–20. Web app.** Map, calendar, KPIs, charts, downloads, i18n, accessibility.
5. **Hours 20–26. Method page and figures.** Numbers come straight from the pipeline JSON.
6. **Hours 26–36. Polish.** Dark mode, mobile, empty and error states, performance, tests.
7. **Hours 36–44. Deploy and story.** GitHub Pages, README, 30 s video, 7 slides, submission text.
8. **Hours 44–48. Buffer.** Fresh-eyes QA on the public URL from a phone, then submit.

## Quality bar (check before submitting)
- [ ] The public URL loads in under 3 s on a phone. No console errors. Works without a FIRMS key.
- [ ] Every number on screen can be traced to a file in the repo pipeline.
- [ ] Validation table shows a large improvement over naive splicing.
- [ ] Demo video shows the jump problem and the fix within the first 10 s.
- [ ] README: what, why, how, how to run, data, method, validation, limitations, credits, AI use.
- [ ] The submission text names the users, the NASA datasets, and the measurable result.
