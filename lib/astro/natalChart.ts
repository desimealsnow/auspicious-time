import { SwissAdapter, CalcResult } from "./swissAdapter";

// Mock Swiss adapter for fallback
const createMockSwissAdapter = (): SwissAdapter => ({
  julday: (y: number, m: number, d: number, ut: number, cal: number) => {
    // Simple Julian day calculation
    const a = Math.floor((14 - m) / 12);
    const year = y + 4800 - a;
    const month = m + 12 * a - 3;
    return (
      d +
      Math.floor((153 * month + 2) / 5) +
      365 * year +
      Math.floor(year / 4) -
      Math.floor(year / 100) +
      Math.floor(year / 400) -
      32045 +
      ut / 24
    );
  },
  revjul: (jd: number, cal: number) => ({
    year: 2024,
    month: 1,
    day: 1,
    hour: 12,
  }),
  sidtime: (jd: number) => 12,
  get_ayanamsa_ut: (jd: number) => 0,
  set_ephe_path: (path: string) => {},
  set_sid_mode: (mode: number, t0: number, ay: number) => {},
  calc_ut_sync: (jd: number, body: number, flags: number) => ({
    longitude: body * 30, // Simple approximation
    latitude: 0,
    speed: 1,
  }),
  SE_GREG_CAL: 1,
  SEFLG_SWIEPH: 2,
  SEFLG_MOSEPH: 4,
  SEFLG_SPEED: 256,
  SEFLG_SIDEREAL: 64,
  SEFLG_EQUATORIAL: 2048,
  SE_SUN: 0,
  SE_MOON: 1,
  SIDM_LAHIRI: 1,
});

export interface NatalChart {
  level: "L0" | "L1" | "L2";
  birthTime: Date | null;
  birthLat: number;
  birthLon: number;

  // L0: Panchang only
  panchang?: {
    tithi: number;
    nakshatra: number;
    yoga: number;
    karana: number;
    hora: number;
    weekday: number;
  };

  // L1: Add natal Moon and Sun
  luminaries?: {
    sun: {
      longitude: number;
      latitude: number;
      speed: number;
      sign: number;
      nakshatra: number;
    };
    moon: {
      longitude: number;
      latitude: number;
      speed: number;
      sign: number;
      nakshatra: number;
    };
  };

  // L2: Full natal chart with houses
  houses?: {
    ascendant: number;
    mc: number;
    houses: number[]; // 12 house cusps
    lords: number[]; // 12 house lords
  };

  // Planetary positions for all levels
  planets: {
    sun: PlanetPosition;
    moon: PlanetPosition;
    mars: PlanetPosition;
    mercury: PlanetPosition;
    jupiter: PlanetPosition;
    venus: PlanetPosition;
    saturn: PlanetPosition;
  };
}

export interface PlanetPosition {
  longitude: number;
  latitude: number;
  speed: number;
  sign: number;
  nakshatra: number;
  dignity: "own" | "exaltation" | "fall" | "detriment" | "neutral";
}

export interface FallbackConfig {
  hasBirthDate: boolean;
  hasBirthTime: boolean;
  hasBirthLocation: boolean;
}

/**
 * Determine fallback level based on available birth data
 */
export function determineFallbackLevel(
  config: FallbackConfig
): "L0" | "L1" | "L2" {
  if (!config.hasBirthDate) {
    return "L0"; // No DOB: Panchang + generic rules only
  }

  if (!config.hasBirthTime || !config.hasBirthLocation) {
    return "L1"; // DOB, no birth time: Add Chandra Bala + Tara Bala + transits to natal Sun/Moon
  }

  return "L2"; // Full DOB: All modules including houses/angles and event-lagna checks
}

/**
 * Compute natal chart based on fallback level
 */
export async function computeNatalChart(
  swe: SwissAdapter,
  ephFlag: number,
  birthDate: string,
  birthTime: string | null,
  birthLat: number | null,
  birthLon: number | null,
  targetDate: Date
): Promise<NatalChart> {
  // Determine if we have birth time information
  const hasBirthTimeInfo =
    !!birthTime || (birthDate.includes("T") && birthDate.includes("Z"));

  const config: FallbackConfig = {
    hasBirthDate: !!birthDate,
    hasBirthTime: hasBirthTimeInfo,
    hasBirthLocation: birthLat !== null && birthLon !== null,
  };

  const level = determineFallbackLevel(config);

  // Parse birth date with validation
  // Check if birthDate is already a complete ISO string
  let birthDateTime: Date;
  if (birthDate.includes("T")) {
    // Already a complete ISO string
    birthDateTime = new Date(birthDate);
  } else {
    // Construct from separate date and time
    birthDateTime = birthTime
      ? new Date(`${birthDate}T${birthTime}`)
      : new Date(`${birthDate}T12:00:00`); // Default to noon if no time
  }

  // Validate the parsed date
  if (isNaN(birthDateTime.getTime())) {
    console.error("Date parsing failed:", {
      birthDate,
      birthTime,
      parsedDate: birthDateTime,
      hasTime: birthDate.includes("T"),
    });
    throw new Error(
      `Invalid birth date format: ${birthDate}${
        birthTime ? `T${birthTime}` : ""
      }`
    );
  }

  // Calculate Julian Day for birth
  const year = birthDateTime.getUTCFullYear();
  const month = birthDateTime.getUTCMonth() + 1;
  const day = birthDateTime.getUTCDate();
  const hours =
    birthDateTime.getUTCHours() + birthDateTime.getUTCMinutes() / 60;

  console.log("Date components for julday:", {
    birthDate,
    birthTime,
    birthDateTime: birthDateTime.toISOString(),
    year,
    month,
    day,
    hours,
    yearType: typeof year,
    monthType: typeof month,
    dayType: typeof day,
    hoursType: typeof hours,
  });

  // Validate all components are numbers
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours)) {
    throw new Error(
      `Invalid date components: year=${year}, month=${month}, day=${day}, hours=${hours}`
    );
  }

  const jdBirth = swe.julday(year, month, day, hours, swe.SE_GREG_CAL);

  // Get planetary positions at birth
  console.log("Calculating planetary positions for JD:", jdBirth);
  const birthPlanets = await calculatePlanetaryPositions(swe, jdBirth, ephFlag);
  console.log(
    "Birth planets result:",
    birthPlanets.length,
    "planets calculated"
  );
  console.log("First planet (Sun):", birthPlanets[0]);

  // Calculate Panchang at target time (for L0)
  const panchang =
    level === "L0"
      ? await calculatePanchang(swe, ephFlag, targetDate)
      : undefined;

  // Calculate luminaries for L1+
  const luminaries =
    level === "L1" || level === "L2"
      ? {
          sun: birthPlanets[0]
            ? {
                longitude: birthPlanets[0].longitude,
                latitude: birthPlanets[0].latitude,
                speed: birthPlanets[0].speed,
                sign: Math.floor(birthPlanets[0].longitude / 30) + 1,
                nakshatra: Math.floor(birthPlanets[0].longitude / 13.33) + 1,
              }
            : {
                longitude: 0,
                latitude: 0,
                speed: 0,
                sign: 1,
                nakshatra: 1,
              },
          moon: birthPlanets[1]
            ? {
                longitude: birthPlanets[1].longitude,
                latitude: birthPlanets[1].latitude,
                speed: birthPlanets[1].speed,
                sign: Math.floor(birthPlanets[1].longitude / 30) + 1,
                nakshatra: Math.floor(birthPlanets[1].longitude / 13.33) + 1,
              }
            : {
                longitude: 0,
                latitude: 0,
                speed: 0,
                sign: 1,
                nakshatra: 1,
              },
        }
      : undefined;

  // Calculate houses for L2
  const houses =
    level === "L2" && birthLat !== null && birthLon !== null
      ? await calculateHouses(swe, jdBirth, birthLat, birthLon, ephFlag)
      : undefined;

  return {
    level,
    birthTime: birthTime ? birthDateTime : null,
    birthLat: birthLat || 0,
    birthLon: birthLon || 0,
    panchang,
    luminaries,
    houses,
    planets: {
      sun: birthPlanets[0] || {
        longitude: 0,
        latitude: 0,
        speed: 0,
        sign: 1,
        nakshatra: 1,
        dignity: "neutral",
      },
      moon: birthPlanets[1] || {
        longitude: 0,
        latitude: 0,
        speed: 0,
        sign: 1,
        nakshatra: 1,
        dignity: "neutral",
      },
      mars: birthPlanets[2] || {
        longitude: 0,
        latitude: 0,
        speed: 0,
        sign: 1,
        nakshatra: 1,
        dignity: "neutral",
      },
      mercury: birthPlanets[3] || {
        longitude: 0,
        latitude: 0,
        speed: 0,
        sign: 1,
        nakshatra: 1,
        dignity: "neutral",
      },
      jupiter: birthPlanets[4] || {
        longitude: 0,
        latitude: 0,
        speed: 0,
        sign: 1,
        nakshatra: 1,
        dignity: "neutral",
      },
      venus: birthPlanets[5] || {
        longitude: 0,
        latitude: 0,
        speed: 0,
        sign: 1,
        nakshatra: 1,
        dignity: "neutral",
      },
      saturn: birthPlanets[6] || {
        longitude: 0,
        latitude: 0,
        speed: 0,
        sign: 1,
        nakshatra: 1,
        dignity: "neutral",
      },
    },
  };
}

/**
 * Calculate planetary positions at a given time
 */
async function calculatePlanetaryPositions(
  swe: SwissAdapter,
  jd: number,
  ephFlag: number
): Promise<PlanetPosition[]> {
  const planetIds = [0, 1, 2, 3, 4, 5, 6]; // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
  const positions: PlanetPosition[] = [];

  console.log("Starting planetary calculations with:", {
    jd,
    ephFlag,
    hasCalcUtAsync: !!swe.calc_ut_async,
    planetCount: planetIds.length,
  });

  for (const planetId of planetIds) {
    try {
      console.log(`Calculating planet ${planetId}...`);
      let result: CalcResult;
      if (swe.calc_ut_async) {
        result = await swe.calc_ut_async(jd, planetId, ephFlag);
      } else if (swe.calc_ut_sync) {
        result = swe.calc_ut_sync(jd, planetId, ephFlag);
      } else {
        throw new Error(
          `Neither calc_ut_async nor calc_ut_sync is available on Swiss adapter`
        );
      }
      console.log(`Planet ${planetId} result:`, result);
      if (result) {
        const longitude = Array.isArray(result)
          ? result[0]
          : result.longitude || result.lon || 0;
        const latitude = Array.isArray(result)
          ? result[1]
          : result.latitude || result.lat || 0;
        const speed = Array.isArray(result)
          ? result[3]
          : result.speed || result.vel || 0;
        const sign = Math.floor(longitude / 30) + 1;
        const nakshatra = Math.floor(longitude / 13.33) + 1;

        positions.push({
          longitude,
          latitude,
          speed,
          sign,
          nakshatra,
          dignity: calculateDignity(planetId, sign),
        });
      }
    } catch (error) {
      console.warn(`Failed to calculate planet ${planetId}:`, error);
      // Add default position
      positions.push({
        longitude: 0,
        latitude: 0,
        speed: 0,
        sign: 1,
        nakshatra: 1,
        dignity: "neutral",
      });
    }
  }

  return positions;
}

/**
 * Calculate planetary dignity
 */
function calculateDignity(
  planetId: number,
  sign: number
): PlanetPosition["dignity"] {
  const dignities: {
    [key: number]: {
      own: number[];
      exaltation: number[];
      fall: number[];
      detriment: number[];
    };
  } = {
    0: { own: [5], exaltation: [1], fall: [7], detriment: [11] }, // Sun
    1: { own: [4], exaltation: [2], fall: [8], detriment: [10] }, // Moon
    2: { own: [1, 8], exaltation: [10], fall: [4], detriment: [7] }, // Mars
    3: { own: [3, 6], exaltation: [6], fall: [12], detriment: [9] }, // Mercury
    4: { own: [9, 12], exaltation: [4], fall: [10], detriment: [3] }, // Jupiter
    5: { own: [2, 7], exaltation: [12], fall: [6], detriment: [1] }, // Venus
    6: { own: [10, 11], exaltation: [7], fall: [1], detriment: [4] }, // Saturn
  };

  const planetDignities = dignities[planetId];
  if (planetDignities.own.includes(sign)) return "own";
  if (planetDignities.exaltation.includes(sign)) return "exaltation";
  if (planetDignities.fall.includes(sign)) return "fall";
  if (planetDignities.detriment.includes(sign)) return "detriment";
  return "neutral";
}

/**
 * Calculate Panchang at target time
 */
async function calculatePanchang(
  swe: SwissAdapter,
  ephFlag: number,
  targetDate: Date
): Promise<NatalChart["panchang"]> {
  try {
    const jd = swe.julday(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth() + 1,
      targetDate.getUTCDate(),
      targetDate.getUTCHours() + targetDate.getUTCMinutes() / 60,
      swe.SE_GREG_CAL
    );

    let sun: CalcResult;
    let moon: CalcResult;

    console.log("Panchang calculation - JD:", jd, "ephFlag:", ephFlag);
    console.log("Available methods:", {
      hasCalcUtAsync: !!swe.calc_ut_async,
      hasCalcUtSync: !!swe.calc_ut_sync,
    });

    if (swe.calc_ut_async) {
      console.log("Using calc_ut_async for Panchang");
      sun = await swe.calc_ut_async(jd, 0, ephFlag);
      moon = await swe.calc_ut_async(jd, 1, ephFlag);
    } else if (swe.calc_ut_sync) {
      console.log("Using calc_ut_sync for Panchang");
      sun = swe.calc_ut_sync(jd, 0, ephFlag);
      moon = swe.calc_ut_sync(jd, 1, ephFlag);
    } else {
      throw new Error(
        "Neither calc_ut_async nor calc_ut_sync is available for Panchang calculation"
      );
    }

    console.log("Sun result:", sun);
    console.log("Moon result:", moon);

    if (!sun || !moon || typeof sun !== "object" || typeof moon !== "object") {
      console.warn("Swiss Ephemeris calculation failed, using fallback values");
      // Use fallback values for Panchang calculation
      return {
        tithi: 1,
        nakshatra: 1,
        yoga: 1,
        karana: 1,
        hora: 1,
        weekday: 1,
      };
    }

    const sunLong = Array.isArray(sun) ? sun[0] : sun.longitude || sun.lon || 0;
    const moonLong = Array.isArray(moon)
      ? moon[0]
      : moon.longitude || moon.lon || 0;

    // Calculate Tithi (lunar day)
    const tithi = Math.floor(((moonLong - sunLong + 360) % 360) / 12) + 1;

    // Calculate Nakshatra (lunar mansion)
    const nakshatra = Math.floor(moonLong / 13.33) + 1;

    // Calculate Yoga (simplified)
    const yoga = Math.floor((sunLong + moonLong) / 13.33) + 1;

    // Calculate Karana (simplified)
    const karana = Math.floor(((moonLong - sunLong + 360) % 360) / 6) + 1;

    // Calculate Hora (planetary hour)
    const hora = Math.floor(sunLong / 15) + 1;

    // Calculate weekday (0 = Sunday, 1 = Monday, etc.)
    const weekday = targetDate.getUTCDay();

    return {
      tithi,
      nakshatra,
      yoga,
      karana,
      hora,
      weekday,
    };
  } catch (error) {
    console.warn("Panchang calculation failed, using fallback values:", error);
    return {
      tithi: 1,
      nakshatra: 1,
      yoga: 1,
      karana: 1,
      hora: 1,
      weekday: 1,
    };
  }
}

/**
 * Calculate houses for L2 level
 */
async function calculateHouses(
  _swe: SwissAdapter,
  _jd: number,
  _lat: number,
  _lon: number,
  _ephFlag: number
): Promise<NatalChart["houses"]> {
  // For now, use simplified house calculation
  // In a full implementation, you would use a proper houses calculation library
  const ascendant = 0; // Simplified - would need proper calculation
  const mc = 0; // Simplified - would need proper calculation
  const houseCusps = Array.from({ length: 12 }, (_, i) => i * 30); // Simplified

  // Calculate house lords (simplified - just based on sign)
  const _lords = houseCusps.map((cusp: number) => {
    const sign = Math.floor(cusp / 30) + 1;
    return getHouseLord(sign);
  });

  return {
    ascendant,
    mc,
    houses: houseCusps,
    lords: _lords,
  };
}

/**
 * Get house lord based on sign
 */
function getHouseLord(sign: number): number {
  const signLords = [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4]; // Aries to Pisces
  return signLords[sign - 1] || 0;
}
