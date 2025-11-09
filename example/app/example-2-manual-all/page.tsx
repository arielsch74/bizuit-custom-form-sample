'use client'

import { useState } from 'react'
import { useBizuitSDK, formDataToParameters } from '@tyconsa/bizuit-form-sdk'
import { Button, useBizuitAuth, BizuitThemeProvider } from '@tyconsa/bizuit-ui-components'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RequireAuth } from '@/components/require-auth'
import { LiveCodeEditor } from '@/components/live-code-editor'
import Link from 'next/link'

/**
 * EJEMPLO 2: Campos Manuales + Enviar Todos
 *
 * Este ejemplo demuestra cómo:
 * 1. Crear campos de formulario manualmente en código
 * 2. Tener control total sobre la UI y validaciones
 * 3. Enviar TODOS los campos al proceso usando formDataToParameters()
 *
 * Ventajas:
 * - Control total sobre el diseño del formulario
 * - Validaciones personalizadas
 * - Labels, placeholders y mensajes personalizados
 * - Mejor experiencia de usuario
 *
 * Desventajas:
 * - Más código para escribir y mantener
 * - Cambios en el proceso requieren cambios en el código
 * - Envía todos los campos (no selectivo)
 */
function Example2ManualAllContent() {
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  // Estado del formulario con campos definidos manualmente
  const [formData, setFormData] = useState({
    pEmpleado: '',
    pLegajo: '',
    pMonto: '',
    pCategoria: 'Viajes',
    pDescripcion: '',
    pFechaSolicitud: new Date().toISOString().split('T')[0],
    pAprobado: false,
    // Campos adicionales que también se enviarán
    pComentarios: '',
    pPrioridad: 'Media'
  })

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setStatus('submitting')
      setError(null)

      // Parámetros visibles del formulario
      const visibleParameters = formDataToParameters(formData)

      // Parámetros ocultos/calculados
      const hiddenParameters = formDataToParameters({
        // Datos de auditoría
        submittedBy: token ? 'user123' : 'anonymous',
        submittedAt: new Date().toISOString(),
        submittedFrom: 'web-form',

        // Cálculos automáticos
        montoConIVA: parseFloat(formData.pMonto || '0') * 1.21,
        esMontoAlto: parseFloat(formData.pMonto || '0') > 10000,

        // Metadata
        formVersion: '2.0.0',
        deviceInfo: navigator.userAgent,
      })

      // Combinar todos los parámetros
      const allParameters = [...visibleParameters, ...hiddenParameters]

      console.log('Enviando parámetros:', {
        visible: visibleParameters.length,
        hidden: hiddenParameters.length,
        total: allParameters.length,
        all: allParameters
      })

      const response = await sdk.process.raiseEvent({
        eventName: 'AprobacionGastos',
        parameters: allParameters
      }, undefined, token)

      setResult(response)
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar proceso')
      setStatus('error')
    }
  }

  const handleReset = () => {
    setFormData({
      pEmpleado: '',
      pLegajo: '',
      pMonto: '',
      pCategoria: 'Viajes',
      pDescripcion: '',
      pFechaSolicitud: new Date().toISOString().split('T')[0],
      pAprobado: false,
      pComentarios: '',
      pPrioridad: 'Media'
    })
    setStatus('idle')
    setResult(null)
    setError(null)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Volver al inicio
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Ejemplo 2: Campos Manuales + Enviar Todos</h1>
      <p className="text-muted-foreground mb-6">
        Los campos se crean manualmente con control total de la UI, se envían todos los valores
      </p>

      <div className="grid gap-6">
        {/* Editor Interactivo en Vivo - ARRIBA */}
        <LiveCodeEditor
          title="⚡ Editor Interactivo en Vivo"
          description="Edita el código en el panel izquierdo y ve los cambios EN TIEMPO REAL en el panel derecho. Prueba cambiar los placeholders, agregar campos, modificar estilos, etc."
          files={{
            '/App.js': `import { useState } from 'react';
import './styles.css';

export default function App() {
  const [formData, setFormData] = useState({
    pEmpleado: '',
    pLegajo: '',
    pMonto: '',
    pCategoria: 'Viajes',
    pDescripcion: '',
    pFechaSolicitud: new Date().toISOString().split('T')[0],
    pAprobado: false,
    pComentarios: '',
    pPrioridad: 'Media'
  });

  const [showModal, setShowModal] = useState(false);
  const [paramsToSend, setParamsToSend] = useState({ visible: [], hidden: [], all: [] });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aplicar transformaciones a los valores antes de enviar
    const transformedData = {
      ...formData,
      pEmpleado: formData.pEmpleado.toUpperCase(), // ✨ Transformación: MAYÚSCULAS
      pMonto: parseFloat(formData.pMonto || '0').toFixed(2), // ✨ Transformación: formato decimal
      pAprobado: formData.pAprobado ? 'SI' : 'NO' // ✨ Transformación: boolean a texto
    };

    // Parámetros visibles del formulario (con transformaciones aplicadas)
    const visibleParams = Object.entries(transformedData).map(([key, value]) => ({
      name: key,
      value: value,
      direction: 'Input'
    }));

    // Parámetros ocultos/calculados
    const hiddenParams = [
      { name: 'submittedBy', value: 'user123', direction: 'Input' },
      { name: 'submittedAt', value: new Date().toISOString(), direction: 'Input' },
      { name: 'montoConIVA', value: (parseFloat(formData.pMonto || '0') * 1.21).toFixed(2), direction: 'Input' },
      { name: 'esMontoAlto', value: parseFloat(formData.pMonto || '0') > 10000, direction: 'Input' },
    ];

    // ¡IMPORTANTE! Combinar TODOS los parámetros (visibles + ocultos)
    const allParams = [...visibleParams, ...hiddenParams];

    // Guardar los parámetros y mostrar modal
    setParamsToSend({ visible: visibleParams, hidden: hiddenParams, all: allParams });
    setShowModal(true);

    // Simular envío a Bizuit con TODOS los parámetros
    console.log('📤 Enviando a Bizuit:', allParams);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Solicitud de Reembolso de Gastos</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Empleado */}
            <div>
              <label className="form-label">Nombre del Empleado *</label>
              <input
                type="text"
                value={formData.pEmpleado}
                onChange={(e) => handleChange('pEmpleado', e.target.value)}
                placeholder="Juan Pérez"
                required
                className="form-input"
              />
            </div>

            {/* Legajo */}
            <div>
              <label className="form-label">Número de Legajo *</label>
              <input
                type="text"
                value={formData.pLegajo}
                onChange={(e) => handleChange('pLegajo', e.target.value)}
                placeholder="12345"
                required
                className="form-input"
              />
            </div>

            {/* Monto */}
            <div>
              <label className="form-label">Monto Solicitado * (AR$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.pMonto}
                onChange={(e) => handleChange('pMonto', e.target.value)}
                placeholder="1500.00"
                required
                className="form-input"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="form-label">Categoría de Gasto *</label>
              <select
                value={formData.pCategoria}
                onChange={(e) => handleChange('pCategoria', e.target.value)}
                className="form-input"
              >
                <option value="Viajes">Viajes</option>
                <option value="Comidas">Comidas</option>
                <option value="Alojamiento">Alojamiento</option>
                <option value="Transporte">Transporte</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="form-label">Fecha de Solicitud *</label>
              <input
                type="date"
                value={formData.pFechaSolicitud}
                onChange={(e) => handleChange('pFechaSolicitud', e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* Prioridad */}
            <div>
              <label className="form-label">Prioridad</label>
              <select
                value={formData.pPrioridad}
                onChange={(e) => handleChange('pPrioridad', e.target.value)}
                className="form-input"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="form-field">
            <label className="form-label">Descripción del Gasto *</label>
            <textarea
              value={formData.pDescripcion}
              onChange={(e) => handleChange('pDescripcion', e.target.value)}
              placeholder="Describa el motivo del gasto..."
              required
              rows={3}
              className="form-input"
            />
          </div>

          {/* Comentarios */}
          <div className="form-field">
            <label className="form-label">Comentarios Adicionales</label>
            <textarea
              value={formData.pComentarios}
              onChange={(e) => handleChange('pComentarios', e.target.value)}
              placeholder="Comentarios opcionales..."
              rows={2}
              className="form-input"
            />
          </div>

          {/* Checkbox */}
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="aprobado"
              checked={formData.pAprobado}
              onChange={(e) => handleChange('pAprobado', e.target.checked)}
            />
            <label htmlFor="aprobado">Pre-aprobado por supervisor inmediato</label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Enviar Solicitud
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setFormData({
                pEmpleado: '', pLegajo: '', pMonto: '', pCategoria: 'Viajes',
                pDescripcion: '', pFechaSolicitud: new Date().toISOString().split('T')[0],
                pAprobado: false, pComentarios: '', pPrioridad: 'Media'
              })}
            >
              Limpiar
            </button>
          </div>
        </form>

        {/* Modal - Parámetros a enviar a Bizuit */}
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
                  ({paramsToSend.visible.length} visibles + {paramsToSend.hidden.length} ocultos)
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

        {/* Preview - Datos completos con parámetros ocultos */}
        <div className="preview">
          <h3>Vista Previa de Datos:</h3>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a', marginBottom: '8px' }}>
              ✅ Parámetros Visibles ({Object.keys(formData).length}):
            </h4>
            <pre className="preview-code">{JSON.stringify(formData, null, 2)}</pre>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>
              🔒 Parámetros Ocultos/Calculados (4):
            </h4>
            <pre className="preview-code">{JSON.stringify({
              submittedBy: 'user123',
              submittedAt: new Date().toISOString(),
              montoConIVA: (parseFloat(formData.pMonto || '0') * 1.21).toFixed(2),
              esMontoAlto: parseFloat(formData.pMonto || '0') > 10000
            }, null, 2)}</pre>
          </div>

          <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '6px', border: '1px solid #d1d5db' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
              💡 Total: {Object.keys(formData).length + 4} parámetros
              ({Object.keys(formData).length} visibles + 4 ocultos)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}`,
            '/styles.css': `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f9fafb;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  margin-top: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #374151;
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
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Asegurar que el datepicker use la misma fuente */
input[type="date"].form-input {
  font-family: system-ui, -apple-system, sans-serif;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.form-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-checkbox label {
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  flex: 1;
  padding: 12px 24px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #ea580c;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.preview {
  margin-top: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.preview h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #374151;
}

.preview-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  background: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  color: #1f2937;
}

@media (prefers-color-scheme: dark) {
  body { background: #111827; }
  .card { background: #1f2937; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); }
  .card-title { color: #f9fafb; }
  .form-label { color: #e5e7eb; }
  .form-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  .form-checkbox label { color: #e5e7eb; }
  .btn-secondary {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
  .btn-secondary:hover {
    background: #4b5563;
  }
  .preview {
    background: #111827;
    border-color: #374151;
  }
  .preview h3 { color: #e5e7eb; }
  .preview-code {
    background: #0f172a;
    border-color: #374151;
    color: #e5e7eb;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 32px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  padding: 24px;
}

.params-section {
  margin-bottom: 24px;
}

.params-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.params-title.visible {
  color: #16a34a;
}

.params-title.hidden {
  color: #2563eb;
}

.params-list {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.param-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-family: 'Monaco', 'Courier New', monospace;
}

.param-item:last-child {
  margin-bottom: 0;
}

.param-name {
  font-weight: 600;
  color: #4b5563;
  min-width: 140px;
}

.param-value {
  color: #111827;
  word-break: break-all;
}

.params-total {
  padding: 16px;
  background: #f3f4f6;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: #374151;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-modal-close {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-modal-close:hover {
  background: #2563eb;
}`
          }}
        />

        {/* Documentación */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">💡 Cómo funciona este ejemplo</h3>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">1. Definir campos manualmente:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`const [formData, setFormData] = useState({
  pEmpleado: '',
  pMonto: '',
  pCategoria: 'Viajes',
  // ... más campos
})`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">2. Crear inputs con control total de UI:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`<input
  type="text"
  value={formData.pEmpleado}
  onChange={(e) => handleChange('pEmpleado', e.target.value)}
  placeholder="Juan Pérez"
  required
/>`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">3. Aplicar transformaciones a los valores:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`// ✨ Transformar valores antes de enviar
const transformedData = {
  ...formData,
  pEmpleado: formData.pEmpleado.toUpperCase(), // MAYÚSCULAS
  pMonto: parseFloat(formData.pMonto).toFixed(2), // Formato decimal
  pAprobado: formData.pAprobado ? 'SI' : 'NO' // Boolean a texto
}

const visibleParameters = formDataToParameters(transformedData)`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">4. Agregar parámetros ocultos/calculados:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`// Parámetros que NO están en el formulario
const hiddenParameters = formDataToParameters({
  submittedBy: 'user123',
  submittedAt: new Date().toISOString(),
  montoConIVA: parseFloat(formData.pMonto) * 1.21,
  esMontoAlto: formData.pMonto > 10000,
  formVersion: '2.0.0'
})`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">5. Combinar y enviar TODOS los campos:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`// Combinar parámetros visibles (transformados) + ocultos
const allParameters = [...visibleParameters, ...hiddenParameters]

await sdk.process.raiseEvent({
  eventName: 'AprobacionGastos',
  parameters: allParameters // Envía TODO
})`}</pre>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm">
              <strong>✅ Ideal para:</strong> Formularios con UI personalizada, validaciones específicas, mejor UX
            </p>
            <p className="text-sm mt-2">
              <strong>❌ Limitación:</strong> Envía TODOS los campos incluso si algunos no son necesarios para el proceso
            </p>
            <p className="text-sm mt-2 text-primary">
              <strong>💡 Ver Ejemplo 3</strong> para aprender cómo enviar solo campos específicos
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function Example2ManualAllPage() {
  return (
    <BizuitThemeProvider
      defaultTheme="light"
      defaultColorTheme="orange"
      defaultLanguage="es"
    >
      <RequireAuth returnUrl="/example-2-manual-all">
        <Example2ManualAllContent />
      </RequireAuth>
    </BizuitThemeProvider>
  )
}
