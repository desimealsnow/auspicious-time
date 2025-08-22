// Helpers to compute Abhijit, Rahu Kalam, Yamaganda, Gulika from sunrise/sunset.

export type IsoWindow = { start: string; end: string };

/** Creates [start,end] ISO from a base Date + minute offsets */
function windowISO(base: Date, startMin: number, endMin: number): IsoWindow {
  const s = new Date(base);
  s.setMinutes(startMin, 0, 0);
  const e = new Date(base);
  e.setMinutes(endMin, 0, 0);
  return { start: s.toISOString(), end: e.toISOString() };
}

/** Returns minutes from midnight for a Date (local) */
function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** Calculate Abhijit Muhurta from sunrise/sunset */
export function computeAbhijit(sunrise: Date, sunset: Date): IsoWindow | null {
  const sr = minutesSinceMidnight(sunrise);
  const ss = minutesSinceMidnight(sunset);
  if (ss <= sr) return null;

  const dayLen = ss - sr;              // in minutes
  const muhurta = dayLen / 15;         // 1/15th of daytime
  const solarNoon = sr + dayLen / 2;   // center
  const start = solarNoon - muhurta / 2;
  const end = solarNoon + muhurta / 2;

  const base = new Date(sunrise);      // same date
  return windowISO(base, Math.round(start), Math.round(end));
}

/** Segment indexes per weekday (1..8), Sunday = 0 */
const RAHU_SEG: number[]     = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA_SEG: number[] = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SEG: number[]    = [7, 1, 6, 4, 5, 3, 2];

/** Creates 8 equal segments of daytime (in minutes offsets) */
function daytimeSegments(sunrise: Date, sunset: Date): [number, number][] {
  const sr = minutesSinceMidnight(sunrise);
  const ss = minutesSinceMidnight(sunset);
  const len = ss - sr;
  const seg = len / 8;
  const out: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const start = sr + Math.round(i * seg);
    const end = sr + Math.round((i + 1) * seg);
    out.push([start, end]);
  }
  return out;
}

function pickWindow(segments: [number, number][], segIndex1Based: number, base: Date): IsoWindow {
  const idx = Math.max(1, Math.min(8, segIndex1Based)) - 1;
  const [start, end] = segments[idx];
  return windowISO(base, start, end);
}

export function computeDayWindows(date: Date, sunrise: Date, sunset: Date) {
  const wd = date.getDay(); // 0 Sun .. 6 Sat
  const segments = daytimeSegments(sunrise, sunset);

  return {
    rahu_kalam: [pickWindow(segments, RAHU_SEG[wd], sunrise)],
    yamaganda:  [pickWindow(segments, YAMAGANDA_SEG[wd], sunrise)],
    gulika_kalam: [pickWindow(segments, GULIKA_SEG[wd], sunrise)]
  };
}
