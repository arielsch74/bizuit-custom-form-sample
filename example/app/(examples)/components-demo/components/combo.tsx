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
    '/App.js': `import { useState } from 'react';
import Combo from './Combo.js';
import './styles.css';

const countries = [
  { label: 'Argentina', value: 'ar' },
  { label: 'Brasil', value: 'br' },
  { label: 'Chile', value: 'cl' },
  { label: 'México', value: 'mx' },
  { label: 'Estados Unidos', value: 'us' },
];

export default function App() {
  const [selected, setSelected] = useState('');

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Select a Country</h2>
        <Combo
          options={countries}
          value={selected}
          onChange={setSelected}
          placeholder="Choose a country..."
        />
        <p className="hint">Selected: {selected || 'None'}</p>
      </div>
    </div>
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
