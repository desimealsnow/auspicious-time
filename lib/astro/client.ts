import type { AstroPayload, AstroResult } from './types';
import { mockAstro } from './mock';

export async function getAstro(payload: AstroPayload): Promise<AstroResult> {
  const provider = (process.env.ASTRO_PROVIDER || 'vedic').toLowerCase();

  if (provider === 'mock') {
    return mockAstro(payload);
  }

  if (provider === 'vedic') {
    const userId = process.env.VEDIC_RISHI_USER_ID!;
    const apiKey = process.env.VEDIC_RISHI_API_KEY!;
    if (!userId || !apiKey) {
      return { ok: false, error: 'Missing Vedic Rishi credentials' };
    }
    // TODO: Compose real calls for rahukalam/abhijit etc. (left as integration point)
    // For now fallback to mock-style until you wire exact endpoints:
    return mockAstro(payload);
  }

  if (provider === 'prokerala') {
    const apiKey = process.env.PROKERALA_API_KEY!;
    if (!apiKey) return { ok: false, error: 'Missing Prokerala API key' };
    // TODO: Call Prokerala API endpoints and normalize response.
    return mockAstro(payload);
  }

  return { ok: false, error: `Unknown ASTRO_PROVIDER: ${provider}` };
}
