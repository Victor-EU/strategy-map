/**
 * Serverless Function for Retrieving Shared Diagrams
 *
 * Retrieves a diagram from Vercel KV using the short ID.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Diagram ID required' });
    }

    // Retrieve from Vercel KV
    const data = await kv.get(`diagram:${id}`);

    if (!data) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    // Parse and return the diagram data
    const diagramData = typeof data === 'string' ? JSON.parse(data) : data;

    return res.status(200).json({
      diagram: diagramData
    });

  } catch (error) {
    console.error('Error retrieving diagram:', error);
    return res.status(500).json({
      error: 'Failed to load diagram',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
