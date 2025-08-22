import path from 'node:path';
import { createRequire } from 'node:module';

export type CalcResult = {
  longitude?: number;
  latitude?: number;
  declination?: number;
  ra?: number;
  error?: string;
} | number[]; // some builds return an array [lon, lat, dist, vLon, vLat, vDist]

export type SwissAdapter = {
  // time & config
  julday: (y: number, m: number, d: number, utHours: number, cal: number) => number;
  revjul: (jd: number, cal: number) => { year: number; month: number; day: number; hour: number };
  sidtime: (jd: number) => number; // hours
  get_ayanamsa_ut: (jd: number) => number;
  set_ephe_path: (absPath: string) => void;
  set_sid_mode: (mode: number, t0: number, ay: number) => void;

  // positions
  calc_ut_sync?: (jd: number, body: number, flags: number) => CalcResult;     // present for 'sweph'
  calc_ut_async?: (jd: number, body: number, flags: number) => Promise<CalcResult>; // present for 'swisseph'

  // constants
  SE_GREG_CAL: number;
  SEFLG_SWIEPH: number;
  SEFLG_MOSEPH: number;
  SEFLG_SPEED: number;
  SEFLG_SIDEREAL: number;
  SEFLG_EQUATORIAL: number;
  SE_SUN: number;
  SE_MOON: number;
  SIDM_LAHIRI: number;
};

function ensureNumber(n: unknown, label: string): number {
  if (typeof n !== 'number' || Number.isNaN(n)) throw new Error(`${label} must be a number, got ${String(n)}`);
  return n;
}
function absPath(p: string) { return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p); }
function C(raw: any) {
  return {
    SE_GREG_CAL: raw.SE_GREG_CAL ?? raw.GREG_CAL ?? 1,
    SEFLG_SWIEPH: raw.SEFLG_SWIEPH ?? raw.FLG_SWIEPH ?? 2,
    SEFLG_MOSEPH: raw.SEFLG_MOSEPH ?? raw.FLG_MOSEPH ?? 4,
    SEFLG_SPEED: raw.SEFLG_SPEED ?? raw.FLG_SPEED ?? 256,
    SEFLG_SIDEREAL: raw.SEFLG_SIDEREAL ?? raw.FLG_SIDEREAL ?? 64,
    SEFLG_EQUATORIAL: raw.SEFLG_EQUATORIAL ?? raw.FLG_EQUATORIAL ?? 2048,
    SE_SUN: raw.SE_SUN ?? raw.SUN ?? 0,
    SE_MOON: raw.SE_MOON ?? raw.MOON ?? 1,
    SIDM_LAHIRI: raw.SIDM_LAHIRI ?? 1
  };
}

export async function loadSwissAdapter(): Promise<{ swe: SwissAdapter; source: 'sweph'|'swisseph' }> {
  // Prefer ESM/N-API 'sweph' (sync)
  try {
    const mod = await import('sweph');
    const raw: any = (mod as any).default ?? mod;

    const swe: SwissAdapter = {
      ...C(raw),
      julday: (y, m, d, ut, cal) => ensureNumber((raw.swe_julday ?? raw.julday)(y, m, d, ut, cal), 'julday'),
      revjul: (jd, cal) => (raw.swe_revjul ?? raw.revjul)(jd, cal),
      sidtime: (jd) => ensureNumber((raw.swe_sidtime ?? raw.sidtime)(jd), 'sidtime'),
      get_ayanamsa_ut: (jd) => ensureNumber((raw.swe_get_ayanamsa_ut ?? raw.get_ayanamsa_ut)(jd), 'ayanamsa'),
      set_ephe_path: (p) => (raw.swe_set_ephe_path ?? raw.set_ephe_path)(absPath(p)),
      set_sid_mode: (mode, t0, ay) => (raw.swe_set_sid_mode ?? raw.set_sid_mode)(mode, t0, ay),
      calc_ut_sync: (jd, body, flags) => (raw.swe_calc_ut ?? raw.calc_ut)(jd, body, flags),
    };
    return { swe, source: 'sweph' };
  } catch {}

  // Fall back to CJS 'swisseph' (callback)
  try {
    const require = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const raw = require('swisseph');

    const swe: SwissAdapter = {
      ...C(raw),
      julday: (y, m, d, ut, cal) => ensureNumber((raw.swe_julday ?? raw.julday)(y, m, d, ut, cal), 'julday'),
      revjul: (jd, cal) => (raw.swe_revjul ?? raw.revjul)(jd, cal),
      sidtime: (jd) => ensureNumber((raw.swe_sidtime ?? raw.sidtime)(jd), 'sidtime'),
      get_ayanamsa_ut: (jd) => ensureNumber((raw.swe_get_ayanamsa_ut ?? raw.get_ayanamsa_ut)(jd), 'ayanamsa'),
      set_ephe_path: (p) => (raw.swe_set_ephe_path ?? raw.set_ephe_path)(absPath(p)),
      set_sid_mode: (mode, t0, ay) => (raw.swe_set_sid_mode ?? raw.set_sid_mode)(mode, t0, ay),
      calc_ut_async: (jd, body, flags) => new Promise((resolve, reject) => {
        try {
          const fn = (raw.swe_calc_ut ?? raw.calc_ut);
          if (typeof fn !== 'function') return reject(new Error('swe_calc_ut not available'));
          // callback signature: (jd, body, flags, cb)
          if (fn.length >= 4) {
            fn(jd, body, flags, (res: any) => resolve(res));
          } else {
            // some builds still return sync
            resolve(fn(jd, body, flags));
          }
        } catch (e) { reject(e); }
      }),
    };
    return { swe, source: 'swisseph' };
  } catch {
    throw new Error("Swiss Ephemeris not available. Install 'sweph' or 'swisseph' and add .se1 files.");
  }
}
