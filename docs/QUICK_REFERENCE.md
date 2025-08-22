# Quick Reference Guide

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment
echo "SE_EPHE_PATH=./ephe" > .env.local
echo "SE_ALLOW_MOSHIER=1" >> .env.local

# Run development server
npm run dev
```

---

## 📡 API Quick Reference

### POST `/api/astrology/local`

```javascript
// Basic request
const response = await fetch('/api/astrology/local', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dobISO: '1990-05-15T08:30:00.000Z',
    targetISO: '2024-01-20T10:00:00.000Z',
    lat: 12.9716,
    lon: 77.5946,
    tz: 'Asia/Kolkata',
    activity: 'new_business'  // optional
  })
});

const data = await response.json();
console.log(data.verdict.status);  // "Proceed" | "Proceed with caution" | "Avoid"
console.log(data.verdict.score);   // 0-100
```

---

## 🧮 Core Functions

### evaluateTime() - Main Evaluation

```javascript
import { evaluateTime } from '@/lib/evaluator';

const result = evaluateTime({
  dobISO: '1990-05-15T08:30:00.000Z',
  targetISO: '2024-01-20T10:00:00.000Z',
  activity: 'marriage'
}, astroData); // optional

console.log(result.verdict);  // 'GOOD' | 'OKAY' | 'AVOID'
console.log(result.score);    // 0-100
```

### Numerology Functions

```javascript
import { numerologyScore, lifePathFromISO, personalDayFromISO } from '@/lib/numerology';

// Individual calculations
const score = numerologyScore(dobISO, targetISO, 'business');    // 0-100
const lifePath = lifePathFromISO(dobISO);                       // 1-9, 11, 22
const personalDay = personalDayFromISO(dobISO, targetISO);      // 1-9, 11, 22
```

### Time Heuristics

```javascript
import { timeOfDayNotes } from '@/lib/timeHeuristics';

const advice = timeOfDayNotes(new Date(), 'spiritual');
console.log(advice.boost);  // -1 to +1
console.log(advice.notes);  // ['Morning clarity supports focus']
```

---

## 🕐 Astrology Functions

### Vedic Windows

```javascript
import { computeAbhijit, computeDayWindows } from '@/lib/astro/vedicWindows';

// Abhijit Muhurta (auspicious noon period)
const abhijit = computeAbhijit(sunrise, sunset);

// Inauspicious periods
const windows = computeDayWindows(date, sunrise, sunset);
console.log(windows.rahu_kalam);    // [{ start: ISO, end: ISO }]
console.log(windows.yamaganda);     // [{ start: ISO, end: ISO }]
console.log(windows.gulika_kalam);  // [{ start: ISO, end: ISO }]
```

### Sunrise/Sunset

```javascript
import { sunriseSunsetUTC } from '@/lib/astro/sunriseNoaa';

const times = sunriseSunsetUTC(
  new Date('2024-01-20'),
  77.5946,  // longitude
  12.9716   // latitude
);

console.log(times.sunrise);  // Date object (UTC)
console.log(times.sunset);   // Date object (UTC)
```

---

## ⚛️ React Components

### AuspiciousTimeChecker - Main UI

```jsx
import AuspiciousTimeChecker from '@/components/AuspiciousTimeChecker';

export default function Page() {
  return <AuspiciousTimeChecker />;
}
```

### RazorpayDonate - Payment Component

```jsx
import RazorpayDonate from '@/components/RazorpayDonate';

// Basic usage
<RazorpayDonate />

// Customized
<RazorpayDonate
  amountInPaise={10000}  // ₹100
  label="Support App ❤️"
  name="My Astrology App"
/>
```

---

## 🛠️ Utility Functions

### Scoring & Formatting

```javascript
import { clamp, toScore100, labelFor } from '@/lib/utils/score';
import { withinISO } from '@/lib/format';

// Score utilities
const clamped = clamp(150, 0, 100);        // 100
const score100 = toScore100(3, 4);         // 75
const label = labelFor(85);                // 'Proceed'

// Time checking
const isInWindow = withinISO(
  '2024-01-20T10:30:00.000Z',  // target
  '2024-01-20T10:00:00.000Z',  // start
  '2024-01-20T11:00:00.000Z'   // end
); // true
```

---

## 🎯 Activity Types

| Code | Description | Astrology Rules |
|------|-------------|-----------------|
| `travel` | Travel/relocation | Avoids Rahu Kalam + Yamaganda |
| `marriage` | Wedding ceremonies | Avoids all inauspicious periods |
| `new_business` | Business launches | Avoids Rahu Kalam + Gulika |
| `puja` | Spiritual practices | Avoids all inauspicious periods |
| `general` | Default activities | Avoids Rahu Kalam only |

---

## 📊 Scoring System

### Score Ranges

- **80-100**: Highly auspicious
- **60-79**: Generally favorable  
- **40-59**: Proceed with caution
- **20-39**: Better to avoid
- **0-19**: Strongly discouraged

### Scoring Components

1. **Numerology (20%)**: Life path compatibility
2. **Astrology (80%)**: Vedic calculations when available
   - Tarabala (birth nakshatra compatibility)
   - Chandrabala (moon position from birth rashi)
   - Vedic time windows (Rahu Kalam, etc.)
3. **Time Boosts**: Hour-based adjustments

---

## 🌙 Vedic Astrology Terms

### Tithi (Lunar Days)
30 lunar phases from new moon to new moon:
- **Shukla Paksha** (1-15): Waxing moon
- **Krishna Paksha** (16-30): Waning moon

### Nakshatra (Lunar Mansions)
27 star constellations the moon passes through:
- **Examples**: Ashwini, Bharani, Krittika, Rohini...

### Inauspicious Periods
- **Rahu Kalam**: 1.5-hour period to avoid daily
- **Yamaganda**: Another inauspicious window
- **Gulika Kalam**: Third problematic period

### Auspicious Periods
- **Abhijit Muhurta**: ~48 minutes around solar noon

---

## 🔧 Environment Setup

### Required Files

```
ephe/
├── sepl_18.se1  # Planetary data (1800-2399)
├── semo_18.se1  # Moon data (1800-2399)
└── seas_18.se1  # Asteroid data (optional)
```

### Environment Variables

```bash
# Required for Swiss Ephemeris
SE_EPHE_PATH=./ephe
SE_ALLOW_MOSHIER=1  # Allow fallback when files missing

# Optional for donations
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key
```

---

## ⚡ Common Patterns

### Simple Evaluation

```javascript
import { evaluateTime } from '@/lib/evaluator';

const result = evaluateTime({
  dobISO: '1990-05-15T08:30:00.000Z',
  targetISO: '2024-01-20T10:00:00.000Z',
  activity: 'start'
});

if (result.verdict === 'GOOD') {
  console.log('Go ahead!');
} else if (result.verdict === 'OKAY') {
  console.log('Proceed carefully');
} else {
  console.log('Consider postponing');
}
```

### Find Best Time in Range

```javascript
async function findBestTimeInRange(startDate, endDate, input) {
  const results = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const targetISO = current.toISOString();
    const astroData = await getAstroData({ ...input, targetISO });
    const result = evaluateTime({ ...input, targetISO }, astroData);
    
    results.push({ date: new Date(current), result });
    current.setDate(current.getDate() + 1);
  }
  
  return results.sort((a, b) => b.result.score - a.result.score)[0];
}
```

### Check Multiple Activities

```javascript
const activities = ['travel', 'marriage', 'new_business'];
const scores = {};

for (const activity of activities) {
  scores[activity] = evaluateTime({
    dobISO, targetISO, activity
  }).score;
}

console.log(scores);
// { travel: 65, marriage: 82, new_business: 73 }
```

---

## 🚨 Common Issues

### Missing Ephemeris Files

```
Error: Swiss ephemeris files missing in "./ephe"
Solution: Set SE_ALLOW_MOSHIER=1 or download required .se1 files
```

### Invalid Coordinates

```javascript
// Validate coordinates before API call
if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
  // Coordinates are valid
} else {
  console.error('Invalid coordinates');
}
```

### Timezone Issues

```javascript
// Use IANA timezone identifiers
const validTZ = 'Asia/Kolkata';  // ✅ Correct
const invalidTZ = 'IST';         // ❌ Avoid abbreviations
```

---

## 🔍 Debugging

### Enable Debug Mode

```javascript
// API route has debugger statement
// Remove for production or set conditional breakpoints
```

### Check Swiss Ephemeris Status

```javascript
// In API route, check ephemeris file availability
const needed = requiredFilesForYear(2024);
const missing = missingFiles(epheDir, needed);
console.log('Missing files:', missing);
```

### Validate Calculation Results

```javascript
// Check if calculations succeeded
if (result.score === 0 && result.verdict === 'AVOID') {
  console.warn('Possible calculation error');
}
```

---

## 📚 See Also

- **[API.md](./API.md)** - Complete API documentation
- **[COMPONENTS.md](./COMPONENTS.md)** - React component documentation  
- **[LIBRARY_FUNCTIONS.md](./LIBRARY_FUNCTIONS.md)** - Library function reference
- **[Swiss Ephemeris](https://www.astro.com/swisseph/)** - Astronomical calculation engine
- **[Vedic Astrology](https://en.wikipedia.org/wiki/Hindu_astrology)** - Background on calculation methods
