# Analytics Implementation

## Overview

This application includes a **privacy-friendly, anonymous usage tracking system** to help understand how many users are using the app. No personal data is collected or stored.

## What We Track

### Local Statistics (Stored on Your Device Only)
- Number of sessions started
- Number of diagrams saved
- Number of exports created
- Last usage timestamp

### Anonymous Global Statistics (Optional)
- Session start count (one ping per browser session)
- Export count (one ping per export)

## Privacy Guarantees

✅ **No personal data collected**
- No names, emails, or user identifiers
- No IP addresses stored
- No cookies or tracking pixels
- No browser fingerprinting

✅ **Completely anonymous**
- Only aggregate counts tracked
- Cannot identify individual users
- Cannot track user behavior across sessions

✅ **Transparent**
- All tracking code is open source
- You can inspect exactly what's being sent
- You can disable it easily

✅ **Fails gracefully**
- If analytics endpoint is down, app continues working
- No blocking requests
- No impact on app performance

## Implementation Details

### Architecture

```
┌─────────────────┐
│   User's App    │
└────────┬────────┘
         │
         ├─> localStorage (Local Stats)
         │
         └─> Anonymous Ping (Global Count)
                     │
                     ▼
           ┌──────────────────┐
           │ Serverless Func  │ (Optional)
           └──────────────────┘
```

### Code Structure

**`src/utils/analytics.ts`**
- `trackSessionStart()` - Track app startup (once per session)
- `trackDiagramSave()` - Track diagram saves (local only)
- `trackDiagramExport()` - Track exports (sends anonymous ping)
- `getLocalStats()` - Get your personal usage stats

**`api/analytics.ts`** (Optional)
- Serverless function to collect anonymous counts
- Can be deployed to Vercel, Netlify, Cloudflare Workers, etc.

### What Gets Sent

When you start a session:
```javascript
// Single HTTP request
GET https://api.countapi.xyz/hit/strategy-map-app/session-start
// No body, no headers, no personal data
```

When you export:
```javascript
// Single HTTP request
GET https://api.countapi.xyz/hit/strategy-map-app/export
// No body, no headers, no personal data
```

That's it! Just a simple counter increment.

## Alternatives

If you prefer not to use this system, you can:

### 1. Use a Different Service

**Plausible Analytics** (Privacy-focused)
```html
<!-- Add to index.html -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

**Simple Analytics** (No cookies)
```html
<!-- Add to index.html -->
<script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
```

**Fathom Analytics** (GDPR compliant)
```html
<!-- Add to index.html -->
<script src="https://cdn.usefathom.com/script.js" data-site="YOUR_SITE_ID" defer></script>
```

### 2. Deploy Your Own Endpoint

Replace the endpoint in `src/utils/analytics.ts`:

```typescript
const ANALYTICS_ENDPOINT = 'https://your-domain.com/api/analytics';
```

Then deploy `api/analytics.ts` to:
- **Vercel**: `vercel deploy`
- **Netlify**: Place in `netlify/functions/`
- **Cloudflare Workers**: Convert to Worker format

### 3. Use a Database

For persistent storage, modify `api/analytics.ts` to use:

**Vercel KV** (Redis):
```typescript
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  await kv.incr('session-start');
  const count = await kv.get('session-start');
  return res.json({ count });
}
```

**Supabase** (PostgreSQL):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  await supabase.from('analytics').insert({ event: 'session-start' });
  return res.json({ success: true });
}
```

**PlanetScale** (MySQL):
```typescript
import { connect } from '@planetscale/database';

const db = connect({ url: DATABASE_URL });

export default async function handler(req, res) {
  await db.execute('INSERT INTO analytics (event) VALUES (?)', ['session-start']);
  return res.json({ success: true });
}
```

### 4. Disable Entirely

To disable all analytics:

**Option A: Comment out tracking calls**
```typescript
// src/App.tsx
// trackSessionStart();  // Disabled
// trackDiagramSave();   // Disabled
// trackDiagramExport(); // Disabled
```

**Option B: Make functions no-ops**
```typescript
// src/utils/analytics.ts
export function trackSessionStart(): void {
  // Disabled
}
export function trackDiagramSave(): void {
  // Disabled
}
export function trackDiagramExport(): void {
  // Disabled
}
```

## Viewing Statistics

### Your Local Stats

Your personal usage statistics are stored in localStorage. You can view them:

**Option 1: Browser Console**
```javascript
JSON.parse(localStorage.getItem('strategy-map-stats'))
```

**Option 2: Add Stats Panel** (Future Enhancement)
Add a stats panel to the UI to show your personal usage:
```typescript
import { getUsageSummary } from './utils/analytics';

// Display in UI
console.log(getUsageSummary());
```

### Global Stats (If Using Serverless Function)

If you deploy the serverless function, you can view counts:
```bash
curl https://your-domain.com/api/analytics?event=session-start
```

Returns:
```json
{
  "event": "session-start",
  "count": 1234,
  "timestamp": "2025-11-07T10:00:00.000Z"
}
```

## Deployment

### Deploying to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Update endpoint in `src/utils/analytics.ts`:
```typescript
const ANALYTICS_ENDPOINT = 'https://your-project.vercel.app/api/analytics';
```

### Deploying to Netlify

1. Move function:
```bash
mkdir -p netlify/functions
mv api/analytics.ts netlify/functions/
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Update endpoint:
```typescript
const ANALYTICS_ENDPOINT = 'https://your-site.netlify.app/.netlify/functions/analytics';
```

## Legal & Privacy Compliance

This implementation is designed to be compliant with:

✅ **GDPR** (EU)
- No personal data collected
- No consent required (anonymous data)
- No right to be forgotten issues (no personal data)

✅ **CCPA** (California)
- No sale of personal information
- No personal information collected
- No opt-out required

✅ **PECR** (UK)
- No cookies used
- No consent banner needed

## Best Practices

1. **Be Transparent**: Tell users you're collecting anonymous usage stats
2. **Provide Opt-Out**: Allow users to disable if they want
3. **Document Everything**: Clearly explain what you track
4. **Fail Gracefully**: Never let analytics break your app
5. **Minimize Data**: Only collect what you actually need

## Support

For questions or concerns about analytics:
- Review the code in `src/utils/analytics.ts`
- Check network requests in browser DevTools
- Open an issue if you have privacy concerns

---

**Remember**: Good analytics respect user privacy while providing useful insights.
