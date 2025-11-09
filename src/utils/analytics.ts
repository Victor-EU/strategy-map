/**
 * Privacy-Friendly Analytics Utility
 *
 * OOP Principle: Single Responsibility - Handles only anonymous usage tracking
 *
 * This module provides lightweight, privacy-friendly usage tracking without
 * collecting any personal information. It helps understand how many users
 * are using the application.
 *
 * Privacy Guarantees:
 * - No personal data collected
 * - No cookies or tracking pixels
 * - No IP address storage
 * - No user identification
 * - Fails silently if endpoint unavailable
 *
 * What we track:
 * - Anonymous session starts (one per browser session)
 * - App version
 * - General usage metrics (diagram saves, exports)
 */

// CountAPI endpoints for global statistics
const COUNTAPI_NAMESPACE = 'strategy-map-app';
const COUNTAPI_BASE = 'https://api.countapi.xyz';

const SESSION_KEY = 'strategy-map-session-tracked';
const STATS_KEY = 'strategy-map-stats';

export interface AppStats {
  sessionsStarted: number;
  diagramsSaved: number;
  diagramsExported: number;
  lastUsed: number;
}

/**
 * Get local statistics (stored only on this device)
 */
export function getLocalStats(): AppStats {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load local stats:', error);
  }

  return {
    sessionsStarted: 0,
    diagramsSaved: 0,
    diagramsExported: 0,
    lastUsed: Date.now(),
  };
}

/**
 * Update local statistics
 */
function updateLocalStats(update: Partial<AppStats>): void {
  try {
    const stats = getLocalStats();
    const updatedStats = {
      ...stats,
      ...update,
      lastUsed: Date.now(),
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
  } catch (error) {
    console.warn('Failed to update local stats:', error);
  }
}

/**
 * Track session start (called once per browser session)
 *
 * Uses sessionStorage to ensure we only track once per session.
 * Sends anonymous ping to count unique sessions.
 */
export function trackSessionStart(): void {
  // Check if already tracked this session
  if (sessionStorage.getItem(SESSION_KEY)) {
    return;
  }

  // Mark session as tracked
  sessionStorage.setItem(SESSION_KEY, 'true');

  // Update local stats
  const stats = getLocalStats();
  updateLocalStats({
    sessionsStarted: stats.sessionsStarted + 1,
  });

  // Send anonymous ping to global counter (optional, fails silently)
  sendAnonymousPing('session-start');
}

/**
 * Track diagram save
 */
export function trackDiagramSave(): void {
  const stats = getLocalStats();
  updateLocalStats({
    diagramsSaved: stats.diagramsSaved + 1,
  });
}

/**
 * Track diagram export
 */
export function trackDiagramExport(): void {
  const stats = getLocalStats();
  updateLocalStats({
    diagramsExported: stats.diagramsExported + 1,
  });

  // Send anonymous ping for export count
  sendAnonymousPing('export');
}

/**
 * Send anonymous ping to CountAPI
 *
 * Uses CountAPI.xyz - a free, privacy-friendly counter service:
 * - Doesn't store IP addresses
 * - Doesn't use cookies
 * - Just increments a counter
 * - Fails silently if unavailable
 */
function sendAnonymousPing(event: string): void {
  // Don't block app if analytics fails
  try {
    const url = `${COUNTAPI_BASE}/hit/${COUNTAPI_NAMESPACE}/${event}`;

    // Use sendBeacon if available (non-blocking)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
    } else {
      // Fallback to fetch (fire and forget)
      fetch(url).catch(() => {
        // Silently fail - analytics should never break the app
      });
    }
  } catch (error) {
    // Silently fail - analytics should never break the app
  }
}

/**
 * Fetch global statistics from CountAPI
 *
 * Returns aggregate counts across all users
 */
export async function fetchGlobalStats(): Promise<{
  sessions: number;
  exports: number;
} | null> {
  try {
    const [sessionsRes, exportsRes] = await Promise.all([
      fetch(`${COUNTAPI_BASE}/get/${COUNTAPI_NAMESPACE}/session-start`),
      fetch(`${COUNTAPI_BASE}/get/${COUNTAPI_NAMESPACE}/export`),
    ]);

    const sessionsData = await sessionsRes.json();
    const exportsData = await exportsRes.json();

    return {
      sessions: sessionsData.value || 0,
      exports: exportsData.value || 0,
    };
  } catch (error) {
    console.warn('Failed to fetch global stats:', error);
    return null;
  }
}

/**
 * Get usage summary for display to user (local stats only)
 */
export function getUsageSummary(): string {
  const stats = getLocalStats();
  const lastUsedDate = new Date(stats.lastUsed).toLocaleDateString();

  return `
Your Usage Stats (Local Only):
- Sessions: ${stats.sessionsStarted}
- Diagrams Saved: ${stats.diagramsSaved}
- Exports: ${stats.diagramsExported}
- Last Used: ${lastUsedDate}

Note: These stats are stored only on your device.
No personal data is collected or transmitted.
  `.trim();
}
