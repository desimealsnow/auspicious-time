import { NextResponse } from "next/server";
import { loadSwissAdapter } from "@/lib/astro/swissAdapter";
import { getEphemerisFlag } from "@/lib/astro/epheFiles";
import { sunriseSunsetUTC } from "@/lib/astro/sunriseNoaa";
import { quickValidation } from "@/lib/astro/swissValidation";
import { scoreUnified, ScoringRequest } from "@/lib/astro/unifiedScoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EnhancedPayload {
  dobISO: string;
  targetISO: string;
  lat: number;
  lon: number;
  tz: string;
  activity?: string;
}

/**
 * Handles the POST request for enhanced astrology calculations.
 *
 * This function processes the incoming request, validates the required fields, and loads the Swiss Ephemeris. It performs date validation, constructs a scoring request, and calculates a unified score. Additionally, it computes sunrise and sunset times, formats alternatives, and constructs a comprehensive response containing astrological insights and recommendations.
 *
 * @param req - The incoming request object containing the payload for astrology calculations.
 * @returns A JSON response with the results of the astrology calculations, including scores, recommendations, and time windows.
 * @throws Error If there are issues with loading the Swiss Ephemeris, validating input, or calculating sunrise/sunset times.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as EnhancedPayload;
    if (
      !body?.dobISO ||
      !body?.targetISO ||
      !body?.lat ||
      !body?.lon ||
      !body?.tz ||
      !body?.activity
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Load Swiss Ephemeris
    console.log("Loading Swiss Ephemeris...");
    let sweInfo;
    try {
      sweInfo = await loadSwissAdapter();
      if (!sweInfo) {
        throw new Error("Swiss Ephemeris loading returned null");
      }
      console.log("Swiss Ephemeris loaded successfully:", {
        source: sweInfo.source,
        hasCalcUtAsync: !!sweInfo.swe.calc_ut_async,
        hasCalcUtSync: !!sweInfo.swe.calc_ut_sync,
        hasJulday: !!sweInfo.swe.julday,
      });
    } catch (error) {
      console.error("Swiss Ephemeris loading failed:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to load Swiss Ephemeris" },
        { status: 500 }
      );
    }
    const swe = sweInfo.swe;

    // Get ephemeris flag for the target year
    const targetYear = new Date(body.targetISO).getFullYear();
    const ephFlag = getEphemerisFlag(targetYear);

    // Validate Swiss Ephemeris
    const validation = await quickValidation(swe, ephFlag);
    if (!validation) {
      return NextResponse.json(
        { ok: false, error: "Swiss Ephemeris validation failed" },
        { status: 500 }
      );
    }

    // Validate and parse dates
    const birthDate = new Date(body.dobISO);
    const eventTime = new Date(body.targetISO);

    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { ok: false, error: `Invalid birth date format: ${body.dobISO}` },
        { status: 400 }
      );
    }

    if (isNaN(eventTime.getTime())) {
      return NextResponse.json(
        { ok: false, error: `Invalid target date format: ${body.targetISO}` },
        { status: 400 }
      );
    }

    // Extract birth time if available in ISO string
    let birthTime: string | undefined = undefined;
    if (body.dobISO.includes("T")) {
      // Extract time part from ISO string
      const timeMatch = body.dobISO.match(/T(\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)/);
      if (timeMatch) {
        birthTime = timeMatch[1].replace("Z", "");
      }
    }

    console.log("Birth data processing:", {
      originalDOB: body.dobISO,
      extractedBirthTime: birthTime,
      hasTimeInISO: body.dobISO.includes("T"),
    });

    // Create scoring request
    const scoringRequest: ScoringRequest = {
      birthDate: body.dobISO,
      birthTime: birthTime,
      birthLat: body.lat,
      birthLon: body.lon,
      eventTime: eventTime,
      eventLat: body.lat,
      eventLon: body.lon,
      activity: body.activity || "general",
    };

    // Calculate unified score using new pipeline
    const result = await scoreUnified(swe, ephFlag, scoringRequest);

    // Calculate sunrise and sunset for context
    const sunrise = await sunriseSunsetUTC(
      result.stableIntervals[0]?.best || new Date(body.targetISO),
      body.lat,
      body.lon
    );
    const sunset = await sunriseSunsetUTC(
      result.stableIntervals[0]?.best || new Date(body.targetISO),
      body.lat,
      body.lon
    );

    if (!sunrise || !sunset) {
      return NextResponse.json(
        { ok: false, error: "Failed to calculate sunrise/sunset" },
        { status: 500 }
      );
    }

    // Convert alternatives to the expected format
    const formattedAlternatives = result.alternatives.map((alt) => ({
      name:
        alt.best.toLocaleDateString() ===
        new Date(body.targetISO).toLocaleDateString()
          ? `Today - ${alt.best.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : `Tomorrow - ${alt.best.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}`,
      start: alt.start.toISOString(),
      end: alt.end.toISOString(),
      type: "favorable" as const,
      description: `${alt.best.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })} - Swiss Ephemeris Score: ${alt.score}`,
      score: alt.score,
      recommendation:
        alt.score >= 70
          ? "HIGHLY FAVORABLE"
          : alt.score >= 60
          ? "FAVORABLE"
          : "NEUTRAL",
      scoreId: alt.scoreId,
      reasons: alt.reasons,
    }));

    // Create response with unified scoring
    const response = {
      ok: true,
      activity: {
        name: getActivityName(body.activity || "general"),
        score: result.score,
        recommendation: result.recommendation,
        reasons: result.reasons,
        breakdown: result.breakdown,
        scoreId: result.scoreId,
        level: result.level,
      },
      time_windows: {
        current: {
          start:
            result.stableIntervals[0]?.start.toISOString() ||
            new Date(body.targetISO).toISOString(),
          end:
            result.stableIntervals[0]?.end.toISOString() ||
            new Date(
              new Date(body.targetISO).getTime() + 60 * 60 * 1000
            ).toISOString(),
          type: result.score >= 60 ? "favorable" : "unfavorable",
          description: `Current time - ${result.recommendation}`,
          score: result.score,
          scoreId: result.scoreId,
        },
        alternative_times: formattedAlternatives,
      },
      // Panchang Details (simplified for now)
      sunrise: sunrise?.sunrise?.toISOString() || null,
      sunset: sunset?.sunset?.toISOString() || null,
      tithi: { name: "Calculated", index: 1 }, // Would need to extract from event chart
      nakshatra: { name: "Calculated", index: 1 }, // Would need to extract from event chart
      planetary: {
        positions: [], // Would need to extract from event chart
        aspects: [],
        summary: {
          supportive_factors: result.reasons.filter(
            (r) => !r.includes("penalty") && !r.includes("retrograde")
          ),
          challenging_factors: result.reasons.filter(
            (r) => r.includes("penalty") || r.includes("retrograde")
          ),
          key_influences: result.reasons.slice(0, 3),
        },
      },
      canonical: {
        utcMinute: new Date(body.targetISO).toISOString(),
        scoreId: result.scoreId,
        config: {
          ayanamsa: "LAHIRI",
          ephFlags: ephFlag,
          sweVersion: "2.10.03",
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Enhanced astrology calculation error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Retrieves the name of an activity based on the provided key.
 */
function getActivityName(activity: string): string {
  const activityNames: { [key: string]: string } = {
    travel: "Long-Distance Travel",
    business: "Business Meeting",
    marriage: "Wedding Ceremony",
    health: "Medical Procedure",
    education: "Educational Activity",
    creative: "Creative Work",
  };
  return activityNames[activity] || "General Activity";
}

// Removed unused functions - now using unified scoring system
