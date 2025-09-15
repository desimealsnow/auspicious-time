import { SwissAdapter, CalcResult } from "./swissAdapter";
import { EventChart } from "./pipelineScoring";

/**
 * Compute event chart at a specific time and location
 */
export async function computeEventChart(
  swe: SwissAdapter,
  ephFlag: number,
  eventTime: Date,
  lat: number,
  lon: number
): Promise<EventChart> {
  // Validate event time
  if (isNaN(eventTime.getTime())) {
    throw new Error(`Invalid event time: ${eventTime}`);
  }

  // Calculate Julian Day
  const year = eventTime.getUTCFullYear();
  const month = eventTime.getUTCMonth() + 1;
  const day = eventTime.getUTCDate();
  const hours = eventTime.getUTCHours() + eventTime.getUTCMinutes() / 60;

  // Validate all components are numbers
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours)) {
    throw new Error(
      `Invalid event time components: year=${year}, month=${month}, day=${day}, hours=${hours}`
    );
  }

  const jd = swe.julday(year, month, day, hours, swe.SE_GREG_CAL);

  if (!Number.isFinite(jd)) {
    throw new Error("Invalid Julian Day calculation");
  }

  // Get planetary positions
  const planets = await calculateEventPlanetaryPositions(swe, jd, ephFlag);

  // Calculate houses (simplified for now)
  const houses = await calculateEventHouses(swe, jd, lat, lon, ephFlag);

  // Calculate Panchang
  const panchang = await calculateEventPanchang(swe, jd, ephFlag, eventTime);

  return {
    time: eventTime,
    lat,
    lon,
    planets,
    houses,
    panchang,
  };
}

/**
 * Calculate planetary positions for event time
 */
async function calculateEventPlanetaryPositions(
  swe: SwissAdapter,
  jd: number,
  ephFlag: number
): Promise<EventChart["planets"]> {
  const planetIds = [0, 1, 2, 3, 4, 5, 6]; // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
  const planetNames = [
    "sun",
    "moon",
    "mars",
    "mercury",
    "jupiter",
    "venus",
    "saturn",
  ] as const;
  const planets: Record<
    string,
    {
      longitude: number;
      latitude: number;
      speed: number;
      sign: number;
      nakshatra: number;
    }
  > = {};

  for (let i = 0; i < planetIds.length; i++) {
    const planetId = planetIds[i];
    const planetName = planetNames[i];

    try {
      let result: CalcResult;
      if (swe.calc_ut_async) {
        result = await swe.calc_ut_async(jd, planetId, ephFlag);
      } else if (swe.calc_ut_sync) {
        result = swe.calc_ut_sync(jd, planetId, ephFlag);
      } else {
        throw new Error(
          `Neither calc_ut_async nor calc_ut_sync is available for planet ${planetId}`
        );
      }

      if (result) {
        const longitude = Array.isArray(result)
          ? result[0]
          : result.data && Array.isArray(result.data)
          ? result.data[0]
          : result.longitude || result.lon || 0;
        const latitude = Array.isArray(result)
          ? result[1]
          : result.data && Array.isArray(result.data)
          ? result.data[1]
          : result.latitude || result.lat || 0;
        const speed = Array.isArray(result)
          ? result[3]
          : result.data && Array.isArray(result.data)
          ? result.data[3]
          : result.speed || result.vel || 0;
        const sign = Math.floor(longitude / 30) + 1;
        const nakshatra = Math.floor(longitude / 13.33) + 1;

        planets[planetName] = {
          longitude,
          latitude,
          speed,
          sign,
          nakshatra,
        };
      }
    } catch (error) {
      console.warn(`Failed to calculate ${planetName}:`, error);
      // Add default position
      planets[planetName] = {
        longitude: 0,
        latitude: 0,
        speed: 0,
        sign: 1,
        nakshatra: 1,
      };
    }
  }

  return planets as EventChart["planets"];
}

/**
 * Calculate houses for event time (simplified)
 */
async function calculateEventHouses(
  _swe: SwissAdapter,
  _jd: number,
  _lat: number,
  _lon: number,
  _ephFlag: number
): Promise<EventChart["houses"]> {
  // For now, use simplified house calculation
  // In a full implementation, you would use a proper houses calculation library
  const ascendant = 0; // Simplified - would need proper calculation
  const mc = 0; // Simplified - would need proper calculation
  const houses = Array.from({ length: 12 }, (_, i) => i * 30); // Simplified

  return {
    ascendant,
    mc,
    houses,
  };
}

/**
 * Calculate Panchang for event time
 */
async function calculateEventPanchang(
  swe: SwissAdapter,
  jd: number,
  ephFlag: number,
  eventTime: Date
): Promise<EventChart["panchang"]> {
  let sun: CalcResult;
  let moon: CalcResult;

  console.log(`Event chart calculation - JD: ${jd}, ephFlag: ${ephFlag}`);

  if (swe.calc_ut_async) {
    console.log("Using calc_ut_async for event chart");
    sun = await swe.calc_ut_async(jd, 0, ephFlag);
    moon = await swe.calc_ut_async(jd, 1, ephFlag);
  } else if (swe.calc_ut_sync) {
    console.log("Using calc_ut_sync for event chart");
    sun = swe.calc_ut_sync(jd, 0, ephFlag);
    moon = swe.calc_ut_sync(jd, 1, ephFlag);
  } else {
    throw new Error(
      "Neither calc_ut_async nor calc_ut_sync is available for event chart"
    );
  }

  console.log("Event chart Sun result:", sun);
  console.log("Event chart Moon result:", moon);

  if (!sun || !moon) {
    throw new Error("Failed to calculate Sun/Moon positions for Panchang");
  }

  const sunLong = Array.isArray(sun)
    ? sun[0]
    : sun.data && Array.isArray(sun.data)
    ? sun.data[0]
    : sun.longitude || sun.lon || 0;
  const moonLong = Array.isArray(moon)
    ? moon[0]
    : moon.data && Array.isArray(moon.data)
    ? moon.data[0]
    : moon.longitude || moon.lon || 0;

  console.log(
    `Event chart for ${eventTime.toISOString()}: Sun=${sunLong.toFixed(
      6
    )}, Moon=${moonLong.toFixed(6)}`
  );
  console.log(`Event chart JD: ${jd}, Sun result:`, sun, `Moon result:`, moon);

  // Calculate Tithi (lunar day) - more sensitive to small changes
  const tithiRaw = ((moonLong - sunLong + 360) % 360) / 12;
  const tithi = Math.floor(tithiRaw) + 1;
  const tithiFraction = tithiRaw - Math.floor(tithiRaw);

  // Calculate Nakshatra (lunar mansion) - more sensitive to small changes
  const nakshatraRaw = moonLong / 13.33;
  const nakshatra = Math.floor(nakshatraRaw) + 1;
  const nakshatraFraction = nakshatraRaw - Math.floor(nakshatraRaw);

  // Calculate Yoga (simplified) - more sensitive to small changes
  const yogaRaw = (sunLong + moonLong) / 13.33;
  const yoga = Math.floor(yogaRaw) + 1;
  const yogaFraction = yogaRaw - Math.floor(yogaRaw);

  // Calculate Karana (simplified) - more sensitive to small changes
  const karanaRaw = ((moonLong - sunLong + 360) % 360) / 6;
  const karana = Math.floor(karanaRaw) + 1;
  const karanaFraction = karanaRaw - Math.floor(karanaRaw);

  // Calculate Hora (planetary hour) - more sensitive to small changes
  const horaRaw = sunLong / 15;
  const hora = Math.floor(horaRaw) + 1;
  const horaFraction = horaRaw - Math.floor(horaRaw);

  // Calculate weekday (0 = Sunday, 1 = Monday, etc.)
  const eventDate = new Date(
    jd * 24 * 60 * 60 * 1000 - 2440588 * 24 * 60 * 60 * 1000
  );
  const weekday = eventDate.getUTCDay();

  return {
    tithi,
    nakshatra,
    yoga,
    karana,
    hora,
    weekday,
    tithiFraction,
    nakshatraFraction,
    yogaFraction,
    karanaFraction,
    horaFraction,
  };
}

/**
 * Calculate transit aspects between event planets and natal points
 */
export function calculateTransitAspects(
  eventPlanets: EventChart["planets"],
  natalPoints: Array<{ longitude: number; name: string }>
): Array<{
  eventPlanet: string;
  natalPoint: string;
  aspect: string;
  orb: number;
  strength: "strong" | "medium" | "weak";
}> {
  const aspects: Array<{
    eventPlanet: string;
    natalPoint: string;
    aspect: string;
    orb: number;
    strength: "strong" | "medium" | "weak";
  }> = [];

  const aspectAngles = {
    conjunction: 0,
    sextile: 60,
    square: 90,
    trine: 120,
    opposition: 180,
  };

  const aspectOrbs = {
    conjunction: 8,
    sextile: 6,
    square: 8,
    trine: 8,
    opposition: 8,
  };

  for (const [planetName, planet] of Object.entries(eventPlanets)) {
    for (const natalPoint of natalPoints) {
      const diff = Math.abs(planet.longitude - natalPoint.longitude);
      const angle = Math.min(diff, 360 - diff);

      for (const [aspectName, aspectAngle] of Object.entries(aspectAngles)) {
        const orb = Math.abs(angle - aspectAngle);
        const maxOrb = aspectOrbs[aspectName as keyof typeof aspectOrbs];

        if (orb <= maxOrb) {
          const strength =
            orb <= maxOrb * 0.5
              ? "strong"
              : orb <= maxOrb * 0.75
              ? "medium"
              : "weak";

          aspects.push({
            eventPlanet: planetName,
            natalPoint: natalPoint.name,
            aspect: aspectName,
            orb,
            strength,
          });
        }
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * Check if a planet is in a specific house
 */
export function getPlanetHouse(
  planetLongitude: number,
  houses: number[]
): number {
  for (let i = 0; i < houses.length; i++) {
    const nextHouse = houses[(i + 1) % houses.length];
    if (planetLongitude >= houses[i] && planetLongitude < nextHouse) {
      return i + 1;
    }
  }
  return 1; // Default to 1st house
}

/**
 * Check if a planet is retrograde
 */
export function isRetrograde(planetSpeed: number): boolean {
  return planetSpeed < 0;
}

/**
 * Check if a planet is combust (too close to Sun)
 */
export function isCombust(
  planetLongitude: number,
  sunLongitude: number,
  orb: number = 8
): boolean {
  const diff = Math.abs(planetLongitude - sunLongitude);
  return Math.min(diff, 360 - diff) < orb;
}

/**
 * Get planetary dignity for a planet in a sign
 */
export function getPlanetaryDignity(
  planetId: number,
  sign: number
): "own" | "exaltation" | "fall" | "detriment" | "neutral" {
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
