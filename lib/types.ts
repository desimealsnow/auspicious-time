export type WindowISO = { start: string; end: string };

export type ApiResp = {
  ok: boolean;
  sunrise?: string | null;
  sunset?: string | null;
  abhijit_muhurta?: WindowISO[];
  rahu_kalam?: WindowISO[];
  yamaganda?: WindowISO[];
  gulika_kalam?: WindowISO[];
  tithi?: { name: string; index: number };
  nakshatra?: { name: string; index: number };
  janma?: { nakshatra_index: number; rashi_index: number };
  tarabala?: { index: number; name: string; isGood: boolean };
  chandrabala?: { relation: number; isGood: boolean };
  verdict?: {
    activity: string;
    status: "Avoid" | "Proceed with caution" | "Proceed";
    score: number;
    reasons: string[];
    next_safe_window?: WindowISO | null;
  };
  safe_windows?: WindowISO[];
  error?: string;
};
