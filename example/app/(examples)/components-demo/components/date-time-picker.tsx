import { ComponentDoc } from '../all-components-docs';

export const bizuit_date_time_pickerDoc: ComponentDoc = {
  id: 'bizuit-date-time-picker',
  name: 'DateTimePicker',
  category: 'forms',
  icon: 'Calendar',
  description: 'Combined date and time selection component',
  description_es: 'Selector de fecha y hora con interfaz de calendario',
  detailedDescription: 'An intuitive date and time picker that supports date-only, time-only, or combined datetime selection. Features calendar view, time input with validation, timezone support, and various date formats. Includes keyboard navigation and accessibility features.',
  detailedDescription_es: 'Un componente completo de selección de fecha y hora que soporta selección de solo fecha, solo hora, o fecha y hora combinadas. Incluye una interfaz de calendario intuitiva con navegación por mes/año, validación de entrada y formateo de fechas. Construido pensando en la accesibilidad con soporte completo de teclado.',
  useCases: [
    'Event scheduling and calendar apps',
    'Booking and reservation systems',
    'Task deadline management',
    'Meeting and appointment scheduling',
    'Time-based filters and reports',
  ],
  useCases_es: [
    'Formularios de reserva y agendamiento',
    'Filtros de rango de fechas en dashboards',
    'Campos de fecha de nacimiento o aniversario',
    'Selección de fecha de inicio/fin de eventos',
    'Campos de timestamp en sistemas de registro',
  ],
  props: [
    {
      name: 'value',
      type: 'Date | string',
      required: false,
      description: 'Selected date/time value',
      description_es: 'Valor de fecha seleccionado actualmente',
    },
    {
      name: 'onChange',
      type: '(value: Date) => void',
      required: false,
      description: 'Callback when date/time changes',
      description_es: 'Callback ejecutado cuando la fecha cambia',
    },
    {
      name: 'mode',
      type: '"date" | "time" | "datetime"',
      required: false,
      default: '"datetime"',
      description: 'Picker mode',
      description_es: 'Modo de selección (date, time, datetime)',
    },
    {
      name: 'minDate',
      type: 'Date',
      required: false,
      description: 'Minimum selectable date',
      description_es: 'Fecha mínima seleccionable',
    },
    {
      name: 'maxDate',
      type: 'Date',
      required: false,
      description: 'Maximum selectable date',
      description_es: 'Fecha máxima seleccionable',
    },
    {
      name: 'format',
      type: 'string',
      required: false,
      default: '"MM/DD/YYYY HH:mm"',
      description: 'Display format',
      description_es: 'Formato de visualización de fecha',
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
    "title": "Selector de Fecha y Hora",
    "selectDate": "Seleccionar fecha",
    "selectTime": "Seleccionar hora"
  },
  "en": {
    "title": "Date Time Picker",
    "selectDate": "Select date",
    "selectTime": "Select time"
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
            border: \`1px solid ${isDark ? '#4b5563' : '#d1d5db'}\`,
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
                  border: \`1px solid ${mode === themeMode ? primaryColor : (isDark ? '#4b5563' : '#d1d5db')}\`,
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
              border: \`1px solid ${isDark ? '#4b5563' : '#d1d5db'}\`,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Color primario"
          />
        </div>
      </div>

        <h2 className="card-title">Date Picker</h2>
        <DateTimePicker
          type="date"
          value={date}
          onChange={setDate}
        />
        <p className="hint">Selected: {date || 'None'}</p>

        <h2 className="card-title" style={{ marginTop: '24px' }}>Time Picker</h2>
        <DateTimePicker
          type="time"
          value={time}
          onChange={setTime}
        />
        <p className="hint">Selected: {time || 'None'}</p>
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
    '/DateTimePicker.js': `export default function DateTimePicker({ type = 'date', value, onChange }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="form-input"
    />
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
