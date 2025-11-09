/**
 * Serverless Function for Anonymous Analytics
 *
 * This is a Vercel serverless function that tracks anonymous usage statistics.
 * Deploy this with your Vercel project to enable global usage tracking.
 *
 * Privacy Guarantees:
 * - No personal data stored
 * - No IP addresses logged
 * - No user identification
 * - Only counts: sessions, exports
 *
 * Alternative Services:
 * - Can also use CountAPI: https://countapi.xyz
 * - Or Simple Analytics: https://simpleanalytics.com
 * - Or Plausible: https://plausible.io
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory counter (resets on function cold start - use a database for persistence)
// For production, use Vercel KV, Redis, or a simple database
const counters: Record<string, number> = {
  'session-start': 0,
  'export': 0,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { event } = req.query;

  // Validate event type
  if (!event || typeof event !== 'string') {
    return res.status(400).json({ error: 'Event parameter required' });
  }

  // Increment counter
  if (event in counters) {
    counters[event]++;
  } else {
    counters[event] = 1;
  }

  // Return current count (optional)
  return res.status(200).json({
    event,
    count: counters[event],
    timestamp: new Date().toISOString(),
  });
}
