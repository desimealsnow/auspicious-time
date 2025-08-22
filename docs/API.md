# Auspicious Time API Documentation

## Overview

The Auspicious Time application provides a comprehensive system for evaluating the auspiciousness of specific times using Vedic astrology, numerology, and time-of-day heuristics. It combines traditional astrological calculations with modern algorithmic approaches to provide timing guidance for various activities.

## Core Features

- **Vedic Astrology**: Tithi, Nakshatra, Rahu Kalam, Yamaganda, Gulika Kalam, Abhijit Muhurta
- **Personalized Analysis**: Tarabala and Chandrabala calculations based on birth details
- **Numerology**: Life path and personal day calculations
- **Time Heuristics**: Time-of-day recommendations based on activity type
- **Activity-Specific Rules**: Different evaluation criteria for various activities

---

## API Endpoints

### POST `/api/astrology/local`

Performs comprehensive astrological analysis for a specific time and location.

#### Request Body

```typescript
interface Payload {
  dobISO: string;      // Birth date/time in ISO format
  targetISO: string;   // Target date/time to evaluate in ISO format
  lat: number;         // Latitude (-90 to 90)
  lon: number;         // Longitude (-180 to 180)
  tz: string;          // Timezone identifier (e.g., "Asia/Kolkata")
  activity?: string;   // Activity type (optional, defaults to "general")
}
```

#### Activity Types

- `travel` - Travel or relocation activities
- `marriage` - Marriage ceremonies and relationship events
- `new_business` - Business launches and ventures
- `puja` - Spiritual practices and religious ceremonies
- `general` - Default for unspecified activities

#### Response Format

```typescript
interface AstrologyResponse {
  ok: boolean;
  error?: string;
  
  // Sunrise/sunset times
  sunrise: string;     // ISO string
  sunset: string;      // ISO string
  
  // Vedic time windows
  abhijit_muhurta: WindowISO[];
  rahu_kalam: WindowISO[];
  yamaganda: WindowISO[];
  gulika_kalam: WindowISO[];
  
  // Lunar calculations
  tithi: {
    name: string;      // e.g., "Shukla Pratipat"
    index: number;     // 1-30
  };
  nakshatra: {
    name: string;      // e.g., "Ashwini"
    index: number;     // 1-27
  };
  
  // Personalized analysis
  janma: {
    nakshatra_index: number;  // Birth nakshatra (1-27)
    rashi_index: number;      // Birth rashi (1-12)
  };
  tarabala: {
    index: number;     // 1-9
    name: string;      // e.g., "Sampat"
    isGood: boolean;
  };
  chandrabala: {
    relation: number;  // 1-12 (position from birth rashi)
    isGood: boolean;
  };
  
  // Final verdict
  verdict: {
    activity: string;
    status: "Avoid" | "Proceed with caution" | "Proceed";
    score: number;     // 0-100
    reasons: string[];
    next_safe_window?: WindowISO;
  };
  
  // Available safe time windows
  safe_windows: WindowISO[];
}

interface WindowISO {
  start: string;       // ISO string
  end: string;         // ISO string
}
```

#### Example Request

```javascript
const response = await fetch('/api/astrology/local', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dobISO: '1990-05-15T08:30:00.000Z',
    targetISO: '2024-01-20T10:00:00.000Z',
    lat: 12.9716,
    lon: 77.5946,
    tz: 'Asia/Kolkata',
    activity: 'new_business'
  })
});

const data = await response.json();
```

#### Example Response

```json
{
  "ok": true,
  "sunrise": "2024-01-20T01:08:32.000Z",
  "sunset": "2024-01-20T12:47:18.000Z",
  "abhijit_muhurta": [
    {
      "start": "2024-01-20T06:51:45.000Z",
      "end": "2024-01-20T07:38:05.000Z"
    }
  ],
  "rahu_kalam": [
    {
      "start": "2024-01-20T10:17:23.000Z",
      "end": "2024-01-20T11:46:35.000Z"
    }
  ],
  "tithi": {
    "name": "Shukla Dashami",
    "index": 10
  },
  "nakshatra": {
    "name": "Hasta",
    "index": 13
  },
  "verdict": {
    "activity": "new_business",
    "status": "Proceed",
    "score": 75,
    "reasons": [
      "Tarabala favorable (Sampat)",
      "Chandra bala OK",
      "Outside blocked periods"
    ]
  }
}
```

---

## Environment Configuration

### Required Environment Variables

- `SE_EPHE_PATH`: Path to Swiss Ephemeris files directory (default: "./ephe")
- `SE_ALLOW_MOSHIER`: Set to "1" to allow fallback calculations when ephemeris files are missing

### Optional Environment Variables

- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay key for donation functionality

### Ephemeris Files

The application requires Swiss Ephemeris files for accurate calculations:

- `sepl_18.se1` - Planetary data (1800-2399)
- `semo_18.se1` - Moon data (1800-2399)
- `seas_18.se1` - Asteroid data (optional)

Files are automatically selected based on the target year using the `requiredFilesForYear()` function.

---

## Error Handling

### Common Error Responses

```json
// Missing required fields
{
  "ok": false,
  "error": "Invalid payload"
}

// Missing ephemeris files
{
  "ok": false,
  "error": "Swiss ephemeris files missing in \"./ephe\". Add for 2024: sepl_18.se1, semo_18.se1. Or set SE_ALLOW_MOSHIER=1 to allow fallback."
}

// Calculation errors
{
  "ok": false,
  "error": "Sun calc: Swiss calculation failed"
}
```

### Status Codes

- `200`: Successful response or handled error
- `400`: Invalid request payload
- `500`: Internal server error

---

## Activity-Specific Rules

The API applies different evaluation criteria based on activity type:

| Activity | Avoids | Prefers Abhijit | Description |
|----------|--------|-----------------|-------------|
| `travel` | Rahu Kalam, Yamaganda | Yes | Travel and relocation |
| `marriage` | Rahu Kalam, Yamaganda, Gulika Kalam | Yes | Wedding ceremonies |
| `new_business` | Rahu Kalam, Gulika Kalam | Yes | Business launches |
| `puja` | Rahu Kalam, Yamaganda, Gulika Kalam | Yes | Spiritual practices |
| `general` | Rahu Kalam | Yes | Default activities |

---

## Rate Limiting & Performance

- **Runtime**: Node.js (no Edge Runtime due to Swiss Ephemeris requirements)
- **Caching**: Each request is processed independently (`dynamic = 'force-dynamic'`)
- **Performance**: Calculations typically complete in 100-500ms depending on complexity

---

## Integration Examples

### Basic Time Evaluation

```javascript
// Simple evaluation without astrology
const basicEval = evaluateTime({
  dobISO: '1990-05-15T08:30:00.000Z',
  targetISO: '2024-01-20T10:00:00.000Z',
  activity: 'start'
});

console.log(basicEval.verdict); // 'GOOD' | 'OKAY' | 'AVOID'
console.log(basicEval.score);   // 0-100
```

### Full Astrological Evaluation

```javascript
// Get astrological data first
const astroData = await fetch('/api/astrology/local', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dobISO: '1990-05-15T08:30:00.000Z',
    targetISO: '2024-01-20T10:00:00.000Z',
    lat: 12.9716,
    lon: 77.5946,
    tz: 'Asia/Kolkata',
    activity: 'marriage'
  })
}).then(res => res.json());

// Combine with numerology evaluation
const fullEval = evaluateTime({
  dobISO: '1990-05-15T08:30:00.000Z',
  targetISO: '2024-01-20T10:00:00.000Z',
  activity: 'marriage'
}, astroData);

console.log(fullEval.verdict);
console.log(fullEval.astro?.tithi);
console.log(fullEval.astro?.nakshatra);
```

---

## Technical Implementation Notes

### Swiss Ephemeris Integration

The application uses the `sweph` npm package for precise astronomical calculations:

- Supports both Moshier (built-in) and Swiss Ephemeris file modes
- Uses Lahiri ayanamsa for sidereal calculations
- Calculates both tropical and sidereal coordinates as needed

### Coordinate Systems

- **Input coordinates**: WGS84 decimal degrees
- **Time zones**: IANA timezone identifiers
- **Date formats**: ISO 8601 strings in UTC

### Accuracy Considerations

- Swiss Ephemeris provides sub-arcsecond accuracy for Moon/Sun positions
- NOAA algorithms used as fallback for sunrise/sunset when Swiss Ephemeris unavailable
- Vedic window calculations assume standard formulas (may vary by regional tradition)