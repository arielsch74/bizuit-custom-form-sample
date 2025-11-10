# Flujo de Autenticación - Bizuit Form Template

## 📋 Resumen Ejecutivo

El sistema de autenticación de Bizuit Form Template utiliza **HTTP Basic Authentication** con tokens que se persisten en `localStorage` del navegador. El token se genera mediante login con usuario/contraseña y se incluye en cada petición al API de Bizuit.

---

## 🔐 Componentes del Sistema de Autenticación

### 1. **BizuitAuthProvider** (Context Provider)
**Ubicación:** `packages/bizuit-ui-components/src/providers/auth-provider.tsx`

**Responsabilidades:**
- Mantener el estado global de autenticación
- Persistir tokens en `localStorage`
- Validar expiración de tokens
- Proveer métodos `login()` y `logout()`

**Estado gestionado:**
```typescript
{
  token: string | null,              // Token de autenticación (formato: "Basic <base64>")
  user: ILoginResponse['User'] | null,  // Información del usuario
  expirationDate: string | null,     // Fecha de expiración ISO
  isAuthenticated: boolean           // true si token válido y no expirado
}
```

**LocalStorage keys:**
- `bizuit-auth-token` → Token de autenticación
- `bizuit-auth-user` → Datos del usuario (JSON)
- `bizuit-auth-expiration` → Fecha de expiración

---

### 2. **BizuitAuthService** (SDK Service)
**Ubicación:** `packages/bizuit-form-sdk/src/lib/api/auth-service.ts`

**Método principal: `login()`**
```typescript
async login(credentials: ILoginRequest): Promise<ILoginResponse>
```

**Flujo del login:**
1. Recibe `{ username, password }`
2. Crea header `Authorization: Basic <base64(username:password)>`
3. Hace `GET` a `/api/bizuit/Login` con el header
4. El API responde con:
   ```json
   {
     "token": "ZMdufWTdCsSYUXj7...",
     "user": {
       "username": "admin",
       "userID": 1,
       "displayName": "Administrator"
     },
     "forceChange": false,
     "expirationDate": "2025-11-27T22:07:20Z"
   }
   ```
5. Retorna `ILoginResponse` con token formateado como `"Basic <token>"`

---

### 3. **BizuitLogin** (UI Component)
**Ubicación:** `packages/bizuit-ui-components/src/components/BizuitLogin.tsx`

**Funcionalidad:**
- Renderiza formulario de login (usuario/contraseña)
- Llama a `authService.login()`
- En éxito: ejecuta `onLoginSuccess(loginResponse)`
- En error: muestra mensaje de error

---

### 4. **RequireAuth** (Route Guard)
**Ubicación:** `example/components/require-auth.tsx`

**Funcionalidad:**
- Protege rutas que requieren autenticación
- Soporta 2 métodos de autenticación:

  **A. Login manual:** Redirige a `/login` si no autenticado

  **B. Auto-login con token en URL:** Si recibe `?token=XXX`, crea sesión automáticamente
  ```typescript
  // Token desde BPM (ejemplo: form abierto desde Bizuit)
  /start-process?token=Basic_ZMdufWTdCsSY...
  ```

---

## 🔄 Flujos de Autenticación

### **Flujo 1: Login Manual (Usuario/Contraseña)**

```
┌─────────┐
│ Usuario │
└────┬────┘
     │
     │ 1. Navega a /login
     ▼
┌─────────────────┐
│  LoginPage      │
│  /login         │
└────┬────────────┘
     │
     │ 2. Ingresa credenciales
     │    username: "admin"
     │    password: "pass123"
     ▼
┌──────────────────┐
│  BizuitLogin     │
│  (Component)     │
└────┬─────────────┘
     │
     │ 3. authService.login({ username, password })
     ▼
┌───────────────────┐
│ BizuitAuthService │
└────┬──────────────┘
     │
     │ 4. Crea header: Authorization: Basic base64(admin:pass123)
     │ 5. GET /api/bizuit/Login
     ▼
┌──────────────────┐
│  Bizuit API      │
│  (Backend)       │
└────┬─────────────┘
     │
     │ 6. Valida credenciales
     │ 7. Retorna token + user data
     ▼
┌───────────────────┐
│ BizuitAuthService │
└────┬──────────────┘
     │
     │ 8. Formatea token: "Basic ZMdufWTdCsSY..."
     │ 9. Retorna ILoginResponse
     ▼
┌──────────────────┐
│  BizuitLogin     │
└────┬─────────────┘
     │
     │ 10. onLoginSuccess(loginResponse)
     ▼
┌─────────────────┐
│  LoginPage      │
└────┬────────────┘
     │
     │ 11. setAuthData(loginResponse)
     ▼
┌──────────────────────┐
│  BizuitAuthProvider  │
└────┬─────────────────┘
     │
     │ 12. Guarda en localStorage:
     │     - bizuit-auth-token
     │     - bizuit-auth-user
     │     - bizuit-auth-expiration
     │ 13. Actualiza estado global
     ▼
┌─────────┐
│ Usuario │ ✅ Autenticado
└─────────┘
```

---

### **Flujo 2: Auto-login con Token en URL**

```
┌─────────────┐
│   Bizuit    │ (Sistema BPM)
│     BPM     │
└──────┬──────┘
       │
       │ 1. Usuario abre formulario desde BPM
       │    URL: /start-process?token=Basic_ZMdufWTdCsSY...
       ▼
┌────────────────┐
│  RequireAuth   │
└────┬───────────┘
     │
     │ 2. Detecta token en URL
     │ 3. Crea mock user con token:
     │    {
     │      Token: "Basic_ZMdufWTdCsSY...",
     │      User: { Username: "bizuit-user", ... },
     │      ExpirationDate: Date.now() + 24h
     │    }
     ▼
┌──────────────────────┐
│  BizuitAuthProvider  │
└────┬─────────────────┘
     │
     │ 4. setAuthData(mockUserFromToken)
     │ 5. Guarda en localStorage
     │ 6. Marca como autenticado
     ▼
┌─────────────┐
│  Contenido  │ ✅ Renderizado (sin login manual)
│  Protegido  │
└─────────────┘
```

---

## 🔑 Uso del Token en Peticiones API

### **Proceso de envío del token:**

1. **Usuario autenticado** → Token en `useBizuitAuth().token`

2. **Componente hace petición:**
   ```typescript
   const { token } = useBizuitAuth()
   await sdk.process.getProcessParameters('samplewebpages', '', token)
   ```

3. **SDK agrega token a headers:**
   ```typescript
   // process-service.ts:173
   if (token) {
     headers['Authorization'] = token  // "Basic ZMdufWTdCsSY..."
   }
   ```

4. **HTTP Client hace fetch:**
   ```typescript
   GET /api/bizuit/eventmanager/workflowDefinition/parameters/samplewebpages?version=
   Headers:
     Authorization: Basic ZMdufWTdCsSYUXj7/BEC3GVmCT6V5aUjt...
   ```

5. **Next.js API Route (proxy):**
   ```typescript
   // /api/bizuit/[...path]/route.ts
   // Reenvía headers al API de Bizuit
   ```

6. **Bizuit API valida token:**
   - ✅ Si válido → Responde con datos
   - ❌ Si inválido → HTTP 401 Unauthorized

---

## 🚨 Problema Actual: Token 401

### **Diagnóstico:**

```bash
$ curl -v -H "Authorization: Basic ZMdufWTdCsSYUXj7..." https://test.bizuit.com/...
< HTTP/2 401
< content-length: 0
```

**Causa:** El token actual está **expirado o es inválido**.

### **Solución:**

1. **Hacer login manual:**
   - Ir a http://localhost:3000/login
   - Ingresar credenciales válidas
   - El sistema generará un token nuevo

2. **Verificar expiración:**
   - Revisar `localStorage.getItem('bizuit-auth-expiration')`
   - Si está expirado, hacer logout y login nuevamente

3. **Obtener token fresco desde Bizuit:**
   - Generar token desde el panel de Bizuit BPM
   - Usarlo en URL: `?token=NUEVO_TOKEN`

---

## 📊 Diagrama de Persistencia

```
┌──────────────────────────────────────────────────┐
│           NAVEGADOR (Browser)                    │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │       LocalStorage                     │     │
│  │                                        │     │
│  │  bizuit-auth-token:                    │     │
│  │    "Basic ZMdufWTdCsSYUXj7..."         │     │
│  │                                        │     │
│  │  bizuit-auth-user:                     │     │
│  │    {"Username": "admin", "UserID": 1}  │     │
│  │                                        │     │
│  │  bizuit-auth-expiration:               │     │
│  │    "2025-11-27T22:07:20.509Z"          │     │
│  └────────────────────────────────────────┘     │
│                     ▲                            │
│                     │                            │
│         ┌───────────┴──────────┐                 │
│         │ BizuitAuthProvider   │                 │
│         │  (React Context)     │                 │
│         └──────────────────────┘                 │
│                     ▲                            │
│                     │                            │
│         ┌───────────┴──────────┐                 │
│         │   useBizuitAuth()    │                 │
│         │   (Hook en          │                 │
│         │    componentes)      │                 │
│         └──────────────────────┘                 │
└──────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Autenticación

**Para que funcione correctamente:**

- [x] Usuario debe hacer login con credenciales válidas
- [x] Token se guarda en localStorage
- [x] Token se incluye en header `Authorization` de cada petición
- [x] Token debe ser válido (no expirado)
- [x] API de Bizuit debe estar accesible
- [ ] **PENDIENTE:** Token actual está expirado (401)

**Acción requerida:**
1. Ir a `/login`
2. Ingresar credenciales válidas del servidor de Bizuit
3. El sistema generará un token fresco automáticamente

---

## 🔧 Archivos Clave

| Archivo | Ubicación | Responsabilidad |
|---------|-----------|----------------|
| `auth-provider.tsx` | `packages/bizuit-ui-components/src/providers/` | Context Provider de autenticación |
| `auth-service.ts` | `packages/bizuit-form-sdk/src/lib/api/` | Servicio de login y validación |
| `BizuitLogin.tsx` | `packages/bizuit-ui-components/src/components/` | Componente UI de login |
| `require-auth.tsx` | `example/components/` | Route guard |
| `login/page.tsx` | `example/app/login/` | Página de login |
| `route.ts` | `example/app/api/bizuit/[...path]/` | Proxy Next.js → Bizuit API |

---

## 🎯 Manejo Automático de Tokens Expirados

### ✅ **IMPLEMENTADO:** Detección automática de 401

Se ha implementado un sistema de detección automática de tokens expirados que hace logout y redirect a login cuando se detecta un error 401.

#### **Hook: `useBizuitSDKWithAuth()`**

**Ubicación:** `example/hooks/use-bizuit-sdk-with-auth.ts`

**Uso:**
```typescript
// ❌ ANTES: Sin manejo automático de 401
const sdk = useBizuitSDK()
await sdk.process.getProcessParameters(...) // Error 401 no manejado

// ✅ AHORA: Con manejo automático
const sdk = useBizuitSDKWithAuth()
await sdk.process.getProcessParameters(...) // Auto-logout + redirect en 401
```

**Funcionamiento:**
1. Envuelve todas las llamadas del SDK con try/catch
2. Detecta errores 401 (token expirado/inválido)
3. Ejecuta `logout()` para limpiar localStorage
4. Redirige a `/login?redirect=<current-page>`
5. Re-lanza el error para que el componente pueda manejarlo

#### **Hook: `useAuthErrorHandler()`**

**Ubicación:** `example/hooks/use-auth-error-handler.ts`

**Uso manual (alternativa):**
```typescript
const handleAuthError = useAuthErrorHandler()

try {
  await someAsyncOperation()
} catch (error) {
  if (handleAuthError(error, '/ruta-actual')) {
    return // Ya se manejó el 401
  }
  // Manejar otros errores...
}
```

---

## 📦 Archivos de Autenticación

### Hooks Agregados

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| `use-auth-error-handler.ts` | `example/hooks/` | Hook para manejar errores 401 manualmente |
| `use-bizuit-sdk-with-auth.ts` | `example/hooks/` | Wrapper del SDK con manejo automático de 401 |

### Archivos Core

| Archivo | Ubicación | Responsabilidad |
|---------|-----------|----------------|
| `auth-provider.tsx` | `packages/bizuit-ui-components/src/providers/` | Context Provider de autenticación |
| `auth-service.ts` | `packages/bizuit-form-sdk/src/lib/api/` | Servicio de login y validación |
| `BizuitLogin.tsx` | `packages/bizuit-ui-components/src/components/` | Componente UI de login |
| `require-auth.tsx` | `example/components/` | Route guard |
| `login/page.tsx` | `example/app/login/` | Página de login |
| `route.ts` | `example/app/api/bizuit/[...path]/` | Proxy Next.js → Bizuit API |

---

## 🎯 Próximos Pasos

1. ✅ **Hacer login manual** para obtener token válido
2. ✅ **Manejo automático de errores 401** - Implementado
3. ⚠️ Implementar refresh automático de tokens (opcional)
4. ⚠️ Aplicar `useBizuitSDKWithAuth()` en todos los componentes

---

**Documentado:** 2025-11-09
**Última Actualización:** 2025-11-09 22:30
**Autor:** Claude (Investigación e implementación)
**Estado:** Completo con manejo automático de expiración
