# Library Functions Documentation

## Overview

This document covers all public library functions in the Auspicious Time application, organized by module and functionality.

---

## Core Evaluation Functions

### evaluateTime

**Location**: `/lib/evaluator.ts`

The main evaluation function that combines numerology, time heuristics, and optional astrological data to produce a comprehensive assessment.

#### Signature

```typescript
function evaluateTime(input: EvalInput, astro?: EvalAstroWindows): EvalResult
```

#### Parameters

```typescript
interface EvalInput {
  dobISO: string;      // Birth date/time in ISO format
  targetISO: string;   // Target date/time to evaluate
  activity: string;    // Activity type or description
}

interface EvalAstroWindows {
  rahu_kalam?: WindowISO[];
  yamaganda?: WindowISO[];
  gulika_kalam?: WindowISO[];
  abhijit_muhurta?: WindowISO[];
  tithi?: { name?: string };
  nakshatra?: { name?: string };
  verdict?: { score?: number; status?: string; reasons?: string[] };
}
```

#### Returns

```typescript
interface EvalResult {
  verdict: 'GOOD' | 'OKAY' | 'AVOID';
  score: number;        // 0-100
  reasons: string[];
  astro?: {
    tithi?: string;
    nakshatra?: string;
  };
}
```

#### Example Usage

```javascript
import { evaluateTime } from '@/lib/evaluator';

// Basic numerology + time heuristics evaluation
const basicResult = evaluateTime({
  dobISO: '1990-05-15T08:30:00.000Z',
  targetISO: '2024-01-20T10:00:00.000Z',
  activity: 'new_business'
});

console.log(basicResult.verdict);  // 'GOOD'
console.log(basicResult.score);    // 72
console.log(basicResult.reasons);  // ['Numerology baseline: 70/100', 'Morning clarity supports focus']

// With astrological data
const astroData = await getAstrologicalData(); // from API
const fullResult = evaluateTime({
  dobISO: '1990-05-15T08:30:00.000Z',
  targetISO: '2024-01-20T10:00:00.000Z',
  activity: 'marriage'
}, astroData);

console.log(fullResult.astro?.tithi);      // 'Shukla Dashami'
console.log(fullResult.astro?.nakshatra);  // 'Hasta'
```

#### Scoring Algorithm

The function uses a weighted scoring system:

1. **Numerology Score (20% weight)**: Based on life path compatibility
2. **Astrological Score (80% weight)**: Vedic calculations when available
3. **Time-of-day Boost**: Additive bonus/penalty based on hour

---

## Numerology Functions

### numerologyScore

**Location**: `/lib/numerology.ts`

Calculates a numerological compatibility score between birth date and target date.

#### Signature

```typescript
function numerologyScore(
  dobISO: string,
  targetISO: string,
  activity?: string,
  includeTimeOfDay?: boolean
): number
```

#### Parameters

- `dobISO`: Birth date in ISO format
- `targetISO`: Target date to evaluate
- `activity`: Activity type for score adjustment (optional)
- `includeTimeOfDay`: Include time-based adjustments (default: false)

#### Returns

Number between 0-100 representing compatibility score.

#### Example Usage

```javascript
import { numerologyScore } from '@/lib/numerology';

const score = numerologyScore(
  '1990-05-15T08:30:00.000Z',
  '2024-01-20T10:00:00.000Z',
  'business'
);

console.log(score); // 74
```

### lifePathFromISO

Calculates life path number from birth date.

#### Signature

```typescript
function lifePathFromISO(dobISO: string): number
```

#### Example Usage

```javascript
import { lifePathFromISO } from '@/lib/numerology';

const lifePath = lifePathFromISO('1990-05-15T08:30:00.000Z');
console.log(lifePath); // 5 (or 11/22 for master numbers)
```

### personalDayFromISO

Calculates personal day number for a specific date.

#### Signature

```typescript
function personalDayFromISO(dobISO: string, targetISO: string): number
```

#### Example Usage

```javascript
import { personalDayFromISO } from '@/lib/numerology';

const personalDay = personalDayFromISO(
  '1990-05-15T08:30:00.000Z',
  '2024-01-20T10:00:00.000Z'
);
console.log(personalDay); // 7
```

### Utility Functions

#### sumDigits

Sums all digits in a number.

```typescript
function sumDigits(n: number): number

// Example
sumDigits(1234); // 10 (1+2+3+4)
```

#### reduceToCore

Reduces number to core numerological value (1-9, 11, 22).

```typescript
function reduceToCore(n: number): number

// Example
reduceToCore(29); // 11 (master number preserved)
reduceToCore(38); // 2 (3+8=11, then 1+1=2)
```

---

## Time Heuristics Functions

### timeOfDayNotes

**Location**: `/lib/timeHeuristics.ts`

Provides time-of-day recommendations and scoring adjustments.

#### Signature

```typescript
function timeOfDayNotes(d: Date, activity: string): {
  boost: number;
  notes: string[];
}
```

#### Parameters

- `d`: Target date/time
- `activity`: Activity type for specialized recommendations

#### Returns

- `boost`: Numerical adjustment (-1 to +1)
- `notes`: Array of explanatory messages

#### Example Usage

```javascript
import { timeOfDayNotes } from '@/lib/timeHeuristics';

const timeAdvice = timeOfDayNotes(
  new Date('2024-01-20T09:00:00'),
  'business'
);

console.log(timeAdvice.boost); // 1
console.log(timeAdvice.notes); // ['Morning clarity (06:00–11:00) supports focus & momentum.']
```

#### Time Recommendations

- **06:00-11:00**: +1 boost, morning clarity
- **14:00-16:00**: -1 boost, post-lunch energy dip
- **16:00-19:00**: +1 boost, good for decisions
- **23:00-05:00**: -1 boost, late night caution
- **04:00-06:00**: +1 boost for spiritual activities only

---

## Astrology Functions

### computeAbhijit

**Location**: `/lib/astro/vedicWindows.ts`

Calculates the Abhijit Muhurta (auspicious noon period) from sunrise and sunset times.

#### Signature

```typescript
function computeAbhijit(sunrise: Date, sunset: Date): IsoWindow | null
```

#### Parameters

- `sunrise`: Local sunrise time
- `sunset`: Local sunset time

#### Returns

ISO window object or null if calculation fails.

#### Example Usage

```javascript
import { computeAbhijit } from '@/lib/astro/vedicWindows';

const sunrise = new Date('2024-01-20T06:38:00');
const sunset = new Date('2024-01-20T18:15:00');

const abhijit = computeAbhijit(sunrise, sunset);
console.log(abhijit);
// {
//   start: "2024-01-20T12:10:00.000Z",
//   end: "2024-01-20T12:49:00.000Z"
// }
```

### computeDayWindows

Calculates Rahu Kalam, Yamaganda, and Gulika Kalam for a specific day.

#### Signature

```typescript
function computeDayWindows(date: Date, sunrise: Date, sunset: Date): {
  rahu_kalam: IsoWindow[];
  yamaganda: IsoWindow[];
  gulika_kalam: IsoWindow[];
}
```

#### Example Usage

```javascript
import { computeDayWindows } from '@/lib/astro/vedicWindows';

const date = new Date('2024-01-20');
const sunrise = new Date('2024-01-20T06:38:00');
const sunset = new Date('2024-01-20T18:15:00');

const windows = computeDayWindows(date, sunrise, sunset);
console.log(windows.rahu_kalam);   // [{ start: "...", end: "..." }]
console.log(windows.yamaganda);    // [{ start: "...", end: "..." }]
console.log(windows.gulika_kalam); // [{ start: "...", end: "..." }]
```

### sunriseSunsetUTC

**Location**: `/lib/astro/sunriseNoaa.ts`

Calculates sunrise and sunset times using NOAA algorithms.

#### Signature

```typescript
function sunriseSunsetUTC(
  targetUTC: Date, 
  lonDeg: number, 
  latDeg: number
): { sunrise?: Date; sunset?: Date }
```

#### Parameters

- `targetUTC`: Target date in UTC
- `lonDeg`: Longitude in decimal degrees
- `latDeg`: Latitude in decimal degrees

#### Returns

Object with optional sunrise/sunset Date objects (undefined for polar regions).

#### Example Usage

```javascript
import { sunriseSunsetUTC } from '@/lib/astro/sunriseNoaa';

const times = sunriseSunsetUTC(
  new Date('2024-01-20T12:00:00Z'),
  77.5946,  // Bangalore longitude
  12.9716   // Bangalore latitude
);

console.log(times.sunrise); // Date object in UTC
console.log(times.sunset);  // Date object in UTC
```

### sunAltitudeDeg

**Location**: `/lib/astro/sunTimes.ts`

Calculates sun's apparent altitude using Swiss Ephemeris.

#### Signature

```typescript
function sunAltitudeDeg(
  swe: SwissAdapter,
  jd_ut: number,
  lonDeg: number,
  latDeg: number,
  ephFlag: number
): number
```

#### Parameters

- `swe`: Swiss Ephemeris adapter instance
- `jd_ut`: Julian day (UT)
- `lonDeg`: Longitude in degrees
- `latDeg`: Latitude in degrees
- `ephFlag`: Ephemeris calculation flags

#### Returns

Sun altitude in degrees (-90 to +90).

### sunriseSunsetAround

Finds precise sunrise/sunset times using Swiss Ephemeris.

#### Signature

```typescript
function sunriseSunsetAround(
  swe: SwissAdapter,
  jdCenter: number,
  lonDeg: number,
  latDeg: number,
  ephFlag: number
): { sunriseJD?: number; sunsetJD?: number }
```

#### Returns

Julian day numbers for sunrise/sunset events.

---

## Ephemeris File Management

### bandSuffixForYear

**Location**: `/lib/astro/epheFiles.ts`

Determines which Swiss Ephemeris file band is needed for a given year.

#### Signature

```typescript
function bandSuffixForYear(year: number): string
```

#### Example Usage

```javascript
import { bandSuffixForYear } from '@/lib/astro/epheFiles';

console.log(bandSuffixForYear(2024)); // "18" (for 1800-2399 band)
console.log(bandSuffixForYear(2500)); // "24" (for 2400-2999 band)
```

### requiredFilesForYear

Returns the required ephemeris files for accurate Sun/Moon calculations.

#### Signature

```typescript
function requiredFilesForYear(year: number): string[]
```

#### Example Usage

```javascript
import { requiredFilesForYear } from '@/lib/astro/epheFiles';

const files = requiredFilesForYear(2024);
console.log(files); // ['sepl_18.se1', 'semo_18.se1']
```

### optionalFilesForYear

Returns optional ephemeris files (asteroids, etc.).

#### Signature

```typescript
function optionalFilesForYear(year: number): string[]
```

---

## Utility Functions

### withinISO

**Location**: `/lib/format.ts`

Checks if a target time falls within a specified ISO time window.

#### Signature

```typescript
function withinISO(
  targetISO: string, 
  startISO?: string, 
  endISO?: string
): boolean
```

#### Example Usage

```javascript
import { withinISO } from '@/lib/format';

const isWithin = withinISO(
  '2024-01-20T10:30:00.000Z',
  '2024-01-20T10:00:00.000Z',
  '2024-01-20T11:00:00.000Z'
);
console.log(isWithin); // true
```

---

## Scoring Utilities

### clamp

**Location**: `/lib/utils/score.ts`

Constrains a number within specified bounds.

#### Signature

```typescript
function clamp(n: number, lo = 0, hi = 100): number
```

#### Example Usage

```javascript
import { clamp } from '@/lib/utils/score';

console.log(clamp(150));     // 100
console.log(clamp(-10));     // 0
console.log(clamp(75));      // 75
console.log(clamp(50, 0, 80)); // 50
```

### toScore100

Converts scores from different scales to 0-100 range.

#### Signature

```typescript
function toScore100(from: number, base: 4 | 5 | 100 = 100): number
```

#### Example Usage

```javascript
import { toScore100 } from '@/lib/utils/score';

console.log(toScore100(3, 4));   // 75 (3/4 = 75%)
console.log(toScore100(85));     // 85 (already 0-100)
```

### toScore4

Converts 0-100 score to legacy 0-4 scale.

#### Signature

```typescript
function toScore4(score100: number): number
```

### labelFor

Converts numerical score to status label.

#### Signature

```typescript
function labelFor(score100: number): 'Avoid' | 'Proceed with caution' | 'Proceed'
```

#### Example Usage

```javascript
import { labelFor } from '@/lib/utils/score';

console.log(labelFor(85));  // 'Proceed'
console.log(labelFor(50));  // 'Proceed with caution'
console.log(labelFor(25));  // 'Avoid'
```

---

## Advanced Astrology Functions

### Window Calculation Types

```typescript
interface IsoWindow {
  start: string;    // ISO timestamp
  end: string;      // ISO timestamp
}
```

### Internal Helper Functions

#### minutesSinceMidnight

**Location**: `/lib/astro/vedicWindows.ts`

Converts a Date to minutes since midnight (local time).

#### windowISO

Creates ISO window from base date and minute offsets.

#### daytimeSegments

Divides the day into 8 equal segments for Rahu Kalam calculations.

---

## Swiss Ephemeris Integration

### Key Constants

```javascript
// Segment indexes for different weekdays (Sunday = 0)
const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA_SEG = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SEG = [7, 1, 6, 4, 5, 3, 2];
```

### Coordinate Utilities

#### getRAdeg / getDeclinationDeg

**Location**: `/lib/astro/sunTimes.ts`

Extract astronomical coordinates from Swiss Ephemeris results, handling various result formats.

#### norm180

Normalizes angles to -180 to +180 degree range.

```typescript
function norm180(x: number): number
```

---

## Usage Patterns

### Complete Evaluation Workflow

```javascript
import { evaluateTime } from '@/lib/evaluator';
import { numerologyScore, lifePathFromISO } from '@/lib/numerology';
import { timeOfDayNotes } from '@/lib/timeHeuristics';

// Step 1: Get individual components
const numerology = numerologyScore(dobISO, targetISO, activity);
const timeNotes = timeOfDayNotes(new Date(targetISO), activity);
const lifePath = lifePathFromISO(dobISO);

// Step 2: Get astrological data (if available)
const astroData = await fetch('/api/astrology/local', {
  method: 'POST',
  body: JSON.stringify({ dobISO, targetISO, lat, lon, tz, activity })
}).then(res => res.json());

// Step 3: Combine everything
const finalResult = evaluateTime(
  { dobISO, targetISO, activity },
  astroData.ok ? astroData : undefined
);

console.log({
  numerology,
  timeNotes,
  lifePath,
  finalResult
});
```

### Bulk Time Evaluation

```javascript
// Evaluate multiple dates
const dates = ['2024-01-20', '2024-01-21', '2024-01-22'];
const results = await Promise.all(
  dates.map(async date => {
    const targetISO = `${date}T10:00:00.000Z`;
    
    // Get astro data for each date
    const astroData = await getAstroData(dobISO, targetISO, lat, lon, tz);
    
    return {
      date,
      result: evaluateTime({ dobISO, targetISO, activity }, astroData)
    };
  })
);

// Find best option
const bestDate = results
  .sort((a, b) => b.result.score - a.result.score)[0];

console.log(`Best date: ${bestDate.date} (Score: ${bestDate.result.score})`);
```

### Custom Activity Rules

```javascript
// Define custom evaluation logic
function evaluateCustomActivity(input, astroData) {
  const baseResult = evaluateTime(input, astroData);
  
  // Custom adjustments for specific activities
  if (input.activity.includes('exam')) {
    // Boost morning times for exams
    const hour = new Date(input.targetISO).getHours();
    if (hour >= 9 && hour <= 11) {
      baseResult.score += 10;
      baseResult.reasons.push('Morning hours favor mental clarity for exams');
    }
  }
  
  return baseResult;
}
```

---

## Error Handling Patterns

### Graceful Degradation

```javascript
async function safeEvaluate(input) {
  try {
    // Try full astrological evaluation
    const astroData = await getAstroData(input);
    return evaluateTime(input, astroData);
  } catch (error) {
    console.warn('Astrology unavailable, using numerology only:', error);
    
    // Fallback to numerology + time heuristics
    return evaluateTime(input);
  }
}
```

### Input Validation

```javascript
function validateInput(input) {
  const errors = [];
  
  if (!input.dobISO || isNaN(new Date(input.dobISO).getTime())) {
    errors.push('Invalid birth date');
  }
  
  if (!input.targetISO || isNaN(new Date(input.targetISO).getTime())) {
    errors.push('Invalid target date');
  }
  
  if (!input.activity || input.activity.trim().length === 0) {
    errors.push('Activity type required');
  }
  
  return errors;
}
```

---

## Performance Optimization

### Memoization Example

```javascript
import { useMemo } from 'react';
import { lifePathFromISO } from '@/lib/numerology';

function OptimizedComponent({ dobISO }) {
  const lifePath = useMemo(() => {
    return lifePathFromISO(dobISO);
  }, [dobISO]);
  
  return <div>Life Path: {lifePath}</div>;
}
```

### Batch Processing

```javascript
// Process multiple evaluations efficiently
function batchEvaluate(inputs) {
  return inputs.map(input => {
    try {
      return evaluateTime(input);
    } catch (error) {
      return { verdict: 'AVOID', score: 0, reasons: ['Calculation error'], error };
    }
  });
}
```

---

## TypeScript Definitions

### Core Types

```typescript
// Re-exported from evaluator.ts
export type Verdict = 'GOOD' | 'OKAY' | 'AVOID';

export interface EvalInput {
  dobISO: string;
  targetISO: string;
  activity: string;
}

export interface EvalResult {
  verdict: Verdict;
  score: number;
  reasons: string[];
  astro?: {
    tithi?: string;
    nakshatra?: string;
  };
}

// From astro/types.ts
export interface Window {
  start: string;
  end: string;
}

export interface AstroPayload {
  dobISO: string;
  targetISO: string;
  lat: number;
  lon: number;
  tz: string;
}
```

### Utility Types

```typescript
// Score utilities
export type VerdictStatus = 'Avoid' | 'Proceed with caution' | 'Proceed';

// Astrological windows
export type IsoWindow = { start: string; end: string };

// Time heuristics
export interface TimeAdvice {
  boost: number;
  notes: string[];
}
```

---

## Migration Guide

### From 0-4 Scale to 0-100 Scale

If you have existing code using the old 0-4 scoring system:

```javascript
// Old code
const oldScore = calculateScore(); // returns 0-4

// New code
import { toScore100, toScore4 } from '@/lib/utils/score';

const newScore = toScore100(oldScore, 4); // convert 0-4 to 0-100
const backCompat = toScore4(newScore);    // convert back if needed
```

### From Simple to Comprehensive Evaluation

```javascript
// Before: Simple numerology
const score = numerologyScore(dob, target);

// After: Comprehensive evaluation
const result = evaluateTime(
  { dobISO: dob, targetISO: target, activity },
  astroData
);
// Access score via result.score, verdict via result.verdict
```