# 🌐 Cloudflare Deployment Guide for brainsait.io

## 🎯 Overview
Deploy Solo-Spark Innovation Platform to Cloudflare's global network with your custom domain `brainsait.io`. This setup provides:

- ⚡ Global CDN with edge computing
- 💾 KV storage for user data and sessions
- 🗄️ R2 object storage for files and exports
- 🗃️ D1 SQL database for structured data
- ⚙️ Cloudflare Workers for serverless APIs
- 🔒 Enterprise-grade security and DDoS protection
- 📊 Real-time analytics and monitoring

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### 2. One-Click Deployment
```bash
# Make script executable and run
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

## 📋 Manual Setup Steps

### 1. Domain Configuration
1. Add `brainsait.io` to your Cloudflare account
2. Update nameservers to Cloudflare's
3. Configure DNS records:
   ```
   Type    Name    Target
   CNAME   @       solo-spark.pages.dev
   CNAME   www     solo-spark.pages.dev
   CNAME   api     solo-spark.workers.dev
   CNAME   cdn     solo-spark.pages.dev
   ```

### 2. SSL/TLS Configuration
- Enable "Full (strict)" SSL mode
- Turn on "Always Use HTTPS"
- Enable HSTS with max-age 31536000
- Configure SSL/TLS certificates

### 3. KV Namespaces Creation
```bash
# Create production KV namespaces
wrangler kv:namespace create "USER_DATA" --env production
wrangler kv:namespace create "SESSIONS" --env production
wrangler kv:namespace create "CACHE" --env production
wrangler kv:namespace create "ANALYTICS" --env production

# Create preview KV namespaces
wrangler kv:namespace create "USER_DATA" --env production --preview
wrangler kv:namespace create "SESSIONS" --env production --preview
wrangler kv:namespace create "CACHE" --env production --preview
wrangler kv:namespace create "ANALYTICS" --env production --preview
```

### 4. R2 Buckets Setup
```bash
# Create R2 buckets for file storage
wrangler r2 bucket create solo-spark-user-files
wrangler r2 bucket create solo-spark-prototypes
wrangler r2 bucket create solo-spark-exports
wrangler r2 bucket create solo-spark-backups

# Create preview buckets
wrangler r2 bucket create solo-spark-user-files-preview
wrangler r2 bucket create solo-spark-prototypes-preview
wrangler r2 bucket create solo-spark-exports-preview
wrangler r2 bucket create solo-spark-backups-preview
```

### 5. D1 Database Creation
```bash
# Create D1 database
wrangler d1 create solo-spark-db

# Initialize schema
wrangler d1 execute solo-spark-db --file=./schema.sql

# Verify database
wrangler d1 execute solo-spark-db --command="SELECT * FROM users LIMIT 1"
```

### 6. Message Queues Setup
```bash
# Create queues for background processing
wrangler queues create ai-processing-queue
wrangler queues create email-queue
wrangler queues create analytics-queue
```

### 7. Environment Variables Configuration
```bash
# Set secrets (sensitive data)
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GITHUB_TOKEN
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STC_MERCHANT_ID
wrangler secret put MADA_MERCHANT_ID
wrangler secret put CLOUDFLARE_API_TOKEN

# Set environment variables (non-sensitive)
wrangler env set ENVIRONMENT production
wrangler env set DOMAIN brainsait.io
wrangler env set DEFAULT_CURRENCY SAR
wrangler env set DEFAULT_LOCALE ar-SA
```

### 8. Pages Deployment
```bash
# Build the application
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=solo-spark

# Configure custom domain
wrangler pages domain add brainsait.io --project-name=solo-spark
```

### 9. Workers Deployment
```bash
# Deploy authentication worker
wrangler deploy --env production

# Verify deployment
wrangler tail --env production
```

## ⚙️ Configuration Files

### wrangler.toml Updates
Update the resource IDs in `wrangler.toml` with your actual values:

```toml
# Replace with your actual KV namespace IDs
[[kv_namespaces]]
binding = "USER_DATA"
id = "your_actual_kv_id_here"
preview_id = "your_actual_preview_id_here"

# Replace with your actual D1 database ID
[[d1_databases]]
binding = "DB"
database_name = "solo-spark-db"
database_id = "your_actual_d1_id_here"
```

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id

# API Keys
VITE_ANTHROPIC_API_KEY=your_claude_api_key
VITE_GITHUB_TOKEN=your_github_token
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Cloudflare Resources
VITE_KV_USER_DATA_ID=your_kv_namespace_id
VITE_R2_USER_FILES_BUCKET=solo-spark-user-files
VITE_D1_DATABASE_ID=your_d1_database_id
```

## 🔧 Performance Optimization

### Cloudflare Settings
Enable these features in your Cloudflare dashboard:

**Speed:**
- Auto Minify: CSS, JavaScript, HTML ✅
- Brotli Compression ✅
- Rocket Loader ✅
- Polish (image optimization) ✅
- Mirage (mobile optimization) ✅

**Caching:**
- Browser Cache TTL: 4 hours
- Edge Cache TTL: 2 hours
- Development Mode: Off (production)

**Network:**
- HTTP/2: Enabled
- HTTP/3 (QUIC): Enabled
- 0-RTT Connection Resumption: Enabled
- WebSockets: Enabled

### Workers Configuration
```javascript
// In your Worker:
export default {
  async fetch(request, env, ctx) {
    // Set performance headers
    const response = await handleRequest(request, env);

    response.headers.set('Cache-Control', 'public, max-age=3600');
    response.headers.set('CDN-Cache-Control', 'public, max-age=7200');

    return response;
  }
};
```

## 🔒 Security Configuration

### Firewall Rules
Set up these security rules:

1. **Rate Limiting:**
   ```
   (http.request.uri.path contains "/api/auth" and http.request.method eq "POST")
   Rate: 5 requests per minute per IP
   ```

2. **Bot Protection:**
   ```
   (cf.bot_management.score lt 30)
   Action: Challenge (Captcha)
   ```

3. **Geo-blocking (optional):**
   ```
   (ip.geoip.country ne "SA" and ip.geoip.country ne "US" and ip.geoip.country ne "GB")
   Action: Challenge
   ```

### Security Headers
Configure these headers in Pages:

```javascript
// _headers file
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## 📊 Monitoring & Analytics

### Cloudflare Analytics
Enable these analytics features:

1. **Web Analytics:**
   - Real User Monitoring (RUM)
   - Core Web Vitals
   - Custom events tracking

2. **Security Analytics:**
   - Threat monitoring
   - Bot traffic analysis
   - Attack pattern detection

3. **Performance Analytics:**
   - Edge response times
   - Cache hit ratios
   - Bandwidth usage

### Custom Metrics
Track business metrics:

```javascript
// In your Worker
export default {
  async fetch(request, env, ctx) {
    // Track custom events
    ctx.waitUntil(
      env.ANALYTICS_ENGINE.writeDataPoint({
        'blobs': ['user_registration'],
        'doubles': [1],
        'indexes': [request.cf.colo]
      })
    );
  }
};
```

## 🚨 Troubleshooting

### Common Issues

1. **DNS not propagating:**
   ```bash
   # Check DNS propagation
   dig brainsait.io
   nslookup brainsait.io
   ```

2. **KV namespace not found:**
   ```bash
   # List all KV namespaces
   wrangler kv:namespace list
   ```

3. **Worker deployment fails:**
   ```bash
   # Check wrangler configuration
   wrangler whoami
   wrangler dev --local
   ```

4. **SSL certificate issues:**
   - Verify DNS records are correct
   - Check certificate status in Cloudflare dashboard
   - Try disabling proxy (orange cloud) temporarily

### Debug Commands
```bash
# Check Worker logs
wrangler tail --env production

# Test KV operations
wrangler kv:key get "test-key" --namespace-id=your_namespace_id

# Test D1 queries
wrangler d1 execute solo-spark-db --command="SELECT COUNT(*) FROM users"

# Test R2 buckets
wrangler r2 object list solo-spark-user-files
```

## 🎉 Post-Deployment Checklist

### Functionality Tests
- [ ] Landing page loads correctly
- [ ] User registration/login works
- [ ] AI assistant responds
- [ ] Payment integration functional
- [ ] Arabic/English switching works
- [ ] Project save/export works
- [ ] GitHub integration works
- [ ] Mobile responsiveness verified

### Performance Tests
- [ ] PageSpeed Insights score > 90
- [ ] Time to First Byte < 200ms
- [ ] Largest Contentful Paint < 2.5s
- [ ] First Input Delay < 100ms
- [ ] Cumulative Layout Shift < 0.1

### Security Tests
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] Rate limiting functional
- [ ] Bot protection active
- [ ] CORS properly configured

## 🔄 Continuous Deployment

### GitHub Actions Integration
The existing CI/CD pipeline will work with Cloudflare. Update secrets:

```yaml
# .github/workflows/deploy.yml additions
env:
  CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Automated Deployments
```bash
# Deploy on git push
git push origin main

# Deploy specific branch to staging
wrangler pages deploy dist --project-name=solo-spark-staging --branch=staging
```

## 🌟 Advanced Features

### Edge Computing
Leverage Cloudflare Workers for:
- Real-time AI processing at the edge
- Personalization based on user location
- A/B testing and feature flags
- Dynamic content optimization

### Global Distribution
- Automatic content replication across 300+ cities
- Smart routing to nearest data center
- Regional data compliance (GDPR, data residency)
- Multi-region failover

---

## 🎯 Success! Your Innovation Platform is Live

**🌐 Production URL:** https://brainsait.io
**🔧 Dashboard:** https://dash.cloudflare.com
**📊 Analytics:** Available in Cloudflare dashboard
**⚡ Global Edge:** 300+ cities worldwide

Your Solo-Spark platform is now running on Cloudflare's enterprise infrastructure, ready to serve Saudi innovators and scale globally! 🚀🇸🇦
