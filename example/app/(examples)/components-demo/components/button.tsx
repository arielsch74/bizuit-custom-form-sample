import { ComponentDoc } from '../all-components-docs';

export const buttonDoc: ComponentDoc = {
  id: 'button',
  name: 'Button',
  category: 'ui',
  icon: 'Component',
  description: 'Versatile button component with multiple variants and sizes',
  description_es: 'Componente de botón versátil con múltiples variantes y tamaños',
  detailedDescription: 'A highly customizable button component that supports different visual styles (variants), sizes, and states. Built with accessibility in mind and includes hover states, focus indicators, and disabled states. Follows modern UI design patterns with smooth transitions and consistent spacing.',
  detailedDescription_es: 'Un componente de botón altamente personalizable que soporta diferentes estilos visuales (variantes), tamaños y estados. Construido pensando en la accesibilidad e incluye estados hover, indicadores de foco y estados deshabilitados. Sigue patrones modernos de diseño UI con transiciones suaves y espaciado consistente.',
  useCases: [
    'Primary actions in forms (Submit, Save, Create)',
    'Secondary actions (Cancel, Back, Reset)',
    'Destructive actions (Delete, Remove, Clear)',
    'Call-to-action buttons in marketing sections',
    'Navigation and menu interactions',
  ],
  useCases_es: [
    'Acciones principales en formularios (Enviar, Guardar, Crear)',
    'Acciones secundarias (Cancelar, Atrás, Resetear)',
    'Acciones destructivas (Eliminar, Remover, Limpiar)',
    'Botones de llamada a la acción en secciones de marketing',
    'Navegación e interacciones de menú',
  ],
  props: [
    {
      name: 'variant',
      type: "'default' | 'destructive' | 'outline' | 'secondary'",
      required: false,
      default: "'default'",
      description: 'Visual style variant of the button',
      description_es: 'Variante del estilo visual del botón',
    },
    {
      name: 'size',
      type: "'sm' | 'default' | 'lg'",
      required: false,
      default: "'default'",
      description: 'Size of the button (small, default, large)',
      description_es: 'Tamaño del botón (pequeño, predeterminado, grande)',
    },
    {
      name: 'onClick',
      type: '() => void',
      required: false,
      description: 'Click event handler',
      description_es: 'Manejador del evento click',
    },
    {
      name: 'className',
      type: 'string',
      required: false,
      description: 'Additional CSS classes',
      description_es: 'Clases CSS adicionales',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Button content (text, icons, or elements)',
      description_es: 'Contenido del botón (texto, íconos o elementos)',
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Disables the button',
      description_es: 'Deshabilita el botón',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
import Button from './Button.js';
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
      title: 'Variantes de Botón',
      sizes: 'Tamaños de Botón',
      interactive: 'Botón Interactivo',
      default: 'Predeterminado',
      destructive: 'Destructivo',
      outline: 'Contorno',
      secondary: 'Secundario',
      small: 'Pequeño',
      large: 'Grande',
      clickMe: 'Haz clic aquí',
      clicked: '¡Hiciste clic!'
    },
    en: {
      title: 'Button Variants',
      sizes: 'Button Sizes',
      interactive: 'Interactive Button',
      default: 'Default',
      destructive: 'Destructive',
      outline: 'Outline',
      secondary: 'Secondary',
      small: 'Small',
      large: 'Large',
      clickMe: 'Click me',
      clicked: 'You clicked!'
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
          {/* Language Toggle */}
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
            {/* Theme buttons */}
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

            {/* Color picker */}
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
        <div className="form-actions">
          <Button variant="default" primaryColor={primaryColor}>{t('default')}</Button>
          <Button variant="destructive">{t('destructive')}</Button>
          <Button variant="outline">{t('outline')}</Button>
          <Button variant="secondary">{t('secondary')}</Button>
        </div>

        <h2 className="card-title" style={{ marginTop: '24px' }}>{t('sizes')}</h2>
        <div className="form-actions" style={{ alignItems: 'center' }}>
          <Button size="sm" primaryColor={primaryColor}>{t('small')}</Button>
          <Button size="default" primaryColor={primaryColor}>{t('default')}</Button>
          <Button size="lg" primaryColor={primaryColor}>{t('large')}</Button>
        </div>

        <h2 className="card-title" style={{ marginTop: '24px' }}>{t('interactive')}</h2>
        <Button
          onClick={() => alert(t('clicked'))}
          style={{
            background: primaryColor,
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          {t('clickMe')}
        </Button>
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
    '/Button.js': `export default function Button({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  onClick,
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: '600',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const variants = {
    default: { background: '#f97316', color: 'white' },
    destructive: { background: '#dc2626', color: 'white' },
    outline: { border: '1px solid #d1d5db', background: 'white', color: '#374151' },
    secondary: { background: 'white', color: '#374151', border: '1px solid #d1d5db' },
  };

  const sizes = {
    default: { height: '40px', padding: '0 24px', fontSize: '16px' },
    sm: { height: '32px', padding: '0 12px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 32px', fontSize: '18px' },
  };

  return (
    <button
      style={{ ...baseStyles, ...variants[variant], ...sizes[size] }}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
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

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.form-checkbox input[type="checkbox"] {
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
