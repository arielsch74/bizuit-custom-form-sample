# 🧪 Guía de Testing: Tenant Isolation

Esta guía te ayuda a probar la implementación de tenant isolation que previene el "cookie bleeding" entre arielsch y recubiz.

## 📋 Qué se implementó

**Problema anterior:**
- Las cookies `admin_token` y `admin_user_data` se compartían entre todos los deployments en test.bizuit.com
- Un admin autenticado en arielsch podía acceder a recubiz con el mismo token

**Solución implementada:**
- Cookies con prefijo de tenant: `arielsch_admin_token` vs `recubiz_admin_token`
- JWT valida `tenant_id` en backend (rechaza tokens de otro tenant)
- Aislamiento completo por tenant

---

## 🧪 Opción 1: Testing en test.bizuit.com (Producción)

### Pre-requisito
Asegúrate de hacer deploy del código actualizado a test.bizuit.com para ambos tenants:
- arielschBIZUITCustomForms
- recubizBIZUITCustomForms

### Test 1: Login Normal en Cada Tenant

1. **Login en arielsch:**
   ```
   URL: https://test.bizuit.com/arielschBIZUITCustomForms/admin/login
   Usuario: admin
   Password: [tu password]
   ```

2. **Abrir DevTools → Application → Cookies**
   - Verificar que existen las cookies:
     - `arielsch_admin_token` ✅
     - `arielsch_admin_user_data` ✅
   - Path: `/arielschBIZUITCustomForms`

3. **Login en recubiz (misma pestaña del navegador):**
   ```
   URL: https://test.bizuit.com/recubizBIZUITCustomForms/admin/login
   Usuario: admin
   Password: [tu password]
   ```

4. **Verificar cookies en DevTools:**
   - Ahora deberías ver **ambos sets de cookies**:
     - `arielsch_admin_token` (path: /arielschBIZUITCustomForms)
     - `arielsch_admin_user_data`
     - `recubiz_admin_token` (path: /recubizBIZUITCustomForms) ✅
     - `recubiz_admin_user_data` ✅

### Test 2: Verificar Aislamiento de Cookies

1. **Navegar a arielsch admin:**
   ```
   https://test.bizuit.com/arielschBIZUITCustomForms/admin
   ```
   - ✅ Debe funcionar (autenticado con `arielsch_admin_token`)

2. **Navegar a recubiz admin:**
   ```
   https://test.bizuit.com/recubizBIZUITCustomForms/admin
   ```
   - ✅ Debe funcionar (autenticado con `recubiz_admin_token`)

### Test 3: Intentar Cross-Tenant Attack (Debe Fallar)

**Este test verifica que NO se pueden compartir tokens entre tenants.**

1. **Logout de recubiz:**
   ```
   https://test.bizuit.com/recubizBIZUITCustomForms/admin
   Click "Logout"
   ```
   - ✅ Cookies `recubiz_admin_*` deben desaparecer

2. **Intentar usar token de arielsch en recubiz (Manual Cookie Injection):**

   a. Ir a DevTools → Application → Cookies

   b. Copiar el valor de `arielsch_admin_token`

   c. Crear manualmente una cookie en recubiz:
      - Name: `recubiz_admin_token`
      - Value: [pegar valor de arielsch_admin_token]
      - Path: `/recubizBIZUITCustomForms`

   d. Navegar a:
      ```
      https://test.bizuit.com/recubizBIZUITCustomForms/admin
      ```

   e. **Resultado esperado:**
      - ❌ El backend debería rechazar el token
      - ✅ Deberías ser redirigido a login
      - ✅ En los logs del backend verás:
        ```
        [Auth Service] Tenant mismatch: token has 'arielsch' but expected 'recubiz'
        ```

---

## 🧪 Opción 2: Testing en Desarrollo Local

### Configuración: Simular Multi-Tenant

Puedes simular dos tenants en desarrollo con diferentes puertos:

#### Terminal 1: Simular "arielsch" (puerto 3000)

```bash
cd custom-forms/runtime-app

# Crear .env.local para arielsch
cat > .env.local << 'EOF'
NEXT_PUBLIC_BASE_PATH=/arielschBIZUITCustomForms
FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://test.bizuit.com/arielschBIZUITDashboardapi/api
EOF

# Levantar en puerto 3000
npm run dev
```

#### Terminal 2: Backend API (puerto 8000)

```bash
cd custom-forms/backend-api
source venv/bin/activate
python main.py
```

#### Terminal 3: Simular "recubiz" (puerto 3001)

```bash
cd custom-forms/runtime-app

# Crear .env.local.recubiz
cat > .env.local.recubiz << 'EOF'
NEXT_PUBLIC_BASE_PATH=/recubizBIZUITCustomForms
FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://test.bizuit.com/recubizBIZUITDashboardapi/api
EOF

# Usar config de recubiz
cp .env.local.recubiz .env.local

# Levantar en puerto 3001
PORT=3001 npm run dev
```

### Tests en Desarrollo

1. **Login en "arielsch" (localhost:3000):**
   ```
   http://localhost:3000/arielschBIZUITCustomForms/admin/login
   ```
   - DevTools → Cookies → verificar `arielsch_admin_token`

2. **Login en "recubiz" (localhost:3001):**
   ```
   http://localhost:3001/recubizBIZUITCustomForms/admin/login
   ```
   - DevTools → Cookies → verificar `recubiz_admin_token`

3. **Intentar cross-tenant attack:**
   - Copiar `arielsch_admin_token` de localhost:3000
   - Inyectar manualmente como `recubiz_admin_token` en localhost:3001
   - Navegar a `/recubizBIZUITCustomForms/admin`
   - ❌ Debe fallar y redirigir a login

---

## 🧪 Opción 3: Testing Automatizado con cURL

### Test rápido del backend:

```bash
cd custom-forms/backend-api
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# Esperar que levante
sleep 3

# Test 1: Login con tenant arielsch
echo "=== Test 1: Login con tenant arielsch ==="
RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password", "tenant_id": "arielsch"}')

echo "$RESPONSE" | python -m json.tool

# Extraer token
ARIELSCH_TOKEN=$(echo "$RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

# Test 2: Login con tenant recubiz
echo -e "\n=== Test 2: Login con tenant recubiz ==="
RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password", "tenant_id": "recubiz"}')

echo "$RESPONSE" | python -m json.tool

RECUBIZ_TOKEN=$(echo "$RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

# Test 3: Intentar validar token de arielsch con tenant recubiz (debe fallar)
echo -e "\n=== Test 3: Cross-tenant validation (debe fallar) ==="
curl -s -X POST http://localhost:8000/api/auth/validate \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$ARIELSCH_TOKEN\", \"tenant_id\": \"recubiz\"}" | python -m json.tool

# Debe retornar: {"valid": false, ...}

# Limpiar
kill $BACKEND_PID
```

---

## ✅ Resultados Esperados

### ✅ Comportamiento Correcto

1. **Login en arielsch:**
   - Cookies: `arielsch_admin_token`, `arielsch_admin_user_data`
   - Path: `/arielschBIZUITCustomForms`
   - Admin panel funciona correctamente

2. **Login en recubiz:**
   - Cookies: `recubiz_admin_token`, `recubiz_admin_user_data`
   - Path: `/recubizBIZUITCustomForms`
   - Admin panel funciona correctamente

3. **Ambos tenants pueden estar autenticados simultáneamente:**
   - Cookies de arielsch NO afectan a recubiz
   - Cookies de recubiz NO afectan a arielsch

4. **Cross-tenant attack falla:**
   - Token de arielsch inyectado en recubiz → rechazado
   - Backend log: `Tenant mismatch: token has 'arielsch' but expected 'recubiz'`

### ❌ Si algo falla

**Síntoma:** "Token de arielsch funciona en recubiz"
- Problema: El código no está deployed correctamente
- Solución: Verificar que ambos archivos fueron actualizados en test.bizuit.com

**Síntoma:** "No veo cookies con prefijo de tenant"
- Problema: Frontend no está usando la nueva versión
- Solución: Hard refresh (Ctrl+Shift+R) o limpiar cookies

**Síntoma:** "Error 401 inmediato después de login"
- Problema: Backend y frontend no están sincronizados
- Solución: Verificar que AMBOS (backend y runtime-app) están deployed

---

## 📊 Logs de Backend Esperados

**Login exitoso con tenant:**
```
[Auth API] Login attempt for user 'adm***'
[Auth Service] Login successful for user 'admin'
[Database] User 'admin' has roles: ['Administrators', ...]
[Auth Service] Generated session token for 'admin' in tenant 'arielsch'
[Auth API] Login successful for 'adm***' in tenant 'arielsch'
```

**Token validation con tenant correcto:**
```
[Auth Service] Token verified for user 'admin' in tenant 'arielsch'
```

**Token validation con tenant INCORRECTO (ataque bloqueado):**
```
[Auth Service] Tenant mismatch: token has 'arielsch' but expected 'recubiz'
```

---

## 🎯 Checklist de Verificación

- [ ] Login en arielsch crea cookies `arielsch_admin_token`
- [ ] Login en recubiz crea cookies `recubiz_admin_token`
- [ ] Ambos tenants pueden estar autenticados simultáneamente
- [ ] Token de arielsch NO funciona en recubiz (verificado con DevTools)
- [ ] Token de recubiz NO funciona en arielsch (verificado con DevTools)
- [ ] Logout de arielsch NO afecta sesión de recubiz
- [ ] Logout de recubiz NO afecta sesión de arielsch
- [ ] Logs del backend muestran `in tenant 'arielsch'` y `in tenant 'recubiz'`

---

## 🔧 Troubleshooting

### Problema: "No puedo hacer login en ningún tenant"

**Solución:**
1. Verificar que el backend está corriendo
2. Verificar que las credenciales son correctas
3. Ver logs del backend para identificar el error

### Problema: "Las cookies no tienen prefijo de tenant"

**Solución:**
1. Verificar que el código del frontend está actualizado
2. Hard refresh (Ctrl+Shift+R)
3. Limpiar todas las cookies del dominio
4. Volver a hacer login

### Problema: "Token de arielsch funciona en recubiz"

**Solución:**
1. Verificar que el backend tiene el código actualizado
2. Reiniciar el backend (puede tener código viejo en memoria)
3. Verificar logs - deben mostrar `in tenant 'arielsch'`

---

**Última actualización:** 2025-11-24
**Implementado por:** Claude Code
**Archivos modificados:** Ver git diff para lista completa
