import { ComponentDoc } from '../all-components-docs';

export const bizuit_stepperDoc: ComponentDoc = {
  id: 'bizuit-stepper',
  name: 'Stepper',
  category: 'layout',
  icon: 'Component',
  description: 'Multi-step progress indicator for wizards and workflows',
  description_es: 'Indicador de progreso paso a paso para flujos de múltiples pasos',
  detailedDescription: 'A stepper component for visualizing multi-step processes and guiding users through sequential tasks. Features include step validation, clickable navigation, custom icons, progress tracking, and both horizontal and vertical orientations.',
  detailedDescription_es: 'Un componente de stepper que visualiza el progreso a través de un flujo de múltiples pasos. Incluye estados de completado/activo/pendiente, navegación opcional entre pasos, y diseño responsive. Perfecto para guiar a los usuarios a través de formularios complejos o procesos de onboarding.',
  useCases: [
    'Multi-step forms and wizards',
    'Onboarding flows',
    'Checkout processes',
    'Tutorial and guided tours',
    'Task progress tracking',
  ],
  useCases_es: [
    'Formularios de checkout de múltiples pasos',
    'Flujos de onboarding de usuario',
    'Wizards de configuración',
    'Procesos de solicitud en múltiples pasos',
    'Indicadores de progreso de instalación o setup',
  ],
  props: [
    {
      name: 'steps',
      type: 'Array<{label: string, description?: string, icon?: ReactNode}>',
      required: true,
      description: 'Step definitions',
      description_es: 'Array de definiciones de pasos',
    },
    {
      name: 'currentStep',
      type: 'number',
      required: true,
      description: 'Current active step index (0-based)',
      description_es: 'Índice del paso actual',
    },
    {
      name: 'onChange',
      type: '(step: number) => void',
      required: false,
      description: 'Step navigation callback',
    },
    {
      name: 'orientation',
      type: '"horizontal" | "vertical"',
      required: false,
      default: '"horizontal"',
      description: 'Layout orientation',
      description_es: 'Orientación horizontal o vertical',
    },
    {
      name: 'clickable',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Allow clicking steps to navigate',
    },
    {
      name: 'primaryColor',
      type: 'string',
      required: false,
      default: '"#a855f7"',
      description: 'Primary color for active and completed steps',
      description_es: 'Color primario para pasos activos y completados',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
import Stepper from './Stepper.js';
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
    "title": "Stepper",
    "step": "Paso",
    "next": "Siguiente",
    "previous": "Anterior",
    "finish": "Finalizar",
    "stepperExample": "Ejemplo de Stepper",
    "personalInfo": "Información Personal",
    "personalInfoDesc": "Ingresa tus datos",
    "address": "Dirección",
    "addressDesc": "Proporciona tu dirección",
    "confirmation": "Confirmación",
    "confirmationDesc": "Revisa y envía"
  },
  "en": {
    "title": "Stepper",
    "step": "Step",
    "next": "Next",
    "previous": "Previous",
    "finish": "Finish",
    "stepperExample": "Stepper Example",
    "personalInfo": "Personal Info",
    "personalInfoDesc": "Enter your details",
    "address": "Address",
    "addressDesc": "Provide your address",
    "confirmation": "Confirmation",
    "confirmationDesc": "Review and submit"
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

  const [currentStep, setCurrentStep] = useState(0);
  const [steps] = useState([
    { label: t('personalInfo'), description: t('personalInfoDesc') },
    { label: t('address'), description: t('addressDesc') },
    { label: t('confirmation'), description: t('confirmationDesc') },
  ]);

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

        <h2 className="card-title">{t('stepperExample')}</h2>

        <Stepper
          steps={steps}
          currentStep={currentStep}
          clickable
          onChange={setCurrentStep}
          primaryColor={primaryColor}
        />

        <div className="form-actions" style={{ marginTop: '24px' }}>
          <button
            className="btn-secondary"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            {t('previous')}
          </button>
          <button
            className="btn-primary"
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
          >
            {t('next')}
          </button>
        </div>
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
    '/Stepper.js': `export default function Stepper({
  steps,
  currentStep,
  onChange,
  orientation = 'horizontal',
  clickable = false,
  primaryColor = '#a855f7'
}) {
  let orientationClass = 'flex';
  if (orientation === 'horizontal') {
    orientationClass += ' flex-row items-center';
  } else {
    orientationClass += ' flex-col';
  }

  return (
    <div className={orientationClass}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        let circleClasses = 'flex items-center justify-center rounded-full border-2 w-10 h-10';
        let circleStyles = {};

        if (isCompleted) {
          circleClasses += ' text-white';
          circleStyles = {
            backgroundColor: primaryColor,
            borderColor: primaryColor
          };
        } else if (isCurrent) {
          circleStyles = {
            borderColor: primaryColor,
            color: primaryColor
          };
        } else {
          circleClasses += ' border-gray-300 text-gray-400';
        }

        if (clickable) circleClasses += ' cursor-pointer';

        let lineClasses = orientation === 'horizontal' ? 'h-[2px] flex-1 mx-4' : 'w-[2px] h-12';
        let lineStyles = {};

        if (isCompleted) {
          lineStyles = { backgroundColor: primaryColor };
        } else {
          lineClasses += ' bg-gray-300';
        }

        return (
          <div key={index} className="flex items-center">
            <div
              className={circleClasses}
              style={circleStyles}
              onClick={() => clickable && onChange?.(index)}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium">{step.label}</div>
              {step.description && (
                <div className="text-xs text-muted-foreground">{step.description}</div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={lineClasses} style={lineStyles} />
            )}
          </div>
        );
      })}
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
