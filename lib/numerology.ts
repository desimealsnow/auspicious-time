export function sumDigits(n: number): number {
  return String(n).split('').reduce((a, c) => a + Number(c), 0);
}

export function reduceToCore(n: number): number {
  // keep 11 & 22 as master numbers
  const isMaster = (x: number) => x === 11 || x === 22;
  let x = n;
  while (x > 9 && !isMaster(x)) x = sumDigits(x);
  return x;
}

export function lifePathFromISO(dobISO: string): number {
  const d = new Date(dobISO);
  if (isNaN(d.getTime())) return 0;
  const ymd = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return reduceToCore(ymd);
}

export function personalDayFromISO(dobISO: string, targetISO: string): number {
  const lp = lifePathFromISO(dobISO);
  const t = new Date(targetISO);
  if (isNaN(t.getTime())) return 0;
  const ymd = t.getFullYear() * 10000 + (t.getMonth() + 1) * 100 + t.getDate();
  return reduceToCore(lp + reduceToCore(ymd));
}

/** A simple scored heuristic for “day fit” */
// Drop-in replacement: numerology on 0–100 with optional activity influence
export function numerologyScore(
  dobISO: string,
  targetISO: string,
  activity?: string,
  includeTimeOfDay = false
): number {
  const d = new Date(dobISO);
  const t = new Date(targetISO);
  if (isNaN(d.getTime()) || isNaN(t.getTime())) return 50; // neutral

  // local helpers (no external deps)
  const digitSum = (n: number) => {
    n = Math.abs(n);
    let s = 0; while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
    return s;
  };
  const reduce1to9 = (n: number) => {
    n = Math.abs(n);
    while (n > 9) n = digitSum(n);
    return n === 0 ? 9 : n;
  };
  const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

  // Life Path (1..9) from DOB; Day number (1..9) from day-of-month
  const lifePath = reduce1to9(
    digitSum(d.getUTCFullYear()) + digitSum(d.getUTCMonth() + 1) + digitSum(d.getUTCDate())
  );
  const dayNum = reduce1to9(t.getUTCDate());

  // Compatibility on 9-wheel: distance 0..4 → base 50..70
  const dist = Math.min((lifePath - dayNum + 9) % 9, (dayNum - lifePath + 9) % 9); // 0..4
  const base = 50 + (4 - dist) * 5; // 50..70

  // Activity adjustment (small nudge; keywords)
  const a = (activity ?? 'general').toLowerCase();
  let actAdj = 0;
  if (a.includes('travel'))           actAdj += 5;
  if (a.includes('marriage'))         actAdj += 3;
  if (a.includes('business'))         actAdj += 4; // "new_business", "startup" etc also match
  if (a.includes('puja') || a.includes('prayer')) actAdj += 2;
  if (a.includes('interview'))        actAdj += 4;
  if (a.includes('property'))         actAdj += 2;
  if (a.includes('surgery') || a.includes('operation')) actAdj -= 8;

  // Optional time-of-day influence (avoid double-count if you already add it elsewhere)
  let todAdj = 0;
  if (includeTimeOfDay) {
    const hour = t.getHours(); // local hours, same as your previous logic
    if (hour >= 5 && hour < 8)        todAdj += 10; // early calm
    else if (hour >= 8 && hour < 11)  todAdj += 8;  // productive
    else if (hour >= 14 && hour < 17) todAdj += 6;  // steady
    else if (hour >= 22 || hour < 4)  todAdj -= 10; // late night
  }

  return clamp(Math.round(base + actAdj + todAdj), 0, 100);
}

