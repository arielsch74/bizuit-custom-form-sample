'use client'

import { useState } from 'react'
import { useBizuitSDK, type IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField, Button, useBizuitAuth, BizuitCard } from '@tyconsa/bizuit-ui-components'
import { useAppTranslation } from '@/lib/useAppTranslation'
import { RequireAuth } from '@/components/require-auth'
import { LiveCodeEditor } from '@/components/live-code-editor'
import Link from 'next/link'

/**
 * EJEMPLO 7: Form Service - Selective Field Mapping & Transformations
 *
 * Este ejemplo demuestra la característica MÁS PODEROSA del FormService:
 * 1. Mapeo selectivo de campos (fieldMapping)
 * 2. Transformaciones de valores (parseFloat, formatDate, uppercase, etc.)
 * 3. Parámetros adicionales no vinculados al formulario (additionalParameters)
 * 4. Helper createParameters() para construcción flexible
 *
 * CASOS DE USO REALES:
 * ====================
 * ✅ Agregar campos de auditoría automáticamente (createdBy, createdDate, modifiedBy)
 * ✅ Convertir tipos de datos (string → number, string → date, string → boolean)
 * ✅ Transformar valores antes de enviar (uppercase, lowercase, trim, format)
 * ✅ Mapear nombres de campos UI a nombres de parámetros BPM diferentes
 * ✅ Enviar solo un SUBCONJUNTO de campos del formulario
 * ✅ Agregar parámetros calculados (ej: total = cantidad * precio)
 *
 * VS. PROCESS SERVICE (Ejemplo 1):
 * =================================
 * Process Service requiere:
 * - Construir manualmente el array de parámetros
 * - Aplicar transformaciones en tu código manualmente
 * - Agregar campos adicionales manualmente
 * - Más código boilerplate
 *
 * Form Service simplifica:
 * - Declaras fieldMapping con transformaciones
 * - Declaras additionalParameters
 * - Todo se convierte automáticamente
 */
function Example7FormSelectiveContent() {
  const { t } = useAppTranslation()
  const sdk = useBizuitSDK()
  const { token, user } = useBizuitAuth()

  const [processName, setProcessName] = useState('ExpenseRequest')
  const [parameters, setParameters] = useState<IBizuitProcessParameter[]>([])

  // FormData: solo los campos que el usuario ve
  const [formData, setFormData] = useState<Record<string, any>>({
    description: '',
    amountStr: '', // String en el form, pero lo convertiremos a number
    category: 'Travel',
    urgent: false
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [sentParameters, setSentParameters] = useState<any[]>([])

  // Paso 1: Cargar parámetros del proceso (igual que siempre)
  const handlePrepareForm = async () => {
    try {
      setStatus('loading')
      setError(null)
      setResult(null)

      console.log('📋 [FormService] Preparando formulario para:', processName)

      const prepared = await sdk.forms.prepareStartForm({
        processName,
        token
      })

      console.log('✅ [FormService] Formulario preparado')

      setParameters(prepared.parameters)
      setStatus('ready')
    } catch (error: any) {
      console.error('❌ Error preparando formulario:', error)
      setError(error.message || 'Error al preparar formulario')
      setStatus('error')
    }
  }

  // Paso 2: Enviar con field mapping selectivo y transformaciones
  const handleSubmit = async () => {
    try {
      setStatus('submitting')
      setError(null)

      console.log('📤 [FormService] Iniciando proceso con field mapping selectivo')

      // ✨ MAGIA DEL FORM SERVICE: Field Mapping + Transformations
      const response = await sdk.forms.startProcess({
        processName,
        formData, // Solo los campos del formulario

        // 🎯 Field Mapping: Qué campos enviar y cómo transformarlos
        fieldMapping: {
          // Mapeo simple: campo form → parámetro BPM (mismo nombre)
          description: 'description',
          category: 'category',
          urgent: 'urgent',

          // Mapeo con transformación: string → number
          amountStr: {
            parameterName: 'amount', // ¡Nombre diferente!
            transform: (value: string) => parseFloat(value) || 0
          }
        },

        // 🚀 Additional Parameters: Campos NO en el formulario
        additionalParameters: sdk.forms.createParameters({
          // Auditoría automática
          requestedBy: user?.username || 'system',
          requestedDate: new Date().toISOString(),

          // Campos calculados
          status: 'Pending',
          approvalRequired: parseFloat(formData.amountStr || '0') > 1000,

          // Metadata
          source: 'CustomFormsShowcase',
          version: '2.0.0'
        }),

        token
      })

      console.log('✅ [FormService] Proceso iniciado:', response)

      // Para mostrar QUÉ parámetros se enviaron realmente
      const sentParams = [
        { name: 'description', value: formData.description, source: 'formData (mapped)' },
        { name: 'category', value: formData.category, source: 'formData (mapped)' },
        { name: 'urgent', value: formData.urgent, source: 'formData (mapped)' },
        { name: 'amount', value: parseFloat(formData.amountStr) || 0, source: 'formData (transformed from amountStr)' },
        { name: 'requestedBy', value: user?.username || 'system', source: 'additionalParameters' },
        { name: 'requestedDate', value: new Date().toISOString(), source: 'additionalParameters' },
        { name: 'status', value: 'Pending', source: 'additionalParameters' },
        { name: 'approvalRequired', value: parseFloat(formData.amountStr || '0') > 1000, source: 'additionalParameters (calculated)' },
        { name: 'source', value: 'CustomFormsShowcase', source: 'additionalParameters' },
        { name: 'version', value: '2.0.0', source: 'additionalParameters' }
      ]

      setSentParameters(sentParams)
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
        <h1 className="text-4xl font-bold mb-2">{t('example7.title')}</h1>
        <p className="text-gray-600 text-lg">
          {t('example7.subtitle')}
        </p>
      </div>

      <div className="space-y-8">
        {/* Info Card: Qué es Field Mapping */}
        <BizuitCard
          title={t('example7.mapping.title')}
          description={t('example7.mapping.description')}
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3">{t('example7.whyPowerful.title')}</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-purple-600 dark:text-purple-400 mb-2">{t('example7.whyPowerful.selective')}</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• {t('example7.whyPowerful.selective.item1')}</li>
                    <li>• {t('example7.whyPowerful.selective.item2')}</li>
                    <li>• {t('example7.whyPowerful.selective.item3')}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-blue-600 dark:text-blue-400 mb-2">{t('example7.whyPowerful.transformations')}</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• {t('example7.whyPowerful.transformations.item1')}</li>
                    <li>• {t('example7.whyPowerful.transformations.item2')}</li>
                    <li>• {t('example7.whyPowerful.transformations.item3')}</li>
                    <li>• {t('example7.whyPowerful.transformations.item4')}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400 mb-2">🚀 Parámetros Adicionales</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Auditoría (createdBy, createdDate)</li>
                    <li>• Campos calculados</li>
                    <li>• Metadata del sistema</li>
                    <li>• No están en el formulario</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Casos de uso reales */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">{t('example7.useCases.title')}</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold mb-1">{t('example7.useCases.expenses')}</p>
                  <ul className="space-y-1 text-xs">
                    <li>• {t('example7.useCases.expenses.item1')}</li>
                    <li>• {t('example7.useCases.expenses.item2')}</li>
                    <li>• {t('example7.useCases.expenses.item3')}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">{t('example7.useCases.user')}</p>
                  <ul className="space-y-1 text-xs">
                    <li>• {t('example7.useCases.user.item1')}</li>
                    <li>• {t('example7.useCases.user.item2')}</li>
                    <li>• {t('example7.useCases.user.item3')}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">{t('example7.useCases.vacation')}</p>
                  <ul className="space-y-1 text-xs">
                    <li>• {t('example7.useCases.vacation.item1')}</li>
                    <li>• {t('example7.useCases.vacation.item2')}</li>
                    <li>• {t('example7.useCases.vacation.item3')}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">{t('example7.useCases.purchase')}</p>
                  <ul className="space-y-1 text-xs">
                    <li>• {t('example7.useCases.purchase.item1')}</li>
                    <li>• {t('example7.useCases.purchase.item2')}</li>
                    <li>• {t('example7.useCases.purchase.item3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </BizuitCard>

        {/* Código de ejemplo */}
        <BizuitCard
          title={t('example7.code.title')}
          description={t('example7.code.description')}
        >
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm"><code>{`// ✨ FORM SERVICE: Field Mapping + Transformations
const response = await sdk.forms.startProcess({
  processName: 'ExpenseRequest',

  // Formulario: Solo 4 campos
  formData: {
    description: 'Viaje a conferencia',
    amountStr: '1500.50', // ← STRING
    category: 'Travel',
    urgent: false
  },

  // 🎯 Field Mapping: Qué enviar y cómo transformar
  fieldMapping: {
    description: 'description',    // Mapeo simple
    category: 'category',          // Mapeo simple
    urgent: 'urgent',              // Mapeo simple

    // Mapeo con transformación
    amountStr: {
      parameterName: 'amount',     // ¡Nombre diferente!
      transform: (value: string) => parseFloat(value) || 0  // STRING → NUMBER
    }
  },

  // 🚀 Additional Parameters: NO están en el formulario
  additionalParameters: sdk.forms.createParameters({
    // Auditoría
    requestedBy: user?.username || 'system',
    requestedDate: new Date().toISOString(),

    // Campos calculados
    status: 'Pending',
    approvalRequired: parseFloat(formData.amountStr) > 1000,

    // Metadata
    source: 'CustomFormsShowcase',
    version: '2.0.0'
  }),

  token
})

// RESULTADO: 10 parámetros enviados al proceso
// - 4 del formulario (con 1 transformado)
// - 6 adicionales automáticos`}</code></pre>
          </div>
        </BizuitCard>

        {/* Comparación con ProcessService */}
        <BizuitCard
          title={t('example7.comparison.title')}
          description={t('example7.comparison.description')}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                {t('example7.comparison.formService')}
              </h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs">
                <pre>{`// Declarativo y conciso
const response = await sdk.forms.startProcess({
  processName,
  formData,

  fieldMapping: {
    description: 'description',
    amountStr: {
      parameterName: 'amount',
      transform: parseFloat
    }
    // ...
  },

  additionalParameters: sdk.forms.createParameters({
    requestedBy: user?.username,
    requestedDate: new Date().toISOString(),
    status: 'Pending',
    // ...
  }),

  token
})`}</pre>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {t('example7.comparison.formService.lines')}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-amber-600 dark:text-amber-400">
                {t('example7.comparison.processService')}
              </h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs">
                <pre>{`// Imperativo y verboso
const params = await sdk.process.getParameters(
  processName, '', token
)

// Construir parámetros manualmente
const parameters = [
  { name: 'description', value: formData.description },
  { name: 'amount', value: parseFloat(formData.amountStr) || 0 },
  { name: 'category', value: formData.category },
  { name: 'urgent', value: formData.urgent },
  { name: 'requestedBy', value: user?.username || 'system' },
  { name: 'requestedDate', value: new Date().toISOString() },
  { name: 'status', value: 'Pending' },
  { name: 'approvalRequired', value: parseFloat(formData.amountStr) > 1000 },
  { name: 'source', value: 'CustomFormsShowcase' },
  { name: 'version', value: '2.0.0' }
]

const response = await sdk.process.start({
  processName,
  parameters
}, undefined, token)`}</pre>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {t('example7.comparison.processService.lines')}
              </p>
            </div>
          </div>
        </BizuitCard>

        {/* Casos de uso avanzados */}
        <BizuitCard
          title={t('example7.advanced.title')}
          description={t('example7.advanced.description')}
        >
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <h4 className="font-semibold mb-2 text-purple-400">{t('example7.advanced.dates')}</h4>
              <pre className="text-xs"><code>{`fieldMapping: {
  startDate: {
    parameterName: 'startDate',
    transform: (value: string) => new Date(value).toISOString()
  },
  endDate: {
    parameterName: 'endDate',
    transform: (value: string) => {
      const date = new Date(value)
      date.setHours(23, 59, 59) // Fin del día
      return date.toISOString()
    }
  }
}`}</code></pre>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <h4 className="font-semibold mb-2 text-blue-400">{t('example7.advanced.text')}</h4>
              <pre className="text-xs"><code>{`fieldMapping: {
  email: {
    parameterName: 'email',
    transform: (value: string) => value.toLowerCase().trim()
  },
  companyName: {
    parameterName: 'companyName',
    transform: (value: string) => value.toUpperCase().trim()
  }
}`}</code></pre>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <h4 className="font-semibold mb-2 text-green-400">{t('example7.advanced.calculations')}</h4>
              <pre className="text-xs"><code>{`// En additionalParameters puedes hacer cálculos basados en formData
additionalParameters: sdk.forms.createParameters({
  // Calcular total con IVA
  totalWithTax: parseFloat(formData.subtotal) * 1.21,

  // Calcular días entre fechas
  totalDays: Math.ceil(
    (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime())
    / (1000 * 60 * 60 * 24)
  ),

  // Determinar prioridad basada en monto
  priority: parseFloat(formData.amount) > 5000 ? 'High' : 'Normal'
})`}</code></pre>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <h4 className="font-semibold mb-2 text-amber-400">{t('example7.advanced.arrays')}</h4>
              <pre className="text-xs"><code>{`fieldMapping: {
  // Convertir string separado por comas a array
  tags: {
    parameterName: 'tags',
    transform: (value: string) => value.split(',').map(t => t.trim())
  },

  // Convertir objeto a JSON string
  metadata: {
    parameterName: 'metadata',
    transform: (value: any) => JSON.stringify(value)
  }
}`}</code></pre>
            </div>
          </div>
        </BizuitCard>

        {/* Live Code Editor */}
        <div className="mb-8">
          <LiveCodeEditor
            title={t('example7.playground.title')}
            description={t('example7.playground.description')}
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
      title: 'Demo de Field Mapping',
      subtitle: '4 campos en el form → 10 parámetros al proceso',
      step1: 'Preparar Formulario',
      loading: 'Cargando parámetros...',
      submit: 'Iniciar Proceso',
      success: 'Proceso Iniciado Exitosamente'
    },
    en: {
      title: 'Field Mapping Demo',
      subtitle: '4 fields in form → 10 parameters to process',
      step1: 'Prepare Form',
      loading: 'Loading parameters...',
      submit: 'Start Process',
      success: 'Process Started Successfully'
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
 * 🎯 FIELD MAPPING - LA CARACTERÍSTICA MÁS PODEROSA
 *
 * FormService permite:
 * 1. Mapeo selectivo: Envía SOLO los campos que necesitas
 * 2. Transformaciones: Convierte valores (string → number, dates, etc.)
 * 3. Parámetros adicionales: Agrega campos de auditoría automáticamente
 * 4. Nombres diferentes: Campo UI "amountStr" → parámetro BPM "amount"
 *
 * CASO DE USO REAL: Formulario de Gastos
 * - 4 campos en el formulario
 * - 10 parámetros enviados al proceso
 * - Transformación: string → number
 * - Auditoría: requestedBy, requestedDate, source, version
 * - Cálculos: approvalRequired = amount > 1000
 */

// 🔧 Mock del SDK FormService
const mockFormService = {
  prepareStartForm: async ({ processName }) => {
    await new Promise(r => setTimeout(r, 800));

    const mockParameters = [
      { name: 'description', dataType: 'string', value: '', required: true },
      { name: 'amountStr', dataType: 'string', value: '', required: true },
      { name: 'category', dataType: 'string', value: 'Travel', required: true },
      { name: 'urgent', dataType: 'boolean', value: false, required: false }
    ];

    const formData = {};
    mockParameters.forEach(p => {
      formData[p.name] = p.value;
    });

    return { parameters: mockParameters, formData };
  },

  /**
   * startProcess() con fieldMapping + additionalParameters
   * Esta es la MAGIA de FormService
   */
  startProcess: async ({ processName, formData, fieldMapping, additionalParameters }) => {
    await new Promise(r => setTimeout(r, 1000));

    // Aplicar fieldMapping (simulado)
    const mappedParams = {};

    // description: mapeo simple (mismo nombre)
    mappedParams.description = formData.description;

    // category: mapeo simple
    mappedParams.category = formData.category;

    // urgent: mapeo simple
    mappedParams.urgent = formData.urgent;

    // amountStr → amount: TRANSFORMACIÓN (string → number)
    mappedParams.amount = parseFloat(formData.amountStr) || 0;

    // Agregar parámetros adicionales
    const allParams = {
      ...mappedParams,
      ...additionalParameters
    };

    return {
      success: true,
      instanceId: \`INST-\${Math.random().toString(36).substr(2, 9)}\`,
      processName: processName,
      totalParametersSent: Object.keys(allParams).length,
      formFieldsCount: Object.keys(formData).length,
      parameters: allParams,
      timestamp: new Date().toISOString()
    };
  },

  // Helper para crear parámetros
  createParameters: (params) => params
};

function FieldMappingDemo() {
  const { t, language, setLanguage } = useTranslation();
  const { mode, setMode, isDark, primaryColor, setPrimaryColor } = useTheme();

  const [processName] = useState('ExpenseRequest');
  const [currentUser] = useState({ username: 'juan.perez' });
  const [step, setStep] = useState('idle');

  const [parameters, setParameters] = useState([]);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePrepareForm = async () => {
    try {
      setStep('loading');
      setError(null);

      console.log('📋 [FormService] Preparando formulario...');

      const prepared = await mockFormService.prepareStartForm({
        processName: processName
      });

      console.log('✅ Formulario preparado');

      setParameters(prepared.parameters);
      setFormData(prepared.formData);
      setStep('ready');
    } catch (err) {
      setError(err.message);
      setStep('idle');
    }
  };

  const handleSubmit = async () => {
    try {
      setStep('submitting');
      setError(null);

      console.log('📤 [FormService] Iniciando proceso con field mapping...');

      // ✨ FIELD MAPPING: Mapeo selectivo + transformaciones
      const fieldMapping = {
        description: 'description',    // Mapeo simple
        category: 'category',          // Mapeo simple
        urgent: 'urgent',              // Mapeo simple

        // Transformación: amountStr (string) → amount (number)
        amountStr: {
          parameterName: 'amount',
          transform: (value) => parseFloat(value) || 0
        }
      };

      // ✨ ADDITIONAL PARAMETERS: Campos NO en el formulario
      const additionalParameters = mockFormService.createParameters({
        // Auditoría automática
        requestedBy: currentUser.username,
        requestedDate: new Date().toISOString(),

        // Campos calculados
        status: 'Pending',
        approvalRequired: parseFloat(formData.amountStr || '0') > 1000,

        // Metadata
        source: 'CustomFormsShowcase',
        version: '2.0.0'
      });

      console.log('Field Mapping:', fieldMapping);
      console.log('Additional Parameters:', additionalParameters);

      const response = await mockFormService.startProcess({
        processName,
        formData,
        fieldMapping,
        additionalParameters
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
                    background: mode === themeMode ? (isDark ? '#4b5563' : '#e5e7eb') : 'transparent',
                    color: isDark ? '#f9fafb' : '#111827',
                    border: \`1px solid \${isDark ? '#4b5563' : '#d1d5db'}\`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {themeMode === 'light' ? '☀️' : themeMode === 'dark' ? '🌙' : '💻'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { name: 'orange', color: '#f97316' },
                { name: 'blue', color: '#3b82f6' },
                { name: 'purple', color: '#a855f7' }
              ].map(({ name, color }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPrimaryColor(color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: color,
                    border: primaryColor === color ? '2px solid ' + (isDark ? '#fff' : '#000') : '1px solid ' + (isDark ? '#4b5563' : '#d1d5db'),
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>

      {/* PASO 1: Preparar */}
      {step === 'idle' && (
        <div className="card">
          <h2>1️⃣ {t('step1')}</h2>
          <p>Proceso: <strong>{processName}</strong></p>
          <button onClick={handlePrepareForm} className="btn-primary">
            {t('step1')}
          </button>
        </div>
      )}

      {step === 'loading' && (
        <div className="card loading">
          <div className="spinner"></div>
          <p>{t('loading')}</p>
        </div>
      )}

      {/* PASO 2: Completar Formulario */}
      {step === 'ready' && (
        <div className="card">
          <h2>2️⃣ Completar Formulario (4 campos)</h2>
          <p className="info">
            ℹ️ Nota: Solo 4 campos en el formulario, pero se enviarán 10 parámetros al proceso
          </p>

          <div className="form-grid">
            <div className="form-field">
              <label>
                Descripción del Gasto
                <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Ej: Viaje a conferencia"
              />
              <span className="field-hint">→ se enviará como "description"</span>
            </div>

            <div className="form-field">
              <label>
                Monto (en texto)
                <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.amountStr || ''}
                onChange={(e) => handleFieldChange('amountStr', e.target.value)}
                placeholder="1500.50"
              />
              <span className="field-hint transform">
                ✨ transformación → "amount" (number)
              </span>
            </div>

            <div className="form-field">
              <label>
                Categoría
                <span className="required">*</span>
              </label>
              <select
                value={formData.category || 'Travel'}
                onChange={(e) => handleFieldChange('category', e.target.value)}
              >
                <option value="Travel">Viaje</option>
                <option value="Food">Comida</option>
                <option value="Equipment">Equipamiento</option>
                <option value="Other">Otro</option>
              </select>
              <span className="field-hint">→ se enviará como "category"</span>
            </div>

            <div className="form-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.urgent || false}
                  onChange={(e) => handleFieldChange('urgent', e.target.checked)}
                />
                ¿Es urgente?
              </label>
              <span className="field-hint">→ se enviará como "urgent"</span>
            </div>
          </div>

          {/* Preview de parámetros adicionales */}
          <div className="additional-params-preview">
            <h3>🚀 Parámetros que se agregarán automáticamente (6 adicionales):</h3>
            <div className="params-grid">
              <div className="param-item">
                <span className="param-name">requestedBy</span>
                <span className="param-value">{currentUser.username}</span>
              </div>
              <div className="param-item">
                <span className="param-name">requestedDate</span>
                <span className="param-value">{new Date().toISOString().substring(0, 19)}</span>
              </div>
              <div className="param-item">
                <span className="param-name">status</span>
                <span className="param-value">Pending</span>
              </div>
              <div className="param-item calculated">
                <span className="param-name">approvalRequired</span>
                <span className="param-value">
                  {parseFloat(formData.amountStr || '0') > 1000 ? 'true' : 'false'}
                </span>
                <span className="calculated-badge">calculado</span>
              </div>
              <div className="param-item">
                <span className="param-name">source</span>
                <span className="param-value">CustomFormsShowcase</span>
              </div>
              <div className="param-item">
                <span className="param-name">version</span>
                <span className="param-value">2.0.0</span>
              </div>
            </div>
          </div>

          <div className="button-group">
            <button onClick={reset} className="btn-secondary">
              ← Volver
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              {t('submit')}
            </button>
          </div>
        </div>
      )}

      {step === 'submitting' && (
        <div className="card loading">
          <div className="spinner"></div>
          <p>{t('loading')}</p>
        </div>
      )}

      {/* PASO 3: Resultado */}
      {step === 'success' && result && (
        <div className="card success">
          <h2>✅ {t('success')}</h2>

          <div className="magic-banner">
            <h3>✨ La Magia del Field Mapping</h3>
            <div className="magic-stats">
              <div className="stat">
                <div className="stat-number">{result.formFieldsCount}</div>
                <div className="stat-label">Campos en formulario</div>
              </div>
              <div className="stat-arrow">→</div>
              <div className="stat highlight">
                <div className="stat-number">{result.totalParametersSent}</div>
                <div className="stat-label">Parámetros enviados</div>
              </div>
            </div>
          </div>

          <div className="result-details">
            <div className="detail-row">
              <span className="label">Instance ID:</span>
              <span className="value">{result.instanceId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Timestamp:</span>
              <span className="value">{new Date(result.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="parameters-sent">
            <h3>📦 Parámetros Enviados al Proceso:</h3>
            <div className="params-table">
              {Object.entries(result.parameters).map(([key, value]) => (
                <div key={key} className="param-row">
                  <span className="param-key">{key}</span>
                  <span className="param-type">
                    {typeof value === 'number' ? 'number' :
                     typeof value === 'boolean' ? 'boolean' : 'string'}
                  </span>
                  <span className="param-val">{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={reset} className="btn-primary">
            🔄 Iniciar Nuevo Proceso
          </button>
        </div>
      )}

      {error && (
        <div className="card error">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={reset} className="btn-secondary">
            Reintentar
          </button>
        </div>
      )}

      {/* Info Cards */}
      <div className="card info-card">
        <h3>🎯 Ventajas de Field Mapping</h3>
        <ul>
          <li>✅ <strong>Mapeo selectivo:</strong> Envía solo los campos necesarios</li>
          <li>✅ <strong>Transformaciones:</strong> Convierte tipos automáticamente</li>
          <li>✅ <strong>Nombres diferentes:</strong> UI "amountStr" → BPM "amount"</li>
          <li>✅ <strong>Parámetros adicionales:</strong> Auditoría sin tocar el form</li>
          <li>✅ <strong>Campos calculados:</strong> approvalRequired basado en amount</li>
        </ul>
      </div>

      <div className="card comparison-card">
        <h3>📊 Field Mapping Comparison</h3>
        <p className="info">
          ✨ Con Field Mapping: Código más limpio, transformaciones automáticas y parámetros adicionales sin esfuerzo
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <FieldMappingDemo />
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
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  min-height: 100vh;
  padding: 20px;
}

.app-container {
  max-width: 1000px;
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

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-card h1 {
  color: white;
  font-size: 32px;
  margin-bottom: 8px;
}

.header-card .subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
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
  background: #e0f2fe;
  border-left: 4px solid #0ea5e9;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  color: #075985;
  font-size: 14px;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.required {
  color: #e53e3e;
  margin-left: 4px;
}

.form-field input[type="text"],
.form-field select {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.field-hint {
  font-size: 11px;
  color: #718096;
  font-style: italic;
}

.field-hint.transform {
  color: #7c3aed;
  font-weight: 600;
}

.additional-params-preview {
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
}

.additional-params-preview h3 {
  color: #92400e;
  font-size: 14px;
  margin-bottom: 12px;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.param-item {
  background: white;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-item.calculated {
  background: #f0fdf4;
  border: 1px solid #86efac;
}

.param-name {
  font-size: 11px;
  font-weight: 600;
  color: #78350f;
}

.param-value {
  font-size: 13px;
  color: #1c1917;
  font-family: 'Courier New', monospace;
}

.calculated-badge {
  font-size: 9px;
  background: #22c55e;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 2px;
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

.magic-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.magic-banner h3 {
  color: #92400e;
  font-size: 18px;
  margin-bottom: 16px;
}

.magic-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.stat {
  background: white;
  border-radius: 8px;
  padding: 12px 24px;
}

.stat.highlight {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.stat.highlight .stat-number {
  color: white;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.stat.highlight .stat-label {
  color: rgba(255, 255, 255, 0.9);
}

.stat-arrow {
  font-size: 28px;
  color: #f59e0b;
  font-weight: 700;
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
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.label {
  font-weight: 600;
  color: #4a5568;
}

.value {
  color: #2d3748;
  font-family: 'Courier New', monospace;
}

.parameters-sent {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.parameters-sent h3 {
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 12px;
}

.params-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
}

.param-key {
  font-weight: 600;
  color: #374151;
}

.param-type {
  background: #e0e7ff;
  color: #3730a3;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
}

.param-val {
  font-family: 'Courier New', monospace;
  color: #059669;
  text-align: right;
}

.error {
  border-left: 6px solid #f56565;
}

.error h3 {
  color: #c53030;
}

.info-card {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #60a5fa;
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

.comparison-card {
  background: #fafafa;
}

.comparison-card h3 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 20px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.comparison-side {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.comparison-side h4 {
  font-size: 14px;
  margin-bottom: 12px;
  text-align: center;
}

.code-block {
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 10px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  margin-bottom: 8px;
}

.code-note {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  font-style: italic;
}`
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Example7FormSelective() {
  return (
    <RequireAuth>
      <Example7FormSelectiveContent />
    </RequireAuth>
  )
}
