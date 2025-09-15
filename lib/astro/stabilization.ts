import { PipelineScore } from "./pipelineScoring";

export interface StableInterval {
  start: Date;
  best: Date;
  end: Date;
  score: number;
  breakdown: PipelineScore["breakdown"];
  reasons: string[];
  scoreId: string;
  stability: number; // 0-1, how stable this interval is
}

export interface StabilizationConfig {
  windowMinutes: number; // ±2 minutes by default
  minStability: number; // Minimum stability threshold (0-1)
  scoreThreshold: number; // Minimum score difference to consider significant
}

const DEFAULT_CONFIG: StabilizationConfig = {
  windowMinutes: 2,
  minStability: 0.7,
  scoreThreshold: 1.0,
};

/**
 * Stabilize scores by smoothing with a small ±2-minute window
 * and merging plateaus where Δscore < 1 to form stable intervals
 */
export async function stabilizeScores(
  scores: Array<{ time: Date; score: PipelineScore }>,
  config: StabilizationConfig = DEFAULT_CONFIG
): Promise<StableInterval[]> {
  if (scores.length === 0) return [];

  // Sort by time
  const sortedScores = [...scores].sort(
    (a, b) => a.time.getTime() - b.time.getTime()
  );

  // Apply smoothing to reduce jitter
  const smoothedScores = applySmoothing(sortedScores, config);

  // Find stable intervals
  const intervals = findStableIntervals(smoothedScores, config);

  // Merge nearby intervals with similar scores
  const mergedIntervals = mergeSimilarIntervals(intervals, config);

  return mergedIntervals;
}

/**
 * Apply smoothing to reduce jitter in scores
 */
function applySmoothing(
  scores: Array<{ time: Date; score: PipelineScore }>,
  config: StabilizationConfig
): Array<{ time: Date; score: PipelineScore; smoothed: boolean }> {
  const windowMs = config.windowMinutes * 60 * 1000;
  const smoothed: Array<{
    time: Date;
    score: PipelineScore;
    smoothed: boolean;
  }> = [];

  for (let i = 0; i < scores.length; i++) {
    const current = scores[i];
    const windowStart = new Date(current.time.getTime() - windowMs);
    const windowEnd = new Date(current.time.getTime() + windowMs);

    // Find scores within the window
    const windowScores = scores.filter(
      (s) => s.time >= windowStart && s.time <= windowEnd
    );

    if (windowScores.length === 1) {
      // No neighbors, keep original
      smoothed.push({ ...current, smoothed: false });
    } else {
      // Calculate weighted average
      const weights = windowScores.map((s) => {
        const distance = Math.abs(s.time.getTime() - current.time.getTime());
        return Math.max(0, 1 - distance / windowMs);
      });

      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      const weightedScore =
        windowScores.reduce(
          (sum, s, idx) => sum + s.score.score * weights[idx],
          0
        ) / totalWeight;

      // Create smoothed score
      const smoothedScore: PipelineScore = {
        ...current.score,
        score: Math.round(weightedScore * 10) / 10,
      };

      smoothed.push({
        time: current.time,
        score: smoothedScore,
        smoothed: true,
      });
    }
  }

  return smoothed;
}

/**
 * Find stable intervals where score changes are minimal
 */
function findStableIntervals(
  scores: Array<{ time: Date; score: PipelineScore; smoothed: boolean }>,
  config: StabilizationConfig
): StableInterval[] {
  const intervals: StableInterval[] = [];
  let currentInterval: StableInterval | null = null;

  for (let i = 0; i < scores.length; i++) {
    const current = scores[i];

    if (!currentInterval) {
      // Start new interval
      currentInterval = {
        start: current.time,
        best: current.time,
        end: current.time,
        score: current.score.score,
        breakdown: current.score.breakdown,
        reasons: current.score.reasons,
        scoreId: current.score.scoreId,
        stability: 1.0,
      };
    } else {
      // Check if we should extend current interval
      const scoreDiff = Math.abs(current.score.score - currentInterval.score);

      if (scoreDiff <= config.scoreThreshold) {
        // Extend interval
        currentInterval.end = current.time;

        // Update best time if score is higher
        if (current.score.score > currentInterval.score) {
          currentInterval.best = current.time;
          currentInterval.score = current.score.score;
          currentInterval.breakdown = current.score.breakdown;
          currentInterval.reasons = current.score.reasons;
          currentInterval.scoreId = current.score.scoreId;
        }

        // Update stability (decreases as interval gets longer)
        const intervalDuration =
          currentInterval.end.getTime() - currentInterval.start.getTime();
        const maxDuration = 60 * 60 * 1000; // 1 hour max
        currentInterval.stability = Math.max(
          0.1,
          1 - intervalDuration / maxDuration
        );
      } else {
        // Score changed significantly, finalize current interval
        if (currentInterval.stability >= config.minStability) {
          intervals.push(currentInterval);
        }

        // Start new interval
        currentInterval = {
          start: current.time,
          best: current.time,
          end: current.time,
          score: current.score.score,
          breakdown: current.score.breakdown,
          reasons: current.score.reasons,
          scoreId: current.score.scoreId,
          stability: 1.0,
        };
      }
    }
  }

  // Don't forget the last interval
  if (currentInterval && currentInterval.stability >= config.minStability) {
    intervals.push(currentInterval);
  }

  return intervals;
}

/**
 * Merge nearby intervals with similar scores
 */
function mergeSimilarIntervals(
  intervals: StableInterval[],
  config: StabilizationConfig
): StableInterval[] {
  if (intervals.length <= 1) return intervals;

  const merged: StableInterval[] = [];
  let current = intervals[0];

  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    const timeGap = next.start.getTime() - current.end.getTime();
    const scoreDiff = Math.abs(next.score - current.score);
    const maxGap = 30 * 60 * 1000; // 30 minutes max gap

    // Merge if close in time and similar score
    if (timeGap <= maxGap && scoreDiff <= config.scoreThreshold) {
      // Merge intervals
      current = {
        start: current.start,
        best: next.score > current.score ? next.best : current.best,
        end: next.end,
        score: Math.max(current.score, next.score),
        breakdown:
          next.score > current.score ? next.breakdown : current.breakdown,
        reasons: next.score > current.score ? next.reasons : current.reasons,
        scoreId: next.score > current.score ? next.scoreId : current.scoreId,
        stability: Math.min(current.stability, next.stability),
      };
    } else {
      // Don't merge, add current and move to next
      merged.push(current);
      current = next;
    }
  }

  // Add the last interval
  merged.push(current);

  return merged;
}

/**
 * Find alternative times by sweeping nearby minutes
 * Skip forbidden windows and prefer peaks where Moon/benefics help
 */
export async function findAlternatives(
  baseTime: Date,
  baseScore: PipelineScore,
  scoreFunction: (time: Date) => Promise<PipelineScore>,
  config: StabilizationConfig = DEFAULT_CONFIG
): Promise<StableInterval[]> {
  const alternatives: Array<{ time: Date; score: PipelineScore }> = [];

  // Search in ±2 hour window around base time
  const searchWindow = 2 * 60 * 60 * 1000; // 2 hours
  const stepSize = 15 * 60 * 1000; // 15 minutes

  const startTime = new Date(baseTime.getTime() - searchWindow);
  const endTime = new Date(baseTime.getTime() + searchWindow);

  for (
    let time = startTime.getTime();
    time <= endTime.getTime();
    time += stepSize
  ) {
    const testTime = new Date(time);

    try {
      const score = await scoreFunction(testTime);

      // Only consider scores that are significantly better
      if (score.score > baseScore.score + config.scoreThreshold) {
        alternatives.push({ time: testTime, score });
      }
    } catch (error) {
      // Skip times that fail to calculate
      continue;
    }
  }

  // Stabilize the alternatives
  const stableAlternatives = await stabilizeScores(alternatives, config);

  // Sort by score and return top 3
  return stableAlternatives.sort((a, b) => b.score - a.score).slice(0, 3);
}

/**
 * Check if a time falls within a stable interval
 */
export function isWithinStableInterval(
  time: Date,
  intervals: StableInterval[],
  toleranceMinutes: number = 5
): StableInterval | null {
  const toleranceMs = toleranceMinutes * 60 * 1000;

  for (const interval of intervals) {
    const start = new Date(interval.start.getTime() - toleranceMs);
    const end = new Date(interval.end.getTime() + toleranceMs);

    if (time >= start && time <= end) {
      return interval;
    }
  }

  return null;
}

/**
 * Get the best stable interval from a list
 */
export function getBestStableInterval(
  intervals: StableInterval[]
): StableInterval | null {
  if (intervals.length === 0) return null;

  return intervals.reduce((best, current) =>
    current.score > best.score ? current : best
  );
}

/**
 * Filter intervals by minimum score threshold
 */
export function filterByScore(
  intervals: StableInterval[],
  minScore: number
): StableInterval[] {
  return intervals.filter((interval) => interval.score >= minScore);
}

/**
 * Get intervals within a time range
 */
export function getIntervalsInRange(
  intervals: StableInterval[],
  startTime: Date,
  endTime: Date
): StableInterval[] {
  return intervals.filter(
    (interval) => interval.start >= startTime && interval.end <= endTime
  );
}
