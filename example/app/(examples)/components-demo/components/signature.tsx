import { ComponentDoc } from '../all-components-docs';

export const bizuit_signatureDoc: ComponentDoc = {
  id: 'bizuit-signature',
  name: 'Signature',
  category: 'forms',
  icon: 'Component',
  description: 'Canvas-based signature capture component',
  description_es: 'Canvas de firma digital con funcionalidad de dibujo táctil',
  detailedDescription: 'A digital signature component using HTML5 Canvas for capturing handwritten signatures. Features include clear/redo functionality, signature export as image, pen color and width customization, and touch/mouse support.',
  detailedDescription_es: 'Un componente de pad de firma que permite a los usuarios dibujar firmas usando mouse, touch o stylus. Incluye botones de borrar/limpiar, exportación de imagen de firma y detección de firma vacía. Optimizado para dispositivos táctiles con suavizado de trazo y renderizado responsive.',
  useCases: [
    'Contract and agreement signing',
    'Delivery confirmations',
    'Medical consent forms',
    'Legal document execution',
    'Authentication workflows',
  ],
  useCases_es: [
    'Campos de firma de documentos legales',
    'Confirmaciones de entrega y recibo',
    'Firmas de consentimiento médico',
    'Procesos de aprobación que requieren firma',
    'Formularios de acuerdo de contrato',
  ],
  props: [
    {
      name: 'onSave',
      type: '(signature: string) => void',
      required: true,
      description: 'Save callback with base64 image',
      description_es: 'Callback ejecutado cuando se guarda la firma',
    },
    {
      name: 'onClear',
      type: '() => void',
      required: false,
      description: 'Clear callback',
    },
    {
      name: 'penColor',
      type: 'string',
      required: false,
      default: '"#000000"',
      description: 'Pen color',
    },
    {
      name: 'penWidth',
      type: 'number',
      required: false,
      default: '2',
      description: 'Pen stroke width',
    },
    {
      name: 'primaryColor',
      type: 'string',
      required: false,
      default: '"#f97316"',
      description: 'Primary color for buttons',
      description_es: 'Color primario para botones',
    },
    {
      name: 'width',
      type: 'number',
      required: false,
      default: '500',
      description: 'Canvas width',
      description_es: 'Ancho del canvas de firma',
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      default: '200',
      description: 'Canvas height',
      description_es: 'Alto del canvas de firma',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
import Signature from './Signature.js';
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
    "title": "Firma Digital",
    "sign": "Firmar",
    "clear": "Limpiar",
    "save": "Guardar",
    "signatureCaptured": "Firma capturada",
    "drawSignature": "Dibuja tu firma arriba",
    "signatureSuccess": "✓ Firma Capturada",
    "clickToSign": 'Haz clic en el botón "Firmar" para simular la firma'
  },
  "en": {
    "title": "Digital Signature",
    "sign": "Sign",
    "clear": "Clear",
    "save": "Save",
    "signatureCaptured": "Signature captured",
    "drawSignature": "Draw your signature above",
    "signatureSuccess": "✓ Signature Captured",
    "clickToSign": 'Click "Sign" button to simulate signature'
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

  const [signature, setSignature] = useState('');

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

        <h2 className="card-title">{t('title')}</h2>
        <Signature
          value={signature}
          onChange={setSignature}
          t={t}
          primaryColor={primaryColor}
        />
        <p className="hint">
          {signature ? t('signatureCaptured') : t('drawSignature')}
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
    '/Signature.js': `export default function Signature({ value, onChange, t, primaryColor = '#f97316' }) {
  const handleClear = () => {
    onChange('');
  };

  const handleSign = () => {
    onChange('SIGNED_' + Date.now());
  };

  const getPrimaryColorDark = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return '#' + [r * 0.85 | 0, g * 0.85 | 0, b * 0.85 | 0].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  return (
    <div className="form-field">
      <div
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: '6px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value ? (
          <div style={{ fontSize: '24px', fontFamily: 'cursive', color: '#374151' }}>
            {t('signatureSuccess')}
          </div>
        ) : (
          <div style={{ color: '#9ca3af' }}>
            {t('clickToSign')}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          onClick={handleSign}
          className="btn-primary"
          style={{ background: primaryColor }}
          onMouseEnter={(e) => e.target.style.background = getPrimaryColorDark(primaryColor)}
          onMouseLeave={(e) => e.target.style.background = primaryColor}
        >
          ✍️ {t('sign')}
        </button>
        <button onClick={handleClear} className="btn-secondary">
          {t('clear')}
        </button>
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
  background: #f9fafb !important;
  color: #1f2937 !important;
  padding: 20px;
  transition: background 0.3s, color 0.3s;
}

body.dark {
  background: #0f172a !important;
  color: #f1f5f9 !important;
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
  transition: background 0.3s, box-shadow 0.3s;
}

body.dark .card {
  background: #1e293b !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827 !important;
  transition: color 0.3s;
}

body.dark .card-title {
  color: #f1f5f9 !important;
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
