const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const J2000 = 2451545; // 2000-01-01T12:00Z

// sunriseNoaa.ts
function toJulian(d: Date): number {
  let Y = d.getUTCFullYear();           // <-- was const; must be mutable
  let M = d.getUTCMonth() + 1;
  const D = d.getUTCDate();
  const hr =
    d.getUTCHours() +
    d.getUTCMinutes() / 60 +
    d.getUTCSeconds() / 3600 +
    d.getUTCMilliseconds() / 3600000;

  if (M <= 2) { M += 12; Y -= 1; }      // <-- safe now (no const reassignment)

  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 25);
  const JD0 =
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    D +
    B -
    1524.5;

  return JD0 + hr / 24;
}


function solarMeanAnomaly(n: number) { return (357.5291 + 0.98560028 * n) * DEG; }
function eclipticLongitude(M: number): number {
  const C = (1.9148 * Math.sin(M) + 0.0200 * Math.sin(2*M) + 0.0003 * Math.sin(3*M)) * DEG;
  const P = 102.9372 * DEG; // perihelion of the Earth
  return (M + C + P + Math.PI) % (2*Math.PI);
}

function declination(L: number): number {
  const e = 23.44 * DEG; // obliquity
  return Math.asin(Math.sin(e) * Math.sin(L));
}

function hourAngle(lat: number, dec: number, h0deg: number): number {
  const h0 = h0deg * DEG; // -0.833
  const num = Math.sin(h0) - Math.sin(lat*DEG) * Math.sin(dec);
  const den = Math.cos(lat*DEG) * Math.cos(dec);
  const x = num / den;
  if (x <= -1) return Math.PI;  // always above horizon → polar day
  if (x >=  1) return 0;        // always below horizon → polar night
  return Math.acos(x);
}

/** Returns sunrise/sunset as Date (UTC). */
export function sunriseSunsetUTC(targetUTC: Date, lonDeg: number, latDeg: number): { sunrise?: Date; sunset?: Date } {
  // Work on the civil date at 00:00 UTC
  const date0 = new Date(Date.UTC(targetUTC.getUTCFullYear(), targetUTC.getUTCMonth(), targetUTC.getUTCDate(), 0, 0, 0, 0));
  const J = toJulian(date0);
  const n = Math.round(J - J2000 - lonDeg/360);     // solar cycle

  const Jstar = J2000 + lonDeg/360 + n;
  const M = solarMeanAnomaly(Jstar - J2000);
  const L = eclipticLongitude(M);
  const Jtransit = Jstar + 0.0053*Math.sin(M) - 0.0069*Math.sin(2*L);

  const dec = declination(L);
  const w0 = hourAngle(latDeg, dec, -0.833);       // radians

  if (w0 === 0 || w0 === Math.PI) return { sunrise: undefined, sunset: undefined };

  const Jrise = Jtransit - w0/(2*Math.PI);
  const Jset  = Jtransit + w0/(2*Math.PI);

  const toDate = (JD: number) => new Date((JD - 2440587.5) * 86400 * 1000); // JD -> ms since Unix epoch

  return { sunrise: toDate(Jrise), sunset: toDate(Jset) };
}
