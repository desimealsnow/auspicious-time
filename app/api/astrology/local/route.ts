debugger
import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import { computeAbhijit, computeDayWindows } from '@/lib/astro/vedicWindows';
import { requiredFilesForYear } from '@/lib/astro/epheFiles';
import { loadSwissAdapter } from '@/lib/astro/swissAdapter';
import { sunriseSunsetUTC } from '@/lib/astro/sunriseNoaa';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Payload = {
  dobISO: string;
  targetISO: string;
  lat: number;
  lon: number;
  tz: string;
  activity?: string; // <— NEW
};

const ACT_RULES: Record<string, { avoid: Array<'rahu_kalam' | 'yamaganda' | 'gulika_kalam'>; preferAbhijit: boolean }> = {
  travel:        { avoid: ['rahu_kalam','yamaganda'],                 preferAbhijit: true },
  marriage:      { avoid: ['rahu_kalam','yamaganda','gulika_kalam'],  preferAbhijit: true },
  new_business:  { avoid: ['rahu_kalam','gulika_kalam'],              preferAbhijit: true },
  puja:          { avoid: ['rahu_kalam','yamaganda','gulika_kalam'],  preferAbhijit: true },
  general:       { avoid: ['rahu_kalam'],                             preferAbhijit: true }
};

type Window = { start: string | Date; end: string | Date };
const toDate = (x: string | Date) => (x instanceof Date ? x : new Date(x));
const within = (d: Date, w?: Window | null) => !!w && d >= toDate(w.start) && d <= toDate(w.end);

// Interval subtraction: base [start,end] minus many block windows -> list of safe windows
function subtractIntervals(base: [Date, Date], blocks: Window[]): [Date, Date][] {
  let [s, e] = base;
  if (e <= s) return [];
  const sorted = blocks
    .map(b => [toDate(b.start), toDate(b.end)] as [Date, Date])
    .filter(([bs, be]) => be > s && bs < e)
    .sort((a,b) => a[0].getTime() - b[0].getTime());

  const out: [Date, Date][] = [];
  let cur = s;
  for (const [bs, be] of sorted) {
    if (bs > cur) out.push([cur, new Date(Math.min(+bs, +e))]);
    if (be > cur) cur = be;
    if (cur >= e) break;
  }
  if (cur < e) out.push([cur, e]);
  return out.filter(([a,b]) => b > a);
}

// Tarabala (1..9 cycle from birth nakshatra to day nakshatra)
function taraFor(birthIdx1: number, dayIdx1: number) {
  const dist = ((dayIdx1 - birthIdx1 + 27) % 27) + 1;          // 1..27
  const tara = ((dist - 1) % 9) + 1;                            // 1..9
  const names = ['Janma','Sampat','Vipat','Kshema','Pratyak','Sadhana','Naidhana','Mitra','Parama Mitra'];
  const good = [2,4,6,8,9].includes(tara);
  const bad  = [3,5,7].includes(tara);
  return { tara, name: names[tara-1], isGood: good, isBad: bad };
}

// Chandrabala (moon sign distance from Janma rashi; 6/8/12 considered inauspicious)
function chandraFor(birthRashi1: number, dayRashi1: number) {
  const rel = ((dayRashi1 - birthRashi1 + 12) % 12) + 1;  // 1..12
  const isBad = [6,8,12].includes(rel);
  const isGood = !isBad;
  return { relation: rel, isGood, isBad };
}

function ephePathAbs(): string {
  const raw = process.env.SE_EPHE_PATH || './ephe';
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
}
function missingFiles(epheDir: string, files: string[]): string[] {
  return files.filter(f => !fs.existsSync(path.join(epheDir, f)));
}
function toUTHours(d: Date): number {
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
}
function norm360(x: number) { let a = x % 360; if (a < 0) a += 360; return a; }
// drop-in: super-robust longitude extractor with numeric coercion
function getLonDeg(res: any): number | undefined {
  const num = (v: any) => {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
  };
  if (!res) return undefined;

  // common shapes
  if (num(res.longitude) !== undefined) return num(res.longitude);
  if (num(res.lon) !== undefined)       return num(res.lon);

  // array shapes: [lon, lat, ...]
  if (Array.isArray(res) && num(res[0]) !== undefined) return num(res[0]);

  // nested containers seen in some builds
  if (res.data && Array.isArray(res.data) && num(res.data[0]) !== undefined) return num(res.data[0]);
  if (res.x && Array.isArray(res.x) && num(res.x[0]) !== undefined)          return num(res.x[0]);
  if (res.position && num(res.position.long) !== undefined)                  return num(res.position.long);
  if (res.coordinates && Array.isArray(res.coordinates) && num(res.coordinates[0]) !== undefined)
    return num(res.coordinates[0]);

  // last-resort: numeric-indexed props
  if (num((res as any)[0]) !== undefined) return num((res as any)[0]);

  return undefined;
}

function jdToDate(swe: Awaited<ReturnType<typeof loadSwissAdapter>>['swe'], jd: number): Date {
  const r = swe.revjul(jd, swe.SE_GREG_CAL);
  const ms = Date.UTC(r.year, r.month - 1, r.day, 0, 0, 0, 0) + Math.round((r.hour ?? 0) * 3600 * 1000);
  return new Date(ms);
}

export async function POST(req: Request) {

  
  try {
    const body = (await req.json()) as Payload;
    if (!body?.dobISO || !body?.targetISO || typeof body.lat !== 'number' || typeof body.lon !== 'number') {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    // Load Swiss
    let sweInfo;
    try {
      sweInfo = await loadSwissAdapter();
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e?.message || 'Swiss module missing' }, { status: 200 });
    }
    const swe = sweInfo.swe;

    // Ephemeris files (needed for Swiss-only pieces)
    const epheDir = ephePathAbs();
    const target = new Date(body.targetISO);
    const needed = requiredFilesForYear(target.getFullYear());
    const missing = missingFiles(epheDir, needed);
    const allowFallback = process.env.SE_ALLOW_MOSHIER === '1';
    if (missing.length && !allowFallback) {
      return NextResponse.json({
        ok: false,
        error: `Swiss ephemeris files missing in "${epheDir}". Add for ${target.getFullYear()}: ${missing.join(', ')}. ` +
               `Or set SE_ALLOW_MOSHIER=1 to allow fallback.`
      }, { status: 200 });
    }

    // Configure Swiss
    swe.set_ephe_path(epheDir);
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0);

    // JD (UT) for target
    const jdUT = swe.julday(target.getUTCFullYear(), target.getUTCMonth() + 1, target.getUTCDate(), toUTHours(target), swe.SE_GREG_CAL);
    if (!Number.isFinite(jdUT)) {
      return NextResponse.json({ ok: false, error: 'Failed to compute julian day (target).' }, { status: 200 });
    }

    const ephFlag = allowFallback ? swe.SEFLG_MOSEPH : swe.SEFLG_SWIEPH;

    // ---- TITHI & NAKSHATRA (use calc_ut via sync or async wrapper) ----
    const getCalc =  async (ipl: number, flags: number) =>
  (swe as any).calc_ut_sync?.(jdUT, ipl, flags) ?? await (swe as any).calc_ut_async?.(jdUT, ipl, flags);

    // Pass 1: tropical ecliptic + ayanamsa
    let sunRes: any = await getCalc(swe.SE_SUN,  ephFlag | swe.SEFLG_SPEED);
    let moonRes: any = await getCalc(swe.SE_MOON,  ephFlag | swe.SEFLG_SPEED);

    // If result came back as { error }, surface it
    if (sunRes?.error) return NextResponse.json({ ok: false, error: `Sun calc: ${sunRes.error}` }, { status: 200 });
    if (moonRes?.error) return NextResponse.json({ ok: false, error: `Moon calc: ${moonRes.error}` }, { status: 200 });

    let sunLonSid: number | undefined;
    let moonLonSid: number | undefined;

    const sunLonTrop = getLonDeg(sunRes);
    const moonLonTrop = getLonDeg(moonRes);
    if (Number.isFinite(sunLonTrop) && Number.isFinite(moonLonTrop)) {
      const ayan = swe.get_ayanamsa_ut(jdUT);
      sunLonSid  = norm360((sunLonTrop as number) - ayan);
      moonLonSid = norm360((moonLonTrop as number) - ayan);
    } else {
      // Pass 2: sidereal directly
      sunRes = await getCalc(swe.SE_SUN,  ephFlag | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED);
      moonRes = await getCalc(swe.SE_MOON, ephFlag | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED);
      if (sunRes?.error) return NextResponse.json({ ok: false, error: `Sun calc (sidereal): ${sunRes.error}` }, { status: 200 });
      if (moonRes?.error) return NextResponse.json({ ok: false, error: `Moon calc (sidereal): ${moonRes.error}` }, { status: 200 });
      sunLonSid  = getLonDeg(sunRes);
      moonLonSid = getLonDeg(moonRes);
    }

    if (!Number.isFinite(sunLonSid!) || !Number.isFinite(moonLonSid!)) {
      return NextResponse.json({ ok: false, error: 'Swiss result did not include ecliptic longitudes (even after fallback).' }, { status: 200 });
    }

    const diff = norm360((moonLonSid as number) - (sunLonSid as number));
    const tithiIdx0 = Math.floor(diff / 12); // 0..29
    const tithiNames = [
      'Shukla Pratipat','Shukla Dwitiya','Shukla Tritiya','Shukla Chaturthi','Shukla Panchami','Shukla Shashti','Shukla Saptami','Shukla Ashtami','Shukla Navami','Shukla Dashami',
      'Shukla Ekadashi','Shukla Dwadashi','Shukla Trayodashi','Shukla Chaturdashi','Purnima',
      'Krishna Pratipat','Krishna Dwitiya','Krishna Tritiya','Krishna Chaturthi','Krishna Panchami','Krishna Shashti','Krishna Saptami','Krishna Ashtami','Krishna Navami','Krishna Dashami',
      'Krishna Ekadashi','Krishna Dwadashi','Krishna Trayodashi','Krishna Chaturdashi','Amavasya'
    ];
    const tithi = { name: tithiNames[tithiIdx0] ?? `Tithi ${tithiIdx0 + 1}`, index: tithiIdx0 + 1 };

    const nakIdx0 = Math.floor((moonLonSid as number) / (360 / 27)); // 0..26
    const nakNames = [
      'Ashwini','Bharani','Krittika','Rohini','Mrigashirsha','Ardra','Punarvasu','Pushya','Ashlesha',
      'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
      'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
    ];
    const nakshatra = { name: nakNames[nakIdx0] ?? `Nakshatra ${nakIdx0 + 1}`, index: nakIdx0 + 1 };

    // ---- SUNRISE / SUNSET (NOAA, UTC) ----
    const { sunrise, sunset } = sunriseSunsetUTC(target, Number(body.lon), Number(body.lat));
    if (!sunrise || !sunset) {
      return NextResponse.json({
        ok: true,
        sunrise: null,
        sunset: null,
        abhijit_muhurta: [],
        rahu_kalam: [],
        yamaganda: [],
        gulika_kalam: [],
        tithi,
        nakshatra
      });
    }

    // Convert to ISO; your downstream utils use Date objects (UTC ok)
    const sunriseLocal = sunrise;
    const sunsetLocal  = sunset;

    const abhijit = computeAbhijit(sunriseLocal, sunsetLocal);
    const { rahu_kalam, yamaganda, gulika_kalam } = computeDayWindows(target, sunriseLocal, sunsetLocal);

    const activityKey = (body.activity ?? 'general').toLowerCase().replace(/\s+/g, '_');
    const rule = ACT_RULES[activityKey] ?? ACT_RULES.general;
    const calcAt = async (jd: number, ipl: number, flags: number) =>
      (swe as any).calc_ut_sync?.(jd, ipl, flags) ?? await (swe as any).calc_ut_async?.(jd, ipl, flags);
    // Birth Moon (sidereal) → Janma Nakshatra & Rashi
    const dob = new Date(body.dobISO);
    const jdBirth = swe.julday(dob.getUTCFullYear(), dob.getUTCMonth()+1, dob.getUTCDate(), toUTHours(dob), swe.SE_GREG_CAL);
    let birthMoon = await calcAt(jdBirth, swe.SE_MOON, ephFlag | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED);
    if (birthMoon?.error) return NextResponse.json({ ok:false, error:`Birth Moon calc: ${birthMoon.error}` }, { status:200 });
    const birthMoonLon = getLonDeg(birthMoon);
    if (!Number.isFinite(birthMoonLon)) return NextResponse.json({ ok:false, error:'Birth Moon longitude unavailable' }, { status:200 });

    const birthNakIdx1  = Math.floor((birthMoonLon as number) / (360/27)) + 1; // 1..27
    const birthRashi1   = Math.floor((birthMoonLon as number) / 30) + 1;      // 1..12
    const dayRashi1     = Math.floor((moonLonSid as number) / 30) + 1;        // 1..12
    const tara          = taraFor(birthNakIdx1, nakshatra.index);             // uses today's nakshatra
    const chandra       = chandraFor(birthRashi1, dayRashi1);

    // ---------- ACTIVITY WINDOWS ----------
    const avoidBlocks: Window[] = [];
    for (const k of rule.avoid) {
      const list = (k === 'rahu_kalam'   ? rahu_kalam :
                  (k === 'yamaganda'    ? yamaganda  :
                  (k === 'gulika_kalam' ? gulika_kalam : []))) as Window[];
      avoidBlocks.push(...list);
    }
    const baseDay: [Date,Date] = [sunriseLocal, sunsetLocal];
    const safeIntervals = subtractIntervals(baseDay, avoidBlocks);

    // Target moment verdict
    const inAvoid = avoidBlocks.some(w => within(target, w));
    const inAbhijit = !!abhijit && within(target, abhijit);

    // Simple score & status
    let score = 50;
    if (tara.isGood) score += 20;
    if (tara.isBad)  score -= 20;
    if (chandra.isBad) score -= 25; else score += 10;
    if (inAvoid) score -= 30;
    if (rule.preferAbhijit && inAbhijit) score += 10;
    if (score < 0) score = 0; if (score > 100) score = 100;

    let status: 'Avoid' | 'Proceed with caution' | 'Proceed';
    if (inAvoid || score < 40) status = 'Avoid';
    else if (score < 60)       status = 'Proceed with caution';
    else                       status = 'Proceed';

    // Pick next safe 60-min window after target (if current is bad)
    const nextSafe = (() => {
      if (!safeIntervals.length) return null;
      // find first safe interval that starts after target
      const found = safeIntervals.find(([s]) => s >= target) ?? safeIntervals[0];
      const [s,e] = found;
      const end = new Date(Math.min(+e, +s + 60*60*1000)); // 60 minutes proposal
      return { start: s.toISOString(), end: end.toISOString() };
    })();

    return NextResponse.json({
      ok: true,
      sunrise: sunriseLocal.toISOString(),
      sunset: sunsetLocal.toISOString(),
      abhijit_muhurta: abhijit ? [abhijit] : [],
      rahu_kalam,
      yamaganda,
      gulika_kalam,
      tithi,
      nakshatra,
      // NEW: birth-based personalization + activity verdict
      janma: {
        nakshatra_index: birthNakIdx1,
        rashi_index: birthRashi1
      },
      tarabala: { index: tara.tara, name: tara.name, isGood: tara.isGood },
      chandrabala: { relation: chandra.relation, isGood: chandra.isGood },
      verdict: {
        activity: activityKey,
        status,
        score,
        reasons: [
          tara.isGood ? `Tarabala favorable (${tara.name})` :
          tara.isBad  ? `Tarabala unfavorable (${tara.name})` : `Tarabala neutral (${tara.name})`,
          chandra.isBad ? `Moon in ${chandra.relation} from Janma rashi (unfavorable)` : `Chandra bala OK`,
          inAvoid ? `Falls in ${rule.avoid.join(' / ')}` : (inAbhijit && rule.preferAbhijit ? 'In Abhijit muhurta' : 'Outside blocked periods')
        ],
        next_safe_window: nextSafe
      },
      safe_windows: safeIntervals.map(([s,e]) => ({ start: s.toISOString(), end: e.toISOString() }))
    });

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}
