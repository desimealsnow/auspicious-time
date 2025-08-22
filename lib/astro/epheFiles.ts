// Pick which .se1 files are needed for a given Gregorian year.
// Swiss Ephemeris packages data in 600-year bands:
// 1800–2399 -> suffix "18", 2400–2999 -> "24", 3000–3599 -> "30", etc.
//
// For our needs (Sun/Moon for Panchang), we only REQUIRE:
//   - sepl_<suffix>.se1  (planets incl. Sun)
//   - semo_<suffix>.se1  (Moon)
// seas_<suffix>.se1 is optional (asteroids/extra).

export function bandSuffixForYear(year: number): string {
  const start = Math.floor(year / 600) * 600; // 1800, 2400, 3000, ...
  const suffix = String(Math.floor(start / 100)).padStart(2, '0'); // 1800 -> "18"
  return suffix;
}

export function requiredFilesForYear(year: number): string[] {
  const s = bandSuffixForYear(year);
  return [`sepl_${s}.se1`, `semo_${s}.se1`];
}

// Optional convenience if you decide to require seas_* later:
export function optionalFilesForYear(year: number): string[] {
  const s = bandSuffixForYear(year);
  return [`seas_${s}.se1`];
}
