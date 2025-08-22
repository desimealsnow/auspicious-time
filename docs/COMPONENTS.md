# Component Documentation

## Overview

This document covers all React components in the Auspicious Time application, their props, usage patterns, and integration examples.

---

## Components

### AuspiciousTimeChecker

The main UI component that provides the complete auspicious time checking interface.

#### Description

`AuspiciousTimeChecker` is a comprehensive React component that combines user input forms, astrological calculations, and result display. It handles the complete user flow from input collection to result presentation.

#### Props

This component takes no props - it's a complete self-contained interface.

#### Features

- **User Input Collection**: Birth details, location, timezone, activity type
- **Location Services**: Geolocation API integration with fallback to manual entry
- **Astrological Integration**: Optional Vedic astrology calculations via API
- **Real-time Evaluation**: Combines numerology, time heuristics, and astrology
- **Result Display**: Comprehensive scoring with explanations and suggestions
- **Alternative Suggestions**: Next 7 days of better timing options

#### State Management

```typescript
interface ComponentState {
  // User details
  name: string;
  dobDate: string;           // YYYY-MM-DD format
  dobTime: string;           // HH:MM format
  tz: string;                // IANA timezone
  lat: string;               // Latitude as string
  lon: string;               // Longitude as string
  
  // Activity details
  activityType: string;      // Predefined or 'custom'
  customActivity: string;    // Custom activity description
  targetDT: string;          // datetime-local format
  useAstro: boolean;         // Enable/disable astrology API
  
  // Results
  result: EvalResult | null;
  suggestions: Array<{
    when: Date;
    label: string;
    personalDay: number;
  }>;
  error: string;
  astroNote: string;
}
```

#### Usage Example

```jsx
import AuspiciousTimeChecker from '@/components/AuspiciousTimeChecker';

export default function Page() {
  return (
    <div>
      <AuspiciousTimeChecker />
    </div>
  );
}
```

#### Activity Types

The component supports the following predefined activity types:

- `start` - Start a new project
- `sign` - Sign a contract
- `finance` - Financial decision
- `travel` - Travel / Relocation
- `study` - Study / Exam / Deep Work
- `health` - Health / Procedure
- `relationship` - Marriage / Relationship
- `spiritual` - Spiritual practice
- `custom` - Custom activity (requires description)

#### Methods

##### Internal Methods

- `parseLocal(dateStr: string, timeStr?: string): Date | null`
  - Parses local date/time strings into Date objects
  - Handles both date-only and date+time formats

- `fmtDate(d: Date): string`
  - Formats dates using Intl.DateTimeFormat
  - Provides full date and short time display

- `getAstroWindows(params): Promise<EvalAstroWindows | null>`
  - Fetches astrological data from the API
  - Handles errors gracefully with fallback

- `evaluate(): Promise<void>`
  - Main evaluation function
  - Validates inputs and triggers calculation
  - Updates component state with results

- `useMyLocation(): void`
  - Uses browser geolocation API
  - Sets latitude/longitude automatically
  - Provides user feedback

#### Integration Notes

- **Client-side only**: Uses `'use client'` directive
- **Geolocation**: Requires HTTPS in production for location services
- **Timezone Detection**: Automatically detects user timezone
- **Responsive Design**: Adapts to mobile and desktop layouts
- **Error Handling**: Graceful degradation when astrology API unavailable

#### Styling

Uses Tailwind CSS with a dark theme:
- Background: Gradient from slate-950 to slate-900
- Cards: Semi-transparent slate-900 with ring borders
- Accent: Emerald green for primary actions
- Status colors: Green (good), amber (caution), rose (avoid)

---

### RazorpayDonate

A reusable donation component that integrates Razorpay payment gateway with UPI fallback.

#### Description

`RazorpayDonate` provides a button interface for donations using Razorpay payment gateway. It includes automatic script loading, UPI fallback, and customizable options.

#### Props

```typescript
interface RazorpayDonateProps {
  amountInPaise?: number;    // Amount in paise (default: 5000 = ₹50)
  label?: string;            // Button text (default: "❤️ Donate (Razorpay)")
  name?: string;             // Merchant name (default: "Personal Time Advisor")
  description?: string;      // Payment description (default: "Support the project")
  upiFallback?: string;      // UPI URL for fallback (default provided)
}
```

#### Usage Examples

##### Basic Usage

```jsx
import RazorpayDonate from '@/components/RazorpayDonate';

export default function Footer() {
  return (
    <div>
      <RazorpayDonate />
    </div>
  );
}
```

##### Customized Usage

```jsx
<RazorpayDonate
  amountInPaise={10000}  // ₹100
  label="Support Development ❤️"
  name="My Astrology App"
  description="Help us improve the app"
  upiFallback="upi://pay?pa=myupi@bank&pn=MyApp&tn=Donation&cu=INR&am=100"
/>
```

#### Features

- **Automatic Script Loading**: Loads Razorpay checkout script dynamically
- **Environment Detection**: Uses `NEXT_PUBLIC_RAZORPAY_KEY_ID` for configuration
- **UPI Fallback**: Redirects to UPI deep link if Razorpay unavailable
- **Loading States**: Disables button until scripts are ready
- **Error Handling**: Graceful fallback to UPI payment

#### Configuration

Set environment variable for production:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_here
```

#### State Management

```typescript
interface ComponentState {
  ready: boolean;    // Whether Razorpay script is loaded
}
```

#### Methods

##### Internal Methods

- `loadScript(src: string): Promise<boolean>`
  - Dynamically loads external scripts
  - Prevents duplicate script loading
  - Returns loading success status

- `openCheckout(): void`
  - Opens Razorpay checkout interface
  - Falls back to UPI if Razorpay unavailable
  - Handles payment options configuration

#### Integration Notes

- **Client-side only**: Uses `'use client'` directive
- **Script Loading**: Asynchronously loads Razorpay SDK
- **Security**: Uses environment variables for sensitive keys
- **Fallback Strategy**: UPI deep links for broad compatibility

#### Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- Loading state indication
- Semantic button element

---

## Component Integration Patterns

### Error Boundary Integration

```jsx
import { ErrorBoundary } from 'react-error-boundary';
import AuspiciousTimeChecker from '@/components/AuspiciousTimeChecker';

function ErrorFallback({error}) {
  return (
    <div className="text-center p-8">
      <h2>Something went wrong:</h2>
      <pre className="text-red-500">{error.message}</pre>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuspiciousTimeChecker />
    </ErrorBoundary>
  );
}
```

### Layout Integration

```jsx
import AuspiciousTimeChecker from '@/components/AuspiciousTimeChecker';
import RazorpayDonate from '@/components/RazorpayDonate';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header>
        {/* Navigation */}
      </header>
      
      <main>
        <AuspiciousTimeChecker />
      </main>
      
      <footer className="text-center p-8">
        <RazorpayDonate />
      </footer>
    </div>
  );
}
```

### Custom Theming

Both components use Tailwind CSS classes that can be customized:

```css
/* Custom theme overrides */
.auspicious-theme {
  --emerald-600: #059669;
  --slate-900: #0f172a;
  --slate-800: #1e293b;
}
```

---

## Performance Considerations

### AuspiciousTimeChecker

- **Dynamic Import**: Main page uses dynamic import for SSR optimization
- **Geolocation**: Uses high accuracy mode with 10s timeout
- **API Calls**: Debounced to prevent excessive requests
- **State Updates**: Batched for optimal rendering

### RazorpayDonate

- **Script Loading**: One-time async loading with caching
- **Bundle Size**: External script loaded only when needed
- **Memory**: Minimal state footprint

---

## Testing Considerations

### Unit Testing

```javascript
// Example Jest test for parseLocal function
import { render, screen } from '@testing-library/react';
import AuspiciousTimeChecker from '@/components/AuspiciousTimeChecker';

test('renders time checker form', () => {
  render(<AuspiciousTimeChecker />);
  expect(screen.getByText('Personal Time Advisor')).toBeInTheDocument();
  expect(screen.getByLabelText('Date of birth')).toBeInTheDocument();
});
```

### Integration Testing

```javascript
// Example Cypress test
describe('Auspicious Time Checker', () => {
  it('calculates auspicious time', () => {
    cy.visit('/');
    cy.get('[data-testid="dob-date"]').type('1990-05-15');
    cy.get('[data-testid="dob-time"]').type('08:30');
    cy.get('[data-testid="target-datetime"]').type('2024-01-20T10:00');
    cy.get('[data-testid="evaluate-btn"]').click();
    
    cy.get('[data-testid="result"]').should('be.visible');
  });
});
```

---

## Accessibility Features

### AuspiciousTimeChecker

- **Form Labels**: All inputs have proper labels
- **Focus Management**: Logical tab order
- **Error Announcements**: Screen reader friendly error messages
- **Color Contrast**: WCAG AA compliant color scheme

### RazorpayDonate

- **ARIA Labels**: Descriptive button labeling
- **Loading States**: Clear indication of availability
- **Keyboard Access**: Full keyboard navigation support
