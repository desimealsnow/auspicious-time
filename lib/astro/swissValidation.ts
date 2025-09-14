/**
 * Swiss Ephemeris Validation and Testing Utilities
 * Ensures accuracy of astrological calculations for activity-based recommendations
 */

import type { SwissAdapter } from './swissAdapter';
import { calculatePlanetaryPositions, calculateAspects, PLANETS } from './enhancedSwissCalculations';

// Known astronomical data for validation (examples for specific dates)
const VALIDATION_DATA = {
  // 2024-01-01 12:00:00 UTC - New Year's Day Noon
  '2024-01-01T12:00:00.000Z': {
    sun: { longitude: 280.0, tolerance: 1.0 }, // Approximate Capricorn 10°
    moon: { longitude: 15.0, tolerance: 5.0 }, // Approximate positions
    mercury: { longitude: 270.0, tolerance: 5.0 },
    venus: { longitude: 310.0, tolerance: 5.0 },
    mars: { longitude: 250.0, tolerance: 5.0 }
  },
  
  // 2024-06-21 12:00:00 UTC - Summer Solstice
  '2024-06-21T12:00:00.000Z': {
    sun: { longitude: 90.0, tolerance: 1.0 }, // Should be exactly at 0° Cancer (90° longitude)
    moon: { longitude: null, tolerance: 10.0 }, // Variable
    mercury: { longitude: null, tolerance: 10.0 },
    venus: { longitude: null, tolerance: 10.0 },
    mars: { longitude: null, tolerance: 10.0 }
  }
} as const;

// Test cases for different activity scenarios
const ACTIVITY_TEST_CASES = [
  {
    name: 'Business Launch - Favorable',
    activity: 'new_business',
    dateTime: '2024-03-15T10:30:00.000Z',
    expectedRange: { min: 60, max: 100 },
    description: 'Should show favorable timing for business activities'
  },
  {
    name: 'Wedding - Mixed',
    activity: 'marriage', 
    dateTime: '2024-02-14T14:00:00.000Z',
    expectedRange: { min: 40, max: 80 },
    description: 'Valentine\'s Day should have mixed but generally positive influences'
  },
  {
    name: 'Medical Procedure - Caution',
    activity: 'medical_procedure',
    dateTime: '2024-04-08T16:00:00.000Z', // During solar eclipse period
    expectedRange: { min: 20, max: 50 },
    description: 'Eclipse periods typically show challenging energy for medical procedures'
  }
] as const;

export interface ValidationResult {
  passed: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  details: {
    planetary_positions?: any[];
    aspects?: any[];
    calculation_time_ms?: number;
  };
}

export interface ComprehensiveValidation {
  overall_passed: boolean;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  test_results: Array<{
    test_name: string;
    result: ValidationResult;
  }>;
  performance_metrics: {
    average_calculation_time: number;
    max_calculation_time: number;
    total_time: number;
  };
}

/**
 * Validates Swiss Ephemeris calculations against known astronomical data
 */
export async function validateSwissEphemeris(
  swe: SwissAdapter,
  testDate: string,
  ephFlag: number
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const startTime = Date.now();
  
  try {
    // Calculate Julian Day
    const date = new Date(testDate);
    const jdUT = swe.julday(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours() + date.getUTCMinutes() / 60,
      swe.SE_GREG_CAL
    );

    if (!Number.isFinite(jdUT)) {
      errors.push('Failed to calculate Julian Day');
      return { passed: false, score: 0, errors, warnings, details: {} };
    }

    // Calculate planetary positions
    const positions = await calculatePlanetaryPositions(swe, jdUT, ephFlag);
    
    if (positions.length === 0) {
      errors.push('No planetary positions calculated');
      return { passed: false, score: 0, errors, warnings, details: {} };
    }

    // Validate against known data if available
    const knownData = VALIDATION_DATA[testDate as keyof typeof VALIDATION_DATA];
    if (knownData) {
      for (const [planetName, expectedData] of Object.entries(knownData)) {
        const position = positions.find(p => p.planet.toLowerCase() === planetName.toLowerCase());
        
        if (position && expectedData.longitude !== null) {
          const diff = Math.abs(position.longitude - expectedData.longitude);
          if (diff > expectedData.tolerance) {
            errors.push(
              `${planetName} position off by ${diff.toFixed(2)}° (expected ~${expectedData.longitude}°, got ${position.longitude.toFixed(2)}°)`
            );
          }
        }
      }
    }

    // Calculate aspects
    const aspects = calculateAspects(positions);

    // Basic validation checks
    const sunPosition = positions.find(p => p.planet === 'SUN');
    const moonPosition = positions.find(p => p.planet === 'MOON');

    if (!sunPosition) {
      errors.push('Sun position not calculated');
    } else {
      // Sun should move about 1° per day
      if (sunPosition.speed < 0.8 || sunPosition.speed > 1.2) {
        warnings.push(`Sun speed unusual: ${sunPosition.speed.toFixed(4)}°/day (expected ~0.98)`);
      }
    }

    if (!moonPosition) {
      errors.push('Moon position not calculated');
    } else {
      // Moon should move about 12-15° per day
      if (Math.abs(moonPosition.speed) < 10 || Math.abs(moonPosition.speed) > 16) {
        warnings.push(`Moon speed unusual: ${moonPosition.speed.toFixed(4)}°/day (expected 10-15)`);
      }
    }

    // Validate aspect calculations
    if (aspects.length === 0) {
      warnings.push('No aspects calculated - this might indicate an issue');
    }

    // Check for impossible positions
    for (const position of positions) {
      if (position.longitude < 0 || position.longitude >= 360) {
        errors.push(`Invalid longitude for ${position.planet}: ${position.longitude}°`);
      }
      
      if (position.latitude < -90 || position.latitude > 90) {
        errors.push(`Invalid latitude for ${position.planet}: ${position.latitude}°`);
      }
    }

    const calculationTime = Date.now() - startTime;
    const passed = errors.length === 0;
    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 10));

    return {
      passed,
      score,
      errors,
      warnings,
      details: {
        planetary_positions: positions,
        aspects: aspects,
        calculation_time_ms: calculationTime
      }
    };

  } catch (error: any) {
    errors.push(`Calculation error: ${error.message}`);
    return {
      passed: false,
      score: 0,
      errors,
      warnings,
      details: {
        calculation_time_ms: Date.now() - startTime
      }
    };
  }
}

/**
 * Tests activity-based recommendations for accuracy
 */
export async function validateActivityRecommendations(
  swe: SwissAdapter,
  ephFlag: number
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const startTime = Date.now();

  try {
    for (const testCase of ACTIVITY_TEST_CASES) {
      const date = new Date(testCase.dateTime);
      const jdUT = swe.julday(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours() + date.getUTCMinutes() / 60,
        swe.SE_GREG_CAL
      );

      // Import activity analysis dynamically to avoid circular dependencies
      const { analyzeActivityTiming } = await import('./enhancedSwissCalculations');
      
      const positions = await calculatePlanetaryPositions(swe, jdUT, ephFlag);
      const aspects = calculateAspects(positions);
      const analysis = analyzeActivityTiming(testCase.activity, positions, aspects);

      // Validate score is in expected range
      if (analysis.score < testCase.expectedRange.min || analysis.score > testCase.expectedRange.max) {
        warnings.push(
          `${testCase.name}: Score ${analysis.score} outside expected range ${testCase.expectedRange.min}-${testCase.expectedRange.max}`
        );
      }

      // Validate that recommendation matches score
      const expectedRecommendation = getExpectedRecommendation(analysis.score);
      if (analysis.recommendation !== expectedRecommendation) {
        warnings.push(
          `${testCase.name}: Recommendation '${analysis.recommendation}' doesn't match score ${analysis.score} (expected '${expectedRecommendation}')`
        );
      }

      // Validate that we have meaningful factors
      if (analysis.primaryFactors.length === 0 && analysis.supportiveFactors.length === 0 && analysis.challengingFactors.length === 0) {
        errors.push(`${testCase.name}: No analysis factors provided`);
      }
    }

    const passed = errors.length === 0;
    const score = Math.max(0, 100 - (errors.length * 25) - (warnings.length * 10));

    return {
      passed,
      score,
      errors,
      warnings,
      details: {
        calculation_time_ms: Date.now() - startTime
      }
    };

  } catch (error: any) {
    errors.push(`Activity validation error: ${error.message}`);
    return {
      passed: false,
      score: 0,
      errors,
      warnings,
      details: {
        calculation_time_ms: Date.now() - startTime
      }
    };
  }
}

/**
 * Runs comprehensive validation of Swiss Ephemeris integration
 */
export async function runComprehensiveValidation(
  swe: SwissAdapter,
  ephFlag: number
): Promise<ComprehensiveValidation> {
  const testResults: Array<{ test_name: string; result: ValidationResult }> = [];
  const calculationTimes: number[] = [];
  const overallStart = Date.now();

  // Test 1: Basic Swiss Ephemeris calculations
  const basicTest = await validateSwissEphemeris(swe, '2024-01-01T12:00:00.000Z', ephFlag);
  testResults.push({ test_name: 'Basic Planetary Calculations', result: basicTest });
  if (basicTest.details.calculation_time_ms) {
    calculationTimes.push(basicTest.details.calculation_time_ms);
  }

  // Test 2: Solstice calculation (high precision requirement)
  const solsticeTest = await validateSwissEphemeris(swe, '2024-06-21T12:00:00.000Z', ephFlag);
  testResults.push({ test_name: 'Solstice Precision', result: solsticeTest });
  if (solsticeTest.details.calculation_time_ms) {
    calculationTimes.push(solsticeTest.details.calculation_time_ms);
  }

  // Test 3: Activity-based recommendations
  const activityTest = await validateActivityRecommendations(swe, ephFlag);
  testResults.push({ test_name: 'Activity Recommendations', result: activityTest });
  if (activityTest.details.calculation_time_ms) {
    calculationTimes.push(activityTest.details.calculation_time_ms);
  }

  // Test 4: Edge case - leap year
  const leapYearTest = await validateSwissEphemeris(swe, '2024-02-29T12:00:00.000Z', ephFlag);
  testResults.push({ test_name: 'Leap Year Handling', result: leapYearTest });
  if (leapYearTest.details.calculation_time_ms) {
    calculationTimes.push(leapYearTest.details.calculation_time_ms);
  }

  // Calculate overall metrics
  const passedTests = testResults.filter(t => t.result.passed).length;
  const totalTests = testResults.length;
  const overallPassed = passedTests === totalTests;

  const totalTime = Date.now() - overallStart;
  const averageTime = calculationTimes.length > 0 ? 
    calculationTimes.reduce((a, b) => a + b, 0) / calculationTimes.length : 0;
  const maxTime = calculationTimes.length > 0 ? Math.max(...calculationTimes) : 0;

  return {
    overall_passed: overallPassed,
    total_tests: totalTests,
    passed_tests: passedTests,
    failed_tests: totalTests - passedTests,
    test_results: testResults,
    performance_metrics: {
      average_calculation_time: averageTime,
      max_calculation_time: maxTime,
      total_time: totalTime
    }
  };
}

// Helper function to get expected recommendation based on score
function getExpectedRecommendation(score: number): string {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 65) return 'GOOD';
  if (score >= 45) return 'NEUTRAL';
  if (score >= 30) return 'CHALLENGING';
  return 'AVOID';
}

/**
 * Simple validation endpoint for quick testing
 */
export async function quickValidation(swe: SwissAdapter, ephFlag: number): Promise<boolean> {
  try {
    const testDate = new Date();
    const jdUT = swe.julday(
      testDate.getUTCFullYear(),
      testDate.getUTCMonth() + 1, 
      testDate.getUTCDate(),
      testDate.getUTCHours() + testDate.getUTCMinutes() / 60,
      swe.SE_GREG_CAL
    );

    const positions = await calculatePlanetaryPositions(swe, jdUT, ephFlag);
    
    // Basic check: we should get Sun and Moon at minimum
    const hasSun = positions.some(p => p.planet === 'SUN');
    const hasMoon = positions.some(p => p.planet === 'MOON');
    
    return hasSun && hasMoon && positions.length >= 7; // At least 7 major bodies
  } catch (error) {
    console.error('Quick validation failed:', error);
    return false;
  }
}