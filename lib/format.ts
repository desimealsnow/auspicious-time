export function withinISO(targetISO: string, startISO?: string, endISO?: string): boolean {
  if (!startISO || !endISO) return false;
  const t = new Date(targetISO).getTime();
  return t >= new Date(startISO).getTime() && t <= new Date(endISO).getTime();
}
