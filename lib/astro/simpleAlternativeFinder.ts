import {
  CanonicalInputs,
  scoreMinute,
  canonicalizeInputs,
} from "./deterministicScoring";
import { StableSuggestion } from "./deterministicScoring";

/**
 * Simple alternative time finder that tests every hour for the next 7 days
 * This is more reliable than complex hill-climbing algorithms
 */
export async function findSimpleAlternatives(
  canonical: CanonicalInputs,
  swe: any,
  ephFlag: number,
  originalTime: Date,
  mainScore: number,
  minGapMinutes: number = 30
): Promise<StableSuggestion[]> {
  const alternatives: Array<{
    time: Date;
    score: number;
    scoreId: string;
    breakdown: any;
  }> = [];

  // Test every hour for the next 7 days
  const startTime = new Date(originalTime);
  startTime.setUTCHours(startTime.getUTCHours() + 1, 0, 0, 0); // Start from next hour

  const endTime = new Date(originalTime);
  endTime.setUTCDate(endTime.getUTCDate() + 7); // 7 days later

  console.log(
    `🔍 Testing ${Math.ceil(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    )} hours for alternatives...`
  );
  console.log(
    `🎯 Looking for alternatives with score >= ${
      mainScore - 5
    } (main score: ${mainScore})`
  );

  for (
    let time = startTime.getTime();
    time <= endTime.getTime();
    time += 60 * 60 * 1000
  ) {
    // Every hour
    const candidateTime = new Date(time);

    // Skip if too close to original time
    const gapMinutes =
      Math.abs(candidateTime.getTime() - originalTime.getTime()) / (1000 * 60);
    if (gapMinutes < minGapMinutes) continue;

    try {
      // Create canonical input for this candidate time
      const candidateCanonical = canonicalizeInputs(
        candidateTime.toISOString(),
        canonical.lat,
        canonical.lon,
        canonical.tz,
        canonical.eventType
      );

      // Calculate score for this time
      const result = await scoreMinute(candidateCanonical, swe, ephFlag);

      alternatives.push({
        time: candidateTime,
        score: result.score,
        scoreId: candidateCanonical.scoreId,
        breakdown: result.breakdown,
      });

      console.log(
        `✅ Tested ${candidateTime.toISOString()}: Score ${result.score.toFixed(
          1
        )}`
      );
    } catch (error) {
      console.log(`❌ Failed to test ${candidateTime.toISOString()}: ${error}`);
      continue;
    }
  }

  // Filter for alternatives that are either better or within 5 points of main score
  // This shows variety while still prioritizing better times
  const relevantAlternatives = alternatives.filter(
    (alt) => alt.score >= mainScore - 5
  );

  // Sort by score (highest first)
  const sortedAlternatives = relevantAlternatives.sort(
    (a, b) => b.score - a.score
  );

  // Ensure unique scores - only take one alternative per unique score
  const uniqueAlternatives: Array<{
    time: Date;
    score: number;
    scoreId: string;
    breakdown: any;
  }> = [];
  const seenScores = new Set<number>();

  for (const alt of sortedAlternatives) {
    // Round score to 1 decimal place for comparison
    const roundedScore = Math.round(alt.score * 10) / 10;

    if (!seenScores.has(roundedScore)) {
      seenScores.add(roundedScore);
      uniqueAlternatives.push(alt);

      // Stop when we have 5 unique alternatives
      if (uniqueAlternatives.length >= 5) break;
    }
  }

  const topAlternatives = uniqueAlternatives;

  console.log(
    `🎯 Found ${topAlternatives.length} unique alternatives (score >= ${
      mainScore - 5
    }) out of ${alternatives.length} tested`
  );

  // Convert to StableSuggestion format
  return topAlternatives.map((alt, index) => ({
    start: alt.time,
    best: alt.time,
    end: new Date(alt.time.getTime() + 60 * 60 * 1000), // 1 hour window
    score: alt.score,
    breakdown: alt.breakdown,
    scoreId: alt.scoreId,
    reasons: generateSimpleReasons(alt.breakdown, index + 1),
  }));
}

/**
 * Generate simple reasons for alternative times
 */
function generateSimpleReasons(breakdown: any, rank: number): string[] {
  const reasons: string[] = [];

  if (rank === 1) {
    reasons.push("Best overall astrological conditions");
  } else if (rank <= 3) {
    reasons.push("Excellent planetary alignment");
  } else {
    reasons.push("Favorable cosmic timing");
  }

  // Add specific reasons based on breakdown
  if (breakdown.planetaryStrength > 70) {
    reasons.push("Strong planetary influences");
  }
  if (breakdown.aspectHarmony > 60) {
    reasons.push("Harmonious planetary aspects");
  }
  if (breakdown.lunarPhase > 50) {
    reasons.push("Beneficial lunar phase");
  }

  return reasons;
}
