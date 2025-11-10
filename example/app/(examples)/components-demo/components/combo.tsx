import { ComponentDoc } from '../all-components-docs';

export const bizuit_comboDoc: ComponentDoc = {
  id: 'bizuit-combo',
  name: 'Combo',
  category: 'forms',
  icon: 'Component',
  description: 'Advanced combobox with search, multiselect, and async loading',
  detailedDescription: 'A powerful combobox component with search functionality, multiselect support, async data loading, and virtualization for large datasets. Mobile-optimized with touch support.',
  useCases: ['Country/city/state selection', 'Multi-selection of options', 'Searchable dropdown lists', 'Async data loading from API', 'Large dataset handling with virtualization'],
  props: [
    {
        name: "options",
        type: "ComboOption[]",
        required: true,
        description: "Array of available options"
    },
    {
        name: "value",
        type: "string | string[]",
        required: false,
        description: "Selected value(s)"
    },
    {
        name: "onChange",
        type: "(value: string | string[]) => void",
        required: false,
        description: "Callback when selection changes"
    },
    {
        name: "multiSelect",
        type: "boolean",
        required: false,
        default: "false",
        description: "Enable multi-selection"
    },
    {
        name: "searchable",
        type: "boolean",
        required: false,
        default: "true",
        description: "Enable search functionality"
    },
    {
        name: "placeholder",
        type: "string",
        required: false,
        description: "Placeholder text"
    }
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
