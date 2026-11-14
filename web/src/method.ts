import './style.css';
import * as d3 from 'd3';
import { loadMeta, loadRegions, type RegionMeta } from './data';

const $ = (id: string) => document.getElementById(id)!;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const nf = d3.format(',.0f');

async function show(id: string) {
  const meta = await loadMeta(id);
  document.querySelectorAll('.rname').forEach((el) => (el.textContent = meta.label.en ?? meta.name));
  const csv = await d3.csv(`${import.meta.env.BASE_URL}data/${id}/region_monthly.csv`, d3.autoType);
  heroStats(meta);
  breakChart(csv as any[], meta);
  calibration(meta);
  validation('val-v', meta.report.validation_viirs_loyo);
  validation('val-t', meta.report.validation_terra_loyo);
  drift(meta);
  noaa20(meta);
}

function heroStats(meta: RegionMeta) {
  const r = meta.report;
  const v = r.validation_viirs_loyo;
  const adopted = Object.keys(v).find((k) => k.includes('adopted'))!;
  const n0 = v['N0_no_harmonization'].region_month;
  const m3 = v[adopted].region_month;
  const stat = (big: string, label: string) => `<div class="stat"><div class="stat-big">${big}</div><div class="stat-label">${label}</div></div>`;
  $('hero-stats').innerHTML = [
    stat(`${r.raw_pixel_ratio_viirs_over_aqua.toFixed(1)}×`, 'more raw VIIRS pixels than Aqua MODIS (overlap)'),
    stat(`${n0.bias_pct > 0 ? '+' : ''}${Math.round(n0.bias_pct)}%`, 'artificial jump if records are spliced raw'),
    stat(`${m3.bias_pct > 0 ? '+' : ''}${m3.bias_pct.toFixed(1)}%`, 'bias after harmonization (cross-validated)'),
    stat(m3.r2_log1p.toFixed(2), 'R² of monthly counts, held-out years'),
    stat(nf(r.n_detections), 'satellite detections processed'),
  ].join('');
}

function breakChart(rows: any[], meta: RegionMeta) {
  const el = $('fig-break');
  el.innerHTML = '';
  const byYear = d3.rollups(rows.filter((d) => d.ym >= 12 && d.ym <= meta.ym_last), (v) => ({
    H: d3.sum(v, (d) => d.H), A: d3.sum(v, (d) => d.raw_A ?? 0), N: d3.sum(v, (d) => d.raw_N ?? 0), n: v.length,
  }), (d) => 2000 + Math.floor(d.ym / 12)).map(([year, v]) => ({ year, ...v }));
  const width = Math.max(320, el.clientWidth || 800), height = 300;
  const m = { top: 14, right: 16, bottom: 34, left: 60 };
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('role', 'img')
    .attr('aria-label', 'Annual raw MODIS, raw VIIRS and harmonized hotspot counts');
  const x = d3.scaleLinear().domain(d3.extent(byYear, (d) => d.year) as [number, number]).range([m.left, width - m.right]);
  const y = d3.scaleLinear().domain([0, d3.max(byYear, (d) => Math.max(d.H, d.A, d.N))! * 1.05]).nice().range([height - m.bottom, m.top]);
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${height - m.bottom})`).call(d3.axisBottom(x).tickFormat(d3.format('d')));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('~s')));
  const xs = (yr: number) => x(yr);
  const band = (a: number, b: number, c: string, label: string) => {
    svg.append('rect').attr('x', xs(a)).attr('width', Math.max(0, xs(b) - xs(a))).attr('y', m.top).attr('height', height - m.bottom - m.top).attr('fill', c).attr('opacity', 0.12);
    svg.append('text').attr('class', 'axis-label').attr('x', xs(a) + 4).attr('y', m.top + 12).text(label);
  };
  band(2012.08, 2021.5, 'var(--era-viirs)', 'calibration overlap');
  svg.append('line').attr('x1', xs(2021.5)).attr('x2', xs(2021.5)).attr('y1', m.top).attr('y2', height - m.bottom).attr('stroke', 'var(--fg-muted)').attr('stroke-dasharray', '4 3');
  const line = (k: 'H' | 'A' | 'N', color: string, w = 2) =>
    svg.append('path').datum(byYear.filter((d) => d[k] > 0)).attr('fill', 'none').attr('stroke', color).attr('stroke-width', w)
      .attr('d', d3.line<any>().x((d) => xs(d.year)).y((d) => y(d[k])));
  line('N', 'var(--raw-viirs)');
  line('A', 'var(--raw-modis)');
  line('H', 'var(--bar)', 3);
  const lg = svg.append('g').attr('class', 'axis-label').attr('transform', `translate(${m.left + 8},${height - 6})`);
  [['var(--raw-modis)', 'Aqua MODIS raw pixels'], ['var(--raw-viirs)', 'S-NPP VIIRS raw pixels'], ['var(--bar)', 'BRASA harmonized (Aqua-eq)']].forEach(([c, l], i) => {
    lg.append('rect').attr('x', i * 190).attr('y', -9).attr('width', 14).attr('height', 4).attr('fill', c);
    lg.append('text').attr('x', i * 190 + 18).attr('y', -4).text(l);
  });
}

function calibration(meta: RegionMeta) {
  const c = meta.report.calibration_viirs_to_aqua;
  const t = meta.report.calibration_terra_to_aqua;
  $('calib').innerHTML = `<div class="stats small">
    <div class="stat"><div class="stat-big">${c.ratio_day.toFixed(3)}</div><div class="stat-label">Aqua/VIIRS ratio, day (deduplicated)</div></div>
    <div class="stat"><div class="stat-big">${c.ratio_night.toFixed(3)}</div><div class="stat-label">Aqua/VIIRS ratio, night${c.night_pooled ? ' (pooled)' : ''}</div></div>
    <div class="stat"><div class="stat-big">${meta.report.afcd_ratio_viirs_over_aqua.toFixed(2)}×</div><div class="stat-label">VIIRS/Aqua after dedup (vs ${meta.report.raw_pixel_ratio_viirs_over_aqua.toFixed(2)}× raw)</div></div>
    <div class="stat"><div class="stat-big">${c.theta_quantiles[0]}–${c.theta_quantiles[4]}</div><div class="stat-label">cell multiplier θ, 5–95 % (${c.n_cal_cells} cells)</div></div>
    <div class="stat"><div class="stat-big">${t.ratio_day.toFixed(2)}</div><div class="stat-label">Aqua/Terra ratio, day</div></div>
  </div>`;
  const el = $('fig-season');
  el.innerHTML = '';
  const width = Math.max(320, el.clientWidth || 700), height = 220;
  const m = { top: 12, right: 16, bottom: 30, left: 50 };
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('role', 'img').attr('aria-label', 'Seasonal Aqua/VIIRS ratio, day and night');
  const x = d3.scaleBand<number>().domain(d3.range(12)).range([m.left, width - m.right]).padding(0.2);
  const vals = [...c.seasonal.D, ...c.seasonal.N] as number[];
  const y = d3.scaleLinear().domain([0, d3.max(vals)! * 1.15]).nice().range([height - m.bottom, m.top]);
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${height - m.bottom})`).call(d3.axisBottom(x).tickFormat((i) => MONTHS[i]));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.left},0)`).call(d3.axisLeft(y).ticks(4));
  const bw = x.bandwidth() / 2;
  svg.selectAll('rect.d').data(c.seasonal.D as number[]).join('rect').attr('x', (_, i) => x(i)!).attr('width', bw).attr('y', (v) => y(v)).attr('height', (v) => y(0) - y(v)).attr('fill', 'var(--era-viirs)');
  svg.selectAll('rect.n').data(c.seasonal.N as number[]).join('rect').attr('x', (_, i) => x(i)! + bw).attr('width', bw).attr('y', (v) => y(v)).attr('height', (v) => y(0) - y(v)).attr('fill', 'var(--era-terra)');
  const lg = svg.append('g').attr('class', 'axis-label').attr('transform', `translate(${width - m.right - 170},${m.top + 6})`);
  lg.append('rect').attr('width', 10).attr('height', 10).attr('fill', 'var(--era-viirs)');
  lg.append('text').attr('x', 14).attr('y', 9).text('day ratio');
  lg.append('rect').attr('x', 80).attr('width', 10).attr('height', 10).attr('fill', 'var(--era-terra)');
  lg.append('text').attr('x', 94).attr('y', 9).text('night ratio');
}

function validation(elId: string, v: Record<string, any>) {
  const rows = Object.entries(v).map(([name, r]) => {
    const a = r.region_month, c = r.cell_month_0p5deg;
    const cls = name.includes('adopted') ? ' class="adopted"' : '';
    const f = (x: number | null, d = 3) => (x === null || x === undefined ? '–' : x.toFixed(d));
    return `<tr${cls}><th scope="row">${name.replace(/_/g, ' ')}</th><td>${f(a.bias_pct, 1)}%</td><td>${f(a.mae_log1p)}</td><td>${f(a.r2_log1p)}</td><td>${f(a.spearman)}</td>
      <td>${f(c.bias_pct, 1)}%</td><td>${f(c.mae_log1p)}</td><td>${f(c.r2_log1p)}</td><td>${f(c.spearman)}</td><td>${nf(a.n)} / ${nf(c.n)}</td></tr>`;
  }).join('');
  $(elId).innerHTML = `<table><thead><tr><th rowspan="2" scope="col">Model</th><th colspan="4" scope="colgroup">Region × month</th><th colspan="4" scope="colgroup">0.5° cell × month</th><th rowspan="2" scope="col">n</th></tr>
    <tr><th>bias</th><th>MAE</th><th>R²</th><th>ρ</th><th>bias</th><th>MAE</th><th>R²</th><th>ρ</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function noaa20(meta: RegionMeta) {
  const c = meta.report.calibration_noaa20_to_snpp;
  const v = meta.report.validation_noaa20_loyo?.region_month;
  const fb = Object.entries(meta.report.fallback_months ?? {}).map(([m, p]) => `${m} → ${p === 'J1' ? 'NOAA-20' : 'Aqua'}`).join(', ');
  $('j1').innerHTML = c
    ? `<div class="stats small">
        <div class="stat"><div class="stat-big">${c.ratio_day.toFixed(3)}</div><div class="stat-label">S-NPP/NOAA-20 ratio, day</div></div>
        <div class="stat"><div class="stat-big">${c.ratio_night.toFixed(3)}</div><div class="stat-label">S-NPP/NOAA-20 ratio, night</div></div>
        ${v ? `<div class="stat"><div class="stat-big">${v.bias_pct > 0 ? '+' : ''}${v.bias_pct.toFixed(1)}%</div><div class="stat-label">bias, leave-one-year-out (${v.n} months)</div></div>
        <div class="stat"><div class="stat-big">${v.r2_log1p.toFixed(2)}</div><div class="stat-label">R² (log counts)</div></div>` : ''}
        <div class="stat"><div class="stat-big">${fb || '—'}</div><div class="stat-label">months filled from another platform</div></div></div>`
    : '<p class="hint">No NOAA-20 data for this region.</p>';
}

function drift(meta: RegionMeta) {
  const d = meta.report.drift_diagnostic as { year: number; aqua_over_viirs_harmonized: number }[];
  $('drift').innerHTML = d.length
    ? `<table><thead><tr><th>Year</th>${d.map((x) => `<th>${x.year}</th>`).join('')}</tr></thead><tbody><tr><th>Aqua obs ÷ VIIRS-derived</th>${d.map((x) => `<td>${x.aqua_over_viirs_harmonized.toFixed(2)}</td>`).join('')}</tr></tbody></table>`
    : '<p class="hint">Not enough post-2021 data.</p>';
}

(async () => {
  const regions = await loadRegions();
  const sel = $('region') as HTMLSelectElement;
  sel.innerHTML = regions.map((r) => `<option value="${r.id}">${r.label.en ?? r.name}</option>`).join('');
  const fromHash = new URLSearchParams(location.hash.slice(1)).get('r');
  if (fromHash && regions.some((r) => r.id === fromHash)) sel.value = fromHash;
  sel.addEventListener('change', () => {
    history.replaceState(null, '', '#r=' + sel.value);
    show(sel.value);
  });
  await show(sel.value);
})();
