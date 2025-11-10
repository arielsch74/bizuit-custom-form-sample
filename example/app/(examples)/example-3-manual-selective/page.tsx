'use client'

import { useState } from 'react'
import { useBizuitSDK, buildParameters, formDataToParameters } from '@tyconsa/bizuit-form-sdk'
import { Button, useBizuitAuth, useTranslation } from '@tyconsa/bizuit-ui-components'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RequireAuth } from '@/components/require-auth'
import { LiveCodeEditor } from '@/components/live-code-editor'
import Link from 'next/link'

/**
 * EJEMPLO 3: Campos Manuales + Mapeo Selectivo (RECOMENDADO)
 *
 * Este ejemplo demuestra cómo:
 * 1. Crear campos de formulario manualmente en código
 * 2. Tener control total sobre la UI y validaciones
 * 3. ELEGIR selectivamente qué campos enviar usando buildParameters()
 * 4. Aplicar transformaciones a los valores antes de enviar
 *
 * Ventajas:
 * - Control total sobre el diseño del formulario
 * - Envía SOLO los campos necesarios
 * - Transforma valores antes de enviar (uppercase, decimales, etc.)
 * - Mapea campos del formulario a nombres diferentes en Bizuit
 * - Distingue entre parámetros y variables
 * - Mejor performance (menos datos enviados)
 *
 * Esta es la MEJOR PRÁCTICA para formularios personalizados.
 */
function Example3ManualSelectiveContent() {
  const { t } = useTranslation()
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  // Estado del formulario - puede tener más campos de los que se envían
  const [formData, setFormData] = useState({
    // Campos que SÍ se enviarán:
    empleado: '',
    legajo: '',
    monto: '',
    categoria: 'Viajes',
    descripcion: '',
    aprobadoSupervisor: false,

    // Campos que NO se enviarán (solo para UI):
    comentariosInternos: '',
    prioridad: 'Media',
    archivoAdjunto: null as File | null,
    notificarPorEmail: true
  })

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [mappedParameters, setMappedParameters] = useState<any[]>([])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Definir el mapeo selectivo
  const parameterMapping = {
    // Campo del form → Parámetro en Bizuit (con transformación)
    'empleado': {
      parameterName: 'pEmpleado',
      transform: (val: string) => val.toUpperCase() // Convertir a mayúsculas
    },
    'legajo': {
      parameterName: 'pLegajo'
    },
    'monto': {
      parameterName: 'pMonto',
      transform: (val: string) => parseFloat(val).toFixed(2) // Formato decimal
    },
    'categoria': {
      parameterName: 'pCategoria'
    },
    'descripcion': {
      parameterName: 'pDescripcion'
    },
    'aprobadoSupervisor': {
      parameterName: 'vAprobadoSupervisor', // Variable (no parámetro)
      isVariable: true,
      transform: (val: boolean) => val ? 'SI' : 'NO' // Boolean a texto
    }
    // NOTA: comentariosInternos, prioridad, archivoAdjunto, notificarPorEmail
    // NO están en el mapping, por lo tanto NO se enviarán
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setStatus('submitting')
      setError(null)

      // buildParameters() convierte SOLO los campos mapeados del formulario
      const visibleParameters = buildParameters(parameterMapping, formData)

      // NUEVO: {t('ui.add')} parámetros ocultos/calculados usando formDataToParameters()
      const hiddenData = {
        // Datos de auditoría (valor directo, NO del formData)
        submittedBy: token ? 'user123' : 'anonymous',
        submittedAt: new Date().toISOString(),
        submittedFrom: 'web-form',

        // Cálculos basados en formData
        montoConIVA: parseFloat(formData.monto || '0') * 1.21,
        requiereAprobacionGerente: parseFloat(formData.monto || '0') > 5000,

        // Metadata y constantes
        formVersion: '3.0.0',
        browserInfo: navigator.userAgent.substring(0, 50),
      }

      const hiddenParameters = formDataToParameters(hiddenData)

      // Combinar parámetros visibles + ocultos
      const allParameters = [...visibleParameters, ...hiddenParameters]
      setMappedParameters(allParameters)

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
      empleado: '',
      legajo: '',
      monto: '',
      categoria: 'Viajes',
      descripcion: '',
      aprobadoSupervisor: false,
      comentariosInternos: '',
      prioridad: 'Media',
      archivoAdjunto: null,
      notificarPorEmail: true
    })
    setStatus('idle')
    setResult(null)
    setError(null)
    setMappedParameters([])
  }

  // Preview en tiempo real de los parámetros que se enviarán
  const previewParameters = () => {
    try {
      const visibleParams = buildParameters(parameterMapping, formData)

      // Parámetros ocultos/calculados - usando formDataToParameters() para valores directos
      const hiddenData = {
        submittedBy: token ? 'user123' : 'anonymous',
        submittedAt: new Date().toISOString(),
        submittedFrom: 'web-form',
        montoConIVA: parseFloat(formData.monto || '0') * 1.21,
        requiereAprobacionGerente: parseFloat(formData.monto || '0') > 5000,
        formVersion: '3.0.0',
        browserInfo: navigator.userAgent.substring(0, 50),
      }
      const hiddenParams = formDataToParameters(hiddenData)

      return {
        visible: visibleParams,
        hidden: hiddenParams,
        all: [...visibleParams, ...hiddenParams]
      }
    } catch (err) {
      console.error('Error en previewParameters:', err)
      return { visible: [], hidden: [], all: [] }
    }
  }

  // Código para el LiveCodeEditor
  const liveCodeFiles = {
    'App.js': `import React, { useState } from 'react';
import './styles.css';

export default function SelectiveMappingForm() {
  const [formData, setFormData] = useState({
    empleado: '',
    legajo: '',
    monto: '',
    categoria: 'Viajes',
    descripcion: '',
    aprobadoSupervisor: false,
    // Campos que NO se enviarán:
    comentariosInternos: '',
    prioridad: 'Media'
  });

  const [showModal, setShowModal] = useState(false);
  const [paramsToSend, setParamsToSend] = useState({ visible: [], hidden: [], all: [] });

  // Definir el mapeo selectivo
  const parameterMapping = {
    'empleado': {
      parameterName: 'pEmpleado',
      transform: (val) => val.toUpperCase()
    },
    'legajo': {
      parameterName: 'pLegajo'
    },
    'monto': {
      parameterName: 'pMonto',
      transform: (val) => parseFloat(val).toFixed(2)
    },
    'categoria': {
      parameterName: 'pCategoria'
    },
    'descripcion': {
      parameterName: 'pDescripcion'
    },
    'aprobadoSupervisor': {
      parameterName: 'vAprobadoSupervisor',
      isVariable: true,
      transform: (val) => val ? 'SI' : 'NO'
    }
    // NOTA: comentariosInternos y prioridad NO están aquí, no se enviarán
  };

  // Función buildParameters simplificada
  const buildParameters = (mapping, data) => {
    return Object.entries(mapping).map(([fieldName, config]) => ({
      name: config.parameterName,
      value: config.transform
        ? config.transform(data[fieldName])
        : data[fieldName],
      direction: config.isVariable ? 'Variable' : 'Input'
    }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Parámetros visibles (mapeados del formulario)
    const visibleParams = buildParameters(parameterMapping, formData);

    // Parámetros ocultos/calculados
    const hiddenParams = [
      { name: 'submittedBy', value: 'user123', direction: 'Input' },
      { name: 'submittedAt', value: new Date().toISOString(), direction: 'Input' },
      { name: 'montoConIVA', value: (parseFloat(formData.monto || '0') * 1.21).toFixed(2), direction: 'Input' },
      { name: 'requiereAprobacionGerente', value: parseFloat(formData.monto || '0') > 5000, direction: 'Input' }
    ];

    // Combinar todos
    const allParams = [...visibleParams, ...hiddenParams];

    setParamsToSend({ visible: visibleParams, hidden: hiddenParams, all: allParams });
    setShowModal(true);

    console.log('📤 Enviando a Bizuit:', allParams);

    // 🔹 CÓDIGO REAL para enviar a Bizuit (comentado porque no funciona en Sandpack):
    // try {
    //   const response = await sdk.process.raiseEvent({
    //     eventName: 'AprobacionGastos',
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

  return (
    <div className="container">
      <div className="card">
        <h2>Solicitud de Reembolso</h2>

        <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Empleado */}
          <div className="form-group">
            <label>Nombre del Empleado * ✅ Se envía</label>
            <input
              type="text"
              value={formData.empleado}
              onChange={(e) => handleChange('empleado', e.target.value)}
              placeholder="juan pérez"
              required
              className="form-input"
            />
            <p className="hint">
              Se enviará como: pEmpleado = "{formData.empleado.toUpperCase() || 'JUAN PÉREZ'}"
            </p>
          </div>

          {/* Legajo */}
          <div className="form-group">
            <label>Número de Legajo * ✅ Se envía</label>
            <input
              type="text"
              value={formData.legajo}
              onChange={(e) => handleChange('legajo', e.target.value)}
              placeholder="12345"
              required
              className="form-input"
            />
          </div>

          {/* Monto */}
          <div className="form-group">
            <label>Monto Solicitado * ✅ Se envía</label>
            <input
              type="number"
              step="0.01"
              value={formData.monto}
              onChange={(e) => handleChange('monto', e.target.value)}
              placeholder="1500"
              required
              className="form-input"
            />
            <p className="hint">
              Se enviará como: pMonto = "{formData.monto ? parseFloat(formData.monto).toFixed(2) : '1500.00'}"
            </p>
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label>Categoría * ✅ Se envía</label>
            <select
              value={formData.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              className="form-input"
            >
              <option value="Viajes">Viajes</option>
              <option value="Comidas">Comidas</option>
              <option value="Alojamiento">Alojamiento</option>
              <option value="Transporte">Transporte</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label>Descripción * ✅ Se envía</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            placeholder="Describa el motivo del gasto..."
            required
            rows={3}
            className="form-input"
          />
        </div>

        {/* Aprobado */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.aprobadoSupervisor}
              onChange={(e) => handleChange('aprobadoSupervisor', e.target.checked)}
            />
            ✅ Pre-aprobado por supervisor (se envía como variable)
          </label>
        </div>

        {/* Campos que NO se envían */}
        <div className="no-send-section">
          <p className="warning">⚠️ Campos siguientes NO se envían a Bizuit:</p>

          <div className="form-group">
            <label>❌ Comentarios Internos (NO se envía)</label>
            <textarea
              value={formData.comentariosInternos}
              onChange={(e) => handleChange('comentariosInternos', e.target.value)}
              placeholder="Solo para uso interno..."
              rows={2}
              className="form-input no-send"
            />
          </div>

          <div className="form-group">
            <label>❌ Prioridad (NO se envía)</label>
            <select
              value={formData.prioridad}
              onChange={(e) => handleChange('prioridad', e.target.value)}
              className="form-input no-send"
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-submit">
          Enviar Solicitud
        </button>
      </form>

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
    </div>
  );
}`,
    'styles.css': `* {
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

h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

label {
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

.hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.no-send-section {
  border-top: 2px solid #e5e7eb;
  padding-top: 16px;
  margin-top: 16px;
}

.warning {
  font-size: 14px;
  font-weight: 500;
  color: #d97706;
  margin-bottom: 12px;
}

.form-input.no-send {
  opacity: 0.7;
  background: #f9fafb;
}

.btn-submit {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 20px;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
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
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          {t('ui.backToHome')}
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{t('example3.title')} ⭐</h1>
      <p className="text-muted-foreground mb-6">
        {t('example3.description')}
      </p>

      {/* Live Code Editor */}
      <div className="mb-8">
        <LiveCodeEditor
          title={t('example3.liveCodeTitle')}
          description={t('example3.liveCodeDescription')}
          files={liveCodeFiles}
        />
      </div>

      {/* Documentación */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 mt-6">
        <h3 className="font-semibold mb-3 text-lg">💡 {t('example3.howItWorks')}</h3>

        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">1️⃣ {t('example3.step1')}</h4>
            <pre className="bg-background/80 p-3 rounded text-xs overflow-auto">
{`const mapping = {
  'empleado': {
    parameterName: 'pEmpleado',
    transform: (val) => val.toUpperCase()
  },
  'monto': {
    parameterName: 'pMonto',
    transform: (val) => parseFloat(val).toFixed(2)
  },
  'aprobadoSupervisor': {
    parameterName: 'vAprobadoSupervisor',
    isVariable: true,
    transform: (val) => val ? 'SI' : 'NO'
  }
  // {t('example3.note')}
}`}</pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">2️⃣ {t('example3.step2')}</h4>
            <pre className="bg-background/80 p-3 rounded text-xs overflow-auto">
{`const parameters = buildParameters(mapping, formData)
// ${t('example3.onlyGenerates')}`}</pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">3️⃣ {t('example3.step3')}</h4>
            <pre className="bg-background/80 p-3 rounded text-xs overflow-auto">
{`// ${t('example3.notInForm')}
const hiddenData = {
  submittedBy: 'user123',
  submittedAt: new Date().toISOString(),
  montoConIVA: parseFloat(formData.pMonto) * 1.21,
  requiereAprobacion: formData.pMonto > 5000,
  formVersion: '3.0.0'
}

const hiddenParameters = formDataToParameters(hiddenData)`}</pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">4️⃣ {t('example3.step4')}</h4>
            <pre className="bg-background/80 p-3 rounded text-xs overflow-auto">
{`// ${t('example3.combine')}
const allParameters = [...parameters, ...hiddenParameters]

await sdk.process.raiseEvent({
  eventName: 'AprobacionGastos',
  parameters: allParameters // 6 ${t('example3.visibleHidden')} 10
})`}</pre>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-primary/20">
          <p className="text-sm">
            <strong className="text-primary">✅ {t('home.example3.badge')}:</strong> {t('example3.advantages.title')}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>✓ {t('example3.advantages.2')}</li>
            <li>✓ {t('example3.advantages.3')}</li>
            <li>✓ {t('example3.advantages.4')}</li>
            <li>✓ {t('example3.advantages.5')}</li>
            <li>✓ {t('example3.advantages.1')}</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default function Example3ManualSelectivePage() {
  return (
    <RequireAuth returnUrl="/example-3-manual-selective">
      <Example3ManualSelectiveContent />
    </RequireAuth>
  )
}
