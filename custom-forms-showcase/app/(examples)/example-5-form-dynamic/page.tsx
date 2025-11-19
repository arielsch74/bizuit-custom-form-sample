'use client'

import { useState } from 'react'
import { useBizuitSDK, type IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField, Button, useBizuitAuth, BizuitCard } from '@tyconsa/bizuit-ui-components'
import { useAppTranslation } from '@/lib/useAppTranslation'
import { RequireAuth } from '@/components/require-auth'
import { LiveCodeEditor } from '@/components/live-code-editor'
import Link from 'next/link'

/**
 * EJEMPLO 5: Form Service - Dynamic Form (High-Level API)
 *
 * Este ejemplo demuestra cómo usar el FormService (API de alto nivel) para:
 * 1. Preparar un formulario de inicio (prepareStartForm)
 * 2. Iniciar un proceso enviando TODOS los campos automáticamente (startProcess)
 *
 * DIFERENCIAS CON PROCESS SERVICE (Ejemplo 1):
 * ===============================================
 *
 * Process Service (Ejemplo 1 - Bajo Nivel):
 * - Más control manual sobre cada paso
 * - Requieres llamar a getParameters() manualmente
 * - Construyes los parámetros con formDataToParameters()
 * - Llamas a process.start() directamente
 * - Más código, más flexibilidad
 *
 * Form Service (Este Ejemplo - Alto Nivel):
 * - API simplificada con métodos que encapsulan workflows comunes
 * - prepareStartForm() obtiene parámetros Y prepara formData automáticamente
 * - startProcess() maneja la conversión de campos a parámetros
 * - Menos código, casos de uso comunes cubiertos
 * - Helpers adicionales (createParameters, field mapping, locks)
 *
 * CUÁNDO USAR FORM SERVICE:
 * =========================
 * ✅ Formularios estándar de inicio/continuación de procesos
 * ✅ Necesitas mapeo selectivo de campos a parámetros
 * ✅ Quieres agregar parámetros adicionales (usuario, fecha, etc.)
 * ✅ Trabajas con locks de instancia
 * ✅ Prefieres menos código boilerplate
 *
 * CUÁNDO USAR PROCESS SERVICE:
 * ============================
 * ✅ Necesitas control total sobre el flujo
 * ✅ Casos de uso no estándar (ej: iniciar múltiples procesos en paralelo)
 * ✅ Integraciones complejas con lógica personalizada
 * ✅ Optimizaciones específicas de rendimiento
 */
function Example5FormDynamicContent() {
  const { t } = useAppTranslation()
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  const [processName, setProcessName] = useState('DemoFlow')
  const [parameters, setParameters] = useState<IBizuitProcessParameter[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  // Paso 1: Preparar formulario usando FormService (Alto Nivel)
  const handlePrepareForm = async () => {
    try {
      setStatus('loading')
      setError(null)
      setResult(null)

      console.log('📋 [FormService] Preparando formulario para:', processName)

      // ✨ FormService.prepareStartForm() hace TODO en una sola llamada:
      // - Llama a process.initialize() internamente
      // - Filtra parámetros de entrada
      // - Prepara formData con valores por defecto
      const prepared = await sdk.forms.prepareStartForm({
        processName,
        token
      })

      console.log('✅ [FormService] Formulario preparado:', {
        parametersCount: prepared.parameters.length,
        formDataKeys: Object.keys(prepared.formData)
      })

      setParameters(prepared.parameters)
      setFormData(prepared.formData)
      setStatus('ready')
    } catch (error: any) {
      console.error('❌ Error preparando formulario:', error)
      setError(error.message || 'Error al preparar formulario')
      setStatus('error')
    }
  }

  // Paso 2: Enviar formulario usando FormService (Alto Nivel)
  const handleSubmit = async () => {
    try {
      setStatus('submitting')
      setError(null)

      console.log('📤 [FormService] Iniciando proceso con formData:', formData)

      // ✨ FormService.startProcess() simplifica el envío:
      // - Convierte formData a parámetros automáticamente
      // - No necesitas llamar a formDataToParameters()
      // - Maneja files, parámetros adicionales, etc.
      const response = await sdk.forms.startProcess({
        processName,
        formData, // ✨ Envía TODOS los campos automáticamente
        token
      })

      console.log('✅ [FormService] Proceso iniciado:', response)

      setResult(response)
      setStatus('success')
    } catch (error: any) {
      console.error('❌ Error iniciando proceso:', error)
      setError(error.message || 'Error al iniciar proceso')
      setStatus('error')
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← {t('ui.back')}
        </Link>
        <h1 className="text-4xl font-bold mb-2">{t('example5.title')}</h1>
        <p className="text-gray-600 text-lg">
          {t('example5.subtitle')}
        </p>
      </div>

      <div className="space-y-8">
        {/* Info Card: Qué es FormService */}
        <BizuitCard
          title={t('example5.whatIs.title')}
          description={t('example5.whatIs.description')}
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">{t('example5.comparison.title')}</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400 mb-2">{t('example5.comparison.formService')}</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• <code className="text-xs bg-muted px-1 rounded">prepareStartForm()</code> - Todo en una llamada</li>
                    <li>• <code className="text-xs bg-muted px-1 rounded">startProcess(formData)</code> - Conversión automática</li>
                    <li>• {t('example5.comparison.formService.less')}</li>
                    <li>• Helpers para field mapping y locks</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-amber-600 dark:text-amber-400 mb-2">{t('example5.comparison.processService')}</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• <code className="text-xs bg-muted px-1 rounded">getParameters()</code> + manual filtering</li>
                    <li>• <code className="text-xs bg-muted px-1 rounded">formDataToParameters()</code> + <code className="text-xs bg-muted px-1 rounded">start()</code></li>
                    <li>• {t('example5.comparison.processService.more')}</li>
                    <li>• Para casos avanzados/no estándar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </BizuitCard>

        {/* Código de ejemplo */}
        <BizuitCard
          title={t('example5.code.title')}
          description={t('example5.code.description')}
        >
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm"><code>{`// 1️⃣ Preparar formulario (TODO en una llamada)
const { parameters, formData } = await sdk.forms.prepareStartForm({
  processName: 'DemoFlow',
  token
})

// FormService hace automáticamente:
// - await sdk.process.initialize({ processName, token })
// - Filtra parámetros de entrada
// - Convierte parámetros a formData con defaults

// 2️⃣ Iniciar proceso (conversión automática de formData)
const result = await sdk.forms.startProcess({
  processName: 'DemoFlow',
  formData, // ✨ TODOS los campos se envían automáticamente
  token
})

// FormService hace automáticamente:
// - const params = formDataToParameters(formData)
// - await sdk.process.start({ processName, parameters: params }, token)
`}</code></pre>
          </div>
        </BizuitCard>

        {/* Comparación con ProcessService */}
        <BizuitCard
          title={t('example5.comparison2.title')}
          description={t('example5.comparison2.description')}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">{t('example5.comparison.formService')}</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs">
                <pre>{`// Solo 2 llamadas
const prepared = await sdk.form
  .prepareStartForm({
    processName,
    token
  })

const result = await sdk.form
  .startProcess({
    processName,
    formData,
    token
  })`}</pre>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                📏 ~15 líneas de código
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-amber-600 dark:text-amber-400">{t('example5.comparison.processService')}</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs">
                <pre>{`// Múltiples pasos manuales
const params = await sdk.process
  .getParameters(processName, '', token)

const inputParams = params.filter(p =>
  !p.isSystemParameter &&
  (p.direction === 'In' ||
   p.direction === 'Optional')
)

const formData = {}
inputParams.forEach(p => {
  formData[p.name] = p.value
})

const allParams = formDataToParameters(
  formData
)

const result = await sdk.process
  .start({
    processName,
    parameters: allParams
  }, undefined, token)`}</pre>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                📏 ~30 líneas de código
              </p>
            </div>
          </div>
        </BizuitCard>

        {/* Live Code Editor */}
        <div className="mb-8">
          <LiveCodeEditor
            title="⚡ Playground Interactivo - FormService.prepareStartForm() + startProcess()"
            description="Experimenta con FormService en vivo. Modifica el código y ve los resultados al instante."
            files={{
              '/App.js': `import { useState, createContext, useContext, useEffect } from 'react';
import './styles.css';

// 🎨 Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('system');
  const [primaryColor, setPrimaryColor] = useState('#f97316');

  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const effectiveTheme = mode === 'system' ? getSystemTheme() : mode;
  const isDark = effectiveTheme === 'dark';

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

// 🌐 I18n Context
const I18nContext = createContext();

const useTranslation = () => useContext(I18nContext);

const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');

  const translations = {
    es: {
      title: 'Demo de FormService',
      subtitle: 'API de alto nivel para formularios dinámicos',
      step1Title: 'Preparar Formulario',
      process: 'Proceso',
      prepareBtn: 'Preparar Formulario con prepareStartForm()',
      loadingParams: 'Cargando parámetros del proceso...',
      step2Title: 'Completar Formulario',
      preparedFields: 'FormService preparó {count} campos automáticamente',
      enterValue: 'Ingrese',
      formDataCurrent: 'FormData actual',
      back: 'Volver',
      startProcessBtn: 'Iniciar Proceso con startProcess()',
      startingProcess: 'Iniciando proceso...',
      processStarted: 'Proceso Iniciado Exitosamente',
      instanceId: 'Instance ID',
      calculatedTotal: 'Total Calculado',
      timestamp: 'Timestamp',
      dataSent: 'Datos enviados',
      startNewProcess: 'Iniciar Nuevo Proceso',
      error: 'Error',
      retry: 'Reintentar',
      advantages: 'Ventajas de FormService',
      lessCode: 'Menos código: prepareStartForm() hace todo en una llamada',
      autoConversion: 'Conversión automática: formData → parámetros automático',
      lessErrors: 'Menos errores: No necesitas filtrar ni transformar manualmente',
      moreProductive: 'Más productivo: Enfócate en la lógica de negocio, no en boilerplate'
    },
    en: {
      title: 'FormService Demo',
      subtitle: 'High-level API for dynamic forms',
      step1Title: 'Prepare Form',
      process: 'Process',
      prepareBtn: 'Prepare Form with prepareStartForm()',
      loadingParams: 'Loading process parameters...',
      step2Title: 'Complete Form',
      preparedFields: 'FormService prepared {count} fields automatically',
      enterValue: 'Enter',
      formDataCurrent: 'Current FormData',
      back: 'Back',
      startProcessBtn: 'Start Process with startProcess()',
      startingProcess: 'Starting process...',
      processStarted: 'Process Started Successfully',
      instanceId: 'Instance ID',
      calculatedTotal: 'Calculated Total',
      timestamp: 'Timestamp',
      dataSent: 'Data sent',
      startNewProcess: 'Start New Process',
      error: 'Error',
      retry: 'Retry',
      advantages: 'FormService Advantages',
      lessCode: 'Less code: prepareStartForm() does everything in one call',
      autoConversion: 'Automatic conversion: formData → parameters automatic',
      lessErrors: 'Fewer errors: No need to manually filter or transform',
      moreProductive: 'More productive: Focus on business logic, not boilerplate'
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

/**
 * 🎯 FORM SERVICE - API DE ALTO NIVEL
 *
 * FormService simplifica workflows comunes de formularios con helpers que:
 * - Preparan formularios automáticamente (prepareStartForm)
 * - Convierten formData a parámetros (startProcess)
 * - Manejan locks de instancia (prepareContinueForm)
 * - Permiten field mapping selectivo (fieldMapping)
 * - Agregan parámetros adicionales (additionalParameters)
 */

// 🔧 Mock del SDK FormService para demostración
const mockFormService = {
  /**
   * prepareStartForm(): Prepara un formulario de inicio
   * - Obtiene parámetros del proceso
   * - Filtra parámetros de entrada
   * - Crea formData con valores por defecto
   */
  prepareStartForm: async ({ processName }) => {
    // Simular delay de API
    await new Promise(r => setTimeout(r, 800));

    // Simular respuesta de la API
    const mockParameters = [
      { name: 'productName', dataType: 'string', value: '', required: true },
      { name: 'quantity', dataType: 'number', value: 1, required: true },
      { name: 'price', dataType: 'number', value: 0, required: true },
      { name: 'description', dataType: 'string', value: '', required: false }
    ];

    // Crear formData inicial con defaults
    const formData = {};
    mockParameters.forEach(p => {
      formData[p.name] = p.value;
    });

    return {
      parameters: mockParameters,
      formData: formData
    };
  },

  /**
   * startProcess(): Inicia un proceso con formData
   * - Convierte formData a parámetros automáticamente
   * - Envía al servidor
   */
  startProcess: async ({ processName, formData }) => {
    // Simular delay de API
    await new Promise(r => setTimeout(r, 1000));

    // Calcular total automáticamente
    const total = (formData.quantity || 0) * (formData.price || 0);

    // Simular respuesta exitosa
    return {
      success: true,
      instanceId: \`INST-\${Math.random().toString(36).substr(2, 9)}\`,
      processName: processName,
      submittedData: formData,
      calculatedTotal: total,
      timestamp: new Date().toISOString()
    };
  }
};

function FormServiceDemo() {
  const { t, language, setLanguage } = useTranslation();
  const { mode, setMode, isDark, primaryColor, setPrimaryColor } = useTheme();

  const [processName] = useState('ProductOrder');
  const [step, setStep] = useState('idle'); // idle, loading, ready, submitting, success
  const [parameters, setParameters] = useState([]);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * PASO 1: Preparar formulario con FormService.prepareStartForm()
   * ✨ Una sola llamada que hace TODO
   */
  const handlePrepareForm = async () => {
    try {
      setStep('loading');
      setError(null);

      console.log('📋 [FormService] Preparando formulario...');

      // ✨ prepareStartForm() hace TODO en una llamada:
      // 1. Obtiene parámetros del proceso
      // 2. Filtra parámetros de entrada
      // 3. Crea formData con defaults
      const prepared = await mockFormService.prepareStartForm({
        processName: processName
      });

      console.log('✅ Formulario preparado:', prepared);

      setParameters(prepared.parameters);
      setFormData(prepared.formData);
      setStep('ready');
    } catch (err) {
      setError(err.message);
      setStep('idle');
    }
  };

  /**
   * PASO 2: Iniciar proceso con FormService.startProcess()
   * ✨ Conversión automática de formData a parámetros
   */
  const handleStartProcess = async () => {
    try {
      setStep('submitting');
      setError(null);

      console.log('📤 [FormService] Iniciando proceso con formData:', formData);

      // ✨ startProcess() convierte formData automáticamente
      const response = await mockFormService.startProcess({
        processName: processName,
        formData: formData // ✨ Envía TODOS los campos automáticamente
      });

      console.log('✅ Proceso iniciado:', response);

      setResult(response);
      setStep('success');
    } catch (err) {
      setError(err.message);
      setStep('ready');
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const reset = () => {
    setStep('idle');
    setParameters([]);
    setFormData({});
    setResult(null);
    setError(null);
  };

  return (
    <div className="app-container">
      <div className="card">
        {/* Theme and Language Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
            {language === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
          </button>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              style={{
                width: '32px',
                height: '32px',
                border: \`2px solid \${isDark ? '#4b5563' : '#d1d5db'}\`,
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Primary Color"
            />
          </div>
        </div>

        <h1>🎯 {t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>

      {/* PASO 1: Preparar Formulario */}
      {step === 'idle' && (
        <div className="card">
          <h2>1️⃣ {t('step1Title')}</h2>
          <p>{t('process')}: <strong>{processName}</strong></p>
          <button
            onClick={handlePrepareForm}
            className="btn-primary"
            style={{ background: primaryColor }}
          >
            {t('prepareBtn')}
          </button>
        </div>
      )}

      {step === 'loading' && (
        <div className="card loading">
          <div className="spinner"></div>
          <p>{t('loadingParams')}</p>
        </div>
      )}

      {/* PASO 2: Completar Formulario */}
      {step === 'ready' && (
        <div className="card">
          <h2>2️⃣ {t('step2Title')}</h2>
          <p className="info">
            ✨ {t('preparedFields').replace('{count}', parameters.length)}
          </p>

          <div className="form-grid">
            {parameters.map(param => (
              <div key={param.name} className="form-field">
                <label>
                  {param.name}
                  {param.required && <span className="required">*</span>}
                </label>
                <input
                  type={param.dataType === 'number' ? 'number' : 'text'}
                  value={formData[param.name] || ''}
                  onChange={(e) => handleFieldChange(
                    param.name,
                    param.dataType === 'number'
                      ? parseFloat(e.target.value) || 0
                      : e.target.value
                  )}
                  placeholder={\`\${t('enterValue')} \${param.name}\`}
                />
              </div>
            ))}
          </div>

          {/* Preview de los datos */}
          <div className="preview">
            <h3>📝 {t('formDataCurrent')}:</h3>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>

          <div className="button-group">
            <button onClick={reset} className="btn-secondary">
              ← {t('back')}
            </button>
            <button
              onClick={handleStartProcess}
              className="btn-primary"
              style={{ background: primaryColor }}
            >
              {t('startProcessBtn')}
            </button>
          </div>
        </div>
      )}

      {step === 'submitting' && (
        <div className="card loading">
          <div className="spinner"></div>
          <p>{t('startingProcess')}</p>
        </div>
      )}

      {/* PASO 3: Resultado */}
      {step === 'success' && result && (
        <div className="card success">
          <h2>✅ {t('processStarted')}</h2>

          <div className="result-details">
            <div className="detail-row">
              <span className="label">{t('instanceId')}:</span>
              <span className="value">{result?.instanceId || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">{t('process')}:</span>
              <span className="value">{result?.processName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">{t('calculatedTotal')}:</span>
              <span className="value highlight">
                ${result?.calculatedTotal?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">{t('timestamp')}:</span>
              <span className="value">{result?.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A'}</span>
            </div>
          </div>

          <div className="preview">
            <h3>📦 {t('dataSent')}:</h3>
            <pre>{JSON.stringify(result?.submittedData || {}, null, 2)}</pre>
          </div>

          <button onClick={reset} className="btn-primary" style={{ background: primaryColor }}>
            🔄 {t('startNewProcess')}
          </button>
        </div>
      )}

      {error && (
        <div className="card error">
          <h3>❌ {t('error')}</h3>
          <p>{error}</p>
          <button onClick={reset} className="btn-secondary">
            {t('retry')}
          </button>
        </div>
      )}

      {/* Ventajas de FormService */}
      <div className="card info-card">
        <h3>✨ {t('advantages')}</h3>
        <ul>
          <li>✅ <strong>{t('lessCode')}</strong></li>
          <li>✅ <strong>{t('autoConversion')}</strong></li>
          <li>✅ <strong>{t('lessErrors')}</strong></li>
          <li>✅ <strong>{t('moreProductive')}</strong></li>
        </ul>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <FormServiceDemo />
      </I18nProvider>
    </ThemeProvider>
  );
}`,
              '/styles.css': `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.app-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card h1 {
  color: #1a202c;
  font-size: 28px;
  margin-bottom: 8px;
}

.card h2 {
  color: #2d3748;
  font-size: 20px;
  margin-bottom: 16px;
}

.card h3 {
  color: #4a5568;
  font-size: 16px;
  margin-bottom: 12px;
}

.subtitle {
  color: #718096;
  font-size: 14px;
}

.info {
  background: #ebf8ff;
  border-left: 4px solid #4299e1;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  color: #2c5282;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.required {
  color: #e53e3e;
  margin-left: 4px;
}

.form-field input {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-field input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.preview {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.preview h3 {
  color: #4a5568;
  font-size: 14px;
  margin-bottom: 8px;
}

.preview pre {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #2d3748;
  overflow-x: auto;
  background: white;
  padding: 12px;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.loading {
  text-align: center;
  padding: 40px;
  background: #f7fafc;
}

.spinner {
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success {
  border-left: 6px solid #48bb78;
}

.success h2 {
  color: #22543d;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f7fafc;
  border-radius: 6px;
}

.label {
  font-weight: 600;
  color: #4a5568;
}

.value {
  color: #2d3748;
}

.value.highlight {
  font-size: 18px;
  font-weight: 700;
  color: #38a169;
}

.error {
  border-left: 6px solid #f56565;
}

.error h3 {
  color: #c53030;
}

.info-card {
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  border: 2px solid #93c5fd;
}

.info-card h3 {
  color: #1e40af;
  margin-bottom: 12px;
}

.info-card ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-card li {
  color: #1e3a8a;
  font-size: 14px;
  padding-left: 8px;
}

.info-card strong {
  color: #1e40af;
}

/* Dark Mode */
body.dark {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

body.dark .card {
  background: #1e293b;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

body.dark .card h1 {
  color: #f1f5f9;
}

body.dark .card h2 {
  color: #e2e8f0;
}

body.dark .card h3 {
  color: #cbd5e1;
}

body.dark .subtitle {
  color: #94a3b8;
}

body.dark .info {
  background: #1e3a5f;
  border-left-color: #3b82f6;
  color: #93c5fd;
}

body.dark .form-field label {
  color: #e2e8f0;
}

body.dark .required {
  color: #f87171;
}

body.dark .form-field input {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

body.dark .form-field input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

body.dark .preview {
  background: #0f172a;
  border-color: #334155;
}

body.dark .preview h3 {
  color: #cbd5e1;
}

body.dark .preview pre {
  background: #1e293b;
  color: #e2e8f0;
}

body.dark .btn-secondary {
  background: #334155;
  color: #e2e8f0;
  border-color: #475569;
}

body.dark .btn-secondary:hover {
  background: #475569;
  border-color: #64748b;
}

body.dark .loading {
  background: #0f172a;
  color: #e2e8f0;
}

body.dark .spinner {
  border-color: #334155;
  border-top-color: #60a5fa;
}

body.dark .success {
  border-left-color: #22c55e;
}

body.dark .success h2 {
  color: #86efac;
}

body.dark .detail-row {
  background: #0f172a;
}

body.dark .label {
  color: #cbd5e1;
}

body.dark .value {
  color: #e2e8f0;
}

body.dark .value.highlight {
  color: #22c55e;
}

body.dark .error {
  border-left-color: #ef4444;
}

body.dark .error h3 {
  color: #fca5a5;
}

body.dark .error p {
  color: #e2e8f0;
}

body.dark .info-card {
  background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%);
  border-color: #3b82f6;
}

body.dark .info-card h3 {
  color: #93c5fd;
}

body.dark .info-card li {
  color: #bfdbfe;
}

body.dark .info-card strong {
  color: #60a5fa;
}`
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Example5FormDynamic() {
  return (
    <RequireAuth>
      <Example5FormDynamicContent />
    </RequireAuth>
  )
}
