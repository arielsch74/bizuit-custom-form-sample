# Recubiz Gestión - Sistema de Gestión de Cobranzas

Form para gestión de cobranzas integrado con procesos Bizuit BPM de Recubiz.

## 🚀 Desarrollo Local

### 1. Setup de Credenciales

**Crear archivo de credenciales (NO se commitea):**

```bash
cp dev-credentials.example.js dev-credentials.js
```

**Editar `dev-credentials.js` con tus credenciales:**

```javascript
export const DEV_CREDENTIALS = {
  username: 'tu-usuario',
  password: 'tu-password'
};
```

⚠️ **IMPORTANTE:** Este archivo está en `.gitignore` y NO se commitea al repo.

### 2. Build del Form

```bash
npm run build
```

### 3. Testing Local

**Levantar HTTP server:**

```bash
http-server -p 8080 --cors
```

**Abrir en navegador:**

```
http://localhost:8080/dev.html
```

**El form automáticamente:**
1. Detecta que no hay `dashboardParams.token` (no viene del Dashboard)
2. Lee credenciales de `dev-credentials.js`
3. Hace login con esas credenciales
4. Obtiene token JWT
5. Funciona normalmente

## 🔐 Autenticación

### Producción (Dashboard invoca el form)

```typescript
// Dashboard genera URL:
https://test.bizuit.com/recubizBIZUITCustomForms/form/recubiz-gestion
  ?token={encrypted-jwt-token}
  &userName={user}

// Form recibe:
dashboardParams = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  userName: "Juan Perez"
}

// Form usa directamente el token (sin login)
```

### Desarrollo (dev.html local)

```typescript
// dev.html pasa:
dashboardParams = {
  userName: 'Gestor Demo',
  devUsername: 'admin',        // ← De dev-credentials.js
  devPassword: 'admin123'      // ← De dev-credentials.js
}

// Form detecta que no hay token
// Hace login con devUsername/devPassword
// Obtiene token JWT del API
```

## 📦 Procesos Integrados

### RB_ObtenerProximaGestion

Obtiene la próxima deuda pendiente de gestión para un gestor.

**Parámetros:**
- `idGestor` (In): ID del gestor

**Retorna:**
- `Datosgestion` (XML): Datos de la deuda (JSON auto-parseado por SDK)
- `Contactos` (XML): Lista de contactos (JSON auto-parseado por SDK)

### RB_IniciarGestion

Inicia una gestión para una deuda específica.

**Parámetros:**
- `idGestor` (In): ID del gestor
- `idDeudor` (In): ID del deudor
- `idDeuda` (In): ID de la deuda

**Retorna:**
- `instanceId`: ID de la instancia del proceso creado

## 🎨 Características

- **Tema:** Bizuit Orange (personalizable)
- **Framework:** React 18 + TypeScript
- **UI:** Tailwind CSS + Bizuit UI Components
- **SDK:** @tyconsa/bizuit-form-sdk v2.0+
- **Responsive:** Mobile-first design

## 🔧 Estructura del Código

```
recubiz-gestion/
├── src/
│   └── index.tsx              # Código fuente
├── dist/
│   ├── form.js                # Bundle para producción
│   ├── form.js.map            # Source map
│   └── form.meta.json         # Metadata
├── upload/                    # ZIPs de deployment (auto-generado)
├── dev.html                   # Testing local
├── dev-credentials.js         # Credenciales dev (gitignored)
├── dev-credentials.example.js # Template de credenciales
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### Error: "Cannot import DEV_CREDENTIALS"

**Causa:** Falta el archivo `dev-credentials.js`

**Solución:**
```bash
cp dev-credentials.example.js dev-credentials.js
# Editar con tus credenciales
```

### Error: "Error al autenticar"

**Causa:** Credenciales incorrectas en `dev-credentials.js`

**Solución:**
1. Verificar usuario/password en `dev-credentials.js`
2. Verificar que el API esté accesible: `https://test.bizuit.com/recubizBizuitDashboardapi/api/`
3. Probar login manual con Postman

### Form no carga datos

**Causa:** Proceso `RB_ObtenerProximaGestion` no existe o tiene error

**Debug:**
1. Abrir DevTools (F12) → Console
2. Ver logs: `🔍 SDK Response (raw)`
3. Verificar `status !== 'Error'`

## 📚 Referencias

- **SDK:** [@tyconsa/bizuit-form-sdk](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk)
- **UI Components:** [@tyconsa/bizuit-ui-components](https://www.npmjs.com/package/@tyconsa/bizuit-ui-components)
- **Guía de Desarrollo:** [../DEVELOPMENT.md](../DEVELOPMENT.md)
- **Deployment:** [../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
