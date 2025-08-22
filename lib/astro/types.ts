export type Window = { start: string; end: string };

export interface AstroPayload {
  dobISO: string;
  targetISO: string;
  lat: number;
  lon: number;
  tz: string;
}

export interface AstroResult {
  ok: boolean;
  error?: string;
  sunrise?: string;
  sunset?: string;
  rahu_kalam?: Window[];
  yamaganda?: Window[];
  gulika_kalam?: Window[];
  abhijit_muhurta?: Window[];
  tithi?: { name: string };
  nakshatra?: { name: string };
}
