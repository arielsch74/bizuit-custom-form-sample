# Runtime Configuration Guide

## 🎯 Overview

This application supports **two types of configuration**:

1. **Build-time Configuration** (Static): Values are "burned" into the compiled JavaScript during `npm run build`
2. **Runtime Configuration** (Dynamic): Values are read from `.env.local` on each request

## 📊 Configuration Variables

### ✅ Runtime Configuration (Dynamic - No Rebuild Required)

These variables can be **changed without rebuilding** the application. Just update `.env.local` and restart the server.

| Variable | Default | Description |
|----------|---------|-------------|
| `BIZUIT_TIMEOUT` | `30000` | HTTP request timeout in milliseconds |
| `BIZUIT_TOKEN_EXPIRATION_MINUTES` | `1440` | Token expiration time (24 hours) |
| `BIZUIT_API_BASE_URL` | `https://test.bizuit.com/...` | Backend API base URL for proxy |

**How to change:**
```bash
# 1. Edit .env.local on the server
BIZUIT_TIMEOUT=60000
BIZUIT_TOKEN_EXPIRATION_MINUTES=2880

# 2. Restart the server (no rebuild!)
pm2 restart bizuit-app
# or
npm run dev  # for development
```

**How it works:**
- Values are read by the `/api/config` endpoint at runtime
- The client fetches configuration on app load from `/api/config`
- Changes take effect immediately after restart (no rebuild)

### ⚠️ Build-time Configuration (Static - Requires Rebuild)

These variables are **compiled into the JavaScript** during build. Changing them requires `npm run build`.

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_BIZUIT_FORMS_API_URL` | `/api/bizuit` | Forms API URL (client-side) |
| `NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL` | `/api/bizuit` | Dashboard API URL (client-side) |

**How to change:**
```bash
# 1. Edit .env.local on the server
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/new/api/path

# 2. Rebuild the app
npm run build

# 3. Restart the server
pm2 restart bizuit-app
```

**Why they're static:**
- These variables start with `NEXT_PUBLIC_*`
- Next.js includes them in the browser JavaScript bundle
- The browser can't access server environment variables
- Next.js replaces `process.env.NEXT_PUBLIC_*` with literal values during build

## 🔄 Migration from Build-time to Runtime Config

### Before (Build-time - Requires Rebuild)
```bash
# .env.local
NEXT_PUBLIC_BIZUIT_TIMEOUT=30000  # ❌ Burned into build

# To change:
# 1. Edit file
# 2. npm run build (rebuild entire app)
# 3. pm2 restart bizuit-app
```

### After (Runtime - No Rebuild)
```bash
# .env.local
BIZUIT_TIMEOUT=30000  # ✅ Read at runtime

# To change:
# 1. Edit file
# 2. pm2 restart bizuit-app (just restart)
```

## 📁 Configuration Files

### `.env.local` (Server)
```bash
# Runtime Configuration (Dynamic - no rebuild needed)
BIZUIT_TIMEOUT=30000
BIZUIT_TOKEN_EXPIRATION_MINUTES=1440
BIZUIT_API_BASE_URL=https://test.bizuit.com/arielschbizuitdashboardapi/api

# Build-time Configuration (Static - requires rebuild)
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/api/bizuit
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/api/bizuit

# Legacy (kept for backward compatibility)
NEXT_PUBLIC_BIZUIT_TIMEOUT=30000
NEXT_PUBLIC_BIZUIT_TOKEN_EXPIRATION_MINUTES=1440
```

### `app/api/config/route.ts` (API Endpoint)
```typescript
// This endpoint reads runtime configuration
export async function GET() {
  return NextResponse.json({
    timeout: parseInt(process.env.BIZUIT_TIMEOUT || '30000', 10),
    tokenExpirationMinutes: parseInt(process.env.BIZUIT_TOKEN_EXPIRATION_MINUTES || '1440', 10),
  })
}
```

## 🚀 Quick Examples

### Example 1: Change Timeout (No Rebuild)

```bash
# On production server:
cd /path/to/app
vi .env.local

# Change:
BIZUIT_TIMEOUT=60000  # 60 seconds instead of 30

# Restart:
pm2 restart bizuit-app

# ✅ Done! Takes effect immediately
```

### Example 2: Change Token Expiration (No Rebuild)

```bash
# Change from 24h to 48h
BIZUIT_TOKEN_EXPIRATION_MINUTES=2880

# Restart
pm2 restart bizuit-app

# ✅ Done!
```

### Example 3: Change API URLs (Requires Rebuild)

```bash
# Change API URL
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=https://prod.bizuit.com/api

# Rebuild
npm run build

# Restart
pm2 restart bizuit-app

# ✅ Done!
```

## 🔍 How to Check Current Configuration

### From Browser DevTools
```javascript
// Open browser console and run:
fetch('/api/config')
  .then(r => r.json())
  .then(console.log)

// Output:
// {
//   timeout: 30000,
//   tokenExpirationMinutes: 1440,
//   formsApiUrl: "/api/bizuit",
//   dashboardApiUrl: "/api/bizuit"
// }
```

### From Server Logs
```bash
# Check server logs for config endpoint
pm2 logs bizuit-app | grep "Config API"

# Output:
# [Config API] Serving runtime configuration: { timeout: 30000, ... }
```

## 💡 Best Practices

1. **Use Runtime Config when possible**: Prefer `BIZUIT_*` over `NEXT_PUBLIC_*` for values that might change
2. **Document changes**: Keep track of custom configurations in production
3. **Test after changes**: Always verify the app works after changing configuration
4. **Use version control**: Track `.env.local.example` in git (never `.env.local`)

## 🐛 Troubleshooting

### Problem: Config changes don't take effect

**Symptom**: Changed `BIZUIT_TIMEOUT` but app still uses old value

**Solution**:
```bash
# 1. Verify file was saved
cat .env.local | grep BIZUIT_TIMEOUT

# 2. Restart server
pm2 restart bizuit-app

# 3. Check logs
pm2 logs bizuit-app | grep "Config API"

# 4. Verify from browser
fetch('/api/config').then(r => r.json()).then(console.log)
```

### Problem: `NEXT_PUBLIC_*` changes don't take effect

**Symptom**: Changed `NEXT_PUBLIC_BIZUIT_FORMS_API_URL` but app uses old URL

**Solution**: These require rebuild!
```bash
npm run build
pm2 restart bizuit-app
```

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Azure Pipeline Configuration](../azure-pipelines.yml)
- [API Config Endpoint](./app/api/config/route.ts)
