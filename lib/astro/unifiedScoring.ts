import { NatalChart } from "./natalChart";
import { EventChart, PipelineScore, scorePipeline } from "./pipelineScoring";
import { computeEventChart } from "./eventChart";
import { stabilizeScores, StableInterval } from "./stabilization";
import { SwissAdapter } from "./swissAdapter";

export interface UnifiedScoringResult {
  score: number;
  breakdown: PipelineScore["breakdown"];
  reasons: string[];
  scoreId: string;
  level: "L0" | "L1" | "L2";
  stableIntervals: StableInterval[];
  alternatives: StableInterval[];
  recommendation: "HIGHLY FAVORABLE" | "FAVORABLE" | "NEUTRAL" | "AVOID";
}

export interface ScoringRequest {
  birthDate: string;
  birthTime?: string;
  birthLat?: number;
  birthLon?: number;
  eventTime: Date;
  eventLat: number;
  eventLon: number;
  activity: string;
}

/**
 * Main unified scoring function that implements the complete pipeline
 */
export async function scoreUnified(
  swe: SwissAdapter,
  ephFlag: number,
  request: ScoringRequest
): Promise<UnifiedScoringResult> {
  try {
    // Step 1: Compute natal chart with fallback tiers
    let natalChart: NatalChart;
    try {
      natalChart = await computeNatalChart(
        swe,
        ephFlag,
        request.birthDate,
        request.birthTime || null,
        request.birthLat || null,
        request.birthLon || null,
        request.eventTime
      );
    } catch (error) {
      console.error("Natal chart computation failed:", error);
      throw error;
    }

    // Step 2: Compute event chart
    const eventChart = await computeEventChart(
      swe,
      ephFlag,
      request.eventTime,
      request.eventLat,
      request.eventLon
    );

    // Step 3: Calculate pipeline score
    const pipelineScore = await scorePipeline(
      natalChart,
      eventChart,
      swe,
      ephFlag,
      request.activity
    );

    // Step 4: Generate stable intervals
    const stableIntervals = await generateStableIntervals(
      swe,
      ephFlag,
      request
    );

    console.log(`Generated ${stableIntervals.length} stable intervals`);

    // Step 5: Find alternatives
    const alternatives = await findAlternatives(
      swe,
      ephFlag,
      request,
      pipelineScore,
      stableIntervals
    );

    // Step 6: Determine recommendation
    const recommendation = getRecommendation(pipelineScore.score);

    return {
      score: pipelineScore.score,
      breakdown: pipelineScore.breakdown,
      reasons: pipelineScore.reasons,
      scoreId: pipelineScore.scoreId,
      level: natalChart.level,
      stableIntervals,
      alternatives,
      recommendation,
    };
  } catch (error) {
    console.error("Error in scoreUnified:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    throw new Error(
      `Scoring failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate stable intervals around the main time
 */
async function generateStableIntervals(
  swe: SwissAdapter,
  ephFlag: number,
  request: ScoringRequest
): Promise<StableInterval[]> {
  const scores: Array<{ time: Date; score: PipelineScore }> = [];

  // Test ±2 hours around the main time in 15-minute intervals
  const baseTime = request.eventTime;
  const windowHours = 2;
  const stepMinutes = 15;

  for (
    let offsetMinutes = -windowHours * 60;
    offsetMinutes <= windowHours * 60;
    offsetMinutes += stepMinutes
  ) {
    const testTime = new Date(baseTime.getTime() + offsetMinutes * 60 * 1000);

    try {
      // Compute natal chart for this time
      const natalChart = await computeNatalChart(
        swe,
        ephFlag,
        request.birthDate,
        request.birthTime || null,
        request.birthLat || null,
        request.birthLon || null,
        testTime
      );

      // Compute event chart for this time
      const eventChart = await computeEventChart(
        swe,
        ephFlag,
        testTime,
        request.eventLat,
        request.eventLon
      );

      // Calculate score
      const score = await scorePipeline(
        natalChart,
        eventChart,
        swe,
        ephFlag,
        request.activity
      );

      scores.push({ time: testTime, score });
    } catch (error) {
      console.warn(
        `Failed to calculate score for ${testTime.toISOString()}:`,
        error
      );
    }
  }

  // Stabilize the scores
  const stableIntervals = await stabilizeScores(scores);

  return stableIntervals;
}

/**
 * Find alternative times
 */
async function findAlternatives(
  swe: SwissAdapter,
  ephFlag: number,
  request: ScoringRequest,
  baseScore: PipelineScore,
  stableIntervals: StableInterval[]
): Promise<StableInterval[]> {
  // Filter out intervals that are too close to the main time
  const mainTime = request.eventTime;
  const minGapMinutes = 15; // Reduced from 30 to 15 minutes

  const alternatives = stableIntervals.filter((interval) => {
    const timeDiff = Math.abs(interval.best.getTime() - mainTime.getTime());
    return timeDiff >= minGapMinutes * 60 * 1000;
  });

  // Generate weekly search with hourly intervals
  const weeklyTimes: Date[] = [];

  console.log(
    `Starting weekly search for main time: ${mainTime.toISOString()}`
  );

  // Search for the next 7 days, with varied times to get more diverse scores
  const timeSlots = [6, 9, 12, 15, 18]; // 6AM, 9AM, 12PM, 3PM, 6PM
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    for (const hour of timeSlots) {
      const candidateTime = new Date(mainTime);
      candidateTime.setDate(candidateTime.getDate() + dayOffset);
      candidateTime.setHours(hour, 0, 0, 0);

      // Skip if this is the same time as the main request
      const timeDiff = Math.abs(candidateTime.getTime() - mainTime.getTime());
      if (timeDiff > 30 * 60 * 1000) {
        // At least 30 minutes difference
        weeklyTimes.push(candidateTime);
      }
    }
  }

  console.log(
    `Generated ${weeklyTimes.length} candidate times for weekly search`
  );
  console.log(
    "First 5 candidate times:",
    weeklyTimes.slice(0, 5).map((t) => t.toISOString())
  );

  for (const altTime of weeklyTimes) {
    try {
      const natalChart = await computeNatalChart(
        swe,
        ephFlag,
        request.birthDate,
        request.birthTime || null,
        request.birthLat || null,
        request.birthLon || null,
        altTime
      );

      const eventChart = await computeEventChart(
        swe,
        ephFlag,
        altTime,
        request.eventLat,
        request.eventLon
      );

      const score = await scorePipeline(
        natalChart,
        eventChart,
        swe,
        ephFlag,
        request.activity
      );

      // Add all alternatives for debugging
      console.log(
        `Alternative time ${altTime.toISOString()}: score=${
          score.score
        }, base=${baseScore.score}, diff=${Math.abs(
          score.score - baseScore.score
        )}`
      );
      console.log(`Alternative breakdown:`, score.breakdown);

      // Only add if score is different from base score (reduced threshold for more sensitivity)
      if (Math.abs(score.score - baseScore.score) > 0.05) {
        alternatives.push({
          start: new Date(altTime.getTime() - 30 * 60 * 1000),
          end: new Date(altTime.getTime() + 30 * 60 * 1000),
          best: altTime,
          score: score.score,
          scoreId: score.scoreId,
          reasons: score.reasons,
          breakdown: score.breakdown,
          stability: 0.8, // Default stability for alternatives
        });
      }
    } catch (error) {
      console.warn(`Failed to generate alternative for ${altTime}:`, error);
    }
  }

  // Sort by score and return top 3
  return alternatives.sort((a, b) => b.score - a.score).slice(0, 3);
}

/**
 * Determine recommendation based on score
 */
function getRecommendation(
  score: number
): UnifiedScoringResult["recommendation"] {
  if (score >= 75) return "HIGHLY FAVORABLE";
  if (score >= 60) return "FAVORABLE";
  if (score >= 40) return "NEUTRAL";
  return "AVOID";
}

/**
 * Compute natal chart (re-exported for convenience)
 */
async function computeNatalChart(
  swe: SwissAdapter,
  ephFlag: number,
  birthDate: string,
  birthTime: string | null,
  birthLat: number | null,
  birthLon: number | null,
  targetDate: Date
): Promise<NatalChart> {
  // Import the function from natalChart.ts
  const { computeNatalChart: computeNatalChartImpl } = await import(
    "./natalChart"
  );
  return computeNatalChartImpl(
    swe,
    ephFlag,
    birthDate,
    birthTime,
    birthLat,
    birthLon,
    targetDate
  );
}

/**
 * Get detailed analysis for a specific time
 */
export async function getDetailedAnalysis(
  swe: SwissAdapter,
  ephFlag: number,
  request: ScoringRequest
): Promise<{
  natalChart: NatalChart;
  eventChart: EventChart;
  score: PipelineScore;
  transitAspects: Array<{
    eventPlanet: string;
    natalPoint: string;
    aspect: string;
    orb: number;
    strength: "strong" | "medium" | "weak";
  }>;
  analysis: {
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  };
}> {
  // Compute charts
  const natalChart = await computeNatalChart(
    swe,
    ephFlag,
    request.birthDate,
    request.birthTime || null,
    request.birthLat || null,
    request.birthLon || null,
    request.eventTime
  );

  const eventChart = await computeEventChart(
    swe,
    ephFlag,
    request.eventTime,
    request.eventLat,
    request.eventLon
  );

  // Calculate score
  const score = await scorePipeline(
    natalChart,
    eventChart,
    swe,
    ephFlag,
    request.activity
  );

  // Calculate transit aspects
  const { calculateTransitAspects } = await import("./eventChart");
  const natalPoints = [];

  if (natalChart.luminaries) {
    natalPoints.push(
      { longitude: natalChart.luminaries.sun.longitude, name: "Natal Sun" },
      { longitude: natalChart.luminaries.moon.longitude, name: "Natal Moon" }
    );
  }

  if (natalChart.houses) {
    natalPoints.push(
      { longitude: natalChart.houses.ascendant, name: "Natal ASC" },
      { longitude: natalChart.houses.mc, name: "Natal MC" }
    );
  }

  const transitAspects = calculateTransitAspects(
    eventChart.planets,
    natalPoints
  );

  // Generate analysis
  const analysis = generateAnalysis(score, transitAspects, natalChart.level);

  return {
    natalChart,
    eventChart,
    score,
    transitAspects,
    analysis,
  };
}

/**
 * Generate detailed analysis
 */
function generateAnalysis(
  score: PipelineScore,
  transitAspects: Array<{
    eventPlanet: string;
    natalPoint: string;
    aspect: string;
    orb: number;
    strength: "strong" | "medium" | "weak";
  }>,
  level: "L0" | "L1" | "L2"
): {
  strengths: string[];
  challenges: string[];
  recommendations: string[];
} {
  const strengths: string[] = [];
  const challenges: string[] = [];
  const recommendations: string[] = [];

  // Analyze breakdown
  if (score.breakdown.panchangScore > 0.3) {
    strengths.push("Favorable Panchang timing");
  }
  if (score.breakdown.chandraBala > 0.3) {
    strengths.push("Strong Chandra Bala (Moon position)");
  }
  if (score.breakdown.taraBala > 0.3) {
    strengths.push("Beneficial Tara Bala (Nakshatra compatibility)");
  }
  if (score.breakdown.transitLuminariesAngles > 0.3) {
    strengths.push("Positive transit aspects to natal points");
  }
  if (score.breakdown.eventLagna > 0.3) {
    strengths.push("Good event lagna placement");
  }
  if (score.breakdown.moonStrength > 0.3) {
    strengths.push("Strong Moon position");
  }

  // Challenges
  if (score.breakdown.retrogradePenalty < -0.2) {
    challenges.push("Mercury retrograde may cause communication issues");
  }
  if (score.breakdown.combustionPenalty < -0.2) {
    challenges.push("Planetary combustion may reduce effectiveness");
  }
  if (score.breakdown.chandraBala < -0.3) {
    challenges.push("Challenging Chandra Bala");
  }
  if (score.breakdown.taraBala < -0.3) {
    challenges.push("Difficult Tara Bala");
  }

  // Recommendations based on level
  if (level === "L0") {
    recommendations.push(
      "Consider providing birth time for more accurate analysis"
    );
  } else if (level === "L1") {
    recommendations.push(
      "Consider providing birth location for complete analysis"
    );
  }

  // General recommendations
  if (score.score < 40) {
    recommendations.push(
      "Consider choosing a different time for this activity"
    );
  } else if (score.score < 60) {
    recommendations.push("Proceed with caution and consider alternatives");
  } else if (score.score >= 75) {
    recommendations.push("Excellent timing for this activity");
  }

  return {
    strengths,
    challenges,
    recommendations,
  };
}
