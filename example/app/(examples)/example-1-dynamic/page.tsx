'use client'

import { useState } from 'react'
import { useBizuitSDK, formDataToParameters, type IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField, Button, useBizuitAuth } from '@tyconsa/bizuit-ui-components'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RequireAuth } from '@/components/require-auth'
import { LiveCodeEditor } from '@/components/live-code-editor'
import Link from 'next/link'

/**
 * EJEMPLO 1: Campos Dinámicos desde API
 *
 * Este ejemplo demuestra cómo:
 * 1. Obtener parámetros dinámicamente desde la API de Bizuit
 * 2. Generar campos de formulario automáticamente usando DynamicFormField
 * 3. Enviar TODOS los campos al proceso usando formDataToParameters()
 *
 * Ventajas:
 * - No necesitas conocer los parámetros de antemano
 * - Los campos se generan automáticamente según el tipo de dato
 * - Funciona con cualquier proceso sin cambios de código
 *
 * Desventajas:
 * - Menos control sobre la UI
 * - Envía todos los campos (no selectivo)
 * - No permite transformaciones personalizadas
 */
function Example1DynamicContent() {
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  const [processName, setProcessName] = useState('DemoFlow')
  const [parameters, setParameters] = useState<IBizuitProcessParameter[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  // Paso 1: Obtener parámetros del proceso desde API
  const handleLoadParameters = async () => {
    try {
      setStatus('loading')
      setError(null)

      // Llamada API para obtener parámetros
      const params = await sdk.process.getProcessParameters(processName, '', token)

      // Filtrar solo parámetros de entrada (In y Optional)
      const inputParams = params.filter(p =>
        !p.isSystemParameter &&
        !p.isVariable &&
        (p.parameterDirection === 1 || p.parameterDirection === 3) // In o Optional
      )

      setParameters(inputParams)
      setStatus('ready')

      // Inicializar formData con valores por defecto
      const initialData: Record<string, any> = {}
      inputParams.forEach(param => {
        initialData[param.name] = param.value || ''
      })
      setFormData(initialData)
    } catch (err: any) {
      setError(err.message || 'Error al cargar parámetros')
      setStatus('error')
    }
  }

  // Paso 2: Enviar proceso con TODOS los campos + parámetros ocultos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setStatus('submitting')
      setError(null)

      // formDataToParameters() convierte TODO el formData a parámetros
      const visibleParameters = formDataToParameters(formData)

      // NUEVO: Agregar parámetros ocultos/calculados que NO están en el formulario
      const hiddenParameters = formDataToParameters({
        // Datos del usuario autenticado
        userId: token ? 'user123' : 'anonymous',
        userEmail: 'user@example.com',

        // Timestamps y fechas
        submittedAt: new Date().toISOString(),
        submittedDate: new Date().toLocaleDateString('es-AR'),

        // Información del entorno
        appVersion: '1.0.0',
        environment: process.env.NODE_ENV || 'development',

        // Valores calculados
        totalFields: parameters.length,
        formHash: Math.random().toString(36).substring(7),

        // Constantes de negocio
        defaultPriority: 'medium',
        defaultStatus: 'pending',
      })

      // Combinar parámetros visibles + ocultos
      const parametersToSend = [...visibleParameters, ...hiddenParameters]

      console.log('Enviando parámetros:', {
        visible: visibleParameters.length,
        hidden: hiddenParameters.length,
        total: parametersToSend.length,
        all: parametersToSend
      })

      // Iniciar proceso
      const response = await sdk.process.raiseEvent({
        eventName: processName,
        parameters: parametersToSend
      }, undefined, token)

      setResult(response)
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar proceso')
      setStatus('error')
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setParameters([])
    setFormData({})
    setResult(null)
    setError(null)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Volver al inicio
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Ejemplo 1: Campos Dinámicos</h1>
      <p className="text-muted-foreground mb-6">
        Los campos se generan automáticamente desde la API de Bizuit y se envían todos los valores
      </p>

      {/* Live Code Editor */}
      <div className="mb-8">
        <LiveCodeEditor
          title="⚡ Editor Interactivo - Generación Dinámica de Campos"
          description="Este código simula cómo los campos se generan automáticamente desde parámetros de la API. Los parámetros están hardcodeados para demostración."
          files={{
            '/App.js': `import { useState } from 'react';
import './styles.css';

export default function DynamicFormDemo() {
  // 🔹 CÓDIGO REAL (comentado porque no funciona en Sandpack):
  // const sdk = useBizuitSDK();
  // const { token } = useBizuitAuth();
  // const [parameters, setParameters] = useState([]);
  //
  // // Obtener parámetros desde la API de Bizuit:
  // const loadParameters = async () => {
  //   const params = await sdk.process.getProcessParameters('DemoFlow', '', token);
  //   const inputParams = params.filter(p =>
  //     !p.isSystemParameter &&
  //     (p.direction === 'In' || p.direction === 'Optional')
  //   );
  //   setParameters(inputParams);
  // };

  // 🔹 Para esta demostración, usamos parámetros hardcodeados:
  const mockParameters = [
    { name: 'pEmpleado', type: 'SingleValue', direction: 'Input' },
    { name: 'pLegajo', type: 'SingleValue', direction: 'Input' },
    { name: 'pMonto', type: 'SingleValue', direction: 'Input' },
    { name: 'pCategoria', type: 'SingleValue', direction: 'Input' },
    { name: 'pFechaSolicitud', type: 'SingleValue', direction: 'Input' },
  ];

  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [paramsToSend, setParamsToSend] = useState({ visible: [], hidden: [], all: [] });

  const handleChange = (paramName, value) => {
    setFormData(prev => ({ ...prev, [paramName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convertir formData a parámetros
    const visibleParams = Object.entries(formData).map(([key, value]) => ({
      name: key,
      value: value,
      direction: 'Input'
    }));

    // Parámetros ocultos/calculados
    const hiddenParams = [
      { name: 'submittedAt', value: new Date().toISOString(), direction: 'Input' },
      { name: 'formVersion', value: '1.0.0', direction: 'Input' },
    ];

    const allParams = [...visibleParams, ...hiddenParams];

    // 🔹 Para demostración, mostramos el modal
    setParamsToSend({ visible: visibleParams, hidden: hiddenParams, all: allParams });
    setShowModal(true);
    console.log('📤 Enviando a Bizuit:', allParams);

    // 🔹 CÓDIGO REAL para enviar a Bizuit (comentado porque no funciona en Sandpack):
    // try {
    //   const response = await sdk.process.raiseEvent({
    //     eventName: 'DemoFlow',
    //     parameters: allParams
    //   }, undefined, token);
    //
    //   console.log('✅ Respuesta de Bizuit:', response);
    //   alert(\`Proceso iniciado exitosamente! Instance ID: \${response.instanceId}\`);
    // } catch (error) {
    //   console.error('❌ Error al enviar a Bizuit:', error);
    //   alert(\`Error: \${error.message}\`);
    // }
  };

  const closeModal = () => setShowModal(false);

  // 🔹 Función para renderizar campo según tipo de parámetro
  const renderField = (param) => {
    const fieldName = param.name.replace('p', ''); // Quitar 'p' del nombre

    return (
      <div key={param.name} className="form-group">
        <label className="form-label">
          {fieldName} *
        </label>
        <input
          type={param.name.includes('Fecha') ? 'date' :
                param.name.includes('Monto') ? 'number' : 'text'}
          value={formData[param.name] || ''}
          onChange={(e) => handleChange(param.name, e.target.value)}
          className="form-input"
          required
        />
      </div>
    );
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Formulario Generado Dinámicamente</h2>
        <p className="card-description">
          Los campos se crean automáticamente desde los par\u00e1metros de la API
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* 🔹 Generar campos dinámicamente */}
            {mockParameters.map(param => renderField(param))}
          </div>

          <button type="submit" className="btn-submit">
            Enviar Solicitud
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📤 Parámetros que se enviarán a Bizuit</h3>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>

            <div className="modal-body">
              <div className="params-section">
                <h4 className="params-title visible">
                  👁️ Parámetros Visibles ({paramsToSend.visible.length}):
                </h4>
                <div className="params-list">
                  {paramsToSend.visible.map((param, idx) => (
                    <div key={idx} className="param-item">
                      <span className="param-name">{param.name}:</span>
                      <span className="param-value">{JSON.stringify(param.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="params-section">
                <h4 className="params-title hidden">
                  🔒 Parámetros Ocultos ({paramsToSend.hidden.length}):
                </h4>
                <div className="params-list">
                  {paramsToSend.hidden.map((param, idx) => (
                    <div key={idx} className="param-item">
                      <span className="param-name">{param.name}:</span>
                      <span className="param-value">{JSON.stringify(param.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="params-total">
                <strong>Total: {paramsToSend.all.length} parámetros</strong>
                <span> ({paramsToSend.visible.length} visibles + {paramsToSend.hidden.length} ocultos)</span>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="btn-modal-close">
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`,
            '/styles.css': `.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.card-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #111827;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  padding: 0 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #374151;
  position: relative;
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: system-ui, -apple-system, sans-serif;
  background: white;
  transition: border-color 0.2s;
  position: relative;
  z-index: 2;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-submit {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  letter-spacing: 0.3px;
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(249, 115, 22, 0.4);
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  body {
    background: #111827;
  }

  .card {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: #374151;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }

  .card-title {
    color: #f9fafb;
    background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .card-description {
    color: #9ca3af;
  }

  .form-label {
    color: #e5e7eb;
  }

  .form-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .form-input:focus {
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
  }

  .preview {
    background: #0f172a;
    border-color: #374151;
  }

  .preview h3 {
    color: #e5e7eb;
  }

  .preview-code {
    background: #1e293b;
    border-color: #374151;
    color: #e5e7eb;
  }

  .modal-content {
    background: #1f2937;
  }

  .param-item {
    background: #374151;
  }

  .param-name {
    color: #e5e7eb;
  }

  .param-value {
    color: #9ca3af;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 20px;
}

.params-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.params-section:last-of-type {
  border-bottom: none;
}

.params-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
}

.params-title.visible {
  background: #dcfce7;
  color: #15803d;
}

.params-title.hidden {
  background: #dbeafe;
  color: #1e40af;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 4px;
  font-size: 13px;
}

.param-name {
  font-weight: 600;
  color: #374151;
  min-width: 180px;
}

.param-value {
  color: #6b7280;
  word-break: break-all;
}

.params-total {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  border-radius: 8px;
  text-align: center;
  color: #5b21b6;
  font-size: 14px;
}

.params-total strong {
  font-weight: 700;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 2px solid #e5e7eb;
  text-align: center;
}

.btn-modal-close {
  padding: 10px 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-modal-close:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}`
          }}
        />
      </div>

      <div className="grid gap-6">
        {/* Configuración Inicial */}
        {status === 'idle' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Configuración</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre del Proceso
                </label>
                <input
                  type="text"
                  value={processName}
                  onChange={(e) => setProcessName(e.target.value)}
                  placeholder="Ej: DemoFlow"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                />
              </div>

              <Button onClick={handleLoadParameters} className="w-full">
                Cargar Parámetros del Proceso
              </Button>
            </div>
          </Card>
        )}

        {/* Loading */}
        {status === 'loading' && (
          <Card className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando parámetros...</p>
          </Card>
        )}

        {/* Formulario Dinámico */}
        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Formulario: {processName}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {parameters.length} campos generados automáticamente
              </p>

              <div className="space-y-4">
                {parameters.map((param) => (
                  <DynamicFormField
                    key={param.name}
                    parameter={param}
                    value={formData[param.name]}
                    onChange={(value) => setFormData({ ...formData, [param.name]: value })}
                  />
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button type="submit" className="flex-1">
                  Iniciar Proceso
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Cancelar
                </Button>
              </div>
            </Card>

            {/* Preview de Parámetros */}
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Vista Previa: Parámetros a Enviar</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    ✅ Parámetros visibles del formulario ({parameters.length}):
                  </p>
                  <pre className="bg-muted p-3 rounded-md overflow-auto text-xs">
                    {JSON.stringify(formDataToParameters(formData), null, 2)}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    🔒 Parámetros ocultos/calculados (8):
                  </p>
                  <pre className="bg-muted p-3 rounded-md overflow-auto text-xs">
                    {JSON.stringify(formDataToParameters({
                      userId: token ? 'user123' : 'anonymous',
                      userEmail: 'user@example.com',
                      submittedAt: new Date().toISOString(),
                      submittedDate: new Date().toLocaleDateString('es-AR'),
                      appVersion: '1.0.0',
                      environment: process.env.NODE_ENV || 'development',
                      totalFields: parameters.length,
                      formHash: '...(generado al enviar)',
                      defaultPriority: 'medium',
                      defaultStatus: 'pending',
                    }), null, 2)}
                  </pre>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    💡 Total: {parameters.length + 10} parámetros ({parameters.length} visibles + 10 ocultos)
                  </p>
                </div>
              </div>
            </Card>
          </form>
        )}

        {/* Success */}
        {status === 'success' && result && (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Proceso Iniciado</h2>
              <p className="text-muted-foreground">
                Instance ID: <code className="text-xs bg-muted px-2 py-1 rounded">{result.instanceId}</code>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Respuesta del Servidor:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              <Button onClick={handleReset} className="w-full">
                Iniciar Otro Proceso
              </Button>
            </div>
          </Card>
        )}

        {/* Error */}
        {status === 'error' && (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Error</h2>
              <p className="text-destructive">{error}</p>
            </div>

            <Button onClick={handleReset} className="w-full">
              Volver a Intentar
            </Button>
          </Card>
        )}

        {/* Documentación */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">💡 Cómo funciona este ejemplo</h3>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">1. Obtener parámetros dinámicamente:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`const params = await sdk.process.getProcessParameters(
  'NombreProceso',
  '',
  token
)`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">2. Generar campos automáticamente:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`{parameters.map((param) => (
  <DynamicFormField
    key={param.name}
    parameter={param}
    value={formData[param.name]}
    onChange={(value) =>
      setFormData({ ...formData, [param.name]: value })
    }
  />
))}`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">3. Enviar todos los campos + parámetros ocultos:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`// Parámetros del formulario
const visibleParameters = formDataToParameters(formData)

// Parámetros ocultos/calculados
const hiddenParameters = formDataToParameters({
  userId: 'user123',
  submittedAt: new Date().toISOString(),
  appVersion: '1.0.0',
  // ... más parámetros ocultos
})

// Combinar ambos
const allParameters = [...visibleParameters, ...hiddenParameters]

await sdk.process.raiseEvent({
  eventName: 'NombreProceso',
  parameters: allParameters
}, undefined, token)`}</pre>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm">
              <strong>✅ Ideal para:</strong> Formularios genéricos, prototipos rápidos, cuando no conoces los parámetros de antemano
            </p>
            <p className="text-sm mt-2">
              <strong>❌ No ideal para:</strong> UI personalizada, validaciones complejas, mapeo selectivo de campos
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function Example1DynamicPage() {
  return (
    <RequireAuth returnUrl="/example-1-dynamic">
      <Example1DynamicContent />
    </RequireAuth>
  )
}
