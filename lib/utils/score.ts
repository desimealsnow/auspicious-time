export type VerdictStatus = 'Avoid' | 'Proceed with caution' | 'Proceed';

export function clamp(n: number, lo = 0, hi = 100) {
  return n < lo ? lo : n > hi ? hi : n;
}

// MAIN: canonical score is 0–100
export function toScore100(from: number, base: 4 | 5 | 100 = 100) {
  if (base === 100) return clamp(Math.round(from));
  return clamp(Math.round((from / base) * 100));
}

// For legacy consumers (stars / 0–4 style)
export function toScore4(score100: number) {
  return Math.round(clamp(score100) / 25); // 0..4
}

export function labelFor(score100: number): VerdictStatus {
  if (score100 < 40) return 'Avoid';
  if (score100 < 60) return 'Proceed with caution';
  return 'Proceed';
}
