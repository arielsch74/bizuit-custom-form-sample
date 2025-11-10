'use client'

import { useState } from 'react'
import { useBizuitSDK, formDataToParameters, type IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField, Button, useBizuitAuth, useTranslation } from '@tyconsa/bizuit-ui-components'
import { Card } from '@/components/ui/card'
import { RequireAuth } from '@/components/require-auth'
import { LiveCodeEditor } from '@/components/live-code-editor'
import Link from 'next/link'

/**
 * EJEMPLO 1: Campos Dinámicos desde API
 *
 * Este ejemplo demuestra cómo:
 * 1. Obtener parámetros dinámicamente desde la API de Bizuit
 * 2. Generar campos de formulario automáticamente usando DynamicFormField
 * 3. {t('ui.send')} TODOS los campos al proceso usando formDataToParameters()
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
  const { t } = useTranslation()
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

  // Paso 2: {t('ui.send')} proceso con TODOS los campos + parámetros ocultos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setStatus('submitting')
      setError(null)

      // formDataToParameters() convierte TODO el formData a parámetros
      const visibleParameters = formDataToParameters(formData)

      // NUEVO: {t('ui.add')} parámetros ocultos/calculados que NO están en el formulario
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
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          {t('ui.backToHome')}
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{t('example1.title')}</h1>
      <p className="text-muted-foreground mb-6">
        {t('example1.description')}
      </p>

      {/* Live Code Editor */}
      <div className="mb-8">
        <LiveCodeEditor
          title={`⚡ ${t('example1.liveCodeTitle')}`}
          description={t('example1.liveCodeDescription')}
          files={{
            '/App.js': `import { useState, createContext, useContext, useEffect } from 'react';
import './styles.css';

// 🎨 Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('system'); // 'light', 'dark', 'system'
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');

  // Detectar preferencia del sistema
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Calcular tema efectivo
  const effectiveTheme = mode === 'system' ? getSystemTheme() : mode;
  const isDark = effectiveTheme === 'dark';

  // Aplicar clase al body para que el CSS funcione
  useEffect(() => {
    document.body.className = isDark ? 'dark' : 'light';
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// 🌐 Contexto de Internacionalización (i18n)
const I18nContext = createContext();

const useTranslation = () => useContext(I18nContext);

const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');

  const translations = {
    es: {
      title: 'Formulario Generado Dinámicamente',
      description: 'Los campos se crean automáticamente desde los parámetros de la API',
      submit: 'Enviar Solicitud',
      fields: {
        pEmpleado: 'Empleado',
        pLegajo: 'Legajo',
        pMonto: 'Monto',
        pCategoria: 'Categoría',
        pFechaSolicitud: 'FechaSolicitud'
      }
    },
    en: {
      title: 'Dynamically Generated Form',
      description: 'Fields are automatically created from API parameters',
      submit: 'Submit Request',
      fields: {
        pEmpleado: 'Employee',
        pLegajo: 'EmployeeNumber',
        pMonto: 'Amount',
        pCategoria: 'Category',
        pFechaSolicitud: 'RequestDate'
      }
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) value = value?.[k];
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

function DynamicFormDemo() {
  const { t, language, setLanguage } = useTranslation();
  const { mode, setMode, isDark, primaryColor, setPrimaryColor } = useTheme();

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
    const translatedLabel = t(\`fields.\${param.name}\`) || param.name.replace('p', '');

    return (
      <div key={param.name} className="form-group">
        <label className="form-label">
          {translatedLabel} *
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
        {/* Theme and Language Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            style={{
              padding: '6px 12px',
              background: isDark ? '#374151' : '#f3f4f6',
              color: isDark ? '#f9fafb' : '#111827',
              border: \`1px solid \${isDark ? '#4b5563' : '#d1d5db'}\`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {language === 'es' ? '🇬🇧 EN' : '🇪🇸 ES'}
          </button>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Selector de tema */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {['light', 'dark', 'system'].map(themeMode => (
                <button
                  key={themeMode}
                  type="button"
                  onClick={() => setMode(themeMode)}
                  style={{
                    padding: '6px 12px',
                    background: mode === themeMode ? primaryColor : (isDark ? '#374151' : '#f3f4f6'),
                    color: mode === themeMode ? 'white' : (isDark ? '#f9fafb' : '#111827'),
                    border: \`1px solid \${mode === themeMode ? primaryColor : (isDark ? '#4b5563' : '#d1d5db')}\`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {themeMode === 'light' ? '☀️' : themeMode === 'dark' ? '🌙' : '💻'}
                </button>
              ))}
            </div>

            {/* Selector de color primario */}
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              style={{
                width: '40px',
                height: '32px',
                border: \`1px solid \${isDark ? '#4b5563' : '#d1d5db'}\`,
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Color primario"
            />
          </div>
        </div>

        <h2 className="card-title">{t('title')}</h2>
        <p className="card-description">
          {t('description')}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* 🔹 Generar campos dinámicamente */}
            {mockParameters.map(param => renderField(param))}
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              width: '100%'
            }}
          >
            {t('submit')}
          </button>
        </form>

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
              🔒 Parámetros Ocultos/Calculados (2):
            </h4>
            <pre className="preview-code">{JSON.stringify({
              submittedAt: new Date().toISOString(),
              formVersion: '1.0.0'
            }, null, 2)}</pre>
          </div>

          <div className="preview-total">
            <p className="preview-total-text">
              💡 Total: {Object.keys(formData).length + 2} parámetros
              ({Object.keys(formData).length} visibles + 2 ocultos)
            </p>
          </div>
        </div>
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
}

// 🎯 Exportar el componente envuelto en los providers
export default function AppWithProvider() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <DynamicFormDemo />
      </I18nProvider>
    </ThemeProvider>
  );
}`,
            '/styles.css': `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Light Mode (Default) */
body {
  font-family: system-ui, -apple-system, sans-serif !important;
  background: #f9fafb !important;
  color: #111827 !important;
  padding: 20px !important;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.card {
  background: white !important;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827 !important;
}

.card-description {
  font-size: 14px;
  color: #6b7280 !important;
  margin-bottom: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
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
  color: #374151 !important;
  position: relative;
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db !important;
  border-radius: 6px;
  font-size: 14px;
  font-family: system-ui, -apple-system, sans-serif;
  background: white !important;
  color: #111827 !important;
  transition: border-color 0.2s;
  position: relative;
  z-index: 2;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.btn-submit {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(249, 115, 22, 0.4);
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7) !important;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white !important;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3) !important;
}

.modal-header {
  padding: 20px;
  border-bottom: 2px solid #e5e7eb !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white !important;
}

.modal-close {
  background: transparent;
  border: none;
  color: white !important;
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
  background: rgba(255, 255, 255, 0.2) !important;
}

.modal-body {
  padding: 20px;
  background: white !important;
}

.params-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb !important;
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
  background: #dcfce7 !important;
  color: #15803d !important;
}

.params-title.hidden {
  background: #dbeafe !important;
  color: #1e40af !important;
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
  background: #f9fafb !important;
  border-radius: 4px;
  font-size: 13px;
}

.param-name {
  font-weight: 600;
  color: #374151 !important;
  min-width: 180px;
}

.param-value {
  color: #6b7280 !important;
  word-break: break-all;
}

.params-total {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%) !important;
  border-radius: 8px;
  text-align: center;
  color: #5b21b6 !important;
  font-size: 14px;
}

.params-total strong {
  font-weight: 700;
  color: #5b21b6 !important;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 2px solid #e5e7eb !important;
  text-align: center;
  background: white !important;
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
}

/* Dark Mode */
body.dark {
  background: #111827 !important;
  color: #f9fafb !important;
}

body.dark .card {
  background: #1f2937 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

body.dark .card-title {
  color: #f9fafb !important;
}

body.dark .card-description {
  color: #9ca3af !important;
}

body.dark .form-label {
  color: #d1d5db !important;
}

body.dark .form-input {
  background: #374151 !important;
  border-color: #4b5563 !important;
  color: #f9fafb !important;
}

body.dark .form-input:focus {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
}

body.dark .modal-overlay {
  background: rgba(0, 0, 0, 0.85) !important;
}

body.dark .modal-content {
  background: #1f2937 !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
}

body.dark .modal-header {
  border-bottom: 2px solid #374151 !important;
}

body.dark .modal-body {
  background: #1f2937 !important;
}

body.dark .params-section {
  border-bottom: 1px solid #374151 !important;
}

body.dark .params-title.visible {
  background: #065f46 !important;
  color: #d1fae5 !important;
}

body.dark .params-title.hidden {
  background: #1e3a8a !important;
  color: #dbeafe !important;
}

body.dark .param-item {
  background: #374151 !important;
}

body.dark .param-name {
  color: #d1d5db !important;
}

body.dark .param-value {
  color: #9ca3af !important;
}

body.dark .params-total {
  background: linear-gradient(135deg, #5b21b6 0%, #6d28d9 100%) !important;
  color: #ede9fe !important;
}

body.dark .params-total strong {
  color: #ede9fe !important;
}

body.dark .modal-footer {
  border-top: 2px solid #374151 !important;
  background: #1f2937 !important;
}`
          }}
        />
      </div>

      <div className="grid gap-6">
        {/* {t('ui.configuration')} Inicial */}
        {status === 'idle' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('ui.configuration')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('ui.processName')}
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
                {t('ui.loadProcessParameters')}
              </Button>
            </div>
          </Card>
        )}

        {/* Loading */}
        {status === 'loading' && (
          <Card className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{t('ui.loadingParameters')}</p>
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
                  {t('ui.initiateProcess')}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  {t('ui.cancel')}
                </Button>
              </div>
            </Card>

            {/* Preview de Parámetros */}
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Vista Previa: Parámetros a {t('ui.send')}</h3>

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
          <h3 className="font-semibold mb-3">💡 {t('example1.howItWorks')}</h3>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">1. {t('example1.step1')}</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`const params = await sdk.process.getProcessParameters(
  'NombreProceso',
  '',
  token
)`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">2. {t('example1.step2')}</h4>
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
              <h4 className="font-medium mb-1">3. {t('example1.step3')}</h4>
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
              <strong>✅ {t('example1.idealFor')}</strong> {t('example1.idealForText')}
            </p>
            <p className="text-sm mt-2">
              <strong>❌ {t('example1.notIdealFor')}</strong> {t('example1.notIdealForText')}
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
