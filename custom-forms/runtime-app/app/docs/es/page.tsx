/**
 * Documentación para Desarrolladores - Versión en Español
 * Acceso público - sin autenticación requerida
 * Guía completa para desarrolladores junior
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DocsPageES() {
  const [activeSection, setActiveSection] = useState<string>('inicio-rapido')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <span className="text-white font-semibold text-lg block">BIZUIT Custom Forms</span>
                <span className="text-slate-400 text-xs">Documentación para Desarrolladores</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/docs"
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition"
              >
                English
              </Link>
              <span className="text-sm px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500 text-orange-400 font-medium">
                Español
              </span>
              <Link
                href="/admin"
                className="text-slate-400 hover:text-white transition text-sm"
              >
                Panel Admin
              </Link>
              <Link
                href="/"
                className="text-slate-400 hover:text-white transition text-sm"
              >
                ← Inicio
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="sticky top-24 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Contenido</h3>
            <ul className="space-y-1">
              <NavItem href="#inicio-rapido" active={activeSection === 'inicio-rapido'} onClick={() => setActiveSection('inicio-rapido')}>
                Inicio Rápido
              </NavItem>
              <NavItem href="#arquitectura" active={activeSection === 'arquitectura'} onClick={() => setActiveSection('arquitectura')}>
                Arquitectura
              </NavItem>
              <NavItem href="#rutas" active={activeSection === 'rutas'} onClick={() => setActiveSection('rutas')}>
                Rutas y Loaders
              </NavItem>
              <NavItem href="#autenticacion" active={activeSection === 'autenticacion'} onClick={() => setActiveSection('autenticacion')}>
                Autenticación
              </NavItem>
              <NavItem href="#variables-entorno" active={activeSection === 'variables-entorno'} onClick={() => setActiveSection('variables-entorno')}>
                Variables de Entorno
              </NavItem>
              <NavItem href="#credenciales-dev" active={activeSection === 'credenciales-dev'} onClick={() => setActiveSection('credenciales-dev')}>
                Credenciales Dev
              </NavItem>
              <NavItem href="#flujos-trabajo" active={activeSection === 'flujos-trabajo'} onClick={() => setActiveSection('flujos-trabajo')}>
                Flujos de Trabajo
              </NavItem>
              <NavItem href="#testing" active={activeSection === 'testing'} onClick={() => setActiveSection('testing')}>
                Testing
              </NavItem>
              <NavItem href="#deployment" active={activeSection === 'deployment'} onClick={() => setActiveSection('deployment')}>
                Deployment
              </NavItem>
              <NavItem href="#troubleshooting" active={activeSection === 'troubleshooting'} onClick={() => setActiveSection('troubleshooting')}>
                Solución de Problemas
              </NavItem>
              <NavItem href="#faqs" active={activeSection === 'faqs'} onClick={() => setActiveSection('faqs')}>
                Preguntas Frecuentes
              </NavItem>
            </ul>
          </nav>
        </aside>

        {/* Main Documentation Content */}
        <main className="flex-1 max-w-4xl">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Documentación para Desarrolladores
            </h1>
            <p className="text-xl text-slate-400">
              Guía completa para construir y deployar formularios customizados para BIZUIT BPM
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
              <span>🎯 Audiencia: Desarrolladores Junior</span>
              <span>•</span>
              <span>⏱️ Tiempo de Lectura: 30-45 min</span>
              <span>•</span>
              <span>📅 Actualizado: Nov 2025</span>
            </div>
          </div>

          {/* Inicio Rápido */}
          <Section id="inicio-rapido" title="🚀 Inicio Rápido (5 Minutos)">
            <p className="text-slate-300 mb-6">
              Levantá tu entorno de desarrollo en 5 minutos.
            </p>

            <SubSection title="Prerequisitos">
              <CodeBlock language="bash">{`# Verificar versiones instaladas
node --version    # Necesitás: v18.0.0+
npm --version     # Necesitás: v9.0.0+
python3 --version # Necesitás: v3.10+
git --version     # Cualquier versión reciente`}</CodeBlock>
            </SubSection>

            <SubSection title="Pasos de Instalación">
              <CodeBlock language="bash">{`# 1. Clonar repositorio
git clone <repo-url>
cd custom-forms

# 2. Instalar dependencias
npm install

# 3. Setup del submódulo forms-examples
git submodule init
git submodule update
cd forms-examples && npm install && cd ..

# 4. Setup de archivos de entorno
cd runtime-app
cp .env.example .env.local
cp dev-credentials.example.js dev-credentials.js

# 5. Editar dev-credentials.js (IMPORTANTE!)
# Actualizar: username, password, apiUrl
code dev-credentials.js

# 6. Iniciar todos los servicios
cd ..
./start-all.sh`}</CodeBlock>

              <InfoBox type="success" title="¡Listo! Ahora tenés:">
                <ul className="space-y-1 text-sm">
                  <li>✅ Backend API en <code className="text-orange-400">http://localhost:8000</code></li>
                  <li>✅ Showcase en <code className="text-orange-400">http://localhost:3000</code></li>
                  <li>✅ Runtime en <code className="text-orange-400">http://localhost:3001</code></li>
                </ul>
              </InfoBox>
            </SubSection>
          </Section>

          {/* Arquitectura */}
          <Section id="arquitectura" title="🏗️ Arquitectura del Proyecto">
            <p className="text-slate-300 mb-6">
              Entender la arquitectura te ayuda a navegar el código.
            </p>

            <SubSection title="Flujo de Alto Nivel">
              <CodeBlock language="text">{`┌────────────────┐
│ Usuario BIZUIT │ 1. Click en "Abrir Formulario"
└────────┬───────┘
         │ 2. Dashboard genera token JWT
         ▼
┌────────────────────────┐
│ Runtime App (3001)     │ 3. Valida token
│ /form/mi-form?token=   │ 4. Carga form desde DB
└────────┬───────────────┘ 5. Ejecuta formulario
         │
         ▼
┌────────────────────────┐
│ Backend API (8000)     │ • Validación de tokens
│ FastAPI + SQLite       │ • Storage de forms
└────────────────────────┘ • Gestión de versiones`}</CodeBlock>
            </SubSection>

            <SubSection title="Estructura de Directorios">
              <CodeBlock language="text">{`custom-forms/
├── runtime-app/           # Runtime Next.js 15
│   ├── app/
│   │   ├── form/[formName]/   # Rutas dinámicas
│   │   ├── admin/             # Panel admin
│   │   ├── docs/              # ¡Esta página!
│   │   └── api/               # API routes
│   ├── .env.local        # CREAR ESTE ARCHIVO
│   └── dev-credentials.js # CREAR ESTE ARCHIVO
│
├── backend-api/          # Backend FastAPI
│   ├── main.py
│   ├── requirements.txt
│   └── venv/
│
├── forms-examples/       # Git submodule
│   ├── mi-form/
│   │   ├── src/
│   │   ├── dist/
│   │   └── upload/       # ZIPs de deployment
│   └── build-form.js
│
├── start-all.sh         # Iniciar todo
└── logs/                # Logs en runtime`}</CodeBlock>
            </SubSection>
          </Section>

          {/* Rutas y Loaders */}
          <Section id="rutas" title="🔀 Rutas de Forms y Loaders">
            <p className="text-slate-300 mb-6">
              La runtime app tiene DOS formas de cargar forms, cada una con seguridad y casos de uso específicos.
            </p>

            <SubSection title="Comparación de Rutas">
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-3 text-slate-300">Característica</th>
                      <th className="text-left p-3 text-slate-300">/form</th>
                      <th className="text-left p-3 text-slate-300">/formsa</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <tr className="border-b border-slate-800">
                      <td className="p-3 font-semibold text-white">Token Dashboard</td>
                      <td className="p-3">Requerido (prod)<br/>Opcional (dev)</td>
                      <td className="p-3">Opcional (siempre)</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-3 font-semibold text-white">ALLOW_DEV_MODE</td>
                      <td className="p-3 text-green-400">✅ Se verifica</td>
                      <td className="p-3 text-slate-600">❌ Se ignora</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-3 font-semibold text-white">Requiere iframe</td>
                      <td className="p-3 text-slate-600">❌ No</td>
                      <td className="p-3 text-green-400">✅ DEBE ser iframe</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-3 font-semibold text-white">Validación de origen</td>
                      <td className="p-3 text-slate-600">❌ No valida</td>
                      <td className="p-3 text-green-400">✅ Siempre valida</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-3 font-semibold text-white">Acceso directo browser</td>
                      <td className="p-3 text-green-400">✅ Permitido (dev)</td>
                      <td className="p-3 text-red-400">❌ Bloqueado</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Caso de uso</td>
                      <td className="p-3 text-blue-400">Forms del Dashboard</td>
                      <td className="p-3 text-purple-400">Embedding externo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SubSection>

            <SubSection title="Ruta 1: /form/[formName] (Estándar)">
              <InfoBox type="info" title="Propósito">
                <p className="text-sm">Carga estándar de forms desde BIZUIT Dashboard</p>
              </InfoBox>

              <div className="mt-4 space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Modelo de Seguridad:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-slate-300">
                        <strong>Producción</strong> (ALLOW_DEV_MODE=false): Requiere token 's' del Dashboard
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400">⚠️</span>
                      <span className="text-slate-300">
                        <strong>Desarrollo</strong> (ALLOW_DEV_MODE=true): Permite acceso directo con dev-credentials.js
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Ejemplos de URL:</h4>
                  <CodeBlock language="bash">{`# Producción (desde Dashboard)
https://server.com/form/mi-form?s=aAAV/9xqhAE=&InstanceId=123

# Desarrollo (local)
http://localhost:3001/form/mi-form
# ← Usa dev-credentials.js automáticamente`}</CodeBlock>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Parámetros que Recibe tu Form:</h4>
                  <CodeBlock language="typescript">{`export default function MiForm({ dashboardParams }) {
  const {
    userName,      // "juan.perez"
    instanceId,    // "12345"
    eventName,     // "MiProceso"
    activityName,  // "Tarea1"
    tokenId,       // ID interno del token
    operation,     // 1=editar, 2=ver
    apiUrl,        // URL del Dashboard API

    // Solo en modo dev:
    devUsername,   // Desde dev-credentials.js
    devPassword,   // Desde dev-credentials.js
    devApiUrl      // Desde dev-credentials.js
  } = dashboardParams
}`}</CodeBlock>
                </div>
              </div>
            </SubSection>

            <SubSection title="Ruta 2: /formsa/[formName] (Standalone)">
              <InfoBox type="warning" title="Solo Iframe">
                <p className="text-sm">Esta ruta SOLO funciona dentro de iframes. El acceso directo por browser está bloqueado.</p>
              </InfoBox>

              <div className="mt-4 space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Modelo de Seguridad:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-slate-300">DEBE cargarse dentro de un iframe</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-slate-300">DEBE ser desde un origen permitido</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400">❌</span>
                      <span className="text-slate-300">Acceso directo por browser bloqueado</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400">⚠️</span>
                      <span className="text-slate-300">Token del Dashboard opcional</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Configuración:</h4>
                  <CodeBlock language="bash">{`# Orígenes permitidos (separados por coma, soporta wildcards)
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://test.bizuit.com,https://*.example.com

# Permitir localhost (solo desarrollo)
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=true`}</CodeBlock>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Ejemplo de Embedding:</h4>
                  <CodeBlock language="html">{`<!-- App externa embebiendo el form -->
<iframe
  src="https://server.com/formsa/mi-form?version=1.0.5"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>

<!-- Con token del Dashboard (opcional) -->
<iframe
  src="https://server.com/formsa/mi-form?s=encrypted..."
></iframe>`}</CodeBlock>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">El Form Debe Manejar Parámetros Nulos:</h4>
                  <CodeBlock language="typescript">{`export default function MiForm({ dashboardParams }) {
  if (!dashboardParams) {
    // Modo invitado/anónimo
    return <UIInvitado />
  }

  // Modo autenticado
  const { userName, ... } = dashboardParams
}`}</CodeBlock>
                </div>
              </div>
            </SubSection>

            <SubSection title="Parámetros Query Soportados">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Todos los Parámetros Query:</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <code className="text-orange-400">?version=1.0.5</code>
                    <p className="text-slate-400 mt-1">Cargar versión específica (opcional, default: currentVersion)</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?s=aAAV/9xqhAE=</code>
                    <p className="text-slate-400 mt-1">Token encriptado del Dashboard (TripleDES)</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?InstanceId=12345</code>
                    <p className="text-slate-400 mt-1">ID de instancia del proceso</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?UserName=juan.perez</code>
                    <p className="text-slate-400 mt-1">Nombre del usuario autenticado</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?eventName=MiProceso</code>
                    <p className="text-slate-400 mt-1">Nombre del proceso</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?activityName=Tarea1</code>
                    <p className="text-slate-400 mt-1">Nombre de la actividad (paso del workflow)</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?token=Basic123</code>
                    <p className="text-slate-400 mt-1">Token adicional de auth (soporte legacy)</p>
                  </div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Estructura del Objeto dashboardParams">
              <CodeBlock language="typescript">{`interface DashboardParameters {
  // Desde query string del Dashboard
  instanceId?: string         // ID de instancia del proceso
  userName?: string          // Usuario autenticado
  eventName?: string         // Nombre del proceso
  activityName?: string      // Nombre de la actividad
  token?: string             // Token adicional de auth
  apiUrl?: string           // URL del Dashboard API (desde config)

  // Desde validación del backend (después de desencriptar 's')
  tokenId?: string          // ID interno del token
  operation?: number        // 1=editar, 2=ver
  requesterAddress?: string // Dirección IP
  expirationDate?: string   // Expiración del token

  // Solo en modo dev (ALLOW_DEV_MODE=true)
  devUsername?: string      // Desde dev-credentials.js
  devPassword?: string      // Desde dev-credentials.js
  devApiUrl?: string        // Desde dev-credentials.js
}

// Tu form recibe esto:
<FormComponent dashboardParams={dashboardParams} />`}</CodeBlock>
            </SubSection>
          </Section>

          {/* Autenticación */}
          <Section id="autenticacion" title="🔐 Sistema de Autenticación">
            <p className="text-slate-300 mb-6">
              Los forms usan tokens JWT del Dashboard. El modo dev bypasea esto para desarrollo local.
            </p>

            <SubSection title="Flujo en Producción">
              <div className="space-y-4">
                <Step number={1} title="Usuario en Dashboard hace click en 'Abrir Form'">
                  Dashboard genera token JWT con contexto del usuario
                </Step>
                <Step number={2} title="Form se carga con token en URL">
                  <code className="text-orange-400 text-sm">
                    /form/mi-form?s=eyJhbGc...
                  </code>
                </Step>
                <Step number={3} title="Runtime valida token">
                  Backend API verifica autenticidad del token
                </Step>
                <Step number={4} title="Form se ejecuta con contexto de usuario">
                  userName, roles, processName disponibles en el form
                </Step>
              </div>
            </SubSection>

            <SubSection title="Modo Desarrollo">
              <p className="text-slate-300 mb-4">
                Para desarrollo local, usá credenciales dev en lugar de tokens del Dashboard:
              </p>
              <CodeBlock language="javascript">{`// dev-credentials.js
export const DEV_CREDENTIALS = {
  username: 'tu.email@empresa.com',
  password: 'TuPasswordDashboard',
  apiUrl: 'https://test.bizuit.com/tuTenantBizuitDashboardapi/api/'
}`}</CodeBlock>

              <InfoBox type="warning" title="Advertencia de Seguridad">
                <ul className="space-y-1 text-sm">
                  <li>⚠️ <code className="text-orange-400">ALLOW_DEV_MODE=true</code> SOLO para desarrollo local</li>
                  <li>⚠️ Producción DEBE tener <code className="text-orange-400">ALLOW_DEV_MODE=false</code></li>
                  <li>✅ Variable server-side (diferente por entorno, sin rebuild)</li>
                </ul>
              </InfoBox>
            </SubSection>
          </Section>

          {/* Variables de Entorno */}
          <Section id="variables-entorno" title="🔧 Variables de Entorno">
            <p className="text-slate-300 mb-6">
              Next.js tiene dos tipos de variables de entorno con comportamientos diferentes.
            </p>

            <SubSection title="Build-Time vs Server-Side">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">Build-Time (NEXT_PUBLIC_*)</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>✅ Accesible en cliente</li>
                    <li>⚠️ "Bakeadas" en JavaScript</li>
                    <li>🔄 Rebuild requerido al cambiar</li>
                  </ul>
                  <CodeBlock language="typescript" className="mt-3">{`const url = process.env.NEXT_PUBLIC_API_URL`}</CodeBlock>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="text-purple-400 font-semibold mb-2">Server-Side (sin prefijo)</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>✅ Solo acceso server-side</li>
                    <li>✅ Cambiables en runtime</li>
                    <li>🔄 Solo restart (sin rebuild)</li>
                  </ul>
                  <CodeBlock language="typescript" className="mt-3">{`const url = process.env.FASTAPI_URL`}</CodeBlock>
                </div>
              </div>
            </SubSection>

            <SubSection title="Referencia Completa de .env.local">
              <CodeBlock language="bash">{`# =============================================================================
# API Dashboard de BIZUIT
# =============================================================================
# Variable build-time - accesible en código cliente
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/api/bizuit
# Producción: https://test.bizuit.com/tenantBizuitDashboardapi/api

# Timeout HTTP (milisegundos)
NEXT_PUBLIC_BIZUIT_TIMEOUT=30000

# =============================================================================
# Backend FastAPI
# =============================================================================
# Solo server-side - NO expuesta al cliente
FASTAPI_URL=http://127.0.0.1:8000

# =============================================================================
# Modo Desarrollo - CONFIGURACIÓN CRÍTICA DE SEGURIDAD
# =============================================================================
# Permite forms sin token del Dashboard
# Variable server-side - puede diferir por deployment
#
# DESARROLLO: true  → Usa dev-credentials.js
# PRODUCCIÓN:  false → Requiere token del Dashboard
#
ALLOW_DEV_MODE=true

# =============================================================================
# Configuración de Deployment
# =============================================================================
# Base path para deployment en subdirectorio
# Local: Dejar comentado
# Producción: /BIZUITCustomForms
# NEXT_PUBLIC_BASE_PATH=/BIZUITCustomForms

# Timeout de sesión del admin (minutos)
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=30

# =============================================================================
# Seguridad Iframe (Forms Standalone)
# =============================================================================
# Orígenes permitidos para embedding en iframe
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://test.bizuit.com

# Permitir localhost para testing de iframes (solo desarrollo)
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=true

# Webhook secret para GitHub Actions
# Generar: openssl rand -hex 32
WEBHOOK_SECRET=tu-webhook-secret-aqui`}</CodeBlock>

              <InfoBox type="info" title="Recordá">
                <ul className="space-y-1 text-sm">
                  <li>🔄 ¿Cambiaste <code className="text-orange-400">NEXT_PUBLIC_*</code>? → <strong>Rebuild</strong></li>
                  <li>🔄 ¿Cambiaste variable server? → <strong>Restart</strong> solamente</li>
                </ul>
              </InfoBox>
            </SubSection>

            <SubSection title="Tabla de Referencia de Variables">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-3 text-slate-300">Variable</th>
                      <th className="text-left p-3 text-slate-300">Tipo</th>
                      <th className="text-center p-3 text-slate-300">¿Rebuild?</th>
                      <th className="text-left p-3 text-slate-300">Propósito</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <EnvVarRow
                      name="NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL"
                      type="Build-time"
                      rebuild={true}
                      purpose="URL base del Dashboard API"
                    />
                    <EnvVarRow
                      name="NEXT_PUBLIC_BASE_PATH"
                      type="Build-time"
                      rebuild={true}
                      purpose="Path de subdirectorio deployment"
                    />
                    <EnvVarRow
                      name="FASTAPI_URL"
                      type="Server-side"
                      rebuild={false}
                      purpose="URL interna del Backend API"
                    />
                    <EnvVarRow
                      name="ALLOW_DEV_MODE"
                      type="Server-side"
                      rebuild={false}
                      purpose="Habilitar credenciales dev"
                      critical={true}
                    />
                    <EnvVarRow
                      name="WEBHOOK_SECRET"
                      type="Server-side"
                      rebuild={false}
                      purpose="Auth de webhook GitHub"
                    />
                  </tbody>
                </table>
              </div>
            </SubSection>
          </Section>

          {/* Credenciales Dev */}
          <Section id="credenciales-dev" title="🔑 Setup de Credenciales de Desarrollo">
            <p className="text-slate-300 mb-6">
              Las credenciales dev te permiten testear forms localmente sin acceso al Dashboard.
            </p>

            <SubSection title="¿Por Qué Credenciales Dev?">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-red-400 font-semibold mb-2">Sin Credenciales Dev</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>❌ No podés testear localmente</li>
                    <li>❌ Necesitás acceso al Dashboard</li>
                    <li>❌ No podés trabajar offline</li>
                    <li>❌ Iteración lenta</li>
                  </ul>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2">Con Credenciales Dev</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>✅ Testear instantáneamente</li>
                    <li>✅ Sin necesidad del Dashboard</li>
                    <li>✅ Trabajar offline</li>
                    <li>✅ Iteración rápida</li>
                  </ul>
                </div>
              </div>
            </SubSection>

            <SubSection title="Pasos de Setup">
              <div className="space-y-6">
                <Step number={1} title="Habilitar Modo Dev">
                  <p className="text-slate-400 mb-2">Editar <code className="text-orange-400">runtime-app/.env.local</code>:</p>
                  <CodeBlock language="bash">{`ALLOW_DEV_MODE=true  # ← Agregar esta línea`}</CodeBlock>
                </Step>

                <Step number={2} title="Crear Archivo de Credenciales">
                  <CodeBlock language="bash">{`cd runtime-app
cp dev-credentials.example.js dev-credentials.js`}</CodeBlock>
                </Step>

                <Step number={3} title="Agregar Tus Credenciales">
                  <p className="text-slate-400 mb-2">Obtené credenciales de tu team lead o usá tu cuenta de test:</p>
                  <CodeBlock language="javascript">{`// dev-credentials.js
export const DEV_CREDENTIALS = {
  username: 'tu.email@empresa.com',
  password: 'TuPassword123',
  apiUrl: 'https://test.bizuit.com/tuTenantBizuitDashboardapi/api/'
  //                                    ^^^^^^^^^^
  //                                    Nombre de tu tenant
}`}</CodeBlock>
                  <InfoBox type="info" title="Ejemplos de Tenant">
                    <ul className="space-y-1 text-sm">
                      <li>• <code className="text-orange-400">arielsch</code> → <code className="text-slate-400">arielschBizuitDashboardapi</code></li>
                      <li>• <code className="text-orange-400">recubiz</code> → <code className="text-slate-400">recubizBizuitDashboardapi</code></li>
                      <li>• Patrón: <code className="text-slate-400">{`{tenant}BizuitDashboardapi/api/`}</code></li>
                    </ul>
                  </InfoBox>
                </Step>

                <Step number={4} title="Verificar Setup">
                  <CodeBlock language="bash">{`npm run dev
open http://localhost:3001/form/test-form

# Revisar consola del browser
# Deberías ver: "Autenticado con credenciales dev"
# NO deberías ver: "Validación de token falló"`}</CodeBlock>
                </Step>
              </div>
            </SubSection>

            <SubSection title="Checklist de Seguridad">
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                <ChecklistItem checked>dev-credentials.js en .gitignore (ya está)</ChecklistItem>
                <ChecklistItem checked={false}>Nunca commitear credenciales reales</ChecklistItem>
                <ChecklistItem checked={false}>Usar solo cuentas de test (NO producción)</ChecklistItem>
                <ChecklistItem checked={false}>ALLOW_DEV_MODE=true solo en .env.local local</ChecklistItem>
                <ChecklistItem checked={false}>Producción: ALLOW_DEV_MODE=false</ChecklistItem>
              </div>
            </SubSection>
          </Section>

          {/* Flujos de Trabajo */}
          <Section id="flujos-trabajo" title="💻 Flujos de Trabajo de Desarrollo">
            <p className="text-slate-300 mb-6">
              Tres flujos de trabajo para diferentes escenarios de desarrollo.
            </p>

            <WorkflowCard
              title="Flujo 1: Desarrollo Full Stack"
              icon="🔄"
              color="green"
              useWhen="Desarrollando funcionalidad del form que necesita backend"
            >
              <CodeBlock language="bash">{`# Iniciar todos los servicios
./start-all.sh

# Servicios corriendo:
# • Backend (8000)
# • Showcase (3000) - opcional
# • Runtime (3001)

# Desarrollar tu form
cd forms-examples/mi-form
code src/index.tsx

# Testear form
open http://localhost:3001/form/mi-form

# Ver logs
tail -f logs/backend-api.log`}</CodeBlock>

              <InfoBox type="success" title="Mejor para">
                <ul className="space-y-1 text-sm">
                  <li>✅ Testing de integración SDK</li>
                  <li>✅ Llamadas a procesos (raiseEvent, initialize)</li>
                  <li>✅ Testing de integración completo</li>
                  <li>✅ Trabajo con dependencia del backend</li>
                </ul>
              </InfoBox>
            </WorkflowCard>

            <WorkflowCard
              title="Flujo 2: Desarrollo Fat Bundle"
              icon="⚡"
              color="orange"
              useWhen="Iteraciones rápidas de UI, styling, testing de componentes"
            >
              <CodeBlock language="bash">{`# Buildear fat bundle
cd forms-examples/mi-form
npm run build

# Crea:
# ✅ dist/form.js     (fat bundle - TODAS las deps)
# ✅ dist/dev.html    (página de test)

# Servir vía HTTP
cd dist
python3 -m http.server 8080

# Abrir página de test
open http://localhost:8080/dev.html`}</CodeBlock>

              <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                <h4 className="text-white font-semibold mb-2">¿Qué es un Fat Bundle?</h4>
                <p className="text-slate-400 text-sm mb-3">
                  Un archivo JavaScript autocontenido con TODO incluido:
                </p>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>• Tu código del form</li>
                  <li>• Librería React</li>
                  <li>• Componentes UI</li>
                  <li>• Bizuit SDK</li>
                  <li>• Todas las dependencias</li>
                </ul>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Loop de Desarrollo:</h4>
                <ol className="space-y-2 text-sm text-slate-300 list-decimal ml-5">
                  <li>Editar <code className="text-orange-400">src/index.tsx</code></li>
                  <li>Ejecutar <code className="text-orange-400">npm run build</code> (rápido!)</li>
                  <li>Refrescar browser (Cmd+R)</li>
                  <li>¡Ver cambios instantáneamente!</li>
                </ol>
              </div>

              <InfoBox type="success" title="Mejor para">
                <ul className="space-y-1 text-sm">
                  <li>✅ Styling y layout</li>
                  <li>✅ Comportamiento de componentes</li>
                  <li>✅ UI de validación de forms</li>
                  <li>✅ Iteraciones rápidas</li>
                </ul>
              </InfoBox>

              <InfoBox type="warning" title="Limitaciones">
                <ul className="space-y-1 text-sm">
                  <li>❌ No podés llamar APIs reales de Bizuit</li>
                  <li>❌ No podés testear integración de procesos</li>
                  <li>✅ Perfecto para trabajo solo de UI</li>
                </ul>
              </InfoBox>
            </WorkflowCard>

            <WorkflowCard
              title="Flujo 3: Testing en Runtime (Puerto 3001)"
              icon="🧪"
              color="purple"
              useWhen="Testear como va a correr en producción"
            >
              <InfoBox type="warning" title="ENTENDIMIENTO CRÍTICO">
                <p className="text-sm font-semibold mb-2">
                  ¡El puerto 3001 carga forms desde la BASE DE DATOS, NO desde tu filesystem!
                </p>
                <p className="text-sm">
                  Esto significa que DEBÉS <strong>subir</strong> tu form antes de testear en puerto 3001.
                </p>
              </InfoBox>

              <div className="my-4">
                <h4 className="text-white font-semibold mb-3">Requisitos:</h4>
                <div className="space-y-2">
                  <ChecklistItem checked={false}>Form buildeado (npm run build)</ChecklistItem>
                  <ChecklistItem checked={false}>ZIP creado (manual o desde workflow)</ChecklistItem>
                  <ChecklistItem checked={false}>ZIP subido vía panel admin</ChecklistItem>
                  <ChecklistItem checked={false}>Form existe en tabla CustomForms</ChecklistItem>
                  <ChecklistItem checked={false}>Backend API corriendo</ChecklistItem>
                </div>
              </div>

              <CodeBlock language="bash">{`# Proceso completo de testing
cd forms-examples/mi-form

# 1. Buildear form
npm run build

# 2. Obtener o crear ZIP
ls -lt upload/*.zip | head -1
# O: cd dist && zip -r ../mi-form.zip .

# 3. Iniciar servicios
cd ../../
./start-all.sh

# 4. Subir ZIP
open http://localhost:3001/admin/upload-forms
# Drag and drop del ZIP

# 5. Testear form
open http://localhost:3001/form/mi-form`}</CodeBlock>

              <InfoBox type="success" title="¿Por qué este workflow?">
                <ul className="space-y-1 text-sm">
                  <li>✅ Testea comportamiento real de producción</li>
                  <li>✅ Testea carga desde base de datos</li>
                  <li>✅ Detecta issues de deployment temprano</li>
                </ul>
              </InfoBox>
            </WorkflowCard>
          </Section>

          {/* Testing */}
          <Section id="testing" title="🧪 Estrategias de Testing">
            <SubSection title="Matriz de Testing">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-3 text-slate-300">Tipo de Test</th>
                      <th className="text-left p-3 text-slate-300">Workflow</th>
                      <th className="text-center p-3 text-slate-300">Backend</th>
                      <th className="text-left p-3 text-slate-300">Velocidad</th>
                      <th className="text-left p-3 text-slate-300">Caso de Uso</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800">
                      <td className="p-3 text-white">Solo UI</td>
                      <td className="p-3">Fat Bundle</td>
                      <td className="p-3 text-center">❌</td>
                      <td className="p-3">⚡ Instantáneo</td>
                      <td className="p-3">Styling, layout, componentes</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-3 text-white">Integración</td>
                      <td className="p-3">Full Stack</td>
                      <td className="p-3 text-center">✅</td>
                      <td className="p-3">🐢 Moderado</td>
                      <td className="p-3">Llamadas SDK, integración procesos</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white">Tipo Producción</td>
                      <td className="p-3">Runtime (3001)</td>
                      <td className="p-3 text-center">✅</td>
                      <td className="p-3">🐌 Lento</td>
                      <td className="p-3">Validación final, prep deployment</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SubSection>

            <SubSection title="Checklist Pre-Deployment">
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                <ChecklistItem checked={false}>UI se ve correcta (Fat Bundle)</ChecklistItem>
                <ChecklistItem checked={false}>Validación de form funciona (Fat Bundle)</ChecklistItem>
                <ChecklistItem checked={false}>Integración SDK funciona (Full Stack)</ChecklistItem>
                <ChecklistItem checked={false}>Llamadas a procesos funcionan (Full Stack)</ChecklistItem>
                <ChecklistItem checked={false}>Form carga desde database (Runtime 3001)</ChecklistItem>
                <ChecklistItem checked={false}>Sin errores en consola (Todos los workflows)</ChecklistItem>
                <ChecklistItem checked={false}>Responsive mobile (Browser DevTools)</ChecklistItem>
                <ChecklistItem checked={false}>Dark mode funciona (Si aplica)</ChecklistItem>
              </div>
            </SubSection>
          </Section>

          {/* Deployment */}
          <Section id="deployment" title="📦 Proceso de Deployment">
            <p className="text-slate-300 mb-6">
              Deployment automatizado vía GitHub Actions con semantic versioning.
            </p>

            <SubSection title="Flujo de Deployment">
              <CodeBlock language="text">{`Desarrollo Local
      ↓
 Git Commit (feat: nueva feature)
      ↓
 Push a main
      ↓
GitHub Actions Workflow
      ↓
  ✅ Detecta forms modificados
  ✅ Buildea cada form
  ✅ Incrementa versión (feat: → minor)
  ✅ Crea ZIP de deployment
  ✅ Sube a Artifacts (90 días)
  ✅ Commitea ZIP al repo
  ✅ Crea git tag
      ↓
Descargar desde Artifacts
      ↓
Subir al Panel Admin
      ↓
  ¡Producción! 🎉`}</CodeBlock>
            </SubSection>

            <SubSection title="Semantic Versioning">
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2">Patch Bump (1.0.5 → 1.0.6)</h4>
                  <CodeBlock language="bash">{`git commit -m "fix: corregir bug de validación"
git commit -m "chore: actualizar dependencias"`}</CodeBlock>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">Minor Bump (1.0.5 → 1.1.0)</h4>
                  <CodeBlock language="bash">{`git commit -m "feat: agregar feature de export"`}</CodeBlock>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-red-400 font-semibold mb-2">Major Bump (1.0.5 → 2.0.0)</h4>
                  <CodeBlock language="bash">{`git commit -m "feat: rediseñar layout del form

BREAKING CHANGE: API vieja removida"`}</CodeBlock>
                </div>
              </div>
            </SubSection>

            <SubSection title="Descargar Artifact">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Opción A: GitHub Actions</h4>
                  <CodeBlock language="bash">{`# Vía web UI
# Actions → Último run → Artifacts

# Vía CLI
gh run list --limit 1
gh run download <run-id>`}</CodeBlock>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Opción B: Repositorio</h4>
                  <CodeBlock language="bash">{`# Pull del último código
git pull origin main

# ZIP ya commiteado
ls forms-examples/mi-form/upload/*.zip`}</CodeBlock>
                </div>
              </div>
            </SubSection>
          </Section>

          {/* Troubleshooting */}
          <Section id="troubleshooting" title="🐛 Solución de Problemas Comunes">
            <TroubleshootingItem
              problem="Puerto Ya en Uso"
              error="EADDRINUSE: address already in use :::3001"
            >
              <CodeBlock language="bash">{`# Fix rápido: Usar scripts automatizados
./stop-all.sh
./start-all.sh

# Fix manual: Matar puertos específicos
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Showcase
lsof -ti:3001 | xargs kill -9  # Runtime`}</CodeBlock>
            </TroubleshootingItem>

            <TroubleshootingItem
              problem="Form No Carga en Puerto 3001"
              error='"Form not found" o página en blanco'
            >
              <div className="space-y-3">
                <p className="text-slate-400 text-sm">¡Recordá: Puerto 3001 carga desde la BASE DE DATOS!</p>
                <CodeBlock language="bash">{`# Checklist:
# 1. ¿Backend corriendo?
curl http://localhost:8000/docs

# 2. ¿Form subido?
open http://localhost:3001/admin
# Revisar lista de forms

# 3. ¿Nombre correcto del form?
# URL: /form/mi-form (lowercase, guiones)
# NO: /form/MiForm`}</CodeBlock>
              </div>
            </TroubleshootingItem>

            <TroubleshootingItem
              problem="Autenticación Falló"
              error="Invalid token o 401 Unauthorized"
            >
              <CodeBlock language="bash">{`# Para modo dev:
# 1. Revisar ALLOW_DEV_MODE
grep ALLOW_DEV_MODE runtime-app/.env.local
# Debería ser: ALLOW_DEV_MODE=true

# 2. Revisar que existe dev-credentials.js
ls runtime-app/dev-credentials.js

# 3. Revisar formato
cat runtime-app/dev-credentials.js
# Debe exportar: { username, password, apiUrl }

# 4. Testear credenciales
# Intentá loguearte al Dashboard manualmente

# Para modo producción:
# Revisar token en URL: ?s=eyJhbGc...`}</CodeBlock>
            </TroubleshootingItem>

            <TroubleshootingItem
              problem="Los Cambios No se Reflejan"
              error="Código viejo sigue corriendo después de cambios"
            >
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 text-sm font-semibold mb-1">¿Cambiaste variable NEXT_PUBLIC_*?</p>
                  <CodeBlock language="bash">{`npm run build  # ¡Rebuild requerido!
npm start`}</CodeBlock>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 text-sm font-semibold mb-1">¿Cambiaste variable server?</p>
                  <CodeBlock language="bash">{`./stop-all.sh && ./start-all.sh  # Solo restart`}</CodeBlock>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <p className="text-orange-300 text-sm font-semibold mb-1">¿Cambiaste código del form en puerto 3001?</p>
                  <CodeBlock language="bash">{`npm run build
# ¡Subir nuevo ZIP vía panel admin!`}</CodeBlock>
                </div>
              </div>
            </TroubleshootingItem>
          </Section>

          {/* FAQs */}
          <Section id="faqs" title="❓ Preguntas Frecuentes">
            <div className="space-y-6">
              <FAQ question="¿Necesito el Dashboard corriendo localmente?">
                <p className="text-slate-300">
                  <strong>¡No!</strong> Ese es el punto de las credenciales dev. La runtime app se autentica
                  con el <strong>Dashboard de test</strong> (test.bizuit.com) usando tus credenciales dev.
                </p>
              </FAQ>

              <FAQ question="¿Puedo trabajar offline?">
                <p className="text-slate-300 mb-2">Parcialmente:</p>
                <ul className="space-y-1 text-sm text-slate-300 ml-4">
                  <li>✅ Editar código del form</li>
                  <li>✅ Buildear fat bundle</li>
                  <li>✅ Testear UI vía dev.html</li>
                  <li>❌ No podés testear llamadas SDK (necesitás Dashboard API)</li>
                  <li>❌ No podés testear integración de procesos</li>
                </ul>
              </FAQ>

              <FAQ question="¿Por qué mi form funciona en dev pero no en producción?">
                <p className="text-slate-300 mb-2">Causas comunes:</p>
                <ol className="space-y-2 text-sm text-slate-300 list-decimal ml-5">
                  <li><strong>ALLOW_DEV_MODE</strong>: Producción debe ser <code className="text-orange-400">false</code></li>
                  <li><strong>Variables de entorno</strong>: Diferente .env.local en producción</li>
                  <li><strong>Base path</strong>: Producción usa <code className="text-orange-400">/BIZUITCustomForms</code></li>
                  <li><strong>URLs API</strong>: Endpoints diferentes de Dashboard API</li>
                  <li><strong>Credenciales</strong>: Dev credentials no funcionan en producción</li>
                </ol>
              </FAQ>

              <FAQ question="¿Cómo hago rollback de un deployment malo?">
                <CodeBlock language="bash">{`# Opción 1: Subir versión anterior
cd forms-examples/mi-form/upload
ls -lt *.zip  # Encontrar versión anterior que funcionaba
# Subir ZIP viejo vía panel admin

# Opción 2: Git revert
git revert HEAD
git push origin main
# Workflow rebuildeará y creará nuevo artifact`}</CodeBlock>
              </FAQ>

              <FAQ question="¿Puedo tener múltiples forms en un repo?">
                <p className="text-slate-300 mb-2">
                  <strong>¡Sí!</strong> Ese es el diseño. Cada form tiene:
                </p>
                <ul className="space-y-1 text-sm text-slate-300 ml-4">
                  <li>✅ Versionado independiente</li>
                  <li>✅ Deployment independiente</li>
                  <li>✅ Propio directorio <code className="text-orange-400">upload/</code></li>
                  <li>✅ Propios git tags (<code className="text-orange-400">form-name-v1.0.0</code>)</li>
                </ul>
              </FAQ>

              <FAQ question="¿Qué pasa si cambio manualmente la versión en package.json?">
                <p className="text-slate-300">
                  ¡El workflow lo va a <strong>auto-corregir</strong>! Los git tags son la fuente de verdad.
                  El workflow lee el último tag, calcula la próxima versión, y sobreescribe package.json.
                </p>
                <InfoBox type="warning" title="Mejor Práctica" className="mt-3">
                  <p className="text-sm">¡No cambies manualmente las versiones en package.json! Dejá que el workflow lo maneje.</p>
                </InfoBox>
              </FAQ>
            </div>
          </Section>

          {/* Learning Path */}
          <Section id="ruta-aprendizaje" title="🎓 Ruta de Aprendizaje para Developers Junior">
            <div className="space-y-6">
              <WeekPlan week={1} title="Setup y Básicos">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Día 1-2: Setup del Entorno</h5>
                    <div className="space-y-1">
                      <ChecklistItem checked={false}>Clonar repositorio</ChecklistItem>
                      <ChecklistItem checked={false}>Instalar dependencias</ChecklistItem>
                      <ChecklistItem checked={false}>Setup .env.local</ChecklistItem>
                      <ChecklistItem checked={false}>Setup dev-credentials.js</ChecklistItem>
                      <ChecklistItem checked={false}>Iniciar todos los servicios exitosamente</ChecklistItem>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Día 3-4: Explorar Ejemplos</h5>
                    <div className="space-y-1">
                      <ChecklistItem checked={false}>Navegar ejemplos del showcase</ChecklistItem>
                      <ChecklistItem checked={false}>Abrir forms en browser</ChecklistItem>
                      <ChecklistItem checked={false}>Inspeccionar con DevTools</ChecklistItem>
                      <ChecklistItem checked={false}>Leer código fuente de forms</ChecklistItem>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Día 5: Primer Form</h5>
                    <div className="space-y-1">
                      <ChecklistItem checked={false}>Copiar form de ejemplo</ChecklistItem>
                      <ChecklistItem checked={false}>Modificar UI</ChecklistItem>
                      <ChecklistItem checked={false}>Testear con fat bundle</ChecklistItem>
                    </div>
                  </div>
                </div>
              </WeekPlan>

              <WeekPlan week={2} title="Skills de Desarrollo">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Día 1-3: Workflow Fat Bundle</h5>
                    <div className="space-y-1">
                      <ChecklistItem checked={false}>Crear form simple</ChecklistItem>
                      <ChecklistItem checked={false}>Aplicar estilos con Tailwind CSS</ChecklistItem>
                      <ChecklistItem checked={false}>Agregar validación de form</ChecklistItem>
                      <ChecklistItem checked={false}>Testear en dev.html</ChecklistItem>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Día 4-5: Workflow Full Stack</h5>
                    <div className="space-y-1">
                      <ChecklistItem checked={false}>Usar Bizuit SDK</ChecklistItem>
                      <ChecklistItem checked={false}>Hacer llamadas API</ChecklistItem>
                      <ChecklistItem checked={false}>Manejar respuestas</ChecklistItem>
                      <ChecklistItem checked={false}>Testear con credenciales dev</ChecklistItem>
                    </div>
                  </div>
                </div>
              </WeekPlan>

              <WeekPlan week={3} title="Integración y Deployment">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Día 1-2: Testing en Runtime</h5>
                    <div className="space-y-1">
                      <ChecklistItem checked={false}>Subir form vía admin</ChecklistItem>
                      <ChecklistItem checked={false}>Testear en puerto 3001</ChecklistItem>
                      <ChecklistItem checked={false}>Verificar carga desde database</ChecklistItem>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Día 3-5: Deployment</h5>
                    <div className="space-y-1">
                      <ChecklistItem checked={false}>Commitear con mensaje semántico</ChecklistItem>
                      <ChecklistItem checked={false}>Push a main</ChecklistItem>
                      <ChecklistItem checked={false}>Monitorear GitHub Actions</ChecklistItem>
                      <ChecklistItem checked={false}>Descargar artifact</ChecklistItem>
                      <ChecklistItem checked={false}>Subir al panel admin</ChecklistItem>
                    </div>
                  </div>
                </div>
              </WeekPlan>
            </div>
          </Section>

          {/* Resources */}
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <ResourceLink
              href="http://localhost:8000/docs"
              icon="📡"
              title="Docs Backend API"
              description="Swagger UI de FastAPI"
              external
            />
            <ResourceLink
              href="http://localhost:3000"
              icon="🎨"
              title="Ejemplos Showcase"
              description="Demostraciones en vivo"
              external
            />
            <ResourceLink
              href="/admin"
              icon="⚙️"
              title="Panel Admin"
              description="Subir y gestionar forms"
            />
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-slate-700 text-center">
            <p className="text-slate-400">
              ¿Necesitás ayuda? Consultá el{' '}
              <a href="https://github.com/your-org/your-repo" className="text-orange-400 hover:text-orange-300">
                repositorio
              </a>{' '}
              o preguntale al equipo!
            </p>
            <p className="text-slate-500 mt-2 text-sm">¡Feliz coding! 🚀</p>
          </div>
        </main>
      </div>
    </div>
  )
}

// Componentes (mismos que versión inglés)
function NavItem({ href, active, onClick, children }: { href: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        onClick={onClick}
        className={`block px-3 py-2 rounded-lg text-sm transition ${
          active
            ? 'bg-orange-500/20 text-orange-400 font-medium'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        {children}
      </a>
    </li>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-bold text-white mb-6 pb-2 border-b border-slate-700">
        {title}
      </h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}

function CodeBlock({ language, children, className = '' }: { language?: string; children: string; className?: string }) {
  return (
    <div className={`bg-slate-950 rounded-lg border border-slate-700 overflow-hidden ${className}`}>
      {language && (
        <div className="bg-slate-900 border-b border-slate-700 px-4 py-2">
          <span className="text-xs text-slate-500 uppercase font-mono">{language}</span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-slate-300 font-mono">{children}</code>
      </pre>
    </div>
  )
}

function InfoBox({
  type,
  title,
  children,
  className = '',
}: {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  className?: string
}) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    warning: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
  }

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }

  return (
    <div className={`border rounded-lg p-4 ${styles[type]} ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[type]}</span>
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-2">{title}</h4>}
          <div className="text-slate-300">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Step({ number, title, children }: { number: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold mb-2">{title}</h4>
        {children && <div className="text-slate-400">{children}</div>}
      </div>
    </div>
  )
}

function EnvVarRow({
  name,
  type,
  rebuild,
  purpose,
  critical,
}: {
  name: string
  type: string
  rebuild: boolean
  purpose: string
  critical?: boolean
}) {
  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/30">
      <td className="p-3">
        <code className={`text-sm ${critical ? 'text-orange-400 font-semibold' : 'text-slate-300'}`}>
          {name}
        </code>
      </td>
      <td className="p-3">
        <span className={`text-xs px-2 py-1 rounded ${type === 'Build-time' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
          {type}
        </span>
      </td>
      <td className="p-3 text-center">
        {rebuild ? <span className="text-orange-400">✅</span> : <span className="text-slate-600">❌</span>}
      </td>
      <td className="p-3">{purpose}</td>
    </tr>
  )
}

function ChecklistItem({ checked, children }: { checked: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className={`flex-shrink-0 w-5 h-5 rounded border mt-0.5 flex items-center justify-center ${
        checked ? 'bg-green-500/20 border-green-500' : 'border-slate-600'
      }`}>
        {checked && <span className="text-green-400 text-xs">✓</span>}
      </div>
      <span className="text-sm text-slate-300">{children}</span>
    </div>
  )
}

function WorkflowCard({
  title,
  icon,
  color,
  useWhen,
  children,
}: {
  title: string
  icon: string
  color: string
  useWhen: string
  children: React.ReactNode
}) {
  const colors = {
    green: 'from-green-500/10 to-emerald-500/10 border-green-500/30',
    orange: 'from-orange-500/10 to-red-500/10 border-orange-500/30',
    purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/30',
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} border rounded-xl p-6 mb-6`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-slate-900/50 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-slate-400">Usar cuando: {useWhen}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function TroubleshootingItem({
  problem,
  error,
  children,
}: {
  problem: string
  error: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">🐛</span>
        <div>
          <h3 className="text-lg font-semibold text-red-400">{problem}</h3>
          <code className="text-sm text-slate-400">{error}</code>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function FAQ({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-5">
      <h3 className="text-lg font-semibold text-white mb-3">P: {question}</h3>
      <div className="pl-4 border-l-2 border-orange-500">{children}</div>
    </div>
  )
}

function WeekPlan({ week, title, children }: { week: number; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <span className="text-orange-400 font-bold">S{week}</span>
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ResourceLink({
  href,
  icon,
  title,
  description,
  external,
}: {
  href: string
  icon: string
  title: string
  description: string
  external?: boolean
}) {
  const Component = external ? 'a' : Link
  const props = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Component
      href={href}
      {...props}
      className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-orange-500 transition group"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition">
        {title}
      </h3>
      <p className="text-sm text-slate-400 mt-2">{description}</p>
      {external && <span className="text-xs text-slate-500 mt-1 block">Abre en nueva pestaña ↗</span>}
    </Component>
  )
}
