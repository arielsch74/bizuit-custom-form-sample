# Referencia Rápida - Bizuit Form SDK

Guía de consulta rápida para tareas comunes.

## 📋 Índice
- [Autenticación](#autenticación)
- [Iniciar Proceso](#iniciar-proceso)
- [Continuar Proceso](#continuar-proceso)
- [Obtener Datos de Instancia](#obtener-datos-de-instancia)
- [Formularios Dinámicos](#formularios-dinámicos)
- [Formularios Manuales](#formularios-manuales)

---

## Autenticación

### Recibir token por URL (desde Bizuit BPM)

```tsx
import { useSearchParams } from 'next/navigation'
import { processUrlToken } from '@tyconsa/bizuit-form-sdk'
import { useBizuitAuth } from '@tyconsa/bizuit-ui-components'

function MyPage() {
  const searchParams = useSearchParams()
  const { login } = useBizuitAuth()

  const urlToken = searchParams.get('token')
  const eventName = searchParams.get('eventName')
  const instanceId = searchParams.get('instanceId')

  useEffect(() => {
    if (urlToken) {
      const loginResponse = processUrlToken(urlToken)
      login(loginResponse)
    }
  }, [urlToken])
}
```

### Login manual

```tsx
import { BizuitLogin } from '@tyconsa/bizuit-ui-components'
import { BizuitAuthService } from '@tyconsa/bizuit-form-sdk'

const authService = new BizuitAuthService(bizuitConfig)

<BizuitLogin
  authService={authService}
  onLoginSuccess={(response) => setAuthData(response)}
/>
```

---

## Iniciar Proceso

### Opción 1: Con formulario dinámico

```tsx
import { useBizuitSDK, filterFormParameters, formDataToParameters } from '@tyconsa/bizuit-form-sdk'

const sdk = useBizuitSDK()

// 1. Obtener parámetros
const allParams = await sdk.process.getProcessParameters('ProcessName', '', token)
const formParams = filterFormParameters(allParams)

// 2. Renderizar formulario (ver ejemplos)

// 3. Iniciar proceso
const result = await sdk.process.raiseEvent(
  {
    eventName: 'ProcessName',
    parameters: formDataToParameters(formData),
  },
  [],      // files
  token
)

console.log('Instance ID:', result.instanceId)
```

### Opción 2: Con datos fijos

```tsx
const result = await sdk.process.raiseEvent(
  {
    eventName: 'ApprovalProcess',
    parameters: [
      { name: 'ClientName', value: 'John Doe', type: 'SingleValue', direction: 'In' },
      { name: 'Amount', value: '1000', type: 'SingleValue', direction: 'In' },
    ],
  },
  [],
  token
)
```

---

## Continuar Proceso

```tsx
import { loadInstanceDataForContinue } from '@tyconsa/bizuit-form-sdk'

// 1. Cargar datos de la instancia
const result = await loadInstanceDataForContinue(sdk, instanceId, token)

// result.formParameters - parámetros editables con valores actuales
// result.formData - objeto con valores para pre-llenar formulario

setFormData(result.formData)  // Pre-llenar formulario

// 2. Continuar proceso
await sdk.process.continueInstance(
  {
    instanceId: instanceId,
    eventName: 'ContinueEvent',
    parameters: formDataToParameters(formData),
  },
  [],
  token
)
```

---

## Obtener Datos de Instancia

```tsx
const instanceData = await sdk.process.getInstanceData(instanceId, token)

// Estructura del response:
// instanceData.results.tyconParameters.tyconParameter[]

const parameters = instanceData.results?.tyconParameters?.tyconParameter || []

// Filtrar por dirección
const inputParams = parameters.filter(p => p.parameterDirection === 'In')
const outputParams = parameters.filter(p => p.parameterDirection === 'Out')
const optionalParams = parameters.filter(p => p.parameterDirection === 'Optional')
```

---

## Formularios Dinámicos

### Componente DynamicFormField (más fácil)

```tsx
import { DynamicFormField } from '@tyconsa/bizuit-ui-components'

{parameters.map((param) => (
  <DynamicFormField
    key={param.name}
    parameter={param}
    value={formData[param.name]}
    onChange={(value) => setFormData({ ...formData, [param.name]: value })}
  />
))}
```

### Renderizado manual

```tsx
const renderField = (param) => {
  switch(param.type.toLowerCase()) {
    case 'string':
    case 'text':
      return <input type="text" ... />
    case 'int':
    case 'number':
      return <input type="number" ... />
    case 'bool':
    case 'boolean':
      return <input type="checkbox" ... />
    case 'date':
      return <BizuitDateTimePicker mode="date" ... />
    case 'datetime':
      return <BizuitDateTimePicker mode="datetime" ... />
    default:
      return <input type="text" ... />
  }
}
```

---

## Formularios Manuales

### Definir campos

```tsx
const [name, setName] = useState('')
const [amount, setAmount] = useState(0)
const [urgent, setUrgent] = useState(false)
```

### Convertir a parámetros de Bizuit

```tsx
import { formDataToParameters } from '@tyconsa/bizuit-form-sdk'

const formData = {
  ClientName: name,
  Amount: amount,
  IsUrgent: urgent,
}

const parameters = formDataToParameters(formData)
// Ahora puedes usar 'parameters' en raiseEvent o continueInstance
```

---

## Tipos de Parámetros

### parameterDirection

- `1` o `"In"` - Parámetro de entrada
- `2` o `"Out"` - Parámetro de salida
- `3` o `"Optional"` - Parámetro opcional

### parameterType

- `1` o `"SingleValue"` - Valor simple (string, number, bool)
- `2` o `"Xml"` - Contenido XML

### Filtros

```tsx
// Para START process (sin variables)
filterFormParameters(allParams)  // Incluye: In + Optional, excluye: Out + Variables

// Para CONTINUE process (con variables)
filterContinueParameters(allParams)  // Incluye: In + Optional + Variables, excluye: Out

// Manual
params.filter(p => p.parameterDirection === 1 || p.parameterDirection === 3)
```

---

## Componentes UI

### ProcessSuccessScreen

```tsx
import { ProcessSuccessScreen } from '@tyconsa/bizuit-ui-components'

<ProcessSuccessScreen
  processData={result}
  title="¡Proceso Completado!"
  subtitle="El proceso se ejecutó correctamente"
  onNewProcess={() => resetForm()}
  onBackToHome={() => router.push('/')}
/>
```

### BizuitDateTimePicker

```tsx
import { BizuitDateTimePicker } from '@tyconsa/bizuit-ui-components'

<BizuitDateTimePicker
  value={date}
  onChange={(newDate) => setDate(newDate)}
  mode="datetime"  // o "date"
  locale="es"
/>
```

### BizuitCombo

```tsx
import { BizuitCombo } from '@tyconsa/bizuit-ui-components'

const options = [
  { value: 'high', label: 'Alta', group: 'Prioridad' },
  { value: 'low', label: 'Baja', group: 'Prioridad' },
]

<BizuitCombo
  options={options}
  value={selected}
  onChange={setSelected}
  placeholder="Selecciona prioridad"
/>
```

---

## Manejo de Errores

```tsx
try {
  const result = await sdk.process.raiseEvent(...)
  setStatus('success')
} catch (error: any) {
  console.error('Error:', error)
  setError(error.message)
  setStatus('error')
}
```

---

## Ver También

- [Getting Started](./GETTING_STARTED.md) - Guía completa paso a paso
- [Ejemplos](./examples/) - Código completo funcional
- [SDK Docs](../../packages/bizuit-form-sdk/README.md) - Documentación del SDK
- [UI Components Docs](../../packages/bizuit-ui-components/README.md) - Documentación de componentes
