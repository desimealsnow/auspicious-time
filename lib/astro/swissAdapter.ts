import path from "node:path";
import { createRequire } from "node:module";

// Type for Swiss Ephemeris module constants
interface SwissConstants {
  default?: SwissConstants;
  SE_GREG_CAL?: number;
  GREG_CAL?: number;
  SEFLG_SWIEPH?: number;
  FLG_SWIEPH?: number;
  SEFLG_MOSEPH?: number;
  FLG_MOSEPH?: number;
  SEFLG_SPEED?: number;
  FLG_SPEED?: number;
  SEFLG_SIDEREAL?: number;
  FLG_SIDEREAL?: number;
  SEFLG_EQUATORIAL?: number;
  FLG_EQUATORIAL?: number;
  SE_SUN?: number;
  SUN?: number;
  SE_MOON?: number;
  MOON?: number;
  SIDM_LAHIRI?: number;
  swe_julday?: (...args: number[]) => number;
  julday?: (...args: number[]) => number;
  swe_revjul?: (...args: number[]) => {
    year: number;
    month: number;
    day: number;
    hour: number;
  };
  revjul?: (...args: number[]) => {
    year: number;
    month: number;
    day: number;
    hour: number;
  };
  swe_sidtime?: (...args: number[]) => number;
  sidtime?: (...args: number[]) => number;
  swe_get_ayanamsa_ut?: (...args: number[]) => number;
  get_ayanamsa_ut?: (...args: number[]) => number;
  swe_set_ephe_path?: (path: string) => void;
  set_ephe_path?: (path: string) => void;
  swe_set_sid_mode?: (...args: number[]) => void;
  set_sid_mode?: (...args: number[]) => void;
  swe_calc_ut?: (...args: number[]) => CalcResult;
  calc_ut?: (...args: number[]) => CalcResult;
}

export type CalcResult =
  | {
      longitude?: number;
      latitude?: number;
      declination?: number;
      ra?: number;
      error?: string;
      lon?: number;
      lat?: number;
      speed?: number;
      vel?: number;
      data?: number[];
      flag?: number;
    }
  | number[]; // some builds return an array [lon, lat, dist, vLon, vLat, vDist]

export type SwissAdapter = {
  // time & config
  julday: (
    y: number,
    m: number,
    d: number,
    utHours: number,
    cal: number
  ) => number;
  revjul: (
    jd: number,
    cal: number
  ) => { year: number; month: number; day: number; hour: number };
  sidtime: (jd: number) => number; // hours
  get_ayanamsa_ut: (jd: number) => number;
  set_ephe_path: (absPath: string) => void;
  set_sid_mode: (mode: number, t0: number, ay: number) => void;

  // positions
  calc_ut_sync?: (jd: number, body: number, flags: number) => CalcResult; // present for 'sweph'
  calc_ut_async?: (
    jd: number,
    body: number,
    flags: number
  ) => Promise<CalcResult>; // present for 'swisseph'

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
  if (typeof n !== "number" || Number.isNaN(n))
    throw new Error(`${label} must be a number, got ${String(n)}`);
  return n;
}
function absPath(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}
function C(raw: SwissConstants) {
  return {
    SE_GREG_CAL: raw.SE_GREG_CAL ?? raw.GREG_CAL ?? 1,
    SEFLG_SWIEPH: raw.SEFLG_SWIEPH ?? raw.FLG_SWIEPH ?? 2,
    SEFLG_MOSEPH: raw.SEFLG_MOSEPH ?? raw.FLG_MOSEPH ?? 4,
    SEFLG_SPEED: raw.SEFLG_SPEED ?? raw.FLG_SPEED ?? 256,
    SEFLG_SIDEREAL: raw.SEFLG_SIDEREAL ?? raw.FLG_SIDEREAL ?? 64,
    SEFLG_EQUATORIAL: raw.SEFLG_EQUATORIAL ?? raw.FLG_EQUATORIAL ?? 2048,
    SE_SUN: raw.SE_SUN ?? raw.SUN ?? 0,
    SE_MOON: raw.SE_MOON ?? raw.MOON ?? 1,
    SIDM_LAHIRI: raw.SIDM_LAHIRI ?? 1,
  };
}

export async function loadSwissAdapter(): Promise<{
  swe: SwissAdapter;
  source: "sweph" | "swisseph";
}> {
  // Prefer ESM/N-API 'sweph' (sync)
  try {
    const mod = await import("sweph");
    const raw: SwissConstants = (mod as SwissConstants).default ?? mod;

    const swe: SwissAdapter = {
      ...C(raw),
      julday: (y, m, d, ut, cal) => {
        const fn = raw.swe_julday ?? raw.julday;
        if (!fn) throw new Error("julday function not available");
        return ensureNumber(fn(y, m, d, ut, cal), "julday");
      },
      revjul: (jd, cal) => {
        const fn = raw.swe_revjul ?? raw.revjul;
        if (!fn) throw new Error("revjul function not available");
        return fn(jd, cal);
      },
      sidtime: (jd) => {
        const fn = raw.swe_sidtime ?? raw.sidtime;
        if (!fn) throw new Error("sidtime function not available");
        return ensureNumber(fn(jd), "sidtime");
      },
      get_ayanamsa_ut: (jd) => {
        const fn = raw.swe_get_ayanamsa_ut ?? raw.get_ayanamsa_ut;
        if (!fn) throw new Error("get_ayanamsa_ut function not available");
        return ensureNumber(fn(jd), "ayanamsa");
      },
      set_ephe_path: (p) => {
        const fn = raw.swe_set_ephe_path ?? raw.set_ephe_path;
        if (!fn) throw new Error("set_ephe_path function not available");
        return fn(absPath(p));
      },
      set_sid_mode: (mode, t0, ay) => {
        const fn = raw.swe_set_sid_mode ?? raw.set_sid_mode;
        if (!fn) throw new Error("set_sid_mode function not available");
        return fn(mode, t0, ay);
      },
      calc_ut_sync: (jd, body, flags) => {
        const fn = raw.swe_calc_ut ?? raw.calc_ut;
        if (!fn) throw new Error("calc_ut function not available");
        return fn(jd, body, flags);
      },
    };
    return { swe, source: "sweph" };
  } catch {}

  // Fall back to CJS 'swisseph' (callback)
  try {
    const require = createRequire(import.meta.url);
    const raw = require("swisseph");

    const swe: SwissAdapter = {
      ...C(raw),
      julday: (y, m, d, ut, cal) => {
        const fn = raw.swe_julday ?? raw.julday;
        if (!fn) throw new Error("julday function not available");
        return ensureNumber(fn(y, m, d, ut, cal), "julday");
      },
      revjul: (jd, cal) => {
        const fn = raw.swe_revjul ?? raw.revjul;
        if (!fn) throw new Error("revjul function not available");
        return fn(jd, cal);
      },
      sidtime: (jd) => {
        const fn = raw.swe_sidtime ?? raw.sidtime;
        if (!fn) throw new Error("sidtime function not available");
        return ensureNumber(fn(jd), "sidtime");
      },
      get_ayanamsa_ut: (jd) => {
        const fn = raw.swe_get_ayanamsa_ut ?? raw.get_ayanamsa_ut;
        if (!fn) throw new Error("get_ayanamsa_ut function not available");
        return ensureNumber(fn(jd), "ayanamsa");
      },
      set_ephe_path: (p) => {
        const fn = raw.swe_set_ephe_path ?? raw.set_ephe_path;
        if (!fn) throw new Error("set_ephe_path function not available");
        return fn(absPath(p));
      },
      set_sid_mode: (mode, t0, ay) => {
        const fn = raw.swe_set_sid_mode ?? raw.set_sid_mode;
        if (!fn) throw new Error("set_sid_mode function not available");
        return fn(mode, t0, ay);
      },
      calc_ut_async: (jd, body, flags) =>
        new Promise((resolve, reject) => {
          try {
            const fn = raw.swe_calc_ut ?? raw.calc_ut;
            if (typeof fn !== "function")
              return reject(new Error("swe_calc_ut not available"));
            // callback signature: (jd, body, flags, cb)
            if (fn.length >= 4) {
              fn(jd, body, flags, (res: unknown) => {
                try {
                  // Check if the result contains an error
                  if (
                    res &&
                    typeof res === "object" &&
                    "error" in res &&
                    res.error
                  ) {
                    reject(new Error(String(res.error)));
                  } else {
                    resolve(res as CalcResult);
                  }
                } catch (e) {
                  reject(e);
                }
              });
            } else {
              // some builds still return sync
              try {
                const res = fn(jd, body, flags);
                if (res && typeof res === "object" && res.error) {
                  reject(new Error(res.error));
                } else {
                  resolve(res);
                }
              } catch (e) {
                reject(e);
              }
            }
          } catch (e) {
            reject(e);
          }
        }),
    };
    return { swe, source: "swisseph" };
  } catch {
    throw new Error(
      "Swiss Ephemeris not available. Install 'sweph' or 'swisseph' and add .se1 files."
    );
  }
}
