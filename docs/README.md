# Auspicious Time - Documentation Index

Welcome to the comprehensive documentation for the Auspicious Time application. This documentation covers all public APIs, functions, components, and usage patterns.

## 📋 Documentation Overview

| Document | Description | Audience |
|----------|-------------|----------|
| **[Quick Reference](./QUICK_REFERENCE.md)** | Developer cheat sheet with common patterns | Developers, Quick lookup |
| **[API Documentation](./API.md)** | Complete REST API reference | Backend developers, API consumers |
| **[Component Documentation](./COMPONENTS.md)** | React component props and usage | Frontend developers |
| **[Library Functions](./LIBRARY_FUNCTIONS.md)** | Utility functions and algorithms | All developers |

## 🎯 Start Here

### New to the Project?
👉 **Start with [Quick Reference](./QUICK_REFERENCE.md)** for an overview and common usage patterns.

### API Integration?
👉 **Go to [API Documentation](./API.md)** for complete endpoint specifications and examples.

### Frontend Development?
👉 **Check [Component Documentation](./COMPONENTS.md)** for React component props and integration patterns.

### Library Usage?
👉 **See [Library Functions](./LIBRARY_FUNCTIONS.md)** for detailed function reference with examples.

## 📊 What's Documented

### ✅ Complete Coverage

- **API Endpoints**: `/api/astrology/local` with full request/response specs
- **React Components**: `AuspiciousTimeChecker`, `RazorpayDonate` with props and examples
- **Core Functions**: `evaluateTime`, numerology, astrology, time heuristics
- **Utility Functions**: Scoring, formatting, coordinate calculations
- **Type Definitions**: Complete TypeScript interfaces and types
- **Environment Setup**: Configuration, ephemeris files, deployment
- **Error Handling**: Common issues and solutions
- **Usage Patterns**: Integration examples and best practices

### 🎨 Documentation Features

- **Code Examples**: Working examples for every function and component
- **Type Definitions**: Complete TypeScript interfaces
- **Error Handling**: Common issues and troubleshooting
- **Performance Notes**: Optimization tips and considerations
- **Accessibility**: WCAG compliance information
- **Testing**: Unit and integration test examples

## 🔗 Quick Navigation

### By Use Case

| I want to... | Go to |
|--------------|-------|
| Integrate the API | [API.md - Integration Examples](./API.md#integration-examples) |
| Use React components | [COMPONENTS.md - Usage Examples](./COMPONENTS.md#components) |
| Understand scoring | [LIBRARY_FUNCTIONS.md - Scoring Algorithm](./LIBRARY_FUNCTIONS.md#scoring-algorithm) |
| Set up environment | [QUICK_REFERENCE.md - Environment Setup](./QUICK_REFERENCE.md#environment-setup) |
| Handle errors | [API.md - Error Handling](./API.md#error-handling) |
| Debug issues | [QUICK_REFERENCE.md - Debugging](./QUICK_REFERENCE.md#debugging) |

### By Technology

| Technology | Documentation |
|------------|---------------|
| **Next.js API Routes** | [API.md](./API.md) |
| **React Components** | [COMPONENTS.md](./COMPONENTS.md) |
| **TypeScript Types** | [LIBRARY_FUNCTIONS.md - TypeScript Definitions](./LIBRARY_FUNCTIONS.md#typescript-definitions) |
| **Swiss Ephemeris** | [API.md - Technical Implementation](./API.md#technical-implementation-notes) |
| **Tailwind CSS** | [COMPONENTS.md - Styling](./COMPONENTS.md#styling) |

## 💡 Key Concepts

### Astrological Terms

- **Tithi**: Lunar day (1-30 in lunar month)
- **Nakshatra**: Lunar mansion (1-27 star groups)
- **Rahu Kalam**: Inauspicious period to avoid daily
- **Abhijit Muhurta**: Auspicious noon period
- **Tarabala**: Birth nakshatra compatibility (1-9 scale)
- **Chandrabala**: Moon position from birth sign

### Scoring System

- **0-100 Scale**: Primary scoring system
- **Weighted Combination**: 80% astrology + 20% numerology
- **Activity Rules**: Different criteria per activity type
- **Time Boosts**: Hour-based adjustments

### Data Flow

```
User Input → Numerology + Time Heuristics → Astrology API → Combined Evaluation → Result
```

## 🛠️ Development Workflow

### 1. Setup Development Environment

```bash
git clone <repository>
cd auspicious-time
npm install
```

### 2. Configure Environment

```bash
# Copy ephemeris files to ephe/ directory
# Set environment variables in .env.local
```

### 3. Understanding the Architecture

1. Read [Quick Reference](./QUICK_REFERENCE.md) for overview
2. Examine [API Documentation](./API.md) for backend
3. Study [Component Documentation](./COMPONENTS.md) for frontend
4. Refer to [Library Functions](./LIBRARY_FUNCTIONS.md) for utilities

### 4. Making Changes

- **API Changes**: Update [API.md](./API.md)
- **Component Changes**: Update [COMPONENTS.md](./COMPONENTS.md)
- **Function Changes**: Update [LIBRARY_FUNCTIONS.md](./LIBRARY_FUNCTIONS.md)
- **Quick patterns**: Update [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

## 📞 Support & Resources

### Common Questions

**Q: How accurate are the calculations?**
A: Swiss Ephemeris provides sub-arcsecond accuracy. Vedic interpretations follow traditional methods but may vary by school.

**Q: Can I use this commercially?**
A: Yes, under MIT license. Consider professional consultation for critical applications.

**Q: What if ephemeris files are missing?**
A: Set `SE_ALLOW_MOSHIER=1` to use built-in calculations with slightly reduced accuracy.

### External Resources

- [Swiss Ephemeris Documentation](https://www.astro.com/swisseph/)
- [Vedic Astrology Fundamentals](https://en.wikipedia.org/wiki/Hindu_astrology)
- [Numerology Principles](https://en.wikipedia.org/wiki/Numerology)

## 🔄 Keeping Documentation Updated

When making changes to the codebase:

1. **Update relevant documentation files**
2. **Add new examples for new features**
3. **Update type definitions if interfaces change**
4. **Test all code examples in documentation**
5. **Update this index if new sections are added**

---

**Last Updated**: January 2025
**Documentation Version**: 1.0
**Application Version**: 0.1.0