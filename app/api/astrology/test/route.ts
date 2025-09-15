import { NextResponse } from "next/server";
import { loadSwissAdapter } from "@/lib/astro/swissAdapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Handles the GET request to test the Swiss Ephemeris functionality.
 *
 * This function attempts to load the Swiss Ephemeris adapter and configure it with the appropriate settings. It then calculates the Julian Day for a test date and performs calculations for both the Sun and Moon. If any step fails, it returns an error response with relevant details. Finally, it returns a success response with the results of the calculations.
 *
 * @returns A JSON response indicating the success or failure of the Swiss Ephemeris tests, including details of the calculations performed.
 * @throws Error If loading the Swiss Ephemeris adapter or performing calculations fails.
 */
export async function GET() {
  try {
    // Load Swiss Ephemeris
    let sweInfo;
    try {
      sweInfo = await loadSwissAdapter();
    } catch (e: unknown) {
      return NextResponse.json(
        {
          ok: false,
          error:
            e instanceof Error ? e.message : "Swiss Ephemeris module missing",
        },
        { status: 200 }
      );
    }
    const swe = sweInfo.swe;

    // Configure Swiss Ephemeris
    swe.set_ephe_path(process.env.SE_EPHE_PATH || "./ephe");
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0);

    const ephFlag =
      process.env.SE_ALLOW_MOSHIER === "1"
        ? swe.SEFLG_MOSEPH
        : swe.SEFLG_SWIEPH;

    // Test with a date within the ephemeris range (2020)
    const testDate = new Date("2020-01-01T12:00:00.000Z");
    const jdUT = swe.julday(
      testDate.getUTCFullYear(),
      testDate.getUTCMonth() + 1,
      testDate.getUTCDate(),
      testDate.getUTCHours() + testDate.getUTCMinutes() / 60,
      swe.SE_GREG_CAL
    );

    // Test Sun calculation
    let sunResult;
    try {
      sunResult =
        swe.calc_ut_sync?.(jdUT, swe.SE_SUN, ephFlag) ??
        (await swe.calc_ut_async?.(jdUT, swe.SE_SUN, ephFlag));
    } catch (error) {
      return NextResponse.json({
        ok: false,
        error: `Sun calculation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        details: {
          julianDay: jdUT,
          ephemerisFlag: ephFlag,
          testDate: testDate.toISOString(),
        },
      });
    }

    // Test Moon calculation
    let moonResult;
    try {
      moonResult =
        swe.calc_ut_sync?.(jdUT, swe.SE_MOON, ephFlag) ??
        (await swe.calc_ut_async?.(jdUT, swe.SE_MOON, ephFlag));
    } catch (error) {
      return NextResponse.json({
        ok: false,
        error: `Moon calculation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        details: {
          julianDay: jdUT,
          ephemerisFlag: ephFlag,
          testDate: testDate.toISOString(),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Swiss Ephemeris is working correctly",
      details: {
        source: sweInfo.source,
        julianDay: jdUT,
        testDate: testDate.toISOString(),
        ephemerisFlag: ephFlag,
        sunResult: Array.isArray(sunResult) ? sunResult.slice(0, 3) : sunResult,
        moonResult: Array.isArray(moonResult)
          ? moonResult.slice(0, 3)
          : moonResult,
        ephemerisPath: process.env.SE_EPHE_PATH || "./ephe",
      },
    });
  } catch (error: unknown) {
    console.error("Test error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Test failed",
      },
      { status: 500 }
    );
  }
}
