import { ComponentDoc } from '../all-components-docs';

export const bizuit_subformDoc: ComponentDoc = {
  id: 'bizuit-subform',
  name: 'Subform',
  category: 'forms',
  icon: 'Component',
  description: 'Nested subform component for array data management',
  description_es: 'Formulario anidado con campos repetibles y gestión de array',
  detailedDescription: 'A subform component for managing arrays of related data entries. Features add/remove rows, nested field validation, drag-to-reorder, and dynamic field rendering. Perfect for invoice line items, contact lists, and repeatable form sections.',
  detailedDescription_es: 'Un componente de subformulario que permite a los usuarios agregar múltiples instancias de un grupo de campos. Incluye botones de agregar/eliminar, validación de cada instancia y manejo de arrays de objetos. Ideal para formularios con relaciones uno-a-muchos como contactos, items de pedido o entradas de experiencia.',
  useCases: [
    'Invoice and order line items',
    'Contact and address lists',
    'Product variant management',
    'Custom field groups',
    'Dynamic form sections',
  ],
  useCases_es: [
    'Agregar múltiples contactos de emergencia',
    'Items de línea de pedido en formularios de compra',
    'Entradas de experiencia laboral o educación en CVs',
    'Agregar múltiples direcciones (facturación/envío)',
    'Gestión de dependientes o miembros de familia',
  ],
  props: [
    {
      name: 'value',
      type: 'any[]',
      required: false,
      description: 'Array of subform data',
      description_es: 'Array de valores de subformulario',
    },
    {
      name: 'onChange',
      type: '(value: any[]) => void',
      required: false,
      description: 'Change callback',
      description_es: 'Callback ejecutado cuando los valores de subformulario cambian',
    },
    {
      name: 'fields',
      type: 'Field[]',
      required: true,
      description: 'Field definitions for each row',
      description_es: 'Definición de campos para cada instancia de subformulario',
    },
    {
      name: 'minItems',
      type: 'number',
      required: false,
      default: '0',
      description: 'Minimum rows required',
      description_es: 'Número mínimo de instancias requeridas',
    },
    {
      name: 'maxItems',
      type: 'number',
      required: false,
      description: 'Maximum rows allowed',
      description_es: 'Número máximo de instancias permitidas',
    },
    {
      name: 'primaryColor',
      type: 'string',
      required: false,
      default: '#a855f7',
      description: 'Primary color for UI elements (borders, buttons)',
      description_es: 'Color primario para elementos de UI (bordes, botones)',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
import Subform from './Subform.js';
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
    "title": "Subformulario - Ítems de Factura",
    "addItem": "Agregar ítem",
    "removeItem": "Eliminar",
    "itemLabel": "Ítem #",
    "nameLabel": "Nombre",
    "namePlaceholder": "Nombre del ítem",
    "qtyLabel": "Cant.",
    "priceLabel": "Precio",
    "subtotalLabel": "Subtotal",
    "totalLabel": "Total",
    "itemsCount": "ítems"
  },
  "en": {
    "title": "Subform - Invoice Items",
    "addItem": "Add Item",
    "removeItem": "Remove",
    "itemLabel": "Item #",
    "nameLabel": "Name",
    "namePlaceholder": "Item name",
    "qtyLabel": "Qty",
    "priceLabel": "Price",
    "subtotalLabel": "Subtotal",
    "totalLabel": "Total",
    "itemsCount": "items"
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

  const [items, setItems] = useState([
    { id: 1, name: 'Product A', quantity: 1, price: 29.99 },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), name: '', quantity: 1, price: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

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
        <Subform
          items={items}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onChangeItem={handleChangeItem}
          t={t}
          primaryColor={primaryColor}
        />
        <p className="hint">
          {t('totalLabel')}: $\{total.toFixed(2)} ({items.length} {t('itemsCount')})
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
    '/Subform.js': `export default function Subform({ items, onAddItem, onRemoveItem, onChangeItem, t, primaryColor = '#a855f7' }) {
  return (
    <div className="form-field">
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            padding: '16px',
            border: \`1px solid \${primaryColor}33\`,
            borderRadius: '6px',
            marginBottom: '12px',
            backgroundColor: \`\${primaryColor}08\`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <strong>{t('itemLabel')}{index + 1}</strong>
            <button
              onClick={() => onRemoveItem(index)}
              style={{
                background: primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {t('removeItem')}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                {t('nameLabel')}
              </label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => onChangeItem(index, 'name', e.target.value)}
                className="form-input"
                placeholder={t('namePlaceholder')}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                {t('qtyLabel')}
              </label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => onChangeItem(index, 'quantity', parseInt(e.target.value) || 0)}
                className="form-input"
                min="1"
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                {t('priceLabel')}
              </label>
              <input
                type="number"
                value={item.price}
                onChange={(e) => onChangeItem(index, 'price', parseFloat(e.target.value) || 0)}
                className="form-input"
                step="0.01"
              />
            </div>
          </div>

          <div style={{ marginTop: '8px', textAlign: 'right', color: '#6b7280', fontSize: '14px' }}>
            {t('subtotalLabel')}: $\{(item.quantity * item.price).toFixed(2)\}
          </div>
        </div>
      ))}

      <button
        onClick={onAddItem}
        className="btn-secondary"
        style={{ width: '100%' }}
      >
        + {t('addItem')}
      </button>
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
