/**
 * Enhanced Swiss Ephemeris calculations for activity-based astrological analysis
 * Provides comprehensive planetary analysis suitable for global audience
 */

import type { SwissAdapter, CalcResult } from "./swissAdapter";

// Planet constants for Swiss Ephemeris
export const PLANETS = {
  SUN: 0,
  MOON: 1,
  MERCURY: 2,
  VENUS: 3,
  MARS: 4,
  JUPITER: 5,
  SATURN: 6,
  URANUS: 7,
  NEPTUNE: 8,
  PLUTO: 9,
  NORTH_NODE: 10, // Rahu
  SOUTH_NODE: 11, // Ketu
  CHIRON: 15,
  ASCENDING_NODE: 10,
} as const;

// Activity-Planet correlations for global audience
export const ACTIVITY_PLANET_MAP = {
  // Business & Career
  new_business: {
    primary: [PLANETS.MERCURY, PLANETS.JUPITER],
    supportive: [PLANETS.SUN, PLANETS.VENUS],
    avoid: [PLANETS.SATURN, PLANETS.MARS],
  },
  career_change: {
    primary: [PLANETS.SUN, PLANETS.JUPITER],
    supportive: [PLANETS.MERCURY],
    avoid: [PLANETS.SATURN],
  },
  financial_investment: {
    primary: [PLANETS.JUPITER, PLANETS.VENUS],
    supportive: [PLANETS.MERCURY],
    avoid: [PLANETS.MARS, PLANETS.SATURN],
  },

  // Relationships & Personal
  marriage: {
    primary: [PLANETS.VENUS, PLANETS.JUPITER],
    supportive: [PLANETS.MOON],
    avoid: [PLANETS.MARS, PLANETS.SATURN, PLANETS.NORTH_NODE],
  },
  proposal: {
    primary: [PLANETS.VENUS],
    supportive: [PLANETS.JUPITER, PLANETS.MOON],
    avoid: [PLANETS.MARS],
  },
  relationship_talks: {
    primary: [PLANETS.VENUS, PLANETS.MERCURY],
    supportive: [PLANETS.MOON],
    avoid: [PLANETS.MARS],
  },

  // Health & Wellness
  medical_procedure: {
    primary: [PLANETS.SUN],
    supportive: [PLANETS.JUPITER],
    avoid: [PLANETS.MARS, PLANETS.SATURN, PLANETS.NORTH_NODE],
  },
  health_treatment: {
    primary: [PLANETS.SUN, PLANETS.JUPITER],
    supportive: [PLANETS.MOON],
    avoid: [PLANETS.MARS, PLANETS.SATURN],
  },
  surgery: {
    primary: [PLANETS.MARS],
    supportive: [PLANETS.SUN],
    avoid: [PLANETS.MOON, PLANETS.NORTH_NODE],
  },

  // Education & Communication
  exam: {
    primary: [PLANETS.MERCURY, PLANETS.JUPITER],
    supportive: [PLANETS.SUN],
    avoid: [PLANETS.SATURN, PLANETS.MARS],
  },
  learning: {
    primary: [PLANETS.MERCURY],
    supportive: [PLANETS.JUPITER, PLANETS.SUN],
    avoid: [PLANETS.SATURN],
  },
  presentation: {
    primary: [PLANETS.MERCURY, PLANETS.SUN],
    supportive: [PLANETS.JUPITER],
    avoid: [PLANETS.SATURN],
  },

  // Travel & Movement
  travel: {
    primary: [PLANETS.MERCURY, PLANETS.JUPITER],
    supportive: [PLANETS.MOON],
    avoid: [PLANETS.MARS, PLANETS.SATURN, PLANETS.NORTH_NODE],
  },
  relocation: {
    primary: [PLANETS.MOON, PLANETS.JUPITER],
    supportive: [PLANETS.MERCURY],
    avoid: [PLANETS.SATURN, PLANETS.MARS],
  },

  // Spiritual & Personal Growth
  spiritual_practice: {
    primary: [PLANETS.JUPITER, PLANETS.NEPTUNE],
    supportive: [PLANETS.MOON, PLANETS.SUN],
    avoid: [PLANETS.MARS],
  },
  meditation: {
    primary: [PLANETS.NEPTUNE, PLANETS.MOON],
    supportive: [PLANETS.JUPITER],
    avoid: [PLANETS.MARS],
  },

  // General/Default
  general: {
    primary: [PLANETS.SUN, PLANETS.MOON],
    supportive: [PLANETS.JUPITER],
    avoid: [PLANETS.SATURN, PLANETS.MARS],
  },
} as const;

// Aspect angles (in degrees)
export const ASPECTS = {
  CONJUNCTION: { angle: 0, orb: 8, type: "major", nature: "neutral" },
  SEXTILE: { angle: 60, orb: 6, type: "major", nature: "positive" },
  SQUARE: { angle: 90, orb: 8, type: "major", nature: "challenging" },
  TRINE: { angle: 120, orb: 8, type: "major", nature: "positive" },
  OPPOSITION: { angle: 180, orb: 8, type: "major", nature: "challenging" },
  SEMI_SEXTILE: { angle: 30, orb: 3, type: "minor", nature: "neutral" },
  SEMI_SQUARE: { angle: 45, orb: 3, type: "minor", nature: "challenging" },
  SESQUIQUADRATE: { angle: 135, orb: 3, type: "minor", nature: "challenging" },
  QUINCUNX: { angle: 150, orb: 3, type: "minor", nature: "challenging" },
} as const;

export interface PlanetPosition {
  planet: keyof typeof PLANETS;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  sign: number; // 1-12 (Aries to Pisces)
  degree: number; // 0-30 within sign
}

export interface AspectData {
  planet1: keyof typeof PLANETS;
  planet2: keyof typeof PLANETS;
  aspect: keyof typeof ASPECTS;
  orb: number;
  applying: boolean;
  strength: "strong" | "medium" | "weak";
}

export interface ActivityAnalysis {
  activity: string;
  score: number; // 0-100
  recommendation: "EXCELLENT" | "GOOD" | "NEUTRAL" | "CHALLENGING" | "AVOID";
  primaryFactors: string[];
  supportiveFactors: string[];
  challengingFactors: string[];
  planetaryStrengths: Array<{
    planet: string;
    strength: number;
    reason: string;
  }>;
  significantAspects: AspectData[];
  globalInterpretation: string;
}

// Calculate all planetary positions
export async function calculatePlanetaryPositions(
  swe: SwissAdapter,
  jdUT: number,
  ephFlag: number
): Promise<PlanetPosition[]> {
  const positions: PlanetPosition[] = [];

  const getCalc = async (
    ipl: number,
    flags: number
  ): Promise<CalcResult | undefined> => {
    try {
      return (
        swe.calc_ut_sync?.(jdUT, ipl, flags) ??
        (await swe.calc_ut_async?.(jdUT, ipl, flags))
      );
    } catch (error) {
      console.warn(`Calculation error for planet ${ipl}:`, error);
      return undefined;
    }
  };

  // Calculate main planets (start with just Sun and Moon for debugging)
  const planetIds = [
    PLANETS.SUN,
    PLANETS.MOON,
    // Add other planets gradually
    PLANETS.MERCURY,
    PLANETS.VENUS,
    PLANETS.MARS,
    PLANETS.JUPITER,
    PLANETS.SATURN,
  ];

  for (const planetId of planetIds) {
    try {
      const result = await getCalc(planetId, ephFlag | swe.SEFLG_SPEED);

      if (!result) {
        console.warn(`No result for planet ${planetId}`);
        continue;
      }

      if (Array.isArray(result) && result.length === 0) {
        console.warn(`Empty result array for planet ${planetId}`);
        continue;
      }

      if (
        !Array.isArray(result) &&
        result &&
        "error" in result &&
        result.error
      ) {
        console.warn(`Error calculating planet ${planetId}: ${result.error}`);
        continue;
      }

      const longitude = extractLongitude(result);
      const latitude = extractLatitude(result);
      const speed = extractSpeed(result);

      console.log(`Planet ${planetId} extracted:`, {
        longitude,
        latitude,
        speed,
      });

      if (longitude !== undefined && latitude !== undefined) {
        const sign = Math.floor(longitude / 30) + 1; // 1-12
        const degree = longitude % 30;
        const retrograde = (speed ?? 0) < 0;

        const planetName = Object.keys(PLANETS)[
          Object.values(PLANETS).indexOf(planetId)
        ] as keyof typeof PLANETS;

        positions.push({
          planet: planetName,
          longitude,
          latitude,
          speed: speed ?? 0,
          retrograde,
          sign,
          degree,
        });
      } else {
        console.warn(`Invalid coordinates for planet ${planetId}:`, {
          longitude,
          latitude,
        });
      }
    } catch (error) {
      console.warn(`Failed to calculate planet ${planetId}:`, error);
    }
  }

  return positions;
}

// Calculate aspects between planets
export function calculateAspects(positions: PlanetPosition[]): AspectData[] {
  const aspects: AspectData[] = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];

      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      // Check for aspects
      for (const [aspectName, aspectData] of Object.entries(ASPECTS)) {
        const orb = Math.abs(diff - aspectData.angle);

        if (orb <= aspectData.orb) {
          const applying = isAspectApplying(p1, p2, aspectData.angle);
          const strength = getAspectStrength(orb, aspectData.orb);

          aspects.push({
            planet1: p1.planet,
            planet2: p2.planet,
            aspect: aspectName as keyof typeof ASPECTS,
            orb,
            applying,
            strength,
          });
        }
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb); // Sort by closest orb
}

// Analyze activity timing based on planetary positions and aspects
export function analyzeActivityTiming(
  activity: string,
  positions: PlanetPosition[],
  aspects: AspectData[]
): ActivityAnalysis {
  const activityKey = activity.toLowerCase().replace(/\s+/g, "_");
  const activityMap =
    ACTIVITY_PLANET_MAP[activityKey as keyof typeof ACTIVITY_PLANET_MAP] ||
    ACTIVITY_PLANET_MAP.general;

  let score = 50; // Start neutral
  const primaryFactors: string[] = [];
  const supportiveFactors: string[] = [];
  const challengingFactors: string[] = [];
  const planetaryStrengths: Array<{
    planet: string;
    strength: number;
    reason: string;
  }> = [];
  const significantAspects = aspects.filter((asp) => asp.strength !== "weak");

  // Analyze primary planets for this activity
  for (const planetId of activityMap.primary) {
    const planetName = Object.keys(PLANETS)[
      Object.values(PLANETS).indexOf(planetId)
    ] as keyof typeof PLANETS;
    const position = positions.find((p) => p.planet === planetName);

    if (position) {
      const strength = calculatePlanetaryStrength(position, aspects);
      planetaryStrengths.push({
        planet: getGlobalPlanetName(planetName),
        strength,
        reason: getPlanetStrengthReason(position, aspects, activityKey),
      });

      if (strength > 70) {
        score += 20;
        primaryFactors.push(
          `Strong ${getGlobalPlanetName(planetName)} supports ${activity}`
        );
      } else if (strength > 50) {
        score += 10;
        supportiveFactors.push(
          `Favorable ${getGlobalPlanetName(planetName)} position`
        );
      } else if (strength < 30) {
        score -= 15;
        challengingFactors.push(
          `Weakened ${getGlobalPlanetName(planetName)} may create obstacles`
        );
      }
    }
  }

  // Analyze supportive planets
  for (const planetId of activityMap.supportive) {
    const planetName = Object.keys(PLANETS)[
      Object.values(PLANETS).indexOf(planetId)
    ] as keyof typeof PLANETS;
    const position = positions.find((p) => p.planet === planetName);

    if (position) {
      const strength = calculatePlanetaryStrength(position, aspects);
      if (strength > 60) {
        score += 8;
        supportiveFactors.push(
          `Supportive ${getGlobalPlanetName(planetName)} influence`
        );
      }
    }
  }

  // Analyze planets to avoid
  for (const planetId of activityMap.avoid) {
    const planetName = Object.keys(PLANETS)[
      Object.values(PLANETS).indexOf(planetId)
    ] as keyof typeof PLANETS;
    const position = positions.find((p) => p.planet === planetName);

    if (position) {
      const strength = calculatePlanetaryStrength(position, aspects);
      if (strength > 60) {
        score -= 12;
        challengingFactors.push(
          `Strong ${getGlobalPlanetName(planetName)} creates challenging energy`
        );
      }
    }
  }

  // Analyze significant aspects
  for (const aspect of significantAspects) {
    const aspectInfluence = getAspectInfluence(aspect, activityKey);
    score += aspectInfluence.scoreChange;

    if (aspectInfluence.scoreChange > 0) {
      supportiveFactors.push(aspectInfluence.description);
    } else if (aspectInfluence.scoreChange < 0) {
      challengingFactors.push(aspectInfluence.description);
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  const recommendation = getRecommendation(score);
  const globalInterpretation = generateGlobalInterpretation(
    activity,
    score,
    primaryFactors,
    challengingFactors
  );

  return {
    activity,
    score,
    recommendation,
    primaryFactors,
    supportiveFactors,
    challengingFactors,
    planetaryStrengths,
    significantAspects,
    globalInterpretation,
  };
}

// Helper functions
function extractLongitude(result: CalcResult): number | undefined {
  if (Array.isArray(result)) return result[0];
  if (typeof result === "object" && result !== null) {
    return (
      result.longitude ??
      result.lon ??
      (result as { data?: number[] }).data?.[0]
    );
  }
  return undefined;
}

function extractLatitude(result: CalcResult): number | undefined {
  if (Array.isArray(result)) return result[1];
  if (typeof result === "object" && result !== null) {
    return (
      result.latitude ?? result.lat ?? (result as { data?: number[] }).data?.[1]
    );
  }
  return undefined;
}

function extractSpeed(result: CalcResult): number | undefined {
  if (Array.isArray(result)) return result[3];
  if (typeof result === "object" && result !== null) {
    return (
      result.speed ?? result.vel ?? (result as { data?: number[] }).data?.[3]
    );
  }
  return undefined;
}

function isAspectApplying(
  p1: PlanetPosition,
  p2: PlanetPosition,
  _aspectAngle: number
): boolean {
  // Simplified: faster planet is approaching slower planet
  if (Math.abs(p1.speed) > Math.abs(p2.speed)) {
    return true; // Assume applying for simplicity
  }
  return false;
}

function getAspectStrength(
  orb: number,
  maxOrb: number
): "strong" | "medium" | "weak" {
  const percentage = orb / maxOrb;
  if (percentage <= 0.3) return "strong";
  if (percentage <= 0.7) return "medium";
  return "weak";
}

function calculatePlanetaryStrength(
  position: PlanetPosition,
  aspects: AspectData[]
): number {
  let strength = 50; // Base strength

  // Add strength based on sign (simplified)
  // This would be enhanced with actual dignity tables
  if (position.sign === 1 || position.sign === 5 || position.sign === 9) {
    // Fire signs
    strength += 10;
  }

  // Retrograde consideration
  if (
    position.retrograde &&
    position.planet !== "SUN" &&
    position.planet !== "MOON"
  ) {
    strength -= 10;
  }

  // Aspect influences
  const planetAspects = aspects.filter(
    (a) => a.planet1 === position.planet || a.planet2 === position.planet
  );
  for (const aspect of planetAspects) {
    const aspectData = ASPECTS[aspect.aspect];
    if (aspectData.nature === "positive" && aspect.strength !== "weak") {
      strength += aspect.strength === "strong" ? 15 : 8;
    } else if (
      aspectData.nature === "challenging" &&
      aspect.strength !== "weak"
    ) {
      strength -= aspect.strength === "strong" ? 12 : 6;
    }
  }

  return Math.max(0, Math.min(100, strength));
}

function getPlanetStrengthReason(
  position: PlanetPosition,
  aspects: AspectData[],
  _activity: string
): string {
  const reasons: string[] = [];

  if (
    position.retrograde &&
    position.planet !== "SUN" &&
    position.planet !== "MOON"
  ) {
    reasons.push("retrograde motion");
  }

  const planetAspects = aspects.filter(
    (a) =>
      (a.planet1 === position.planet || a.planet2 === position.planet) &&
      a.strength !== "weak"
  );

  const positiveAspects = planetAspects.filter(
    (a) => ASPECTS[a.aspect].nature === "positive"
  );
  const challengingAspects = planetAspects.filter(
    (a) => ASPECTS[a.aspect].nature === "challenging"
  );

  if (positiveAspects.length > 0) {
    reasons.push(`favorable aspects from ${positiveAspects.length} planet(s)`);
  }
  if (challengingAspects.length > 0) {
    reasons.push(
      `challenging aspects from ${challengingAspects.length} planet(s)`
    );
  }

  return reasons.length > 0 ? reasons.join(", ") : "current positioning";
}

function getGlobalPlanetName(planet: keyof typeof PLANETS): string {
  const globalNames = {
    SUN: "Sun",
    MOON: "Moon",
    MERCURY: "Mercury",
    VENUS: "Venus",
    MARS: "Mars",
    JUPITER: "Jupiter",
    SATURN: "Saturn",
    URANUS: "Uranus",
    NEPTUNE: "Neptune",
    PLUTO: "Pluto",
    NORTH_NODE: "North Node",
    SOUTH_NODE: "South Node",
  };
  return globalNames[planet as keyof typeof globalNames] || planet;
}

function getAspectInfluence(
  aspect: AspectData,
  _activity: string
): { scoreChange: number; description: string } {
  const aspectData = ASPECTS[aspect.aspect];
  const planet1Name = getGlobalPlanetName(aspect.planet1);
  const planet2Name = getGlobalPlanetName(aspect.planet2);

  let baseChange = 0;
  if (aspectData.nature === "positive") {
    baseChange =
      aspect.strength === "strong" ? 12 : aspect.strength === "medium" ? 8 : 4;
  } else if (aspectData.nature === "challenging") {
    baseChange = -(aspect.strength === "strong"
      ? 10
      : aspect.strength === "medium"
      ? 6
      : 3);
  }

  const description = `${planet1Name}-${planet2Name} ${aspect.aspect
    .toLowerCase()
    .replace("_", " ")} ${
    aspectData.nature === "positive" ? "supports" : "challenges"
  } your timing`;

  return { scoreChange: baseChange, description };
}

function getRecommendation(
  score: number
): "EXCELLENT" | "GOOD" | "NEUTRAL" | "CHALLENGING" | "AVOID" {
  if (score >= 80) return "EXCELLENT";
  if (score >= 65) return "GOOD";
  if (score >= 45) return "NEUTRAL";
  if (score >= 30) return "CHALLENGING";
  return "AVOID";
}

function generateGlobalInterpretation(
  activity: string,
  score: number,
  primaryFactors: string[],
  challengingFactors: string[]
): string {
  const recommendation = getRecommendation(score);

  let interpretation = `For ${activity}, the current planetary alignments show ${recommendation.toLowerCase()} timing`;

  if (recommendation === "EXCELLENT" || recommendation === "GOOD") {
    interpretation += ` with strong cosmic support. ${primaryFactors
      .slice(0, 2)
      .join(" and ")}.`;
  } else if (recommendation === "CHALLENGING" || recommendation === "AVOID") {
    interpretation += ` with significant obstacles. Consider postponing as ${challengingFactors
      .slice(0, 2)
      .join(" and ")}.`;
  } else {
    interpretation += ` with mixed influences. Proceed with awareness and preparation.`;
  }

  return interpretation;
}
