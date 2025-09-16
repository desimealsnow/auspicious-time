Project Context for Agents and New Contributors

Overview

- App: Next.js 15 (App Router), React 19, TypeScript, Tailwind v4
- Domain: Finds auspicious times using Vedic astrology (Swiss Ephemeris), basic heuristics, and Google Places for location entry
- Primary entry UI: components/AuspiciousTimeChecker.tsx → uses ModernMuhurtaForm.tsx

Key UX decisions (current)

- Activity selection is removed from the UI. The backend still accepts an activity string and defaults to "general" internally.
- Location inputs use Google Places (new) via the web component gmpx-place-autocomplete (wrapping in components/GooglePlacesInput.tsx).

Important files

- components/ModernMuhurtaForm.tsx
  - Sends POST to /api/astrology/enhanced with:
    - dobISO (birth date/time in ISO)
    - targetISO (event date/time in ISO)
    - birthLat/birthLon (optional)
    - eventLat/eventLon (required)
    - tz (IANA string)
- app/api/astrology/enhanced/route.ts
  - Validates payload, loads Swiss Ephemeris, performs unified scoring, returns time windows and panchang snapshot.
- components/GooglePlacesInput.tsx
  - Loads @googlemaps/extended-component-library, appends <gmpx-api-loader api-key=... libraries="places">, binds the element to a native input via the for attribute. Emits selection via gmpx-placechange and keeps input changes in sync.
- scripts/test-places.mjs
  - Backend test for Google Places v1 Autocomplete. Verifies that the API key works and returns suggestions. Useful for diagnosing UI loader issues.

Environment

- .env (local development)
  - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (required for Places)
  - SE_EPHE_PATH=./ephe (path to Swiss Ephemeris files)
  - SE_ALLOW_MOSHIER=1 (optional; allows fallback if ephemeris files missing)
- API key requirements
  - Enable Places API (New) for the project, billing enabled
  - Allow localhost:3000 referrer for local development

Testing the Places key (no browser)

- PowerShell:
  - cmd /c "set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY && node scripts/test-places.mjs Mum"
- Expected OK with suggestion text and placeId. If 403, enable Places API (New) and billing.

Common pitfalls

- Multiple Maps JS loads → use the single loader: <gmpx-api-loader api-key="..." libraries="places" /> (this is appended dynamically by GooglePlacesInput).
- Using old Autocomplete class → new builds should use Place Autocomplete Element; we already migrated.
- Not seeing suggestions → key restrictions, billing, or blocked scripts (CSP/ad blockers).

Contact points

- Enhanced API: app/api/astrology/enhanced/route.ts
- Swiss adapter and ephe flags: lib/astro/swissAdapter.ts, lib/astro/epheFiles.ts
- Scoring pipeline: lib/astro/unifiedScoring.ts
