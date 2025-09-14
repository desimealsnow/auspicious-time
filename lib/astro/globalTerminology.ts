/**
 * Global Terminology Mapping for Astrological Concepts
 * Converts Sanskrit/Hindu terms to universally understood astrological language
 */

// Time Period Translations
export const TIME_PERIOD_TRANSLATIONS = {
  // Traditional Sanskrit terms → Global equivalents
  'rahu_kalam': {
    global_name: 'Shadow Period',
    description: 'A daily time period when subtle planetary influences may create obstacles or delays',
    duration: 'Approximately 1.5 hours daily',
    recommendation: 'Best used for reflection, planning, or routine activities rather than new initiatives'
  },
  
  'yamaganda': {
    global_name: 'Tension Period', 
    description: 'A time when planetary energies may increase stress, conflicts, or miscommunications',
    duration: 'Approximately 1.5 hours daily',
    recommendation: 'Exercise extra caution in important communications and decision-making'
  },
  
  'gulika_kalam': {
    global_name: 'Restriction Period',
    description: 'A period when environmental energies may cause delays, obstacles, or limitations',
    duration: 'Approximately 1.5 hours daily', 
    recommendation: 'Avoid launching new projects or signing important agreements'
  },
  
  'abhijit_muhurta': {
    global_name: 'Peak Energy Window',
    description: 'The optimal daily period when solar energy reaches its most beneficial influence',
    duration: 'Around 48 minutes near midday',
    recommendation: 'Excellent for important decisions, new beginnings, and significant activities'
  }
} as const;

// Lunar Calendar Translations
export const LUNAR_PHASE_TRANSLATIONS = {
  // Tithi translations
  'tithi': {
    global_name: 'Lunar Day',
    description: 'A unit of time based on the Moon\'s position relative to the Sun',
    significance: 'Each lunar day has unique energy patterns affecting different activities'
  },
  
  // Individual Tithi names
  'pratipat': { global_name: 'New Beginnings Phase', energy: 'Initiation and fresh starts' },
  'dwitiya': { global_name: 'Building Phase', energy: 'Development and growth' },
  'tritiya': { global_name: 'Activity Phase', energy: 'Action and progress' },
  'chaturthi': { global_name: 'Obstacle Navigation', energy: 'Overcoming challenges' },
  'panchami': { global_name: 'Learning Phase', energy: 'Education and skill development' },
  'shashti': { global_name: 'Competition Phase', energy: 'Contests and challenges' },
  'saptami': { global_name: 'Friendship Phase', energy: 'Social connections and relationships' },
  'ashtami': { global_name: 'Intensity Phase', energy: 'High energy and potential conflicts' },
  'navami': { global_name: 'Completion Phase', energy: 'Finishing projects and tasks' },
  'dashami': { global_name: 'Elimination Phase', energy: 'Removing obstacles and negativity' },
  'ekadashi': { global_name: 'Spiritual Phase', energy: 'Meditation and inner work' },
  'dwadashi': { global_name: 'Happiness Phase', energy: 'Joy and celebrations' },
  'trayodashi': { global_name: 'Activity Peak', energy: 'Maximum energy for work' },
  'chaturdashi': { global_name: 'Preparation Phase', energy: 'Getting ready for completion' },
  'purnima': { global_name: 'Full Moon', energy: 'Culmination and fulfillment' },
  'amavasya': { global_name: 'New Moon', energy: 'New beginnings and introspection' }
} as const;

// Stellar Constellation Translations
export const CONSTELLATION_TRANSLATIONS = {
  'nakshatra': {
    global_name: 'Lunar Constellation',
    description: 'One of 27 star groups that the Moon passes through each month',
    significance: 'Each constellation influences personality traits and favorable timing'
  },
  
  // Individual Nakshatra translations
  'ashwini': { global_name: 'The Healers', traits: 'Quick action, healing, new beginnings' },
  'bharani': { global_name: 'The Bearers', traits: 'Responsibility, creativity, transformation' },
  'krittika': { global_name: 'The Cutters', traits: 'Sharp intellect, purification, cutting through illusions' },
  'rohini': { global_name: 'The Growers', traits: 'Beauty, fertility, material growth' },
  'mrigashirsha': { global_name: 'The Seekers', traits: 'Curiosity, searching, exploration' },
  'ardra': { global_name: 'The Storm', traits: 'Emotional depth, cleansing, renewal' },
  'punarvasu': { global_name: 'The Renewers', traits: 'Return, restoration, safety' },
  'pushya': { global_name: 'The Nourishers', traits: 'Nourishment, support, spiritual growth' },
  'ashlesha': { global_name: 'The Embracers', traits: 'Intuition, mystery, transformation' },
  'magha': { global_name: 'The Mighty', traits: 'Leadership, ancestry, pride' },
  'purva_phalguni': { global_name: 'The Lovers', traits: 'Romance, creativity, relaxation' },
  'uttara_phalguni': { global_name: 'The Patrons', traits: 'Support, friendship, contracts' },
  'hasta': { global_name: 'The Hands', traits: 'Skill, craftsmanship, healing' },
  'chitra': { global_name: 'The Bright', traits: 'Beauty, creativity, brilliance' },
  'swati': { global_name: 'The Independent', traits: 'Independence, flexibility, movement' },
  'vishakha': { global_name: 'The Fork', traits: 'Determination, goal achievement, choices' },
  'anuradha': { global_name: 'The Followers', traits: 'Friendship, cooperation, devotion' },
  'jyeshtha': { global_name: 'The Eldest', traits: 'Protection, seniority, responsibility' },
  'mula': { global_name: 'The Roots', traits: 'Investigation, foundations, research' },
  'purva_ashadha': { global_name: 'The Invincible', traits: 'Invincibility, purification, connections' },
  'uttara_ashadha': { global_name: 'The Winners', traits: 'Victory, achievement, leadership' },
  'shravana': { global_name: 'The Listeners', traits: 'Learning, connection, communication' },
  'dhanishta': { global_name: 'The Wealthy', traits: 'Wealth, music, rhythm' },
  'shatabhisha': { global_name: 'The Healers', traits: 'Healing, mystery, solitude' },
  'purva_bhadrapada': { global_name: 'The Fierce', traits: 'Intensity, idealism, transformation' },
  'uttara_bhadrapada': { global_name: 'The Warriors', traits: 'Depth, wisdom, sacrifice' },
  'revati': { global_name: 'The Wealthy', traits: 'Completion, prosperity, journey\'s end' }
} as const;

// Planetary Period Translations
export const PLANETARY_PERIOD_TRANSLATIONS = {
  'dasha': {
    global_name: 'Planetary Period',
    description: 'Major life phases ruled by different planets',
    significance: 'Each planet brings its unique energy and lessons during its ruling period'
  },
  
  'antardasha': {
    global_name: 'Sub-Period',
    description: 'Shorter planetary influences within major periods',
    significance: 'Fine-tunes the energy of the main planetary period'
  },
  
  'mahadasha': {
    global_name: 'Major Life Cycle',
    description: 'The primary planetary influence lasting several years',
    significance: 'Shapes major life themes, opportunities, and challenges'
  }
} as const;

// Compatibility Analysis Terms
export const COMPATIBILITY_TRANSLATIONS = {
  'tarabala': {
    global_name: 'Stellar Compatibility',
    description: 'How the birth constellation relates to the current day\'s constellation',
    significance: 'Indicates favorable or challenging energy patterns for activities'
  },
  
  'chandrabala': {
    global_name: 'Lunar Harmony',
    description: 'The relationship between birth moon sign and current moon sign',
    significance: 'Shows emotional and mental compatibility with current timing'
  },
  
  'rashidata': {
    global_name: 'Zodiac Relationship',
    description: 'How zodiac signs interact with each other',
    significance: 'Indicates harmony or conflict between different energy signatures'
  }
} as const;

// Activity Category Translations
export const ACTIVITY_TRANSLATIONS = {
  // Traditional categories → Modern global terms
  'vivaha': { global_name: 'Wedding & Marriage', scope: 'Romantic partnerships and unions' },
  'griha_pravesh': { global_name: 'New Home & Relocation', scope: 'Moving and establishing new residences' },
  'vyavasaya': { global_name: 'Business & Career', scope: 'Professional activities and ventures' },
  'vidya_arambha': { global_name: 'Education & Learning', scope: 'Academic and skill development activities' },
  'yatra': { global_name: 'Travel & Journeys', scope: 'Short and long-distance travel' },
  'aushadhi': { global_name: 'Health & Healing', scope: 'Medical procedures and wellness activities' },
  'daan': { global_name: 'Charity & Giving', scope: 'Philanthropic and generous activities' },
  'sanskriti': { global_name: 'Cultural & Spiritual', scope: 'Religious and cultural ceremonies' }
} as const;

// Energy Quality Descriptions
export const ENERGY_QUALITY_TRANSLATIONS = {
  'sattva': {
    global_name: 'Harmony Energy',
    characteristics: 'Peaceful, balanced, pure, conducive to spiritual growth',
    activities: 'Meditation, learning, healing, creative work'
  },
  
  'rajas': {
    global_name: 'Dynamic Energy', 
    characteristics: 'Active, passionate, goal-oriented, conducive to achievement',
    activities: 'Business, competition, physical activities, new projects'
  },
  
  'tamas': {
    global_name: 'Inertia Energy',
    characteristics: 'Slow, heavy, resistant to change, conducive to rest',
    activities: 'Rest, sleep, routine maintenance, endings'
  }
} as const;

// Helper function to get global translation
export function getGlobalTranslation(
  category: keyof typeof TIME_PERIOD_TRANSLATIONS | keyof typeof LUNAR_PHASE_TRANSLATIONS,
  term: string
): { global_name: string; description?: string; significance?: string } {
  
  // Check time periods
  if (category in TIME_PERIOD_TRANSLATIONS) {
    const translation = TIME_PERIOD_TRANSLATIONS[category as keyof typeof TIME_PERIOD_TRANSLATIONS];
    return translation;
  }
  
  // Check lunar phases
  if (category in LUNAR_PHASE_TRANSLATIONS) {
    const translation = LUNAR_PHASE_TRANSLATIONS[category as keyof typeof LUNAR_PHASE_TRANSLATIONS];
    return translation;
  }
  
  // Return the original term if no translation found
  return {
    global_name: term,
    description: `Traditional astrological term: ${term}`
  };
}

// Generate user-friendly explanations
export function generateGlobalExplanation(
  concept: string,
  context?: string
): string {
  const explanations: Record<string, string> = {
    'lunar_day': 'Each lunar day has unique energy patterns. Some days favor new beginnings, others support completion of projects.',
    'stellar_influence': 'The star constellation the Moon occupies affects the subtle energies available for different activities.',
    'planetary_aspect': 'When planets form specific geometric angles, they create harmonious or challenging energy combinations.',
    'time_window': 'Certain daily time periods have concentrated beneficial or challenging cosmic influences.',
    'compatibility': 'Your birth chart creates a unique energy signature that harmonizes differently with various times and dates.'
  };
  
  return explanations[concept] || 'This represents a traditional astrological concept adapted for modern understanding.';
}

// Create global-friendly recommendations
export function createGlobalRecommendation(
  activity: string,
  energy_level: 'high' | 'medium' | 'low',
  challenges: string[],
  supports: string[]
): string {
  const baseRecommendations = {
    high: `Excellent cosmic energy supports your ${activity}. This is an optimal time to proceed with confidence.`,
    medium: `Mixed cosmic influences for your ${activity}. Proceed mindfully with good preparation.`,
    low: `Challenging cosmic energy for ${activity}. Consider postponing or proceeding with extra caution.`
  };
  
  let recommendation = baseRecommendations[energy_level];
  
  if (supports.length > 0) {
    recommendation += ` Favorable factors: ${supports.slice(0, 2).join(' and ')}.`;
  }
  
  if (challenges.length > 0) {
    recommendation += ` Areas of caution: ${challenges.slice(0, 2).join(' and ')}.`;
  }
  
  return recommendation;
}

// Export comprehensive mapping for API responses
export const COMPREHENSIVE_GLOBAL_MAPPING = {
  time_periods: TIME_PERIOD_TRANSLATIONS,
  lunar_phases: LUNAR_PHASE_TRANSLATIONS,
  constellations: CONSTELLATION_TRANSLATIONS,
  planetary_periods: PLANETARY_PERIOD_TRANSLATIONS,
  compatibility: COMPATIBILITY_TRANSLATIONS,
  activities: ACTIVITY_TRANSLATIONS,
  energy_qualities: ENERGY_QUALITY_TRANSLATIONS
} as const;