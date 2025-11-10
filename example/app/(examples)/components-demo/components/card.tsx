import { ComponentDoc } from '../all-components-docs';

export const bizuit_cardDoc: ComponentDoc = {
  id: 'bizuit-card',
  name: 'Card',
  category: 'layout',
  icon: 'Component',
  description: 'Versatile container component for grouping related content',
  description_es: 'Componente contenedor flexible para agrupar contenido relacionado',
  detailedDescription: 'A flexible card component that provides a clean container for displaying grouped information. Supports headers, footers, images, and various content layouts. Includes hover effects, shadows, and responsive design patterns for modern UI layouts.',
  detailedDescription_es: 'Un componente de tarjeta versátil que proporciona un contenedor visual con secciones consistentes de encabezado, cuerpo y pie. Soporta múltiples variantes de estilo, estados elevados y diseño responsive. Ideal para organizar contenido en layouts de dashboard o presentar información agrupada de forma visual.',
  useCases: [
    'Product displays in e-commerce',
    'User profile cards',
    'Dashboard widgets and statistics',
    'Blog post previews',
    'Feature showcases',
  ],
  useCases_es: [
    'Tarjetas de producto en sitios de comercio electrónico',
    'Tarjetas de perfil de usuario',
    'Widgets de dashboard y paneles de información',
    'Tarjetas de artículo o vista previa de blog',
    'Tarjetas de contenido en galerías y grids',
  ],
  props: [
    {
      name: 'title',
      type: 'string',
      required: false,
      description: 'Card title text',
      description_es: 'Título que aparece en el encabezado de la tarjeta',
    },
    {
      name: 'description',
      type: 'string',
      required: false,
      description: 'Card description or subtitle',
    },
    {
      name: 'footer',
      type: 'ReactNode',
      required: false,
      description: 'Footer content',
      description_es: 'Contenido opcional del pie de la tarjeta',
    },
    {
      name: 'image',
      type: 'string',
      required: false,
      description: 'Header image URL',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Card body content',
      description_es: 'Contenido principal de la tarjeta',
    },
    {
      name: 'hoverable',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Enable hover effect',
    },
    {
      name: 'primaryColor',
      type: 'string',
      required: false,
      default: '#a855f7',
      description: 'Primary color for accents and borders',
      description_es: 'Color primario para acentos y bordes',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
import Card from './Card.js';
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
      title: 'Variantes de Tarjeta',
      defaultTitle: 'Tarjeta Predeterminada',
      defaultDesc: 'Esta es una tarjeta con estilo básico',
      defaultContent: 'El contenido de la tarjeta va aquí',
      outlineTitle: 'Tarjeta con Contorno',
      outlineDesc: 'Tarjeta con borde delineado',
      outlineContent: 'Pasa el mouse sobre esta tarjeta',
      filledTitle: 'Tarjeta Rellena',
      filledDesc: 'Tarjeta con fondo relleno',
      filledContent: 'Esta tarjeta es clickeable'
    },
    en: {
      title: 'Card Variants',
      defaultTitle: 'Default Card',
      defaultDesc: 'This is a default card with basic styling',
      defaultContent: 'Card content goes here',
      outlineTitle: 'Outline Card',
      outlineDesc: 'Card with outlined border',
      outlineContent: 'Hover over this card',
      filledTitle: 'Filled Card',
      filledDesc: 'Card with filled background',
      filledContent: 'This card is clickable'
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

        <h2 className="card-title">{t('title')}</h2>

        <Card
          title={t('defaultTitle')}
          description={t('defaultDesc')}
          primaryColor={primaryColor}
        >
          <p className="hint">{t('defaultContent')}</p>
        </Card>

        <Card
          variant="outline"
          title={t('outlineTitle')}
          description={t('outlineDesc')}
          hoverable
          primaryColor={primaryColor}
        >
          <p className="hint">{t('outlineContent')}</p>
        </Card>

        <Card
          variant="filled"
          title={t('filledTitle')}
          description={t('filledDesc')}
          clickable
          primaryColor={primaryColor}
        >
          <p className="hint">{t('filledContent')}</p>
        </Card>
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
    '/Card.js': `export default function Card({
  title,
  description,
  header,
  footer,
  children,
  variant = 'default',
  hoverable = false,
  clickable = false,
  className = '',
  primaryColor = '#a855f7',
  ...props
}) {
  const variantClasses = {
    default: 'border bg-card shadow-sm',
    outline: 'border-2',
    filled: 'bg-muted border-none',
  };

  const classes = [
    'rounded-lg text-card-foreground',
    variantClasses[variant],
    hoverable && 'transition-shadow hover:shadow-md',
    clickable && 'cursor-pointer transition-all hover:scale-[1.02]',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {header && <div className="p-6 pb-0">{header}</div>}

      {(title || description) && (
        <div className="p-6">
          {title && <h3 className="text-2xl font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1.5">{description}</p>}
        </div>
      )}

      {children && <div className="p-6 pt-0">{children}</div>}

      {footer && <div className="flex items-center p-6 pt-0">{footer}</div>}
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
  margin-bottom: 16px;
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
