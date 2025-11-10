import { ComponentDoc } from '../all-components-docs';

export const dynamic_form_fieldDoc: ComponentDoc = {
  id: 'dynamic-form-field',
  name: 'DynamicFormField',
  category: 'forms',
  icon: 'Component',
  description: 'Dynamic form field renderer based on field type',
  description_es: 'Campo de formulario adaptable que cambia tipo según configuración',
  detailedDescription: 'A flexible form field component that dynamically renders different input types (text, number, email, select, checkbox, etc.) based on configuration. Perfect for building dynamic forms from JSON schemas or API responses.',
  detailedDescription_es: 'Un componente de campo de formulario altamente flexible que puede renderizar diferentes tipos de entrada (text, number, select, checkbox, etc.) basado en configuración. Incluye validación integrada, manejo de errores y formateo automático. Ideal para formularios generados dinámicamente o sistemas de construcción de formularios.',
  useCases: [
    'Form builders and generators',
    'Survey and questionnaire systems',
    'Settings and configuration UIs',
    'Custom field management',
    'Admin panels with dynamic schemas',
  ],
  useCases_es: [
    'Constructores de formularios de administración',
    'Sistemas de configuración dinámica',
    'Formularios generados por esquema o API',
    'Formularios de metadatos personalizables',
    'Sistemas multi-tenant con campos variables',
  ],
  props: [
    {
      name: 'type',
      type: '"text" | "number" | "email" | "select" | "checkbox" | "textarea"',
      required: true,
      description: 'Field type',
    },
    {
      name: 'label',
      type: 'string',
      required: true,
      description: 'Field label',
      description_es: 'Etiqueta del campo',
    },
    {
      name: 'value',
      type: 'any',
      required: false,
      description: 'Field value',
      description_es: 'Valor actual del campo',
    },
    {
      name: 'onChange',
      type: '(value: any) => void',
      required: false,
      description: 'Value change callback',
      description_es: 'Callback ejecutado cuando el valor cambia',
    },
    {
      name: 'options',
      type: 'Array<{value: string, label: string}>',
      required: false,
      description: 'Options for select fields',
      description_es: 'Opciones para campos de tipo select',
    },
    {
      name: 'required',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Required field',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
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
    "title": "Campo de Formulario Dinámico",
    "fieldName": "Nombre del campo",
    "fieldValue": "Valor del campo"
  },
  "en": {
    "title": "Dynamic Form Field",
    "fieldName": "Field name",
    "fieldValue": "Field value"
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

        <h2 className="card-title">Dynamic Form Fields</h2>
        {fields.map((field) => (
          <DynamicFormField
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(value) => setValues({ ...values, [field.name]: value })}
          />
        ))}
        <p className="hint">
          Values: {JSON.stringify(values, null, 2)}
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
    '/DynamicFormField.js': `export default function DynamicFormField({ field, value, onChange }) {
  const renderInput = () => {
    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form-input"
        >
          <option value="">Select {field.label}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="form-input"
      />
    );
  };

  return (
    <div className="form-field">
      <label className="form-label">{field.label}</label>
      {renderInput()}
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
