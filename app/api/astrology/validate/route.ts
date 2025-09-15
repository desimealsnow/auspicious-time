import { NextResponse } from "next/server";
import { loadSwissAdapter } from "@/lib/astro/swissAdapter";
import { runComprehensiveValidation } from "@/lib/astro/swissValidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // Run comprehensive validation
    const validation = await runComprehensiveValidation(swe, ephFlag);

    return NextResponse.json({
      ok: true,
      validation,
      swiss_ephemeris: {
        source: sweInfo.source,
        version: "2.10.03", // This would be dynamically retrieved in production
        ephemeris_path: process.env.SE_EPHE_PATH || "./ephe",
        allow_moshier_fallback: process.env.SE_ALLOW_MOSHIER === "1",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Validation error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Validation failed",
      },
      { status: 500 }
    );
  }
}
