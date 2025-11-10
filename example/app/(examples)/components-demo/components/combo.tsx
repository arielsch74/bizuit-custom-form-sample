import { ComponentDoc } from '../all-components-docs';

export const bizuit_comboDoc: ComponentDoc = {
  id: 'bizuit-combo',
  name: 'Combo',
  category: 'forms',
  icon: 'Component',
  description: 'Searchable dropdown component with autocomplete functionality',
  description_es: 'Componente de lista desplegable con búsqueda y funcionalidad de autocompletado',
  detailedDescription: 'A powerful combo box component that combines a text input with a dropdown menu. Features include real-time search filtering, keyboard navigation, custom option rendering, and support for large datasets. Ideal for form fields requiring selection from a predefined list with search capability.',
  detailedDescription_es: 'Un componente combobox sofisticado que combina un campo de entrada con una lista desplegable. Incluye búsqueda en tiempo real, filtrado de opciones y navegación por teclado. Ideal para selecciones donde los usuarios necesitan buscar entre muchas opciones o pueden no recordar el valor exacto.',
  useCases: [
    'Country, state, or city selectors',
    'Product or category search',
    'User or team member selection',
    'Tag or label assignment',
    'Command palette interfaces',
  ],
  useCases_es: [
    'Selección de países, estados o ciudades',
    'Búsqueda y selección de productos',
    'Selección de categorías o etiquetas con muchas opciones',
    'Autocompletado de nombres de usuario o direcciones de email',
    'Selección de códigos o identificadores con búsqueda',
  ],
  props: [
    {
      name: 'options',
      type: 'Array<{value: string, label: string}>',
      required: true,
      description: 'Array of selectable options',
      description_es: 'Array de opciones disponibles para selección',
    },
    {
      name: 'value',
      type: 'string',
      required: false,
      description: 'Currently selected value',
      description_es: 'Valor seleccionado actualmente',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      required: false,
      description: 'Callback when selection changes',
      description_es: 'Callback ejecutado cuando la selección cambia',
    },
    {
      name: 'placeholder',
      type: 'string',
      required: false,
      default: '"Select..."',
      description: 'Placeholder text',
      description_es: 'Texto de placeholder cuando no hay valor seleccionado',
    },
    {
      name: 'searchable',
      type: 'boolean',
      required: false,
      default: 'true',
      description: 'Enable search filtering',
      description_es: 'Habilitar funcionalidad de búsqueda',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
import Combo from './Combo.js';
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
    es: {
      title: 'Seleccionar un País',
      placeholder: 'Elige un país...',
      selected: 'Seleccionado',
      none: 'Ninguno',
      countries: {
        ar: 'Argentina',
        br: 'Brasil',
        cl: 'Chile',
        mx: 'México',
        us: 'Estados Unidos'
      }
    },
    en: {
      title: 'Select a Country',
      placeholder: 'Choose a country...',
      selected: 'Selected',
      none: 'None',
      countries: {
        ar: 'Argentina',
        br: 'Brazil',
        cl: 'Chile',
        mx: 'Mexico',
        us: 'United States'
      }
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
  const [selected, setSelected] = useState('');

  const countries = [
    { label: t('countries.ar'), value: 'ar' },
    { label: t('countries.br'), value: 'br' },
    { label: t('countries.cl'), value: 'cl' },
    { label: t('countries.mx'), value: 'mx' },
    { label: t('countries.us'), value: 'us' },
  ];

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
              border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
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
                    border: `1px solid ${mode === themeMode ? primaryColor : (isDark ? '#4b5563' : '#d1d5db')}`,
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
                border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Color primario"
            />
          </div>
        </div>

        <h2 className="card-title">{t('title')}</h2>
        <Combo
          options={countries}
          value={selected}
          onChange={setSelected}
          placeholder={t('placeholder')}
        />
        <p className="hint">{t('selected')}: {selected || t('none')}</p>
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
    '/Combo.js': `export default function Combo({ options, value, onChange, placeholder = 'Select...' }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-input"
        style={{ cursor: 'pointer' }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
  color: #374151 !important;
  transition: color 0.3s;
}

body.dark .form-label {
  color: #cbd5e1 !important;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db !important;
  border-radius: 6px;
  font-size: 14px;
  font-family: system-ui, -apple-system, sans-serif;
  background: white !important;
  color: #1f2937 !important;
  transition: border-color 0.2s, background 0.3s, color 0.3s;
}

body.dark .form-input {
  background: #334155 !important;
  border-color: #475569 !important;
  color: #f1f5f9 !important;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

body.dark .form-input:focus {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2) !important;
}

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
  color: #374151;
  transition: color 0.3s;
}

body.dark .form-checkbox label {
  color: #cbd5e1;
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

body.dark .btn-secondary {
  background: #374151;
  color: #f9fafb;
  border-color: #4b5563;
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

body.dark .btn-secondary:hover {
  background: #4b5563;
  border-color: #6b7280;
}

.hint {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280 !important;
  line-height: 1.5;
  transition: color 0.3s;
}

body.dark .hint {
  color: #94a3b8 !important;
}`,
  },
};
