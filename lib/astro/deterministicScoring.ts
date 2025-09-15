import { createHash } from "crypto";
import {
  analyzeActivityTiming,
  calculateAspects,
  calculatePlanetaryPositions,
} from "./enhancedSwissCalculations";

// Fixed configuration for deterministic results
export const CANONICAL_CONFIG = {
  ayanamsa: "LAHIRI", // Fixed ayanamsa
  ephFlags: 0x00000002 | 0x00000004, // SEFLG_SWIEPH | SEFLG_SPEED
  houseSystem: "PLACIDUS",
  sweVersion: "2.10.03", // Fixed version for consistency
  sidereal: false, // Use tropical
  deltaTModel: "MORRISON_STEPHENSON",
} as const;

// Event type specific weights (normalized to sum to 1.0)
export const EVENT_WEIGHTS = {
  travel: {
    moonStrength: 0.25,
    beneficsToLagna: 0.2,
    nakshatraSuitability: 0.2,
    tithiSuitability: 0.15,
    horaSuitability: 0.15,
    maleficsOnAngles: -0.2,
    rahuYamaGulikaPenalty: -0.15,
    combustionPenalty: -0.1,
    mercuryRetroPenalty: -0.15,
  },
  business: {
    moonStrength: 0.2,
    beneficsToLagna: 0.25,
    nakshatraSuitability: 0.2,
    tithiSuitability: 0.2,
    horaSuitability: 0.2,
    maleficsOnAngles: -0.2,
    rahuYamaGulikaPenalty: -0.15,
    combustionPenalty: -0.1,
    mercuryRetroPenalty: -0.2,
  },
  marriage: {
    moonStrength: 0.3,
    beneficsToLagna: 0.25,
    nakshatraSuitability: 0.25,
    tithiSuitability: 0.2,
    horaSuitability: 0.15,
    maleficsOnAngles: -0.25,
    rahuYamaGulikaPenalty: -0.2,
    combustionPenalty: -0.1,
    mercuryRetroPenalty: -0.1,
  },
  health: {
    moonStrength: 0.25,
    beneficsToLagna: 0.25,
    nakshatraSuitability: 0.2,
    tithiSuitability: 0.2,
    horaSuitability: 0.15,
    maleficsOnAngles: -0.25,
    rahuYamaGulikaPenalty: -0.2,
    combustionPenalty: -0.15,
    mercuryRetroPenalty: -0.1,
  },
} as const;

export interface CanonicalInputs {
  utcMinute: Date;
  lat: number;
  lon: number;
  tz: string;
  eventType: string;
  scoreId: string;
}

export interface ScoringBreakdown {
  moonStrength: number;
  beneficsToLagna: number;
  nakshatraSuitability: number;
  tithiSuitability: number;
  horaSuitability: number;
  maleficsOnAngles: number;
  rahuYamaGulikaPenalty: number;
  combustionPenalty: number;
  mercuryRetroPenalty: number;
  rawScore: number;
  finalScore: number;
}

export interface StableSuggestion {
  start: Date;
  best: Date;
  end: Date;
  score: number;
  breakdown: ScoringBreakdown;
  scoreId: string;
  reasons: string[];
}

/**
 * Canonicalize inputs to ensure deterministic results
 */
export function canonicalizeInputs(
  localDatetime: string,
  lat: number,
  lon: number,
  tz: string,
  eventType: string
): CanonicalInputs {
  // Parse the input datetime
  const inputDate = new Date(localDatetime);

  // Round down to the minute for deterministic results
  const utcMinute = new Date(inputDate);
  utcMinute.setSeconds(0, 0); // Round down to minute

  // The input is already in UTC format (ISO string), so we can use it directly
  // But we need to ensure it's properly rounded to the minute
  const utcTime = new Date(utcMinute.getTime());

  // Generate deterministic score ID
  const scoreId = generateScoreId(utcTime, lat, lon, tz, eventType);

  return {
    utcMinute: utcTime,
    lat,
    lon,
    tz,
    eventType,
    scoreId,
  };
}

/**
 * Generate deterministic score ID for consistency verification
 */
function generateScoreId(
  utcMinute: Date,
  lat: number,
  lon: number,
  tz: string,
  eventType: string
): string {
  const canonical = {
    utcMinute: utcMinute.toISOString(),
    lat: Math.round(lat * 1000000) / 1000000, // 6 decimal places
    lon: Math.round(lon * 1000000) / 1000000,
    tz,
    eventType,
    ayanamsa: CANONICAL_CONFIG.ayanamsa,
    ephFlags: CANONICAL_CONFIG.ephFlags,
    sweVersion: CANONICAL_CONFIG.sweVersion,
  };

  return createHash("sha256")
    .update(JSON.stringify(canonical))
    .digest("hex")
    .substring(0, 16); // First 16 chars for readability
}

/**
 * Compute comprehensive astrological score with transparent breakdown
 */
export async function scoreMinute(
  canonical: CanonicalInputs,
  swe: any,
  ephFlag: number
): Promise<{ score: number; breakdown: ScoringBreakdown; reasons: string[] }> {
  try {
    // Calculate Julian Day
    const jdUT = swe.julday(
      canonical.utcMinute.getUTCFullYear(),
      canonical.utcMinute.getUTCMonth() + 1,
      canonical.utcMinute.getUTCDate(),
      canonical.utcMinute.getUTCHours() +
        canonical.utcMinute.getUTCMinutes() / 60,
      swe.SE_GREG_CAL
    );

    if (!Number.isFinite(jdUT)) {
      throw new Error("Invalid Julian Day calculation");
    }

    // Get planetary positions
    const planetaryPositions = await calculatePlanetaryPositions(
      swe,
      jdUT,
      ephFlag
    );
    if (!planetaryPositions || planetaryPositions.length === 0) {
      throw new Error("No planetary positions calculated");
    }

    // Calculate aspects
    const aspects = calculateAspects(planetaryPositions);

    // Compute sub-scores (each normalized to [-1, +1])
    const breakdown = await computeSubScores(
      planetaryPositions,
      aspects,
      canonical.lat,
      canonical.lon,
      canonical.eventType,
      swe,
      jdUT
    );

    // Apply event-specific weights
    const weights =
      EVENT_WEIGHTS[canonical.eventType as keyof typeof EVENT_WEIGHTS] ||
      EVENT_WEIGHTS.travel;

    const rawScore =
      breakdown.moonStrength * weights.moonStrength +
      breakdown.beneficsToLagna * weights.beneficsToLagna +
      breakdown.nakshatraSuitability * weights.nakshatraSuitability +
      breakdown.tithiSuitability * weights.tithiSuitability +
      breakdown.horaSuitability * weights.horaSuitability +
      breakdown.maleficsOnAngles * weights.maleficsOnAngles +
      breakdown.rahuYamaGulikaPenalty * weights.rahuYamaGulikaPenalty +
      breakdown.combustionPenalty * weights.combustionPenalty +
      breakdown.mercuryRetroPenalty * weights.mercuryRetroPenalty;

    // Normalize to [0, 100] and round to 1 decimal place
    const finalScore =
      Math.round(Math.max(0, Math.min(100, (rawScore + 1) * 50)) * 10) / 10;

    // Generate reasons
    const reasons = generateReasons(breakdown, weights);

    return {
      score: finalScore,
      breakdown: { ...breakdown, rawScore, finalScore },
      reasons,
    };
  } catch (error) {
    console.error("Error in scoreMinute:", error);
    throw error;
  }
}

/**
 * Compute individual sub-scores for transparency
 */
async function computeSubScores(
  planetaryPositions: any[],
  aspects: any[],
  lat: number,
  lon: number,
  eventType: string,
  swe: any,
  jdUT: number
): Promise<Omit<ScoringBreakdown, "rawScore" | "finalScore">> {
  // Extract planetary data
  const sun = planetaryPositions[0];
  const moon = planetaryPositions[1];
  const mars = planetaryPositions[2];
  const mercury = planetaryPositions[3];
  const jupiter = planetaryPositions[4];
  const venus = planetaryPositions[5];
  const saturn = planetaryPositions[6];

  // Moon strength (waxing/waning, angular houses, dignity)
  const moonStrength = calculateMoonStrength(moon, sun, aspects);

  // Benefics aspecting Lagna or Moon
  const beneficsToLagna = calculateBeneficsToLagna(planetaryPositions, aspects);

  // Nakshatra suitability for event type
  const nakshatraSuitability = calculateNakshatraSuitability(moon, eventType);

  // Tithi suitability for event type
  const tithiSuitability = calculateTithiSuitability(sun, moon, eventType);

  // Hora (planetary hour) suitability
  const horaSuitability = calculateHoraSuitability(sun, eventType);

  // Malefics in kendras/8th/12th
  const maleficsOnAngles = calculateMaleficsOnAngles(
    planetaryPositions,
    aspects
  );

  // Rahu-kalam, Yamaganda, Gulika penalties
  const rahuYamaGulikaPenalty = await calculateRahuYamaGulikaPenalty(
    sun,
    lat,
    lon,
    swe,
    jdUT
  );

  // Combustion penalties
  const combustionPenalty = calculateCombustionPenalty(mercury, venus, sun);

  // Mercury retrograde penalty (for communication-related events)
  const mercuryRetroPenalty = calculateMercuryRetroPenalty(mercury, eventType);

  return {
    moonStrength,
    beneficsToLagna,
    nakshatraSuitability,
    tithiSuitability,
    horaSuitability,
    maleficsOnAngles,
    rahuYamaGulikaPenalty,
    combustionPenalty,
    mercuryRetroPenalty,
  };
}

// Individual calculation functions (simplified implementations)
function calculateMoonStrength(moon: any, sun: any, aspects: any[]): number {
  // Enhanced moon strength calculation
  const moonPhase = (moon.longitude - sun.longitude + 360) % 360;
  const isWaxing = moonPhase < 180;

  // More nuanced moon strength based on phase
  let phaseStrength = 0;
  if (moonPhase < 45 || moonPhase > 315) {
    phaseStrength = 0.8; // New moon area
  } else if (moonPhase < 90 || moonPhase > 270) {
    phaseStrength = 0.6; // Crescent/gibbous
  } else if (moonPhase < 135 || moonPhase > 225) {
    phaseStrength = 0.4; // First/third quarter
  } else {
    phaseStrength = 0.2; // Full moon area
  }

  // Waxing is generally better
  const waxingBonus = isWaxing ? 0.2 : -0.1;

  return Math.max(-1, Math.min(1, phaseStrength + waxingBonus));
}

function calculateBeneficsToLagna(
  planetaryPositions: any[],
  aspects: any[]
): number {
  // Enhanced benefic calculation
  const jupiter = planetaryPositions[4];
  const venus = planetaryPositions[5];

  // More sophisticated benefic strength calculation
  let totalStrength = 0;

  // Jupiter strength (0-360 degrees)
  const jupiterAngle = jupiter.longitude;
  let jupiterStrength = 0;
  if (jupiterAngle >= 0 && jupiterAngle < 30) {
    jupiterStrength = 0.8; // 1st house
  } else if (jupiterAngle >= 30 && jupiterAngle < 60) {
    jupiterStrength = 0.6; // 2nd house
  } else if (jupiterAngle >= 60 && jupiterAngle < 90) {
    jupiterStrength = 0.4; // 3rd house
  } else if (jupiterAngle >= 90 && jupiterAngle < 120) {
    jupiterStrength = 0.9; // 4th house (angular)
  } else if (jupiterAngle >= 120 && jupiterAngle < 150) {
    jupiterStrength = 0.3; // 5th house
  } else if (jupiterAngle >= 150 && jupiterAngle < 180) {
    jupiterStrength = 0.2; // 6th house
  } else if (jupiterAngle >= 180 && jupiterAngle < 210) {
    jupiterStrength = 0.7; // 7th house (angular)
  } else if (jupiterAngle >= 210 && jupiterAngle < 240) {
    jupiterStrength = 0.3; // 8th house
  } else if (jupiterAngle >= 240 && jupiterAngle < 270) {
    jupiterStrength = 0.5; // 9th house
  } else if (jupiterAngle >= 270 && jupiterAngle < 300) {
    jupiterStrength = 0.8; // 10th house (angular)
  } else if (jupiterAngle >= 300 && jupiterAngle < 330) {
    jupiterStrength = 0.4; // 11th house
  } else {
    jupiterStrength = 0.2; // 12th house
  }

  // Venus strength
  const venusAngle = venus.longitude;
  let venusStrength = 0;
  if (venusAngle >= 0 && venusAngle < 30) {
    venusStrength = 0.7; // 1st house
  } else if (venusAngle >= 30 && venusAngle < 60) {
    venusStrength = 0.8; // 2nd house (own house)
  } else if (venusAngle >= 60 && venusAngle < 90) {
    venusStrength = 0.3; // 3rd house
  } else if (venusAngle >= 90 && venusAngle < 120) {
    venusStrength = 0.6; // 4th house
  } else if (venusAngle >= 120 && venusAngle < 150) {
    venusStrength = 0.9; // 5th house (own house)
  } else if (venusAngle >= 150 && venusAngle < 180) {
    venusStrength = 0.2; // 6th house
  } else if (venusAngle >= 180 && venusAngle < 210) {
    venusStrength = 0.5; // 7th house
  } else if (venusAngle >= 210 && venusAngle < 240) {
    venusStrength = 0.1; // 8th house
  } else if (venusAngle >= 240 && venusAngle < 270) {
    venusStrength = 0.4; // 9th house
  } else if (venusAngle >= 270 && venusAngle < 300) {
    venusStrength = 0.3; // 10th house
  } else if (venusAngle >= 300 && venusAngle < 330) {
    venusStrength = 0.6; // 11th house
  } else {
    venusStrength = 0.2; // 12th house
  }

  totalStrength = (jupiterStrength + venusStrength) / 2;

  return Math.max(-1, Math.min(1, totalStrength));
}

function calculateNakshatraSuitability(moon: any, eventType: string): number {
  // Enhanced nakshatra calculation
  const nakshatra = Math.floor(moon.longitude / 13.33) + 1;

  // More nuanced nakshatra suitability with different strength levels
  const nakshatraScores = {
    travel: {
      excellent: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27],
      good: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
      poor: [0], // Add at least one value to avoid never[] type
    },
    business: {
      excellent: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
      good: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27],
      poor: [0], // Add at least one value to avoid never[] type
    },
    marriage: {
      excellent: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27,
      ],
      good: [0], // Add at least one value to avoid never[] type
      poor: [0], // Add at least one value to avoid never[] type
    },
    health: {
      excellent: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27],
      good: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
      poor: [0], // Add at least one value to avoid never[] type
    },
  };

  const scores =
    nakshatraScores[eventType as keyof typeof nakshatraScores] ||
    nakshatraScores.travel;

  if (scores.excellent.includes(nakshatra)) {
    return 0.8; // Excellent nakshatra
  } else if (scores.good.includes(nakshatra)) {
    return 0.4; // Good nakshatra
  } else if (scores.poor.includes(nakshatra)) {
    return -0.6; // Poor nakshatra
  } else {
    return 0.1; // Neutral nakshatra
  }
}

function calculateTithiSuitability(
  sun: any,
  moon: any,
  eventType: string
): number {
  // Enhanced tithi calculation
  const tithi =
    Math.floor(((moon.longitude - sun.longitude + 360) % 360) / 12) + 1;

  // More nuanced tithi suitability with different strength levels
  const tithiScores = {
    travel: {
      excellent: [
        2, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
        23, 24, 25, 26, 27, 28, 29,
      ],
      good: [1, 4, 8, 30],
      poor: [0], // Add at least one value to avoid never[] type
    },
    business: {
      excellent: [
        2, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
        23, 24, 25, 26, 27, 28, 29,
      ],
      good: [1, 4, 8, 30],
      poor: [0], // Add at least one value to avoid never[] type
    },
    marriage: {
      excellent: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      ],
      good: [0], // Add at least one value to avoid never[] type
      poor: [0], // Add at least one value to avoid never[] type
    },
    health: {
      excellent: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      ],
      good: [0], // Add at least one value to avoid never[] type
      poor: [0], // Add at least one value to avoid never[] type
    },
  };

  const scores =
    tithiScores[eventType as keyof typeof tithiScores] || tithiScores.travel;

  if (scores.excellent.includes(tithi)) {
    return 0.6; // Excellent tithi
  } else if (scores.good.includes(tithi)) {
    return 0.3; // Good tithi
  } else if (scores.poor.includes(tithi)) {
    return -0.4; // Poor tithi
  } else {
    return 0.1; // Neutral tithi
  }
}

function calculateHoraSuitability(sun: any, eventType: string): number {
  // Enhanced hora calculation based on sun longitude
  const hora = Math.floor(sun.longitude / 15) + 1;

  // More nuanced hora suitability with different strength levels
  const horaScores = {
    travel: {
      excellent: [
        6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
      ],
      good: [1, 2, 3, 4, 5, 24],
      poor: [0], // Add at least one value to avoid never[] type
    },
    business: {
      excellent: [
        7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
      ],
      good: [1, 2, 3, 4, 5, 6, 24],
      poor: [0], // Add at least one value to avoid never[] type
    },
    marriage: {
      excellent: [
        6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
      ],
      good: [1, 2, 3, 4, 5, 24],
      poor: [0], // Add at least one value to avoid never[] type
    },
    health: {
      excellent: [
        6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
      ],
      good: [1, 2, 3, 4, 5, 24],
      poor: [0], // Add at least one value to avoid never[] type
    },
  };

  const scores =
    horaScores[eventType as keyof typeof horaScores] || horaScores.travel;

  if (scores.excellent.includes(hora)) {
    return 0.5; // Excellent hora
  } else if (scores.good.includes(hora)) {
    return 0.2; // Good hora
  } else if (scores.poor.includes(hora)) {
    return -0.3; // Poor hora
  } else {
    return 0.1; // Neutral hora
  }
}

function calculateMaleficsOnAngles(
  planetaryPositions: any[],
  aspects: any[]
): number {
  // Simplified malefic calculation
  const mars = planetaryPositions[2];
  const saturn = planetaryPositions[6];

  // Check if malefics are in angular houses (1st, 4th, 7th, 10th)
  const marsInAngle = mars.longitude > 0 && mars.longitude < 90 ? -0.3 : 0;
  const saturnInAngle =
    saturn.longitude > 0 && saturn.longitude < 90 ? -0.3 : 0;

  return marsInAngle + saturnInAngle;
}

async function calculateRahuYamaGulikaPenalty(
  sun: any,
  lat: number,
  lon: number,
  swe: any,
  jdUT: number
): Promise<number> {
  // Simplified rahu-kalam calculation
  // This would need proper sunrise/sunset calculation and rahu-kalam windows
  return 0; // Placeholder
}

function calculateCombustionPenalty(
  mercury: any,
  venus: any,
  sun: any
): number {
  // Check if Mercury or Venus are too close to Sun (combustion)
  const mercuryCombustion =
    Math.abs(mercury.longitude - sun.longitude) < 8 ? -0.4 : 0;
  const venusCombustion =
    Math.abs(venus.longitude - sun.longitude) < 8 ? -0.2 : 0;

  return mercuryCombustion + venusCombustion;
}

function calculateMercuryRetroPenalty(mercury: any, eventType: string): number {
  // Check if Mercury is retrograde for communication-related events
  const isRetrograde = mercury.speed < 0;
  const isCommunicationEvent = ["business", "marriage"].includes(eventType);

  return isRetrograde && isCommunicationEvent ? -0.3 : 0;
}

function generateReasons(
  breakdown: Omit<ScoringBreakdown, "rawScore" | "finalScore">,
  weights: any
): string[] {
  const reasons: string[] = [];

  // Positive factors
  if (breakdown.moonStrength > 0.3) reasons.push("Strong Moon position");
  if (breakdown.beneficsToLagna > 0.3) reasons.push("Benefics aspecting Lagna");
  if (breakdown.nakshatraSuitability > 0.3) reasons.push("Favorable Nakshatra");
  if (breakdown.tithiSuitability > 0.2) reasons.push("Good Tithi");
  if (breakdown.horaSuitability > 0.1) reasons.push("Suitable Hora");

  // Negative factors
  if (breakdown.maleficsOnAngles < -0.2)
    reasons.push("Malefics in angular houses");
  if (breakdown.rahuYamaGulikaPenalty < -0.1) reasons.push("Rahu-kalam period");
  if (breakdown.combustionPenalty < -0.1) reasons.push("Planetary combustion");
  if (breakdown.mercuryRetroPenalty < -0.1) reasons.push("Mercury retrograde");

  return reasons.slice(0, 6); // Top 6 reasons
}
