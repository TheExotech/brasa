// Auto-generated plain-language situation summary (EN / ES).
import type { Analysis } from './analysis';
import { fmt, getLang, t } from './i18n';

const pct = (v: number, m: number) => (m > 0 ? Math.round((v / m - 1) * 100) : null);

export function summary(a: Analysis, aoiName: string, units: string): string[] {
  const S = t();
  const es = getLang() === 'es';
  const out: string[] = [];
  const u = units === 'viirs' ? (es ? 'equivalentes VIIRS' : 'VIIRS-equivalent') : (es ? 'equivalentes Aqua-MODIS' : 'Aqua-MODIS-equivalent');
  if (!a.cells.length) return [S.noData];

  const c = a.current;
  if (c) {
    const cell = c.cell;
    const name = `${S.monthsLong[cell.month]} ${cell.year}`;
    const refMed = cell.partial && c.sameSpanMedian !== null ? c.sameSpanMedian : cell.median;
    if (cell.value < 3 && refMed < 3) {
      out.push(es
        ? `<b>${name}${cell.partial ? ` (días 1–${c.days})` : ''}</b>: actividad baja (${fmt(cell.value)} focos; mediana histórica ${fmt(refMed)}), habitual para esta época del año en ${aoiName}.`
        : `<b>${name}${cell.partial ? ` (days 1–${c.days})` : ''}</b>: low activity (${fmt(cell.value)} hotspots; historical median ${fmt(refMed)}), typical for this time of year in ${aoiName}.`);
    } else if (cell.partial && c.sameSpanMedian !== null) {
      const p = pct(cell.value, c.sameSpanMedian);
      const lvl = classify(c.sameSpanRank ?? 50, es);
      out.push(es
        ? `<b>${name} (días 1–${c.days})</b>: ${fmt(cell.value)} focos ${u} en ${aoiName}, frente a una mediana de ${fmt(c.sameSpanMedian)} para los mismos días en ${a.baseline[0]}–${a.baseline[1]}${p !== null ? ` (${p >= 0 ? '+' : ''}${p} %)` : ''}. Actividad <b>${lvl}</b> (percentil ${fmt(c.sameSpanRank ?? NaN)}).`
        : `<b>${name} (days 1–${c.days})</b>: ${fmt(cell.value)} ${u} hotspots in ${aoiName}, vs a median of ${fmt(c.sameSpanMedian)} for the same days in ${a.baseline[0]}–${a.baseline[1]}${p !== null ? ` (${p >= 0 ? '+' : ''}${p}%)` : ''}. Activity is <b>${lvl}</b> (percentile ${fmt(c.sameSpanRank ?? NaN)}).`);
    } else {
      const p = pct(cell.value, cell.median);
      const lvl = classify(cell.pctRank, es);
      out.push(es
        ? `<b>${name}</b>: ${fmt(cell.value)} focos ${u} (intervalo 90 %: ${fmt(cell.lo)}–${fmt(cell.hi)}) frente a una mediana histórica de ${fmt(cell.median)}${p !== null ? ` (${p >= 0 ? '+' : ''}${p} %)` : ''}: actividad <b>${lvl}</b>.`
        : `<b>${name}</b>: ${fmt(cell.value)} ${u} hotspots (90% interval ${fmt(cell.lo)}–${fmt(cell.hi)}) vs a historical median of ${fmt(cell.median)}${p !== null ? ` (${p >= 0 ? '+' : ''}${p}%)` : ''}: activity is <b>${lvl}</b>.`);
    }
  }

  const s = a.season;
  if (s.length && s.length < 12) {
    const span = `${S.monthsLong[s.start]}–${S.monthsLong[s.end]}`;
    out.push(es
      ? `La temporada de fuego típica va de <b>${span}</b> (${s.length} meses concentran el 80 % de la actividad), con pico en <b>${S.monthsLong[s.peak]}</b>.`
      : `The typical fire season runs <b>${span}</b> (${s.length} months hold 80% of activity), peaking in <b>${S.monthsLong[s.peak]}</b>.`);
    // upcoming critical period
    if (c) {
      const next = (c.cell.month + 1) % 12;
      const inSeason = (mo: number) => (s.start <= s.end ? mo >= s.start && mo <= s.end : mo >= s.start || mo <= s.end);
      if (inSeason(next) && !inSeason(c.cell.month))
        out.push(es ? `⚠ <b>${S.monthsLong[next]}</b> marca el inicio del período crítico.` : `⚠ <b>${S.monthsLong[next]}</b> marks the start of the critical period.`);
      else if (inSeason(next))
        out.push(es ? `${S.monthsLong[next]} está dentro de la temporada de fuego (mediana ${fmt(a.climatology[next])}).` : `${S.monthsLong[next]} is within the fire season (median ${fmt(a.climatology[next])}).`);
    }
  }

  if (a.peakYear) {
    const top = [...a.annual].filter((d) => d.complete).sort((x, y) => y.value - x.value).slice(0, 3);
    out.push(es
      ? `Años más activos: ${top.map((d) => `<b>${d.year}</b> (${fmt(d.value)})`).join(', ')}.`
      : `Most active years: ${top.map((d) => `<b>${d.year}</b> (${fmt(d.value)})`).join(', ')}.`);
  }
  if (a.trend) {
    const sig = a.trend.p < 0.05;
    const dir = a.trend.slopePerDecade > 0 ? (es ? 'aumento' : 'increase') : (es ? 'disminución' : 'decrease');
    out.push(es
      ? `Tendencia ${a.trend.years[0]}–${a.trend.years[1]}: ${dir} de ${fmt(Math.abs(a.trend.pctPerDecade))} % por década (Mann–Kendall p = ${a.trend.p.toFixed(3)}, ${sig ? 'significativa' : 'no significativa'}).`
      : `Trend ${a.trend.years[0]}–${a.trend.years[1]}: ${dir} of ${fmt(Math.abs(a.trend.pctPerDecade))}% per decade (Mann–Kendall p = ${a.trend.p.toFixed(3)}, ${sig ? 'significant' : 'not significant'}).`);
  }
  const anomalous = a.cells.filter((x) => !x.lowSignal && x.pctRank >= 95 && x.value > 2 * x.median && x.median >= 3).slice(-3);
  if (anomalous.length)
    out.push((es ? 'Últimos meses excepcionalmente altos (≥ 2× la mediana): ' : 'Latest exceptionally high months (≥ 2× median): ') +
      anomalous.map((x) => `${S.months[x.month]} ${x.year} (${fmt(x.value)}, ${es ? 'mediana' : 'median'} ${fmt(x.median)})`).join('; ') + '.');
  return out;
}

function classify(rank: number, es: boolean): string {
  if (rank >= 90) return es ? 'muy por encima de lo normal' : 'well above normal';
  if (rank >= 67) return es ? 'por encima de lo normal' : 'above normal';
  if (rank > 33) return es ? 'cerca de lo normal' : 'near normal';
  if (rank > 10) return es ? 'por debajo de lo normal' : 'below normal';
  return es ? 'muy por debajo de lo normal' : 'well below normal';
}
