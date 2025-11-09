/**
 * Serverless Function for Sharing Diagrams
 *
 * Creates a shareable link by storing the diagram data in Vercel KV (Redis).
 * Returns a short ID that can be used to retrieve the diagram later.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const diagramData = req.body;

    // Validate data
    if (!diagramData || typeof diagramData !== 'object') {
      return res.status(400).json({ error: 'Invalid diagram data' });
    }

    // Generate short ID (8 characters, URL-safe)
    const id = nanoid(8);

    // Store in Vercel KV with 90 day expiration
    await kv.set(
      `diagram:${id}`,
      JSON.stringify(diagramData),
      {
        ex: 60 * 60 * 24 * 90 // 90 days in seconds
      }
    );

    // Return the ID and full URL
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : req.headers.origin || 'http://localhost:5173';

    return res.status(200).json({
      id,
      url: `${baseUrl}/view/${id}`
    });

  } catch (error) {
    console.error('Error storing diagram:', error);
    return res.status(500).json({
      error: 'Failed to create share link',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
