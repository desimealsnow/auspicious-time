import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import { loadSwissAdapter } from '@/lib/astro/swissAdapter';
import { requiredFilesForYear } from '@/lib/astro/epheFiles';
import { sunriseSunsetUTC } from '@/lib/astro/sunriseNoaa';
import { 
  calculatePlanetaryPositions, 
  calculateAspects, 
  analyzeActivityTiming,
  ACTIVITY_PLANET_MAP
} from '@/lib/astro/enhancedSwissCalculations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface EnhancedPayload {
  dobISO: string;
  targetISO: string;
  lat: number;
  lon: number;
  tz: string;
  activity?: string;
}

interface GlobalTimeWindows {
  name: string;
  start: string;
  end: string;
  type: 'favorable' | 'challenging' | 'neutral';
  description: string;
}

// Global terminology mapping (avoiding Sanskrit terms)
const GLOBAL_TIME_WINDOWS = {
  rahu_kalam: 'Shadow Period',
  yamaganda: 'Challenging Period', 
  gulika_kalam: 'Restrictive Period',
  abhijit_muhurta: 'Peak Energy Window'
} as const;

// Activity categories with global-friendly names
const GLOBAL_ACTIVITIES = {
  // Business & Professional
  'new_business': 'Starting a New Business',
  'career_change': 'Career Transition', 
  'financial_investment': 'Financial Investment',
  'important_meeting': 'Important Business Meeting',
  'contract_signing': 'Contract Signing',
  'product_launch': 'Product Launch',
  
  // Personal & Relationships
  'marriage': 'Wedding Ceremony',
  'proposal': 'Marriage Proposal',
  'relationship_talks': 'Relationship Discussion',
  'family_reunion': 'Family Gathering',
  
  // Health & Wellness
  'medical_procedure': 'Medical Procedure',
  'health_treatment': 'Health Treatment',
  'surgery': 'Surgical Procedure',
  'therapy_session': 'Therapy Session',
  
  // Education & Growth
  'exam': 'Important Examination',
  'learning': 'Learning New Skills',
  'presentation': 'Public Presentation',
  'interview': 'Job Interview',
  
  // Travel & Movement
  'travel': 'Long-Distance Travel',
  'relocation': 'Moving/Relocation',
  'house_purchase': 'Real Estate Purchase',
  
  // Spiritual & Personal
  'spiritual_practice': 'Spiritual Practice',
  'meditation': 'Meditation Session',
  'personal_ritual': 'Personal Ceremony',
  
  // General
  'general': 'General Activities'
} as const;

function ephePathAbs(): string {
  const raw = process.env.SE_EPHE_PATH || './ephe';
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
}

function missingFiles(epheDir: string, files: string[]): string[] {
  return files.filter(f => !fs.existsSync(path.join(epheDir, f)));
}

function toUTHours(d: Date): number {
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
}

function createGlobalTimeWindows(
  sunrise: Date, 
  sunset: Date, 
  rahu: any[], 
  yamaganda: any[], 
  gulika: any[], 
  abhijit: any
): GlobalTimeWindows[] {
  const windows: GlobalTimeWindows[] = [];
  
  // Convert traditional periods to global descriptions
  if (rahu?.length > 0) {
    windows.push({
      name: GLOBAL_TIME_WINDOWS.rahu_kalam,
      start: rahu[0].start,
      end: rahu[0].end,
      type: 'challenging',
      description: 'A period when subtle energies may create obstacles. Best used for reflection rather than new initiatives.'
    });
  }
  
  if (yamaganda?.length > 0) {
    windows.push({
      name: GLOBAL_TIME_WINDOWS.yamaganda,
      start: yamaganda[0].start,
      end: yamaganda[0].end,
      type: 'challenging',
      description: 'Time of increased tension and potential conflicts. Exercise caution in communications and decisions.'
    });
  }
  
  if (gulika?.length > 0) {
    windows.push({
      name: GLOBAL_TIME_WINDOWS.gulika_kalam,
      start: gulika[0].start,
      end: gulika[0].end,
      type: 'challenging',
      description: 'Period of restrictions and delays. Not ideal for launching new projects or important activities.'
    });
  }
  
  if (abhijit) {
    windows.push({
      name: GLOBAL_TIME_WINDOWS.abhijit_muhurta,
      start: abhijit.start,
      end: abhijit.end,
      type: 'favorable',
      description: 'Peak solar energy period. Excellent for important decisions, new beginnings, and significant activities.'
    });
  }
  
  return windows.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as EnhancedPayload;
    if (!body?.dobISO || !body?.targetISO || typeof body.lat !== 'number' || typeof body.lon !== 'number') {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    // Load Swiss Ephemeris
    let sweInfo;
    try {
      sweInfo = await loadSwissAdapter();
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e?.message || 'Swiss Ephemeris module missing' }, { status: 200 });
    }
    const swe = sweInfo.swe;

    // Check ephemeris files
    const epheDir = ephePathAbs();
    const target = new Date(body.targetISO);
    const needed = requiredFilesForYear(target.getFullYear());
    const missing = missingFiles(epheDir, needed);
    const allowFallback = process.env.SE_ALLOW_MOSHIER === '1';
    
    if (missing.length && !allowFallback) {
      return NextResponse.json({
        ok: false,
        error: `Swiss ephemeris files missing in "${epheDir}". Required for ${target.getFullYear()}: ${missing.join(', ')}. Set SE_ALLOW_MOSHIER=1 to allow fallback calculations.`
      }, { status: 200 });
    }

    // Configure Swiss Ephemeris
    swe.set_ephe_path(epheDir);
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0);

    // Calculate Julian Day
    const jdUT = swe.julday(
      target.getUTCFullYear(), 
      target.getUTCMonth() + 1, 
      target.getUTCDate(), 
      toUTHours(target), 
      swe.SE_GREG_CAL
    );

    if (!Number.isFinite(jdUT)) {
      return NextResponse.json({ ok: false, error: 'Failed to compute julian day for target time.' }, { status: 200 });
    }

    const ephFlag = allowFallback ? swe.SEFLG_MOSEPH : swe.SEFLG_SWIEPH;

    // Get sunrise/sunset for time windows
    const { sunrise, sunset } = sunriseSunsetUTC(target, Number(body.lon), Number(body.lat));
    
    if (!sunrise || !sunset) {
      return NextResponse.json({
        ok: false,
        error: 'Could not calculate sunrise/sunset for the given location and date'
      }, { status: 200 });
    }

    // Calculate comprehensive planetary positions
    const planetaryPositions = await calculatePlanetaryPositions(swe, jdUT, ephFlag);
    
    if (planetaryPositions.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'Failed to calculate planetary positions'
      }, { status: 200 });
    }

    // Calculate planetary aspects
    const aspects = calculateAspects(planetaryPositions);

    // Analyze activity timing
    const activityKey = (body.activity || 'general').toLowerCase().replace(/\s+/g, '_');
    const activityAnalysis = analyzeActivityTiming(activityKey, planetaryPositions, aspects);

    // Calculate traditional time windows (with global descriptions)
    let timeWindows: GlobalTimeWindows[] = [];
    
    try {
      // Import traditional calculations
      const { computeAbhijit, computeDayWindows } = await import('@/lib/astro/vedicWindows');
      const abhijit = computeAbhijit(sunrise, sunset);
      const { rahu_kalam, yamaganda, gulika_kalam } = computeDayWindows(target, sunrise, sunset);
      
      timeWindows = createGlobalTimeWindows(sunrise, sunset, rahu_kalam, yamaganda, gulika_kalam, abhijit);
    } catch (error) {
      console.warn('Traditional time window calculation failed:', error);
    }

    // Determine overall recommendation
    const currentTime = new Date(body.targetISO);
    const isInChallengingPeriod = timeWindows.some(w => 
      w.type === 'challenging' && 
      currentTime >= new Date(w.start) && 
      currentTime <= new Date(w.end)
    );

    // Adjust planetary analysis score based on traditional time windows
    let finalScore = activityAnalysis.score;
    let finalRecommendation = activityAnalysis.recommendation;
    
    if (isInChallengingPeriod) {
      finalScore = Math.max(0, finalScore - 25);
      if (finalScore < 40) {
        finalRecommendation = 'AVOID';
      } else if (finalScore < 60) {
        finalRecommendation = 'CHALLENGING';
      }
    }

    // Find next favorable window
    const now = new Date(body.targetISO);
    const nextFavorableWindow = timeWindows.find(w => 
      w.type === 'favorable' && new Date(w.start) > now
    );

    // Enhanced response with global terminology
    const response = {
      ok: true,
      timestamp: new Date().toISOString(),
      location: { latitude: body.lat, longitude: body.lon },
      
      // Activity Analysis (Main Result)
      activity: {
        name: GLOBAL_ACTIVITIES[activityKey as keyof typeof GLOBAL_ACTIVITIES] || activityKey,
        recommendation: finalRecommendation,
        score: finalScore,
        confidence: activityAnalysis.significantAspects.length > 2 ? 'high' : 'medium',
        interpretation: activityAnalysis.globalInterpretation
      },

      // Planetary Analysis
      planetary: {
        positions: planetaryPositions.map(p => ({
          name: p.planet.toLowerCase().replace('_', ' '),
          sign: getSignName(p.sign),
          degree: Math.round(p.degree * 100) / 100,
          retrograde: p.retrograde,
          strength: activityAnalysis.planetaryStrengths.find(ps => 
            ps.planet.toLowerCase() === p.planet.toLowerCase().replace('_', ' ')
          )?.strength || 50
        })),
        
        aspects: activityAnalysis.significantAspects.map(a => ({
          planets: `${a.planet1.toLowerCase().replace('_', ' ')} - ${a.planet2.toLowerCase().replace('_', ' ')}`,
          type: a.aspect.toLowerCase().replace('_', ' '),
          strength: a.strength,
          influence: ASPECTS[a.aspect]?.nature || 'neutral'
        })),
        
        summary: {
          supportive_factors: activityAnalysis.supportiveFactors,
          challenging_factors: activityAnalysis.challengingFactors,
          key_influences: activityAnalysis.primaryFactors
        }
      },

      // Time Windows (Global Terminology)
      time_windows: {
        current_period: timeWindows.find(w => 
          currentTime >= new Date(w.start) && currentTime <= new Date(w.end)
        ) || null,
        
        all_periods: timeWindows,
        
        next_favorable: nextFavorableWindow || null,
        
        today_summary: {
          sunrise: sunrise.toISOString(),
          sunset: sunset.toISOString(),
          total_favorable_hours: timeWindows.filter(w => w.type === 'favorable').length,
          total_challenging_hours: timeWindows.filter(w => w.type === 'challenging').length
        }
      },

      // Recommendations
      recommendations: {
        immediate: finalRecommendation === 'AVOID' ? 
          'Consider postponing this activity to a more favorable time.' :
          finalRecommendation === 'EXCELLENT' ? 
          'Excellent timing! Proceed with confidence.' :
          'Timing has mixed influences. Proceed with awareness and preparation.',
        
        optimal_timing: nextFavorableWindow ? 
          `Next optimal window: ${nextFavorableWindow.name} from ${new Date(nextFavorableWindow.start).toLocaleTimeString()} to ${new Date(nextFavorableWindow.end).toLocaleTimeString()}` :
          'No specific favorable windows identified for today.',
        
        general_advice: generateGeneralAdvice(activityKey, activityAnalysis)
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Enhanced astrology calculation error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || 'Internal calculation error' 
    }, { status: 500 });
  }
}

// Helper functions
function getSignName(signNumber: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[signNumber - 1] || `Sign ${signNumber}`;
}

function generateGeneralAdvice(activity: string, analysis: any): string {
  const adviceMap: Record<string, string> = {
    'new_business': 'Focus on clear communication and solid planning. Avoid impulsive decisions.',
    'marriage': 'Emphasize harmony and understanding. Choose moments of emotional stability.',
    'travel': 'Plan carefully and allow extra time for unexpected delays.',
    'exam': 'Maintain focus and avoid distractions. Trust your preparation.',
    'medical_procedure': 'Ensure clear communication with healthcare providers.',
    'general': 'Stay flexible and adapt to changing circumstances.'
  };
  
  return adviceMap[activity] || 'Trust your intuition and proceed mindfully.';
}

// Import ASPECTS for the route
const ASPECTS = {
  CONJUNCTION: { angle: 0, orb: 8, type: 'major', nature: 'neutral' },
  SEXTILE: { angle: 60, orb: 6, type: 'major', nature: 'positive' },
  SQUARE: { angle: 90, orb: 8, type: 'major', nature: 'challenging' },
  TRINE: { angle: 120, orb: 8, type: 'major', nature: 'positive' },
  OPPOSITION: { angle: 180, orb: 8, type: 'major', nature: 'challenging' },
  SEMI_SEXTILE: { angle: 30, orb: 3, type: 'minor', nature: 'neutral' },
  SEMI_SQUARE: { angle: 45, orb: 3, type: 'minor', nature: 'challenging' },
  SESQUIQUADRATE: { angle: 135, orb: 3, type: 'minor', nature: 'challenging' },
  QUINCUNX: { angle: 150, orb: 3, type: 'minor', nature: 'challenging' }
} as const;