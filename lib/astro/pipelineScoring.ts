import { NatalChart } from "./natalChart";
import { SwissAdapter } from "./swissAdapter";

export interface PipelineScore {
  score: number; // 0-100
  breakdown: {
    panchangScore: number;
    chandraBala: number;
    taraBala: number;
    transitLuminariesAngles: number;
    eventLagna: number;
    moonStrength: number;
    retrogradePenalty: number;
    combustionPenalty: number;
  };
  reasons: string[];
  scoreId: string;
}

export interface PlanetData {
  longitude: number;
  latitude: number;
  speed: number;
  sign: number;
  nakshatra: number;
}

export interface EventChart {
  time: Date;
  lat: number;
  lon: number;
  planets: {
    sun: PlanetData;
    moon: PlanetData;
    mars: PlanetData;
    mercury: PlanetData;
    jupiter: PlanetData;
    venus: PlanetData;
    saturn: PlanetData;
  };
  houses?: {
    ascendant: number;
    mc: number;
    houses: number[];
  };
  panchang: {
    tithi: number;
    nakshatra: number;
    yoga: number;
    karana: number;
    hora: number;
    weekday: number;
    tithiFraction: number;
    nakshatraFraction: number;
    yogaFraction: number;
    karanaFraction: number;
    horaFraction: number;
  };
}

// Configuration weights (normalized to sum to 1.0)
export const PIPELINE_WEIGHTS = {
  panchang: 0.25,
  chandraBala: 0.15,
  taraBala: 0.15,
  transitLuminariesAngles: 0.2,
  eventLagna: 0.15,
  moonStrength: 0.1,
  retrogradePenalty: -0.05,
  combustionPenalty: -0.05,
} as const;

/**
 * Main pipeline scoring function following the specified formula:
 * S = wP*Panchang + wCB*ChandraBala + wTB*TaraBala +
 *     wTA*TransitLuminariesAngles + wEL*EventLagna +
 *     wMS*MoonStrength - wRP*RetrogradePenalty - wCP*CombustionPenalty
 */
export async function scorePipeline(
  natalChart: NatalChart,
  eventChart: EventChart,
  swe: SwissAdapter,
  ephFlag: number,
  activity: string
): Promise<PipelineScore> {
  // Compute all sub-scores (each normalized to [-1, +1])
  const panchangScore = calculatePanchangScore(eventChart.panchang, activity);
  const chandraBala = calculateChandraBala(natalChart, eventChart);
  const taraBala = calculateTaraBala(natalChart, eventChart);
  const transitLuminariesAngles = calculateTransitLuminariesAngles(
    natalChart,
    eventChart
  );
  const eventLagna = calculateEventLagna(natalChart, eventChart);
  const moonStrength = calculateMoonStrength(eventChart);
  const retrogradePenalty = calculateRetrogradePenalty(eventChart, activity);
  const combustionPenalty = calculateCombustionPenalty(eventChart);

  // Apply weights and calculate raw score
  const rawScore =
    panchangScore * PIPELINE_WEIGHTS.panchang +
    chandraBala * PIPELINE_WEIGHTS.chandraBala +
    taraBala * PIPELINE_WEIGHTS.taraBala +
    transitLuminariesAngles * PIPELINE_WEIGHTS.transitLuminariesAngles +
    eventLagna * PIPELINE_WEIGHTS.eventLagna +
    moonStrength * PIPELINE_WEIGHTS.moonStrength +
    retrogradePenalty * PIPELINE_WEIGHTS.retrogradePenalty +
    combustionPenalty * PIPELINE_WEIGHTS.combustionPenalty;

  // Normalize to [0, 100]
  const finalScore =
    Math.round(Math.max(0, Math.min(100, (rawScore + 1) * 50)) * 10) / 10;

  // Debug: Log scoring breakdown for each alternative
  console.log(`Score breakdown for ${eventChart.time.toISOString()}:`, {
    panchangScore,
    chandraBala,
    taraBala,
    transitLuminariesAngles,
    eventLagna,
    moonStrength,
    finalScore,
  });

  // Generate reasons
  const reasons = generateReasons({
    panchangScore,
    chandraBala,
    taraBala,
    transitLuminariesAngles,
    eventLagna,
    moonStrength,
    retrogradePenalty,
    combustionPenalty,
  });

  // Generate score ID for determinism
  const scoreId = generateScoreId(natalChart, eventChart, activity);

  return {
    score: finalScore,
    breakdown: {
      panchangScore,
      chandraBala,
      taraBala,
      transitLuminariesAngles,
      eventLagna,
      moonStrength,
      retrogradePenalty,
      combustionPenalty,
    },
    reasons,
    scoreId,
  };
}

/**
 * PanchangScore P: suitability of tithi/nakshatra/yoga/karana, hora, weekday
 */
function calculatePanchangScore(
  panchang: EventChart["panchang"],
  activity: string
): number {
  let score = 0;

  // Tithi suitability with fractional sensitivity
  const tithiScore = getTithiScore(panchang.tithi, activity);
  const tithiFractionBonus = panchang.tithiFraction * 0.1; // Small bonus for being closer to next tithi
  score += (tithiScore + tithiFractionBonus) * 0.3;

  // Nakshatra suitability with fractional sensitivity
  const nakshatraScore = getNakshatraScore(panchang.nakshatra, activity);
  const nakshatraFractionBonus = panchang.nakshatraFraction * 0.1; // Small bonus for being closer to next nakshatra
  score += (nakshatraScore + nakshatraFractionBonus) * 0.3;

  // Yoga suitability with fractional sensitivity
  const yogaScore = getYogaScore(panchang.yoga, activity);
  const yogaFractionBonus = panchang.yogaFraction * 0.1; // Small bonus for being closer to next yoga
  score += (yogaScore + yogaFractionBonus) * 0.2;

  // Hora suitability with fractional sensitivity
  const horaScore = getHoraScore(panchang.hora, activity);
  const horaFractionBonus = panchang.horaFraction * 0.1; // Small bonus for being closer to next hora
  score += (horaScore + horaFractionBonus) * 0.2;

  return Math.max(-1, Math.min(1, score));
}

/**
 * Chandra Bala: transit Moon vs natal Moon sign
 * Favorable if transit is 1,3,6,7,10,11 from natal
 * Unfavorable 2,4,5,8,9,12
 */
function calculateChandraBala(
  natalChart: NatalChart,
  eventChart: EventChart
): number {
  if (natalChart.level === "L0" || !natalChart.luminaries) {
    return 0; // No natal data available
  }

  const natalMoonSign = natalChart.luminaries.moon.sign;
  const transitMoonSign =
    Math.floor(eventChart.planets.moon.longitude / 30) + 1;

  const relation = ((transitMoonSign - natalMoonSign + 12) % 12) + 1;

  const favorable = [1, 3, 6, 7, 10, 11];
  const unfavorable = [2, 4, 5, 8, 9, 12];

  if (favorable.includes(relation)) {
    return 0.8; // Strong positive
  } else if (unfavorable.includes(relation)) {
    return -0.6; // Strong negative
  } else {
    return 0.1; // Neutral
  }
}

/**
 * Tara Bala: event nakshatra counted from janma nakshatra
 * Boost for Sampat/Kshema/Sadhana/Mitra/Parama-Mitra
 * Penalty for Vipat/Pratyak/Naidhana
 */
function calculateTaraBala(
  natalChart: NatalChart,
  eventChart: EventChart
): number {
  if (natalChart.level === "L0" || !natalChart.luminaries) {
    return 0; // No natal data available
  }

  const natalNakshatra = natalChart.luminaries.moon.nakshatra;
  const eventNakshatra = eventChart.panchang.nakshatra;

  const distance = ((eventNakshatra - natalNakshatra + 27) % 27) + 1;
  const tara = ((distance - 1) % 9) + 1;

  const favorable = [2, 4, 6, 8, 9]; // Sampat, Kshema, Sadhana, Mitra, Parama-Mitra
  const unfavorable = [3, 5, 7]; // Vipat, Pratyak, Naidhana

  if (favorable.includes(tara)) {
    return 0.7; // Positive
  } else if (unfavorable.includes(tara)) {
    return -0.5; // Negative
  } else {
    return 0.1; // Neutral (Janma)
  }
}

/**
 * Transit aspects to natal luminaries & angles
 * Benefics (Jupiter/Venus) trine/sextile/conj to natal ASC/Sun/Moon → positive
 * Malefics (Mars/Saturn) square/opposition/conj to the same → negative
 */
function calculateTransitLuminariesAngles(
  natalChart: NatalChart,
  eventChart: EventChart
): number {
  if (natalChart.level === "L0") {
    return 0; // No natal data available
  }

  let score = 0;

  if (natalChart.luminaries) {
    // Check aspects to natal Sun and Moon
    const natalSun = natalChart.luminaries.sun;
    const natalMoon = natalChart.luminaries.moon;

    // Benefic aspects to natal luminaries
    score += checkBeneficAspects(eventChart.planets.jupiter, natalSun) * 0.3;
    score += checkBeneficAspects(eventChart.planets.jupiter, natalMoon) * 0.3;
    score += checkBeneficAspects(eventChart.planets.venus, natalSun) * 0.2;
    score += checkBeneficAspects(eventChart.planets.venus, natalMoon) * 0.2;

    // Malefic aspects to natal luminaries
    score += checkMaleficAspects(eventChart.planets.mars, natalSun) * 0.3;
    score += checkMaleficAspects(eventChart.planets.mars, natalMoon) * 0.3;
    score += checkMaleficAspects(eventChart.planets.saturn, natalSun) * 0.2;
    score += checkMaleficAspects(eventChart.planets.saturn, natalMoon) * 0.2;
  }

  if (natalChart.houses) {
    // Check aspects to natal ASC and MC
    const natalAsc = natalChart.houses.ascendant;
    const natalMC = natalChart.houses.mc;

    score +=
      checkBeneficAspects(eventChart.planets.jupiter, { longitude: natalAsc }) *
      0.2;
    score +=
      checkBeneficAspects(eventChart.planets.venus, { longitude: natalAsc }) *
      0.2;
    score +=
      checkMaleficAspects(eventChart.planets.mars, { longitude: natalAsc }) *
      0.2;
    score +=
      checkMaleficAspects(eventChart.planets.saturn, { longitude: natalAsc }) *
      0.2;
  }

  return Math.max(-1, Math.min(1, score));
}

/**
 * Event lagna hygiene (L2 only)
 * Keep malefics out of 1/8/12; benefics aspecting lagna/10th → positive
 */
function calculateEventLagna(
  natalChart: NatalChart,
  eventChart: EventChart
): number {
  if (natalChart.level !== "L2" || !eventChart.houses) {
    return 0; // Only for L2 level
  }

  let score = 0;
  const ascendant = eventChart.houses.ascendant;
  const mc = eventChart.houses.mc;

  // Check malefics in 1st, 8th, 12th houses
  const malefics = [eventChart.planets.mars, eventChart.planets.saturn];
  for (const malefic of malefics) {
    const house = getHouseFromLongitude(
      malefic.longitude,
      eventChart.houses.houses
    );
    if ([1, 8, 12].includes(house)) {
      score -= 0.4; // Heavy penalty
    }
  }

  // Check benefics aspecting lagna and 10th house
  const benefics = [eventChart.planets.jupiter, eventChart.planets.venus];
  for (const benefic of benefics) {
    if (checkAspect(benefic.longitude, ascendant, 8)) {
      score += 0.3; // Positive aspect to ASC
    }
    if (checkAspect(benefic.longitude, mc, 8)) {
      score += 0.3; // Positive aspect to MC
    }
  }

  return Math.max(-1, Math.min(1, score));
}

/**
 * Moon strength proxy: waxing, angular house, dignity
 */
function calculateMoonStrength(eventChart: EventChart): number {
  let score = 0;

  // Waxing/waning
  const moonPhase =
    (eventChart.planets.moon.longitude -
      eventChart.planets.sun.longitude +
      360) %
    360;
  const isWaxing = moonPhase < 180;
  score += isWaxing ? 0.3 : -0.1;

  // Angular houses (if houses available)
  if (eventChart.houses) {
    const moonHouse = getHouseFromLongitude(
      eventChart.planets.moon.longitude,
      eventChart.houses.houses
    );
    if ([1, 4, 7, 10].includes(moonHouse)) {
      score += 0.4; // Angular house bonus
    }
  }

  // Dignity
  const moonSign = Math.floor(eventChart.planets.moon.longitude / 30) + 1;
  const dignity = getMoonDignity(moonSign);
  score += dignity === "own" ? 0.3 : dignity === "exaltation" ? 0.2 : 0;

  return Math.max(-1, Math.min(1, score));
}

/**
 * Mercury retrograde penalty (stronger if decision/communication heavy)
 */
function calculateRetrogradePenalty(
  eventChart: EventChart,
  activity: string
): number {
  const isRetrograde = eventChart.planets.mercury.speed < 0;
  if (!isRetrograde) return 0;

  const communicationActivities = [
    "business",
    "marriage",
    "education",
    "interview",
  ];
  const isCommunicationHeavy = communicationActivities.some((act) =>
    activity.toLowerCase().includes(act)
  );

  return isCommunicationHeavy ? -0.6 : -0.3;
}

/**
 * Combustion penalty
 */
function calculateCombustionPenalty(eventChart: EventChart): number {
  let penalty = 0;

  // Mercury combustion
  const mercuryCombustion =
    Math.abs(
      eventChart.planets.mercury.longitude - eventChart.planets.sun.longitude
    ) < 8;
  if (mercuryCombustion) penalty -= 0.3;

  // Venus combustion
  const venusCombustion =
    Math.abs(
      eventChart.planets.venus.longitude - eventChart.planets.sun.longitude
    ) < 8;
  if (venusCombustion) penalty -= 0.2;

  return penalty;
}

// Helper functions
function getTithiScore(tithi: number, _activity: string): number {
  const favorableTithis = [
    2, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29,
  ];
  return favorableTithis.includes(tithi) ? 0.8 : 0.2;
}

function getNakshatraScore(nakshatra: number, _activity: string): number {
  const favorableNakshatras = [
    1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27,
  ];
  return favorableNakshatras.includes(nakshatra) ? 0.8 : 0.2;
}

function getYogaScore(yoga: number, _activity: string): number {
  const favorableYogas = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27,
  ];
  return favorableYogas.includes(yoga) ? 0.6 : 0.2;
}

function getHoraScore(hora: number, _activity: string): number {
  const favorableHoras = [
    6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ];
  return favorableHoras.includes(hora) ? 0.6 : 0.2;
}

function checkBeneficAspects(
  transitPlanet: PlanetData,
  natalPoint: { longitude: number }
): number {
  const aspects = checkAspects(transitPlanet.longitude, natalPoint.longitude);
  let score = 0;

  if (aspects.conjunction) score += 0.3;
  if (aspects.sextile) score += 0.5;
  if (aspects.trine) score += 0.7;

  return score;
}

function checkMaleficAspects(
  transitPlanet: PlanetData,
  natalPoint: { longitude: number }
): number {
  const aspects = checkAspects(transitPlanet.longitude, natalPoint.longitude);
  let score = 0;

  if (aspects.conjunction) score -= 0.4;
  if (aspects.square) score -= 0.6;
  if (aspects.opposition) score -= 0.5;

  return score;
}

function checkAspects(
  transitLong: number,
  natalLong: number
): {
  conjunction: boolean;
  sextile: boolean;
  square: boolean;
  trine: boolean;
  opposition: boolean;
} {
  const diff = Math.abs(transitLong - natalLong);
  const orb = Math.min(diff, 360 - diff);

  return {
    conjunction: orb <= 8,
    sextile: Math.abs(orb - 60) <= 6,
    square: Math.abs(orb - 90) <= 8,
    trine: Math.abs(orb - 120) <= 8,
    opposition: Math.abs(orb - 180) <= 8,
  };
}

function checkAspect(
  planetLong: number,
  pointLong: number,
  orb: number
): boolean {
  const diff = Math.abs(planetLong - pointLong);
  const angle = Math.min(diff, 360 - diff);
  return angle <= orb;
}

function getHouseFromLongitude(longitude: number, houses: number[]): number {
  for (let i = 0; i < houses.length; i++) {
    const nextHouse = houses[(i + 1) % houses.length];
    if (longitude >= houses[i] && longitude < nextHouse) {
      return i + 1;
    }
  }
  return 1; // Default to 1st house
}

function getMoonDignity(
  sign: number
): "own" | "exaltation" | "fall" | "detriment" | "neutral" {
  if (sign === 4) return "own"; // Cancer
  if (sign === 2) return "exaltation"; // Taurus
  if (sign === 8) return "fall"; // Scorpio
  if (sign === 10) return "detriment"; // Capricorn
  return "neutral";
}

function generateReasons(breakdown: PipelineScore["breakdown"]): string[] {
  const reasons: string[] = [];

  if (breakdown.panchangScore > 0.3) reasons.push("Favorable Panchang");
  if (breakdown.chandraBala > 0.3) reasons.push("Strong Chandra Bala");
  if (breakdown.taraBala > 0.3) reasons.push("Beneficial Tara Bala");
  if (breakdown.transitLuminariesAngles > 0.3)
    reasons.push("Positive transit aspects");
  if (breakdown.eventLagna > 0.3) reasons.push("Good event lagna");
  if (breakdown.moonStrength > 0.3) reasons.push("Strong Moon position");

  if (breakdown.retrogradePenalty < -0.2) reasons.push("Mercury retrograde");
  if (breakdown.combustionPenalty < -0.2) reasons.push("Planetary combustion");

  return reasons.slice(0, 6);
}

function generateScoreId(
  natalChart: NatalChart,
  eventChart: EventChart,
  activity: string
): string {
  const data = {
    natalLevel: natalChart.level,
    eventTime: eventChart.time.toISOString(),
    activity,
    version: "1.0.0",
  };

  return Buffer.from(JSON.stringify(data)).toString("base64").substring(0, 16);
}
