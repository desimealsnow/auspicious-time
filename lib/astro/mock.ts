import type { AstroPayload, AstroResult, Window } from './types';

function windowOf(day: Date, startH: number, startM: number, durMin: number): Window {
  const s = new Date(day);
  s.setHours(startH, startM, 0, 0);
  const e = new Date(s.getTime() + durMin * 60 * 1000);
  return { start: s.toISOString(), end: e.toISOString() };
}

export async function mockAstro(payload: AstroPayload): Promise<AstroResult> {
  const dt = new Date(payload.targetISO);
  // Make some simple, deterministic windows
  const rahu = windowOf(dt, 13, 30, 60);
  const yama = windowOf(dt, 10, 30, 60);
  const gulika = windowOf(dt, 7, 30, 60);
  const abhijit = windowOf(dt, 12, 5, 50);

  return {
    ok: true,
    rahu_kalam: [rahu],
    yamaganda: [yama],
    gulika_kalam: [gulika],
    abhijit_muhurta: [abhijit],
    tithi: { name: 'Mock Tithi' },
    nakshatra: { name: 'Mock Nakshatra' }
  };
}
