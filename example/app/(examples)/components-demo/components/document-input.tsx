import { ComponentDoc } from '../all-components-docs';

export const bizuit_document_inputDoc: ComponentDoc = {
  id: 'bizuit-document-input',
  name: 'DocumentInput',
  category: 'forms',
  icon: 'Component',
  description: 'Document type selector with format validation',
  description_es: 'Campo de entrada especializado para números de documento e identificación',
  detailedDescription: 'A specialized input component for document identification numbers (DNI, Passport, CUIL, CUIT, etc.). Features automatic format validation, masked input, document type selection, and regional format support.',
  detailedDescription_es: 'Un componente de entrada optimizado para números de documento como pasaportes, licencias de conducir o números de identificación nacional. Incluye validación específica por tipo de documento, formateo automático y verificación de dígitos de control. Soporta múltiples formatos de documento internacionales.',
  useCases: [
    'User registration and KYC forms',
    'Identity verification',
    'Tax and legal document collection',
    'Employee onboarding',
    'Customer identification',
  ],
  useCases_es: [
    'Formularios de registro o verificación de identidad',
    'Formularios de checkout con validación de ID',
    'Formularios de solicitud de empleo o préstamo',
    'Sistemas de verificación de documentos',
    'Formularios de viaje o reserva que requieren información de pasaporte',
  ],
  props: [
    {
      name: 'documentType',
      type: '"DNI" | "Passport" | "CUIL" | "CUIT"',
      required: false,
      default: '"DNI"',
      description: 'Document type',
      description_es: 'Tipo de documento (passport, driverLicense, nationalId)',
    },
    {
      name: 'value',
      type: 'string',
      required: false,
      description: 'Document number',
      description_es: 'Valor del número de documento',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      required: false,
      description: 'Value change callback',
      description_es: 'Callback ejecutado cuando el valor cambia',
    },
    {
      name: 'onTypeChange',
      type: '(type: string) => void',
      required: false,
      description: 'Document type change callback',
    },
    {
      name: 'required',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Required field',
      description_es: 'Marcar el campo como requerido',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
import DocumentInput from './DocumentInput.js';
import './styles.css';

// 🌐 Contexto de Internacionalización (i18n)
const I18nContext = createContext();

const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation debe usarse dentro de I18nProvider');
  return context;
};

const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');

  const translations = {
  "es": {
    "title": "Entrada de Documento",
    "uploadDocument": "Subir documento",
    "selectFile": "Seleccionar archivo"
  },
  "en": {
    "title": "Document Input",
    "uploadDocument": "Upload document",
    "selectFile": "Select file"
  }
};

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

// 🎨 Contexto de Tema (Dark/Light/System)
const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
};

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('system');
  const [primaryColor, setPrimaryColor] = useState('#a855f7');

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
      <div className={isDark ? 'dark' : 'light'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

function App() {
  const { t, language, setLanguage } = useTranslation();
  const { mode, setMode, isDark, primaryColor, setPrimaryColor } = useTheme();

  const [docType, setDocType] = useState('dni');
  const [docNumber, setDocNumber] = useState('');

  return (
<div className="container">
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
            border: '1px solid ' + (isDark ? '#4b5563' : '#d1d5db'),
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {language === 'es' ? '🇬🇧 EN' : '🇪🇸 ES'}
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
                  border: '1px solid ' + (mode === themeMode ? primaryColor : (isDark ? '#4b5563' : '#d1d5db')),
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
              width: '40px',
              height: '32px',
              border: '1px solid ' + (isDark ? '#4b5563' : '#d1d5db'),
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Color primario"
          />
        </div>
      </div>

        <h2 className="card-title">Document Input</h2>

        <label className="form-label">Document Type</label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="form-input"
        >
          <option value="dni">DNI</option>
          <option value="passport">Passport</option>
          <option value="cuil">CUIL</option>
          <option value="cuit">CUIT</option>
        </select>

        <DocumentInput
          type={docType}
          value={docNumber}
          onChange={setDocNumber}
        />

        <p className="hint">
          Selected: {docType.toUpperCase()} - {docNumber || 'None'}
        </p>
      </div>
    </div>
  );
}

export default function AppWithProviders() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </I18nProvider>
  );
}`,
    '/DocumentInput.js': `export default function DocumentInput({ type = 'dni', value, onChange }) {
  const getPlaceholder = () => {
    switch (type) {
      case 'dni': return '12345678';
      case 'passport': return 'ABC123456';
      case 'cuil': return '20-12345678-9';
      case 'cuit': return '20-12345678-9';
      default: return 'Enter document number';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'dni': return 'DNI Number';
      case 'passport': return 'Passport Number';
      case 'cuil': return 'CUIL Number';
      case 'cuit': return 'CUIT Number';
      default: return 'Document Number';
    }
  };

  return (
    <div className="form-field">
      <label className="form-label">{getLabel()}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getPlaceholder()}
        className="form-input"
      />
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

/* Asegurar que los inputs especiales usen la misma fuente */
input[type="date"].form-input,
input[type="time"].form-input,
input[type="datetime-local"].form-input,
select.form-input {
  font-family: system-ui, -apple-system, sans-serif;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.form-checkbox input[type="checkbox"],
.form-checkbox input[type="radio"] {
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

.hint {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}`,
  },
};
