# Guía para Desarrolladores: Tu Primera Pantalla en Bizuit

Esta guía te ayudará a crear pantallas para procesos de Bizuit BPM desde cero.

## 📚 Tabla de Contenidos

1. [Conceptos Básicos](#conceptos-básicos)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Autenticación y Parámetros de URL](#autenticación-y-parámetros-de-url)
4. [Crear Formularios Dinámicos](#crear-formularios-dinámicos)
5. [Crear Formularios Manuales](#crear-formularios-manuales)
6. [Iniciar un Proceso](#iniciar-un-proceso)
7. [Continuar un Proceso](#continuar-un-proceso)
8. [Ejemplos Completos](#ejemplos-completos)

---

## Conceptos Básicos

### ¿Qué es un Proceso en Bizuit?

Un **proceso** en Bizuit BPM es un flujo de trabajo que tiene:
- **Nombre del proceso** (eventName): Identifica qué proceso quieres ejecutar
- **Parámetros de entrada**: Datos que el proceso necesita (ej: nombre del cliente, monto)
- **Parámetros de salida**: Datos que el proceso devuelve
- **Variables**: Datos que se mantienen durante la vida del proceso

### Estados del Proceso

Un proceso puede estar en diferentes estados:
- **Inicio**: Cuando creas una nueva instancia del proceso
- **En ejecución**: El proceso está activo
- **Pausado**: Esperando intervención humana (tu pantalla)
- **Finalizado**: El proceso terminó

### Instance ID

Cada vez que inicias un proceso, Bizuit genera un **Instance ID único**. Este ID es como el "número de ticket" que identifica esa ejecución específica del proceso.

```
Ejemplo: "4a1da430-4188-4502-97a8-e15b009b7e6c"
```

---

## Instalación y Configuración

### 1. Instalar los paquetes necesarios

```bash
npm install @tyconsa/bizuit-form-sdk @tyconsa/bizuit-ui-components
```

### 2. Importar los estilos

En tu archivo principal de Next.js (`app/layout.tsx` o `_app.tsx`):

```tsx
import '@tyconsa/bizuit-ui-components/styles.css'
```

### 3. Configurar el SDK

Crea un archivo de configuración `lib/config.ts`:

```tsx
export const bizuitConfig = {
  formsApiUrl: 'https://test.bizuit.com/arielschbizuitdashboardapi/api',
  dashboardApiUrl: 'https://test.bizuit.com/arielschbizuitdashboardapi',
  timeout: 30000,
}
```

### 4. Configurar los Providers

En tu layout principal:

```tsx
import { BizuitSDKProvider } from '@tyconsa/bizuit-form-sdk'
import { BizuitThemeProvider, BizuitAuthProvider } from '@tyconsa/bizuit-ui-components'
import { bizuitConfig } from '@/lib/config'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <BizuitSDKProvider config={bizuitConfig}>
          <BizuitThemeProvider>
            <BizuitAuthProvider>
              {children}
            </BizuitAuthProvider>
          </BizuitThemeProvider>
        </BizuitSDKProvider>
      </body>
    </html>
  )
}
```

---

## Autenticación y Parámetros de URL

### Escenario 1: Bizuit BPM te llama con un token

Cuando Bizuit BPM abre tu pantalla, pasa el token por URL:

```
https://tu-app.com/start-process?token=ABC123&eventName=MiProceso
```

**Cómo recibirlo en tu código:**

```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { processUrlToken } from '@tyconsa/bizuit-form-sdk'
import { useBizuitAuth } from '@tyconsa/bizuit-ui-components'
import { useEffect, useState } from 'react'

function MiPantalla() {
  const searchParams = useSearchParams()
  const { login: setAuthData } = useBizuitAuth()
  const [urlTokenProcessed, setUrlTokenProcessed] = useState(false)

  // 1. Leer parámetros de la URL
  const urlToken = searchParams.get('token')
  const eventName = searchParams.get('eventName')
  const instanceId = searchParams.get('instanceId')

  // 2. Procesar el token al montar el componente
  useEffect(() => {
    if (urlToken && !urlTokenProcessed) {
      setUrlTokenProcessed(true)

      // Convertir el token en un objeto de login
      const loginResponse = processUrlToken(urlToken)
      setAuthData(loginResponse)
    }
  }, [urlToken, urlTokenProcessed, setAuthData])

  return (
    <div>
      <p>Token: {urlToken}</p>
      <p>Proceso: {eventName}</p>
      <p>Instancia: {instanceId}</p>
    </div>
  )
}
```

### Escenario 2: Login manual del usuario

Si quieres que el usuario haga login manualmente:

```tsx
import { BizuitLogin, useBizuitAuth } from '@tyconsa/bizuit-ui-components'
import { BizuitAuthService } from '@tyconsa/bizuit-form-sdk'
import { bizuitConfig } from '@/lib/config'

function LoginPage() {
  const { login: setAuthData } = useBizuitAuth()
  const authService = new BizuitAuthService(bizuitConfig)

  return (
    <BizuitLogin
      authService={authService}
      onLoginSuccess={(loginResponse) => {
        setAuthData(loginResponse)
        // Redirigir a la página principal
      }}
      onLoginError={(error) => {
        console.error('Error de login:', error)
      }}
    />
  )
}
```

### Escenario 3: Usar ambos (token URL o login manual)

```tsx
function MiPantalla() {
  const searchParams = useSearchParams()
  const { isAuthenticated, token: authToken, login: setAuthData } = useBizuitAuth()

  const urlToken = searchParams.get('token')

  // El token activo es el de la URL o el del contexto de auth
  const activeToken = urlToken || authToken

  useEffect(() => {
    if (urlToken) {
      // Auto-login con token de URL
      const loginResponse = processUrlToken(urlToken)
      setAuthData(loginResponse)
    }
  }, [urlToken, setAuthData])

  // Si no hay token, redirigir al login
  if (!isAuthenticated && !urlToken) {
    return <div>Redirigiendo al login...</div>
  }

  return <div>¡Autenticado! Token: {activeToken}</div>
}
```

---

## Crear Formularios Dinámicos

Los **formularios dinámicos** se generan automáticamente basándose en la definición del proceso en Bizuit.

### Ventajas
✅ Rápido de implementar
✅ No necesitas saber qué parámetros tiene el proceso
✅ Se actualiza automáticamente si cambia el proceso

### Paso a Paso

#### 1. Obtener los parámetros del proceso

```tsx
import { useBizuitSDK, filterFormParameters } from '@tyconsa/bizuit-form-sdk'
import { useState } from 'react'

function FormularioDinamico() {
  const sdk = useBizuitSDK()
  const [parameters, setParameters] = useState([])
  const [formData, setFormData] = useState({})

  const cargarParametros = async () => {
    // Obtener TODOS los parámetros del proceso
    const allParams = await sdk.process.getParameters(
      'NombreDelProceso', // eventName
      '',                 // version (vacío = última versión)
      'tu-token-aqui'    // token de autenticación
    )

    // Filtrar solo los parámetros que el usuario debe llenar
    // (Input y Optional, sin Variables ni Output)
    const formParams = filterFormParameters(allParams)

    setParameters(formParams)
  }
}
```

#### 2. Renderizar los campos automáticamente

**Opción A: Usar el componente DynamicFormField (MÁS FÁCIL)**

```tsx
import { DynamicFormField } from '@tyconsa/bizuit-ui-components'

function FormularioDinamico() {
  // ... código anterior ...

  return (
    <form>
      {parameters.map((param) => (
        <DynamicFormField
          key={param.name}
          parameter={param}
          value={formData[param.name]}
          onChange={(value) => {
            setFormData({ ...formData, [param.name]: value })
          }}
        />
      ))}
    </form>
  )
}
```

**Opción B: Renderizar manualmente según el tipo**

```tsx
function FormularioDinamico() {
  const renderField = (param) => {
    const type = param.type.toLowerCase()

    // Campo de texto
    if (type === 'string' || type === 'text') {
      return (
        <div key={param.name}>
          <label>{param.name}</label>
          <input
            type="text"
            value={formData[param.name] || ''}
            onChange={(e) => setFormData({
              ...formData,
              [param.name]: e.target.value
            })}
          />
        </div>
      )
    }

    // Campo numérico
    if (type === 'int' || type === 'number') {
      return (
        <div key={param.name}>
          <label>{param.name}</label>
          <input
            type="number"
            value={formData[param.name] || ''}
            onChange={(e) => setFormData({
              ...formData,
              [param.name]: e.target.value
            })}
          />
        </div>
      )
    }

    // Campo booleano (checkbox)
    if (type === 'bool' || type === 'boolean') {
      return (
        <div key={param.name}>
          <label>
            <input
              type="checkbox"
              checked={formData[param.name] || false}
              onChange={(e) => setFormData({
                ...formData,
                [param.name]: e.target.checked
              })}
            />
            {param.name}
          </label>
        </div>
      )
    }

    // Fecha
    if (type === 'date' || type === 'datetime') {
      return (
        <div key={param.name}>
          <label>{param.name}</label>
          <BizuitDateTimePicker
            value={formData[param.name]}
            onChange={(value) => setFormData({
              ...formData,
              [param.name]: value
            })}
            mode={type === 'date' ? 'date' : 'datetime'}
          />
        </div>
      )
    }

    // Por defecto, campo de texto
    return (
      <div key={param.name}>
        <label>{param.name}</label>
        <input
          type="text"
          value={formData[param.name] || ''}
          onChange={(e) => setFormData({
            ...formData,
            [param.name]: e.target.value
          })}
        />
      </div>
    )
  }

  return (
    <form>
      {parameters.map(renderField)}
    </form>
  )
}
```

📖 **Ver guía completa**: [Formularios Dinámicos](./guides/DYNAMIC_FORMS.md)

---

## Crear Formularios Manuales

Los **formularios manuales** son para cuando quieres control total sobre el diseño y campos.

### Ventajas
✅ Control total del diseño
✅ Puedes agregar validaciones custom
✅ Mejor UX para el usuario final

### Paso a Paso

#### 1. Definir los campos manualmente

```tsx
function FormularioManual() {
  const [clienteNombre, setClienteNombre] = useState('')
  const [monto, setMonto] = useState(0)
  const [fecha, setFecha] = useState('')
  const [esUrgente, setEsUrgente] = useState(false)

  return (
    <form>
      <div>
        <label>Nombre del Cliente *</label>
        <input
          type="text"
          value={clienteNombre}
          onChange={(e) => setClienteNombre(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Monto *</label>
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <label>Fecha de Entrega</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={esUrgente}
            onChange={(e) => setEsUrgente(e.target.checked)}
          />
          Es Urgente
        </label>
      </div>
    </form>
  )
}
```

#### 2. Convertir a formato de Bizuit

Bizuit espera los parámetros en un formato específico. Usa el helper `formDataToParameters`:

```tsx
import { formDataToParameters } from '@tyconsa/bizuit-form-sdk'

function FormularioManual() {
  // ... estados anteriores ...

  const enviarFormulario = async () => {
    // Crear objeto con los datos del formulario
    const formData = {
      ClienteNombre: clienteNombre,
      Monto: monto,
      FechaEntrega: fecha,
      EsUrgente: esUrgente,
    }

    // Convertir a formato de Bizuit
    const parameters = formDataToParameters(formData)

    // parameters ahora es un array como:
    // [
    //   { name: 'ClienteNombre', value: 'Juan Pérez', type: 'SingleValue', direction: 'In' },
    //   { name: 'Monto', value: '1000', type: 'SingleValue', direction: 'In' },
    //   ...
    // ]
  }
}
```

📖 **Ver guía completa**: [Formularios Manuales](./guides/MANUAL_FORMS.md)

---

## Iniciar un Proceso

### Escenario: Crear una nueva instancia de proceso

```tsx
import { useBizuitSDK, formDataToParameters } from '@tyconsa/bizuit-form-sdk'
import { Button, ProcessSuccessScreen } from '@tyconsa/bizuit-ui-components'

function IniciarProceso() {
  const sdk = useBizuitSDK()
  const [status, setStatus] = useState('idle') // idle, submitting, success, error
  const [processData, setProcessData] = useState(null)
  const [formData, setFormData] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      // Convertir datos del formulario a parámetros
      const parameters = formDataToParameters(formData)

      // Iniciar el proceso
      const result = await sdk.process.start(
        {
          eventName: 'NombreDelProceso',
          parameters: parameters,
        },
        [],             // archivos adjuntos (vacío si no hay)
        'tu-token'     // token de autenticación
      )

      // Guardar el resultado
      setProcessData(result)
      setStatus('success')

      console.log('Proceso iniciado!')
      console.log('Instance ID:', result.instanceId)
      console.log('Status:', result.status)
    } catch (error) {
      console.error('Error al iniciar proceso:', error)
      setStatus('error')
    }
  }

  // Mostrar pantalla de éxito
  if (status === 'success') {
    return (
      <ProcessSuccessScreen
        processData={processData}
        title="¡Proceso Iniciado!"
        subtitle="El proceso se creó correctamente"
        onNewProcess={() => {
          setStatus('idle')
          setFormData({})
          setProcessData(null)
        }}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Tus campos aquí */}

      <Button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Iniciando...' : 'Iniciar Proceso'}
      </Button>
    </form>
  )
}
```

📖 **Ver guía completa**: [Iniciar Proceso](./guides/START_PROCESS.md)

---

## Continuar un Proceso

### Escenario: Continuar una instancia existente

Cuando tienes un proceso pausado esperando intervención humana:

```tsx
import { loadInstanceDataForContinue } from '@tyconsa/bizuit-form-sdk'

function ContinuarProceso() {
  const sdk = useBizuitSDK()
  const [instanceId, setInstanceId] = useState('')
  const [eventName, setEventName] = useState('')
  const [parameters, setParameters] = useState([])
  const [formData, setFormData] = useState({})

  // 1. Cargar datos de la instancia
  const cargarInstancia = async () => {
    const result = await loadInstanceDataForContinue(
      sdk,
      instanceId,
      'tu-token'
    )

    // result contiene:
    // - formParameters: parámetros editables con sus valores actuales
    // - formData: objeto con valores para pre-llenar el formulario

    setParameters(result.formParameters)
    setFormData(result.formData) // ¡Formulario pre-llenado!
  }

  // 2. Enviar los cambios
  const handleSubmit = async (e) => {
    e.preventDefault()

    const parameters = formDataToParameters(formData)

    const result = await sdk.process.continue(
      {
        instanceId: instanceId,
        eventName: eventName,
        parameters: parameters,
      },
      [],           // archivos
      'tu-token'   // token
    )

    console.log('Proceso continuado!', result)
  }

  return (
    <div>
      {/* Paso 1: Solicitar Instance ID */}
      <div>
        <input
          type="text"
          placeholder="Instance ID"
          value={instanceId}
          onChange={(e) => setInstanceId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre del Evento (ej: ContinueEvent)"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <button onClick={cargarInstancia}>Cargar Instancia</button>
      </div>

      {/* Paso 2: Mostrar formulario con valores actuales */}
      {parameters.length > 0 && (
        <form onSubmit={handleSubmit}>
          {parameters.map((param) => (
            <DynamicFormField
              key={param.name}
              parameter={param}
              value={formData[param.name]}
              onChange={(value) => {
                setFormData({ ...formData, [param.name]: value })
              }}
            />
          ))}
          <button type="submit">Continuar Proceso</button>
        </form>
      )}
    </div>
  )
}
```

📖 **Ver guía completa**: [Continuar Proceso](./guides/CONTINUE_PROCESS.md)

---

## Ejemplos Completos

### 📁 Ejemplos en este proyecto

1. **[Formulario Dinámico Simple](./examples/01-dynamic-form-simple.tsx)**
   El ejemplo más básico: formulario auto-generado para iniciar proceso

2. **[Formulario Manual con Validaciones](./examples/02-manual-form-validation.tsx)**
   Formulario hecho a mano con validaciones personalizadas

3. **[Inicio de Proceso Completo](./examples/03-start-process-complete.tsx)**
   Ejemplo completo con manejo de estados y errores

4. **[Continuar Proceso con Pre-carga](./examples/04-continue-process-preload.tsx)**
   Cómo cargar una instancia existente y modificar sus valores

5. **[Integración con Bizuit BPM (URL tokens)](./examples/05-bizuit-integration.tsx)**
   Recibir token e instanceId por URL desde Bizuit

---

## Próximos Pasos

1. **Explorar los ejemplos** en la carpeta `/example/docs/examples/`
2. **Leer las guías detalladas** en `/example/docs/guides/`
3. **Ver las páginas de ejemplo funcionando**:
   - http://localhost:3000/start-process
   - http://localhost:3000/continue-process

## Recursos Adicionales

- **Documentación del SDK**: `packages/bizuit-form-sdk/README.md`
- **Documentación de UI Components**: `packages/bizuit-ui-components/README.md`
- **API de Bizuit**: Consultar con tu equipo de Bizuit

---

## ¿Necesitas Ayuda?

Si tienes dudas o encuentras problemas:

1. Revisa los ejemplos completos en `/docs/examples/`
2. Lee las guías específicas en `/docs/guides/`
3. Consulta con tu equipo técnico

¡Éxito con tu primer proceso en Bizuit! 🚀
