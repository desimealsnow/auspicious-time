export type WindowISO = { start: string; end: string };

export type ApiResp = {
  ok: boolean;
  timestamp?: string;
  location?: { latitude: number; longitude: number };

  // Enhanced Activity Analysis
  activity?: {
    name: string;
    recommendation: "EXCELLENT" | "GOOD" | "NEUTRAL" | "CHALLENGING" | "AVOID";
    score: number;
    confidence: "high" | "medium" | "low";
    interpretation: string;
  };

  // Planetary Analysis
  planetary?: {
    positions: Array<{
      name: string;
      sign: string;
      degree: number;
      retrograde: boolean;
      strength: number;
    }>;
    aspects: Array<{
      planets: string;
      type: string;
      strength: string;
      influence: string;
    }>;
    summary: {
      supportive_factors: string[];
      challenging_factors: string[];
      key_influences: string[];
    };
  };

  // Time Windows (Global Terminology)
  time_windows?: {
    current_period: {
      name: string;
      start: string;
      end: string;
      type: "favorable" | "challenging" | "neutral";
      description: string;
    } | null;
    all_periods: Array<{
      name: string;
      start: string;
      end: string;
      type: "favorable" | "challenging" | "neutral";
      description: string;
    }>;
    next_favorable: {
      name: string;
      start: string;
      end: string;
      type: "favorable" | "challenging" | "neutral";
      description: string;
    } | null;
    alternative_times: Array<{
      name: string;
      start: string;
      end: string;
      type: "favorable" | "challenging" | "neutral";
      description: string;
    }>;
    today_summary: {
      sunrise: string;
      sunset: string;
      total_favorable_hours: number;
      total_challenging_hours: number;
    };
  };

  // Recommendations
  recommendations?: {
    immediate: string;
    optimal_timing: string;
    general_advice: string;
  };

  // Legacy fields for backward compatibility
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
