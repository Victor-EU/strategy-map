# Deployment Guide

This guide covers deploying Strategy Map to production environments.

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved (`npm run build` succeeds)
- [ ] No console.log/debug statements in production code
- [ ] All tests passing (if applicable)
- [ ] Code reviewed and approved
- [ ] Dependencies up-to-date (`npm audit` shows 0 vulnerabilities)

### Security
- [ ] No exposed API keys or secrets
- [ ] Environment variables properly configured
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers configured
- [ ] CORS properly configured (if applicable)

### Performance
- [ ] Bundle size optimized (< 100KB gzipped ✓)
- [ ] Images optimized
- [ ] Lazy loading implemented where appropriate
- [ ] Production build tested locally (`npm run preview`)

### Documentation
- [ ] README.md updated
- [ ] USAGE_GUIDE.md updated
- [ ] CHANGELOG.md updated with version
- [ ] API documentation updated (if applicable)

## 🚀 Vercel Deployment (Recommended)

Vercel provides the best experience for React applications with zero configuration.

### Initial Setup

1. **Install Vercel CLI** (optional, but recommended)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # First deployment
   vercel

   # Production deployment
   vercel --prod
   ```

### GitHub Integration (Automatic Deployments)

1. **Push to GitHub**
   ```bash
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration
   - Click "Deploy"

3. **Automatic Deployments**
   - Every push to `main` → Production deployment
   - Every PR → Preview deployment
   - Instant rollbacks available

### Environment Variables

If your app requires environment variables:

1. **Local Development** (`.env.local`)
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_ANALYTICS_ID=your-analytics-id
   ```

2. **Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add variables for Production, Preview, and Development
   - Variables prefixed with `VITE_` are exposed to the client

### Custom Domain

1. **Add Domain in Vercel**
   - Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Configuration**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Usually ready within minutes

## 🌐 Alternative Platforms

### Netlify

1. **netlify.toml** configuration:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Deploy
   netlify deploy --prod
   ```

### GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/strategy-map",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/strategy-map/',
     plugins: [react()],
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### AWS S3 + CloudFront

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **CloudFront Configuration**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure error pages to serve index.html
   - Enable HTTPS

4. **Custom Domain** (Route 53)
   - Add A record pointing to CloudFront distribution
   - Request ACM certificate for HTTPS

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   # Build stage
   FROM node:18-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   # Production stage
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**
   ```nginx
   server {
     listen 80;
     server_name localhost;
     root /usr/share/nginx/html;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     # Enable gzip compression
     gzip on;
     gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

3. **Build and Run**
   ```bash
   # Build image
   docker build -t strategy-map .

   # Run container
   docker run -d -p 80:80 strategy-map
   ```

## 🔧 Build Optimization

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
  },
})
```

### Environment-Specific Builds

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production"
  }
}
```

## 🔍 Post-Deployment Verification

### Automated Checks

```bash
# Build succeeds
npm run build

# Preview works locally
npm run preview

# No console errors
# Check browser console after deployment
```

### Manual Checks

- [ ] Home page loads correctly
- [ ] All tools work as expected
- [ ] Properties panel functions correctly
- [ ] Export functionality works
- [ ] Right-click save works
- [ ] Zoom controls work
- [ ] Keyboard shortcuts work
- [ ] Mobile responsiveness verified
- [ ] No JavaScript errors in console
- [ ] Assets load correctly (favicon, images)

### Performance Checks

```bash
# Lighthouse CI
npx lighthouse https://your-domain.com --view

# Check metrics:
# - Performance Score > 90
# - First Contentful Paint < 1.5s
# - Time to Interactive < 3.5s
# - Largest Contentful Paint < 2.5s
```

### Security Headers

Verify security headers are set:

```
Content-Security-Policy
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

Vercel sets most of these automatically.

## 🔄 Rollback Procedures

### Vercel

1. **From Dashboard**
   - Go to Deployments
   - Find previous successful deployment
   - Click "..." → "Promote to Production"

2. **From CLI**
   ```bash
   # List deployments
   vercel ls

   # Promote specific deployment
   vercel alias <deployment-url> <your-domain.com>
   ```

### Git-based Rollback

```bash
# Revert last commit
git revert HEAD

# Push to trigger new deployment
git push origin main
```

## 📊 Monitoring

### Analytics

The app includes privacy-friendly analytics via CountAPI:
- Session tracking (anonymous)
- Export counts
- No personal data collected
- GDPR compliant

### Error Monitoring

Consider integrating:
- **Sentry** - Error tracking and performance monitoring
- **LogRocket** - Session replay for debugging
- **Google Analytics** - User behavior (with consent)

### Uptime Monitoring

- **Vercel Analytics** - Built-in performance monitoring
- **UptimeRobot** - External uptime checks
- **Pingdom** - Performance monitoring

## 🔐 Security Best Practices

### SSL/HTTPS

- ✅ Always use HTTPS (automatic on Vercel)
- ✅ Enable HSTS headers
- ✅ Use secure cookies (if applicable)

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;
               connect-src 'self' https://api.countapi.xyz;">
```

### Rate Limiting

If you add server-side features:
- Implement rate limiting on API endpoints
- Use services like Cloudflare for DDoS protection
- Monitor for unusual traffic patterns

## 🆘 Troubleshooting

### Build Fails

**Problem**: TypeScript errors during build

**Solution**:
```bash
# Check for errors locally
npm run build

# Fix errors and rebuild
# Common issues:
# - Missing imports
# - Type mismatches
# - Unused variables (strict mode)
```

### Blank Page After Deployment

**Problem**: App shows blank page

**Solution**:
1. Check browser console for errors
2. Verify base URL in vite.config.ts
3. Check routing configuration
4. Ensure all assets are loading (Network tab)

### Assets Not Loading

**Problem**: Images/styles not loading

**Solution**:
1. Check asset paths (use relative paths or `import`)
2. Verify `base` option in vite.config.ts
3. Check public folder structure
4. Inspect Network tab for 404 errors

### Performance Issues

**Problem**: Slow load times

**Solution**:
1. Analyze bundle size: `npm run build -- --report`
2. Check for large dependencies
3. Implement code splitting
4. Optimize images
5. Enable compression (gzip/brotli)

## 📞 Support

For deployment issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Vite Documentation](https://vitejs.dev)
3. Search GitHub issues
4. Contact support or open an issue

## 🎉 Success!

Your Strategy Map application is now live! 🚀

Remember to:
- Monitor performance and errors
- Keep dependencies updated
- Regular security audits
- User feedback collection
- Continuous improvements

---

**Deployment Checklist Complete! Ready for production! ✅**
