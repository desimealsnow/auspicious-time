debugger
import { numerologyScore } from './numerology';
import { timeOfDayNotes } from './timeHeuristics';
import { withinISO } from './format';

export type Verdict = 'GOOD' | 'OKAY' | 'AVOID';

export interface EvalInput {
  dobISO: string;
  targetISO: string;
  activity: string;
}
type WindowISO = { start: string; end: string };

export interface EvalAstroWindows {
  rahu_kalam?: WindowISO[];
  yamaganda?: WindowISO[];
  gulika_kalam?: WindowISO[];
  abhijit_muhurta?: WindowISO[];
  tithi?: { name?: string };
  nakshatra?: { name?: string };
  verdict?: { score?: number; status?: string; reasons?: string[] }; // from API
}

export interface EvalResult {
  verdict: Verdict;
  score: number;
  reasons: string[];
  astro?: { tithi?: string; nakshatra?: string };
}
const clamp = (n: number, lo = 0, hi = 100) => (n < lo ? lo : n > hi ? hi : n);
function labelFromScore100(score100: number): Verdict {
  if (score100 < 40) return 'AVOID';
  if (score100 < 60) return 'OKAY';
  return 'GOOD';
}

// Convert a small 0–4-style boost to 0–100 domain.
// If you already return 0–100 from timeOfDayNotes, just return it and set factor=1.
function boostTo100(boost: number, factor = 25) {
  // e.g., +3 (0–4 scale) -> +75 on 0–100, then clamp overall later
  return boost * factor;
}

// If your numerologyScore returns 0–4, convert; if it already returns 0–100, keep it.
function numerologyTo100(raw: number | undefined) {
  if (typeof raw !== 'number') return 50;  // neutral default
  if (raw <= 4) return Math.round(raw * 25);
  if (raw <= 100) return Math.round(raw);
  return 100;
}



export function evaluateTime(input: EvalInput, astro?: EvalAstroWindows): EvalResult {
  const reasons: string[] = [];

  // Numerology baseline (0–100)
  const numRaw = numerologyScore(input.dobISO, input.targetISO, input.activity);
  const num100 = numerologyTo100(numRaw);
  if (Number.isFinite(num100)) reasons.push(`Numerology baseline: ${num100}/100`);

  // Time-of-day notes (convert small boost to 0–100 addend)
  const tod = timeOfDayNotes(new Date(input.targetISO), input.activity);
  const todBoost100 = boostTo100(tod?.boost ?? 0);
  if (tod?.notes?.length) reasons.push(...tod.notes);

  // Astro score:
  // 1) Prefer the server’s verdict (0–100) if present — it already includes Tarabala/Chandrabala/windows etc.
  // 2) Otherwise synthesize a quick score from the windows (single-day view).
  let astro100: number | undefined = astro?.verdict?.score;
  if (typeof astro100 !== 'number' && astro) {
    const inRahu   = (astro.rahu_kalam ?? []).some(w => withinISO(input.targetISO, w.start, w.end));
    const inYama   = (astro.yamaganda ?? []).some(w => withinISO(input.targetISO, w.start, w.end));
    const inGulika = (astro.gulika_kalam ?? []).some(w => withinISO(input.targetISO, w.start, w.end));
    const inAbhijit= (astro.abhijit_muhurta ?? []).some(w => withinISO(input.targetISO, w.start, w.end));

    // Start around neutral 60; penalize blocked windows, reward Abhijit lightly
    let s = 60;
    if (inRahu || inYama || inGulika) { s -= 30; reasons.push('Overlaps Rahu/Yamaganda/Gulika.'); }
    if (inAbhijit) { s += 10; reasons.push('Within Abhijit Muhurta.'); }
    astro100 = clamp(s);
  }

  // Blend: weight astro more strongly than numerology; add time-of-day boost.
  // Tweak weights to taste. (0.8 / 0.2 is a good starting point.)
  const a = typeof astro100 === 'number' ? astro100 : 60;
  let score100 = Math.round(a * 0.8 + num100 * 0.2 + todBoost100);
  score100 = clamp(score100);

  // Final verdict label: prefer API status if present; otherwise derive from score.
  const statusText = astro?.verdict?.status;
  const verdict: Verdict =
    statusText?.toLowerCase().includes('avoid') ? 'AVOID' :
    statusText?.toLowerCase().includes('caution') ? 'OKAY' :
    statusText?.toLowerCase().includes('proceed') ? 'GOOD' :
    labelFromScore100(score100);

  // Append API reasons (if any) after our own
  if (astro?.verdict?.reasons?.length) reasons.push(...astro.verdict.reasons);

  return {
    verdict,
    score: score100,
    // score4: Math.round(score100 / 25), // uncomment if you still display X / 4 anywhere
    reasons,
    astro: astro ? {
      tithi: astro.tithi?.name,
      nakshatra: astro.nakshatra?.name
    } : undefined
  };
}
