# Auspicious Time - Personal Time Advisor

A sophisticated web application that combines Vedic astrology, numerology, and time-of-day heuristics to help users find the most auspicious times for important activities.

## ✨ Features

- **🌙 Vedic Astrology**: Tithi, Nakshatra, Rahu Kalam, Yamaganda, Gulika Kalam, Abhijit Muhurta
- **🔢 Numerology**: Life path and personal day calculations
- **⏰ Time Intelligence**: Hour-based recommendations for different activities
- **👤 Personalized Analysis**: Tarabala and Chandrabala based on birth details
- **🎯 Smart Rules**: Activity heuristics in engine (UI no longer asks for activity)
- **📱 Modern UI**: Responsive dark-themed interface with geolocation support
- **💰 Donation Integration**: Razorpay payment gateway with UPI fallback

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd auspicious-time
npm install

# Set up environment (Windows PowerShell)
Copy-Item .env.example .env
# Edit .env and set your API keys (see below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Scoring System

The application uses a sophisticated 0-100 scoring system that combines:

1. **Numerology (20%)**: Compatibility between birth date and target date
2. **Astrology (80%)**: Vedic calculations including:
   - Tarabala (birth nakshatra compatibility)
   - Chandrabala (moon position analysis)
   - Vedic time windows (avoids Rahu Kalam, etc.)
3. **Time Heuristics**: Hour-based adjustments (+/- based on time of day)

### Score Interpretation

- **80-100**: Highly auspicious - excellent time to proceed
- **60-79**: Generally favorable - good time with minor considerations
- **40-59**: Proceed with caution - workable but not ideal
- **20-39**: Better to avoid - significant unfavorable factors
- **0-19**: Strongly discouraged - multiple blocking factors

## 🔧 Configuration

### Environment Variables

```bash
# Google Places (required for location inputs)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY

# Swiss Ephemeris (recommended for on-device/SSR accuracy)
SE_EPHE_PATH=./ephe
SE_ALLOW_MOSHIER=1

# Payment Integration (optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
```

### Ephemeris Files

Place Swiss Ephemeris files in the `ephe/` directory:

- `sepl_18.se1` - Planetary data (1800-2399)
- `semo_18.se1` - Moon data (1800-2399)
- `seas_18.se1` - Asteroid data (optional)

Files are automatically selected based on the calculation year.

If ephemeris files are not present and `SE_ALLOW_MOSHIER=1`, the system falls back to Moshier.

## 📍 Location & Places

- UI location fields (Place of birth, Event location) use Google Places Autocomplete (new `gmpx-place-autocomplete`).
- Ensure your API key has Places API (New) enabled and billing is on.
- Billing is REQUIRED for Places Autocomplete. Enable it here (choose your project): https://console.cloud.google.com/billing
- For local dev, allow the HTTP referrer `http://localhost:3000/*` on the key.

Checklist (must do):

- Enable Places API (New): https://console.developers.google.com/apis/api/places.googleapis.com/overview
- Attach a valid billing account to the project: https://console.cloud.google.com/billing
- Wait a few minutes for changes to propagate
- Verify with backend test:
  - `cmd /c "set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY && node scripts/test-places.mjs Mum"`
  - Expect `OK { suggestion: "Mumbai, Maharashtra, India", ... }`

## 📚 Documentation

### Complete API & Function Reference

- **[API Documentation](./docs/API.md)** - Complete REST API reference with examples
- **[Component Documentation](./docs/COMPONENTS.md)** - React component props and usage
- **[Library Functions](./docs/LIBRARY_FUNCTIONS.md)** - Utility functions and algorithms
- **[Quick Reference](./docs/QUICK_REFERENCE.md)** - Developer cheat sheet

### Key APIs

```javascript
// Main evaluation function
import { evaluateTime } from "@/lib/evaluator";

const result = evaluateTime({
  dobISO: "1990-05-15T08:30:00.000Z",
  targetISO: "2024-01-20T10:00:00.000Z",
  activity: "new_business",
});

console.log(result.verdict); // 'GOOD' | 'OKAY' | 'AVOID'
console.log(result.score); // 0-100
```

```javascript
// Enhanced Astrology API endpoint (unified scoring)
const response = await fetch("/api/astrology/enhanced", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    dobISO: "1990-05-15T08:30:00.000Z",
    targetISO: "2025-01-20T10:00:00.000Z",
    birthLat: 12.9716, // optional
    birthLon: 77.5946, // optional
    eventLat: 19.076,
    eventLon: 72.8777,
    tz: "Asia/Kolkata",
  }),
});
```

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Calculations**: Swiss Ephemeris (sweph package)
- **Algorithms**: Custom numerology and Vedic astrology implementations
- **Payments**: Razorpay integration

### Project Structure

```
auspicious-time/
├── app/
│   ├── api/astrology/enhanced/  # Unified scoring API (Swiss-based)
│   ├── api/astrology/local/     # Lightweight daily windows API
│   └── page.tsx                 # Main application page
├── components/
│   ├── AuspiciousTimeChecker.tsx  # Main UI component
│   ├── GooglePlacesInput.tsx      # Places Autocomplete input (web component)
│   └── RazorpayDonate.tsx         # Payment component
├── lib/
│   ├── evaluator.ts             # Core evaluation logic
│   ├── numerology.ts            # Numerology calculations
│   ├── timeHeuristics.ts        # Time-of-day recommendations
│   ├── astro/                   # Astrological calculations
│   └── utils/                   # Utility functions
├── ephe/                        # Swiss Ephemeris data files
└── docs/                        # Comprehensive documentation
```

## 🔬 Technical Details

### Astrological Calculations

- **Swiss Ephemeris**: Sub-arcsecond accuracy for celestial positions
- **Sidereal System**: Uses Lahiri ayanamsa for Vedic calculations
- **NOAA Algorithms**: Fallback for sunrise/sunset calculations
- **Precision**: Handles both tropical and sidereal coordinate systems

### Numerology System

- **Life Path**: Calculated from birth date using digit reduction
- **Personal Day**: Daily numerological influence
- **Master Numbers**: Preserves 11 and 22 as special cases
- **Activity Adjustments**: Keyword-based score modifications

### Time Heuristics

- **Circadian Rhythms**: Morning clarity, post-lunch dip awareness
- **Activity Matching**: Specialized recommendations per activity type
- **Cultural Considerations**: Pre-dawn spiritual practice recognition

## 🧪 Development

### Running Tests

```bash
# Backend Places Autocomplete test (validates API key)
# PowerShell (Windows)
cmd /c "set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY && node scripts/test-places.mjs Mum"
```

### Linting & Formatting

```bash
npm run lint          # ESLint checking
npm run lint:fix      # Auto-fix issues
```

### Building

```bash
npm run build         # Production build
npm run start         # Production server
```

## 🚀 Deployment

### Environment Setup

1. Set up ephemeris files in production
2. Configure environment variables
3. Set up Razorpay keys (if using donations)

### Vercel Deployment

```bash
# Deploy to Vercel
npm run build
vercel deploy
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code patterns
4. Add tests for new functionality
5. Update documentation as needed
6. Submit a pull request

### Code Style

- Use TypeScript for type safety
- Follow the existing function naming conventions
- Add JSDoc comments for public functions
- Use consistent error handling patterns

## 📖 Background

### Vedic Astrology Concepts

This application implements traditional Vedic astrology concepts:

- **Panchang**: Five limbs of time (Tithi, Nakshatra, Yoga, Karana, Var)
- **Muhurta**: Auspicious time selection for activities
- **Tarabala**: Compatibility based on birth and target nakshatras
- **Chandrabala**: Moon's position relative to birth sign

### Numerology Foundation

Uses Pythagorean numerology principles:

- Life path numbers determine personality and life patterns
- Personal day numbers influence daily energy
- Master numbers (11, 22) carry special significance

## ⚠️ Disclaimers

- **Guidance Only**: This application provides guidance, not definitive predictions
- **Cultural Context**: Vedic astrology interpretations may vary by tradition
- **Professional Consultation**: For critical life events, consult qualified astrologers
- **Accuracy**: Calculations are mathematically precise but interpretation is subjective

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Swiss Ephemeris**: High-precision astronomical calculations
- **Vedic Astrology Tradition**: Ancient wisdom adapted for modern use
- **Open Source Community**: Libraries and tools that make this possible

---

For detailed documentation, see the [docs/](./docs/) directory or start with the [Quick Reference Guide](./docs/QUICK_REFERENCE.md).
