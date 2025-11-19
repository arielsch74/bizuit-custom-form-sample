'use client'

import { useState } from 'react'
import { useBizuitSDK, type IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField, Button, useBizuitAuth, BizuitCard } from '@tyconsa/bizuit-ui-components'
import { useAppTranslation } from '@/lib/useAppTranslation'
import { RequireAuth } from '@/components/require-auth'
import { LiveCodeEditor } from '@/components/live-code-editor'
import Link from 'next/link'

/**
 * EJEMPLO 6: Form Service - Continue Process with Lock Management
 *
 * Este ejemplo demuestra cómo usar el FormService para:
 * 1. Preparar un formulario de continuación con lock automático (prepareContinueForm)
 * 2. Continuar un proceso enviando TODOS los campos (continueProcess)
 * 3. Liberar locks automáticamente (releaseLock)
 *
 * VENTAJAS DEL FORM SERVICE PARA CONTINUE:
 * =========================================
 * ✅ Manejo automático de locks de instancia
 * ✅ Carga de datos de instancia + parámetros en una sola llamada
 * ✅ Conversión automática de formData a parámetros
 * ✅ Helper para liberar locks fácilmente
 *
 * VS. PROCESS SERVICE (Ejemplo 2/3):
 * ===================================
 * Process Service requiere:
 * - Llamar a getInstance() manualmente
 * - Extraer datos de variables manualmente
 * - Llamar a acquireLock() y releaseLock() manualmente
 * - Convertir formData a parámetros manualmente
 * - Más código y control manual de cada paso
 */
function Example6FormContinueContent() {
  const { t } = useAppTranslation()
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  const [instanceId, setInstanceId] = useState('')
  const [processName, setProcessName] = useState('DemoFlow')
  const [parameters, setParameters] = useState<IBizuitProcessParameter[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [lockInfo, setLockInfo] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  // Paso 1: Preparar formulario de continuación con lock
  const handlePrepareForm = async () => {
    try {
      setStatus('loading')
      setError(null)
      setResult(null)

      console.log('📋 [FormService] Preparando formulario de continuación:', {
        instanceId,
        processName
      })

      // ✨ FormService.prepareContinueForm() hace TODO:
      // - Llama a getInstance() internamente
      // - Adquiere lock automáticamente (si autoLock: true)
      // - Extrae variables y parámetros
      // - Prepara formData con valores actuales
      const prepared = await sdk.forms.prepareContinueForm({
        instanceId,
        processName,
        autoLock: true, // ✨ Lock automático
        token
      })

      console.log('✅ [FormService] Formulario preparado:', {
        parametersCount: prepared.parameters.length,
        lockAcquired: !!prepared.lockInfo,
        sessionToken: prepared.lockInfo?.sessionToken
      })

      setParameters(prepared.parameters)
      setFormData(prepared.formData)
      setLockInfo(prepared.lockInfo)
      setStatus('ready')
    } catch (error: any) {
      console.error('❌ Error preparando formulario:', error)
      setError(error.message || 'Error al preparar formulario')
      setStatus('error')
    }
  }

  // Paso 2: Continuar proceso
  const handleSubmit = async () => {
    try {
      setStatus('submitting')
      setError(null)

      console.log('📤 [FormService] Continuando proceso:', {
        instanceId,
        processName,
        formData
      })

      // ✨ FormService.continueProcess() simplifica:
      // - Convierte formData a parámetros automáticamente
      // - Envía todo en una sola llamada
      const response = await sdk.forms.continueProcess({
        instanceId,
        processName,
        formData, // ✨ TODOS los campos automáticamente
        token
      })

      console.log('✅ [FormService] Proceso continuado:', response)

      setResult(response)
      setStatus('success')

      // Liberar lock automáticamente después del éxito
      if (lockInfo?.sessionToken) {
        await handleReleaseLock()
      }
    } catch (error: any) {
      console.error('❌ Error continuando proceso:', error)
      setError(error.message || 'Error al continuar proceso')
      setStatus('error')
    }
  }

  // Liberar lock manualmente
  const handleReleaseLock = async () => {
    if (!lockInfo?.sessionToken) return

    try {
      console.log('🔓 [FormService] Liberando lock...')

      await sdk.forms.releaseLock({
        instanceId,
        activityName: lockInfo.activityName || 'default',
        sessionToken: lockInfo.sessionToken,
        token
      })

      console.log('✅ [FormService] Lock liberado')
      setLockInfo(null)
    } catch (error: any) {
      console.error('❌ Error liberando lock:', error)
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
        <h1 className="text-4xl font-bold mb-2">{t('example6.title')}</h1>
        <p className="text-gray-600 text-lg">
          {t('example6.subtitle')}
        </p>
      </div>

      <div className="space-y-8">
        {/* Info Card */}
        <BizuitCard
          title={t('example6.lock.title')}
          description={t('example6.lock.description')}
        >
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{t('example6.advantages.title')}</h3>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>• {t('example6.advantages.item1')}</li>
              <li>• {t('example6.advantages.item2')}</li>
              <li>• {t('example6.advantages.item3')}</li>
              <li>• {t('example6.advantages.item4')}</li>
              <li>• {t('example6.advantages.item5')}</li>
            </ul>
          </div>
        </BizuitCard>

        {/* Código de ejemplo */}
        <BizuitCard
          title={t('example6.code.title')}
          description={t('example6.code.description')}
        >
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm"><code>{`// 1️⃣ Preparar formulario con lock automático
const { parameters, formData, lockInfo } =
  await sdk.forms.prepareContinueForm({
    instanceId: '123-456',
    processName: 'ExpenseRequest',
    autoLock: true, // ✨ Adquiere lock automáticamente
    token
  })

// FormService hace automáticamente:
// - getInstance(instanceId, token)
// - acquireLock(instanceId, activityName, token)
// - Extrae variables y parámetros
// - Convierte a formData

// 2️⃣ Continuar proceso
const result = await sdk.forms.continueProcess({
  instanceId,
  processName,
  formData, // ✨ Conversión automática
  token
})

// 3️⃣ Liberar lock
await sdk.forms.releaseLock({
  instanceId,
  activityName: lockInfo.activityName,
  sessionToken: lockInfo.sessionToken,
  token
})`}</code></pre>
          </div>
        </BizuitCard>

        {/* Live Code Editor */}
        <div className="mb-8">
          <LiveCodeEditor
            title={t('example6.playground.title')}
            description={t('example6.playground.description')}
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
      title: 'Demo de Gestión de Locks',
      subtitle: 'Edición segura de instancias con locks automáticos',
      step1: 'Cargar Instancia y Adquirir Lock',
      step2: 'Actualizar Datos',
      step3: 'Liberar Lock',
      loadingInstance: 'Cargando instancia...',
      updatingProcess: 'Actualizando proceso...',
      releasingLock: 'Liberando lock...',
      processUpdated: 'Proceso Actualizado Exitosamente',
      lockReleased: 'Lock Liberado',
      submit: 'Actualizar Proceso',
      release: 'Liberar Lock',
      startNew: 'Cargar Nueva Instancia',
      lockInfo: 'Información del Lock',
      whyLocks: '¿Por qué usar Locks?',
      preventConflicts: 'Previene conflictos: Solo un usuario puede editar la instancia a la vez',
      dataConsistency: 'Consistencia de datos: Garantiza que los cambios no se sobrescriban',
      autoManagement: 'Gestión automática: FormService maneja todo con autoLock: true'
    },
    en: {
      title: 'Lock Management Demo',
      subtitle: 'Secure instance editing with automatic locks',
      step1: 'Load Instance and Acquire Lock',
      step2: 'Update Data',
      step3: 'Release Lock',
      loadingInstance: 'Loading instance...',
      updatingProcess: 'Updating process...',
      releasingLock: 'Releasing lock...',
      processUpdated: 'Process Updated Successfully',
      lockReleased: 'Lock Released',
      submit: 'Update Process',
      release: 'Release Lock',
      startNew: 'Load New Instance',
      lockInfo: 'Lock Information',
      whyLocks: 'Why Use Locks?',
      preventConflicts: 'Prevents conflicts: Only one user can edit the instance at a time',
      dataConsistency: 'Data consistency: Ensures changes are not overwritten',
      autoManagement: 'Automatic management: FormService handles everything with autoLock: true'
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
 * 🔒 FORM SERVICE - LOCK MANAGEMENT & CONTINUE PROCESS
 *
 * FormService simplifica el manejo de locks de instancia:
 * - prepareContinueForm() obtiene instancia + adquiere lock automáticamente
 * - continueProcess() actualiza la instancia con nuevos datos
 * - releaseLock() libera el lock cuando terminas
 *
 * ¿Por qué son importantes los locks?
 * - Previenen edición concurrente (dos usuarios editando la misma instancia)
 * - Garantizan consistencia de datos
 * - FormService los maneja automáticamente si usas autoLock: true
 */

// 🔧 Mock del SDK FormService para demostración
const mockFormService = {
  /**
   * prepareContinueForm(): Carga instancia y adquiere lock
   * - Obtiene datos de la instancia
   * - Adquiere lock automáticamente (si autoLock: true)
   * - Prepara formData con valores actuales
   */
  prepareContinueForm: async ({ instanceId, processName, autoLock }) => {
    await new Promise(r => setTimeout(r, 1000));

    // Simular datos de instancia existente
    const mockInstance = {
      instanceId: instanceId,
      processName: processName,
      status: 'InProgress',
      createdDate: '2025-01-15T10:30:00Z',
      variables: [
        { name: 'orderNumber', value: 'ORD-12345' },
        { name: 'customerName', value: 'Juan Pérez' },
        { name: 'amount', value: 1500.50 },
        { name: 'status', value: 'Pending Approval' },
        { name: 'notes', value: '' }
      ]
    };

    // Simular parámetros del proceso
    const mockParameters = [
      { name: 'orderNumber', dataType: 'string', value: 'ORD-12345', required: true },
      { name: 'customerName', dataType: 'string', value: 'Juan Pérez', required: true },
      { name: 'amount', dataType: 'number', value: 1500.50, required: true },
      { name: 'status', dataType: 'string', value: 'Pending Approval', required: true },
      { name: 'notes', dataType: 'string', value: '', required: false }
    ];

    // Crear formData con valores actuales
    const formData = {};
    mockInstance.variables.forEach(v => {
      formData[v.name] = v.value;
    });

    // Simular lock adquirido
    const lockInfo = autoLock ? {
      sessionToken: \`LOCK-\${Math.random().toString(36).substr(2, 9)}\`,
      activityName: 'ReviewOrder',
      acquiredAt: new Date().toISOString()
    } : null;

    return {
      instance: mockInstance,
      parameters: mockParameters,
      formData: formData,
      lockInfo: lockInfo
    };
  },

  /**
   * continueProcess(): Continúa la ejecución del proceso
   * - Actualiza la instancia con nuevos valores
   * - Mantiene el lock activo hasta releaseLock()
   */
  continueProcess: async ({ instanceId, processName, formData }) => {
    await new Promise(r => setTimeout(r, 1200));

    return {
      success: true,
      instanceId: instanceId,
      processName: processName,
      updatedFields: Object.keys(formData),
      nextActivity: 'ManagerApproval',
      timestamp: new Date().toISOString()
    };
  },

  /**
   * releaseLock(): Libera el lock de la instancia
   * - Permite que otros usuarios puedan editar
   * - IMPORTANTE: Siempre liberar locks al terminar
   */
  releaseLock: async ({ instanceId, sessionToken }) => {
    await new Promise(r => setTimeout(r, 500));

    return {
      success: true,
      instanceId: instanceId,
      releasedAt: new Date().toISOString()
    };
  }
};

function LockManagementDemo() {
  const { t, language, setLanguage } = useTranslation();
  const { mode, setMode, isDark, primaryColor, setPrimaryColor } = useTheme();

  const [instanceId] = useState('INST-abc123xyz');
  const [processName] = useState('OrderApproval');
  const [step, setStep] = useState('idle'); // idle, loading, ready, submitting, success, releasing

  const [instance, setInstance] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [formData, setFormData] = useState({});
  const [lockInfo, setLockInfo] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * PASO 1: Preparar formulario Y adquirir lock
   * ✨ prepareContinueForm() hace TODO en una llamada
   */
  const handlePrepareForm = async () => {
    try {
      setStep('loading');
      setError(null);

      console.log('📋 [FormService] Cargando instancia y adquiriendo lock...');

      // ✨ prepareContinueForm() hace TODO:
      // 1. Obtiene datos de la instancia
      // 2. Adquiere lock automáticamente (autoLock: true)
      // 3. Prepara formData con valores actuales
      const prepared = await mockFormService.prepareContinueForm({
        instanceId: instanceId,
        processName: processName,
        autoLock: true // ✨ Lock automático
      });

      console.log('✅ Formulario preparado con lock:', prepared);

      setInstance(prepared.instance);
      setParameters(prepared.parameters);
      setFormData(prepared.formData);
      setLockInfo(prepared.lockInfo);
      setStep('ready');
    } catch (err) {
      setError(err.message);
      setStep('idle');
    }
  };

  /**
   * PASO 2: Actualizar instancia (continuar proceso)
   * Lock se mantiene activo durante la edición
   */
  const handleContinueProcess = async () => {
    try {
      setStep('submitting');
      setError(null);

      console.log('📤 [FormService] Continuando proceso...', formData);

      // Actualizar instancia
      const response = await mockFormService.continueProcess({
        instanceId: instanceId,
        processName: processName,
        formData: formData
      });

      console.log('✅ Proceso actualizado:', response);

      setResult(response);
      setStep('success');
    } catch (err) {
      setError(err.message);
      setStep('ready');
    }
  };

  /**
   * PASO 3: Liberar lock
   * ⚠️ IMPORTANTE: Siempre liberar locks al terminar
   */
  const handleReleaseLock = async () => {
    try {
      setStep('releasing');

      console.log('🔓 [FormService] Liberando lock...', lockInfo?.sessionToken);

      await mockFormService.releaseLock({
        instanceId: instanceId,
        sessionToken: lockInfo?.sessionToken
      });

      console.log('✅ Lock liberado exitosamente');

      // Reset completo
      setStep('idle');
      setInstance(null);
      setParameters([]);
      setFormData({});
      setLockInfo(null);
      setResult(null);
    } catch (err) {
      setError(err.message);
      setStep('success');
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
    setInstance(null);
    setParameters([]);
    setFormData({});
    setLockInfo(null);
    setResult(null);
    setError(null);
  };

  // Calcular tiempo de lock activo
  const getLockDuration = () => {
    if (!lockInfo?.acquiredAt) return '0s';
    const seconds = Math.floor((Date.now() - new Date(lockInfo.acquiredAt).getTime()) / 1000);
    return \`\${seconds}s\`;
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

        <h1>🔒 {t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>

      {/* Lock Status Badge */}
      {lockInfo && step !== 'releasing' && (
        <div className="card lock-status">
          <div className="lock-badge active">
            <span className="lock-icon">🔒</span>
            <div>
              <div className="lock-text">{t('lockInfo')}</div>
              <div className="lock-details">
                Session: {lockInfo.sessionToken?.substr(0, 12)}...
                <br />
                Actividad: {lockInfo.activityName}
                <br />
                Duración: {getLockDuration()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PASO 1: Cargar instancia y adquirir lock */}
      {step === 'idle' && (
        <div className="card">
          <h2>1️⃣ {t('step1')}</h2>
          <div className="instance-info">
            <div className="info-row">
              <span className="label">Instance ID:</span>
              <span className="value">{instanceId}</span>
            </div>
            <div className="info-row">
              <span className="label">Proceso:</span>
              <span className="value">{processName}</span>
            </div>
          </div>
          <button
            onClick={handlePrepareForm}
            className="btn-primary"
            style={{ background: primaryColor }}
          >
            Cargar con prepareContinueForm(autoLock: true)
          </button>
          <p className="hint">
            ✨ prepareContinueForm() adquirirá el lock automáticamente
          </p>
        </div>
      )}

      {step === 'loading' && (
        <div className="card loading">
          <div className="spinner"></div>
          <p>{t('loadingInstance')}</p>
        </div>
      )}

      {/* PASO 2: Editar formulario (lock activo) */}
      {step === 'ready' && (
        <div className="card">
          <h2>2️⃣ {t('step2')}</h2>
          <p className="info">
            🔒 Lock activo - Tienes control exclusivo de esta instancia
          </p>

          {/* Instance Details */}
          <div className="instance-details">
            <h3>📋 Información de la Instancia</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Estado:</span>
                <span className="badge status-pending">{instance?.status}</span>
              </div>
              <div className="detail-item">
                <span className="label">Creada:</span>
                <span className="value">{new Date(instance?.createdDate).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
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
                  placeholder={param.name === 'notes' ? 'Agregar notas de actualización...' : ''}
                />
              </div>
            ))}
          </div>

          <div className="button-group">
            <button onClick={reset} className="btn-secondary">
              ❌ Cancelar (libera lock)
            </button>
            <button
              onClick={handleContinueProcess}
              className="btn-primary"
              style={{ background: primaryColor }}
            >
              ✅ Continuar Proceso
            </button>
          </div>
        </div>
      )}

      {step === 'submitting' && (
        <div className="card loading">
          <div className="spinner"></div>
          <p>Actualizando instancia...</p>
        </div>
      )}

      {/* PASO 3: Éxito - Liberar lock */}
      {step === 'success' && result && (
        <div className="card success">
          <h2>✅ Instancia Actualizada</h2>

          <div className="result-details">
            <div className="detail-row">
              <span className="label">Instance ID:</span>
              <span className="value">{result.instanceId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Siguiente Actividad:</span>
              <span className="badge status-active">{result.nextActivity}</span>
            </div>
            <div className="detail-row">
              <span className="label">Campos Actualizados:</span>
              <span className="value">{result.updatedFields.length} campos</span>
            </div>
            <div className="detail-row">
              <span className="label">Timestamp:</span>
              <span className="value">{new Date(result.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="preview">
            <h3>📦 Datos enviados:</h3>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>

          <div className="warning-box">
            <strong>⚠️ Lock aún activo</strong>
            <p>Debes liberar el lock para que otros usuarios puedan editar esta instancia</p>
          </div>

          <button onClick={handleReleaseLock} className="btn-danger">
            🔓 Liberar Lock con releaseLock()
          </button>
        </div>
      )}

      {step === 'releasing' && (
        <div className="card loading">
          <div className="spinner"></div>
          <p>Liberando lock...</p>
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
        <h3>🔒 ¿Por qué usar Locks?</h3>
        <ul>
          <li>✅ <strong>Previene conflictos:</strong> Solo un usuario puede editar a la vez</li>
          <li>✅ <strong>Consistencia:</strong> Evita sobrescritura de cambios</li>
          <li>✅ <strong>Automático:</strong> FormService maneja acquire/release por ti</li>
          <li>✅ <strong>Seguro:</strong> Los locks expiran automáticamente si el usuario se desconecta</li>
        </ul>
      </div>

      <div className="card info-card workflow">
        <h3>📋 Workflow de Lock Management</h3>
        <div className="workflow-steps">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>prepareContinueForm(autoLock: true)</strong>
              <p>Carga instancia + Adquiere lock</p>
            </div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Usuario edita formulario</strong>
              <p>Lock activo, edición exclusiva</p>
            </div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>continueProcess(formData)</strong>
              <p>Actualiza instancia</p>
            </div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <strong>releaseLock()</strong>
              <p>Libera para otros usuarios</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <LockManagementDemo />
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

.app-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white !important;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.card h1 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827 !important;
}

.card h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #111827 !important;
}

.card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151 !important;
}

.subtitle {
  font-size: 14px;
  color: #6b7280 !important;
  margin-bottom: 24px;
}

.lock-status {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  padding: 16px;
}

.lock-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lock-icon {
  font-size: 32px;
}

.lock-text {
  font-weight: 700;
  font-size: 16px;
  color: #92400e;
}

.lock-details {
  font-size: 12px;
  color: #78350f;
  margin-top: 4px;
  line-height: 1.5;
}

.instance-info {
  background: #f7fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-row,
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.label {
  font-weight: 600;
  color: #4a5568;
}

.value {
  color: #2d3748;
  font-family: 'Courier New', monospace;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.instance-details {
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  color: #1e40af;
}

.hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
  text-align: center;
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

.form-field input,
.form-field textarea {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #f5576c;
  box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
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

.warning-box {
  background: #fef2f2;
  border: 2px solid #f87171;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.warning-box strong {
  color: #991b1b;
  display: block;
  margin-bottom: 8px;
}

.warning-box p {
  color: #7f1d1d;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn-primary,
.btn-secondary,
.btn-danger {
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
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

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  width: 100%;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.loading {
  text-align: center;
  padding: 40px;
  background: #f7fafc;
}

.spinner {
  border: 4px solid #e2e8f0;
  border-top: 4px solid #f5576c;
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

.workflow {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
}

.workflow h3 {
  color: #92400e;
}

.workflow-steps {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.workflow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 200px;
  flex: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #f59e0b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 8px;
}

.step-content {
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.step-content strong {
  display: block;
  font-size: 11px;
  color: #111827;
  margin-bottom: 6px;
  font-weight: 700;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.step-content p {
  font-size: 10px;
  color: #374151;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.workflow-arrow {
  font-size: 24px;
  color: #f59e0b;
  flex-shrink: 0;
  align-self: center;
  margin-top: 40px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #374151 !important;
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
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
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

body.dark .card h1,
body.dark .card h2,
body.dark .card h3 {
  color: #f9fafb !important;
}

body.dark .subtitle {
  color: #9ca3af !important;
}

body.dark .form-label {
  color: #d1d5db !important;
}

body.dark .form-input,
body.dark .form-field input,
body.dark .form-field textarea {
  background: #374151 !important;
  border-color: #4b5563 !important;
  color: #f9fafb !important;
}

body.dark .form-input:focus,
body.dark .form-field input:focus,
body.dark .form-field textarea:focus {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
}

body.dark .instance-info {
  background: #374151 !important;
}

body.dark .label {
  color: #d1d5db !important;
}

body.dark .value {
  color: #e5e7eb !important;
}

body.dark .instance-details {
  background: #1e3a8a !important;
  border-left-color: #60a5fa !important;
}

body.dark .info {
  background: #1e3a8a !important;
  border-left-color: #60a5fa !important;
  color: #dbeafe !important;
}

body.dark .preview {
  background: #111827 !important;
  border-color: #374151 !important;
}

body.dark .preview h3 {
  color: #e5e7eb !important;
}

body.dark .preview pre {
  background: #0f172a !important;
  color: #e5e7eb !important;
}

body.dark .lock-status {
  background: linear-gradient(135deg, #92400e 0%, #78350f 100%) !important;
  border-color: #f59e0b !important;
}

body.dark .lock-text {
  color: #fef3c7 !important;
}

body.dark .lock-details {
  color: #fde68a !important;
}

body.dark .info-card {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%) !important;
  border-color: #3b82f6 !important;
}

body.dark .info-card h3 {
  color: #dbeafe !important;
}

body.dark .info-card li {
  color: #bfdbfe !important;
}

body.dark .info-card strong {
  color: #dbeafe !important;
}

body.dark .workflow {
  background: linear-gradient(135deg, #92400e 0%, #78350f 100%) !important;
  border-color: #f59e0b !important;
}

body.dark .workflow h3 {
  color: #fef3c7 !important;
}

body.dark .step-content {
  background: #374151 !important;
}

body.dark .step-content strong {
  color: #f9fafb !important;
}

body.dark .step-content p {
  color: #d1d5db !important;
}

body.dark .loading {
  background: #1f2937 !important;
}`
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Example6FormContinue() {
  return (
    <RequireAuth>
      <Example6FormContinueContent />
    </RequireAuth>
  )
}
