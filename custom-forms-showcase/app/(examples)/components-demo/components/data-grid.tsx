import { ComponentDoc } from '../all-components-docs';

export const bizuit_data_gridDoc: ComponentDoc = {
  id: 'bizuit-data-grid',
  name: 'DataGrid',
  category: 'forms',
  icon: 'Component',
  description: 'Advanced data table with sorting, filtering, and pagination',
  description_es: 'Tabla de datos avanzada con ordenamiento, filtrado y paginación',
  detailedDescription: 'A feature-rich data grid component for displaying tabular data. Includes column sorting, filtering, pagination, row selection, custom cell rendering, and responsive design. Optimized for large datasets with virtual scrolling support.',
  detailedDescription_es: 'Un componente de grid de datos con todas las funciones que soporta ordenamiento de columnas, filtrado, paginación y selección de filas. Incluye diseño responsive, columnas redimensionables y exportación de datos. Optimizado para grandes conjuntos de datos con virtualización y renderizado eficiente.',
  useCases: [
    'Admin dashboards and data management',
    'Report and analytics displays',
    'User and customer lists',
    'Transaction and order history',
    'Inventory management',
  ],
  useCases_es: [
    'Dashboards de administración con datos tabulares',
    'Grids de gestión de productos o inventario',
    'Tablas de reportes financieros',
    'Listas de usuarios o clientes',
    'Visualización de logs o registros de datos',
  ],
  props: [
    {
      name: 'columns',
      type: 'Array<{key: string, label: string, sortable?: boolean}>',
      required: true,
      description: 'Column definitions',
      description_es: 'Definiciones de columnas con encabezados y accesorios',
    },
    {
      name: 'data',
      type: 'Array<Record<string, any>>',
      required: true,
      description: 'Table data rows',
      description_es: 'Array de datos a mostrar',
    },
    {
      name: 'primaryColor',
      type: 'string',
      required: false,
      default: '#a855f7',
      description: 'Primary color for headers and borders',
      description_es: 'Color primario para encabezados y bordes',
    },
    {
      name: 'onSort',
      type: '(column: string, direction: "asc" | "desc") => void',
      required: false,
      description: 'Sort callback',
    },
    {
      name: 'pagination',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Enable pagination',
      description_es: 'Habilitar paginación',
    },
    {
      name: 'pageSize',
      type: 'number',
      required: false,
      default: '10',
      description: 'Rows per page',
      description_es: 'Número de filas por página',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
import DataGrid from './DataGrid.js';
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
    "title": "Tabla de Datos",
    "name": "Nombre",
    "age": "Edad",
    "email": "Email",
    "status": "Estado",
    "row": "Fila",
    "alice": "Alicia",
    "bob": "Roberto",
    "alice_email": "alicia@ejemplo.com",
    "bob_email": "roberto@ejemplo.com",
    "john": "Juan",
    "john_email": "juan@ejemplo.com",
    "jane": "Juana",
    "jane_email": "juana@ejemplo.com",
    "active": "Activo",
    "inactive": "Inactivo",
    "showing": "Mostrando",
    "records": "registros"
  },
  "en": {
    "title": "Data Grid",
    "name": "Name",
    "age": "Age",
    "email": "Email",
    "status": "Status",
    "row": "Row",
    "alice": "Alice",
    "bob": "Bob",
    "alice_email": "alice@example.com",
    "bob_email": "bob@example.com",
    "john": "John Doe",
    "john_email": "john@example.com",
    "jane": "Jane Smith",
    "jane_email": "jane@example.com",
    "active": "Active",
    "inactive": "Inactive",
    "showing": "Showing",
    "records": "records"
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

  // Datos reactivos que se actualizan cuando cambia el idioma
  const data = [
    { id: 1, name: t('john'), age: 32, email: t('john_email'), status: t('active') },
    { id: 2, name: t('jane'), age: 28, email: t('jane_email'), status: t('active') },
    { id: 3, name: t('bob'), age: 45, email: t('bob_email'), status: t('inactive') },
  ];

  // Columnas reactivas que se actualizan cuando cambia el idioma
  const columns = [
    { key: 'name', label: t('name'), width: '200px' },
    { key: 'age', label: t('age'), width: '80px' },
    { key: 'email', label: t('email'), width: '250px' },
    { key: 'status', label: t('status'), width: '100px' },
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

        <h2 className="card-title">Data Grid</h2>
        <DataGrid data={data} columns={columns} primaryColor={primaryColor} />
        <p className="hint">{t('showing')} {data.length} {t('records')}</p>
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
    '/DataGrid.js': `export default function DataGrid({ data, columns, primaryColor = '#a855f7' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: primaryColor + '20', borderBottom: \`2px solid \${primaryColor}\` }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: primaryColor,
                  width: col.width || 'auto',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              style={{
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    color: '#111827',
                  }}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
