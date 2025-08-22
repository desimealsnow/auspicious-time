import type { SwissAdapter } from './swissAdapter';

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function norm180(x: number): number {
  let a = ((x + 180) % 360 + 360) % 360 - 180;
  if (a <= -180) a += 360;
  return a;
}
function clamp(x: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, x));
}

// Extract Right Ascension (deg) from various result shapes
function getRAdeg(res: any): number | undefined {
  if (!res) return undefined;
  if (typeof res.longitude === 'number') return res.longitude;  // most builds under EQUATORIAL
  if (typeof res.ra === 'number') return res.ra;                // some builds
  if (Array.isArray(res) && typeof res[0] === 'number') return res[0];
  return undefined;
}

// Extract declination (deg) from various result shapes
function getDeclinationDeg(res: any): number | undefined {
  if (!res) return undefined;
  if (typeof res.latitude === 'number') return res.latitude;    // many builds under EQUATORIAL
  if (typeof res.declination === 'number') return res.declination;
  if (typeof res.dec === 'number') return res.dec;
  if (Array.isArray(res) && typeof res[1] === 'number') return res[1];
  return undefined;
}

/** Sun apparent altitude (deg) using *tropical equatorial* RA/Decl. */
export function sunAltitudeDeg(
  swe: SwissAdapter,
  jd_ut: number,
  lonDeg: number,
  latDeg: number,
  ephFlag: number
): number {
  // Tropical equatorial (NO sidereal here!)
  const flags = ephFlag | swe.SEFLG_EQUATORIAL;
    const sun: any =
    (swe as any).calc_ut_sync?.(jd_ut, swe.SE_SUN, flags) // ESM 'sweph' (sync)
    ?? (swe as any).calc_ut?.(jd_ut, swe.SE_SUN, flags);  // some builds expose sync here

    if (!sun) throw new Error('Swiss calc_ut returned no result (callback-only build). Make this function async and use calc_ut_async, or swap to the NOAA path for sun altitude.');
    if (sun?.error) throw new Error(`Sun calc: ${sun.error}`);


  const RAdeg = getRAdeg(sun);
  const dec = getDeclinationDeg(sun);
  if (!Number.isFinite(RAdeg!) || !Number.isFinite(dec!)) {
    throw new Error('Sun RA/Dec unavailable from Swiss result.');
  }

  const gstHours = swe.sidtime(jd_ut);               // hours
  const lstHours = gstHours + lonDeg / 15;
  const lstDeg = ((lstHours % 24) + 24) % 24 * 15;   // 0..360
  const H = norm180(lstDeg - RAdeg!);                // hour angle (deg)

  const phi = latDeg * DEG;
  const delta = dec! * DEG;
  const Hrad = H * DEG;

  const sinAlt = clamp(Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(Hrad), -1, 1);
  return Math.asin(sinAlt) * RAD;
}

/** Find sunrise/sunset (JD UT) by searching for altitude crossing -0.833°. */
export function sunriseSunsetAround(
  swe: SwissAdapter,
  jdCenter: number,
  lonDeg: number,
  latDeg: number,
  ephFlag: number
): { sunriseJD?: number; sunsetJD?: number } {
  const targetAlt = -0.833; // deg
  const spanDays = 2.0;     // ±1 day
  const stepMin = 10;
  const stepDays = stepMin / 1440;

  let sunriseLo: number | null = null, sunriseHi: number | null = null;
  let sunsetLo: number | null = null, sunsetHi: number | null = null;

  let prevAlt = Number.NaN;
  let prevJD = jdCenter - spanDays / 2;

  for (let jd = prevJD; jd <= jdCenter + spanDays / 2 + 1e-9; jd += stepDays) {
    const alt = sunAltitudeDeg(swe, jd, lonDeg, latDeg, ephFlag) - targetAlt;
    if (!Number.isNaN(prevAlt)) {
      if (prevAlt < 0 && alt >= 0 && sunriseLo === null) { sunriseLo = prevJD; sunriseHi = jd; }
      if (prevAlt > 0 && alt <= 0 && sunsetLo === null)  { sunsetLo = prevJD;  sunsetHi = jd; }
    }
    prevAlt = alt;
    prevJD = jd;
    if (sunriseLo !== null && sunsetLo !== null) break;
  }

  function refine(lo: number, hi: number, iters = 22): number {
    let a = lo, b = hi;
    let fa = sunAltitudeDeg(swe, a, lonDeg, latDeg, ephFlag) - targetAlt;
    for (let i = 0; i < iters; i++) {
      const m = 0.5 * (a + b);
      const fm = sunAltitudeDeg(swe, m, lonDeg, latDeg, ephFlag) - targetAlt;
      if (fa * fm <= 0) { b = m; } else { a = m; fa = fm; }
    }
    return 0.5 * (a + b);
  }

  const out: { sunriseJD?: number; sunsetJD?: number } = {};
  if (sunriseLo !== null && sunriseHi !== null) out.sunriseJD = refine(sunriseLo, sunriseHi);
  if (sunsetLo !== null && sunsetHi !== null)   out.sunsetJD  = refine(sunsetLo, sunsetHi);
  return out;
}
