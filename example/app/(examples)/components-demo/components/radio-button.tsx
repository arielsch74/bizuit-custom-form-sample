import { ComponentDoc } from '../all-components-docs';

export const bizuit_radio_buttonDoc: ComponentDoc = {
  id: 'bizuit-radio-button',
  name: 'RadioButton',
  category: 'forms',
  icon: 'Component',
  description: 'Radio button group for mutually exclusive selections',
  description_es: 'Grupo de botones de opción para selección de una sola opción',
  detailedDescription: 'A radio button component for selecting a single option from multiple choices. Supports horizontal and vertical layouts, custom labels, descriptions, and disabled states. Follows accessibility best practices with proper ARIA attributes and keyboard navigation.',
  detailedDescription_es: 'Un componente de grupo de radio buttons que permite a los usuarios seleccionar exactamente una opción de un conjunto de opciones mutuamente excluyentes. Incluye diseño personalizable, estados de hover/focus y variantes de orientación horizontal/vertical. Construido con accesibilidad en mente.',
  useCases: [
    'Payment method selection',
    'Shipping options',
    'Yes/No questions',
    'Multiple choice forms',
    'Settings and preferences',
  ],
  useCases_es: [
    'Selección de método de pago o envío',
    'Selección de género o categoría en formularios',
    'Opciones de preferencia en configuraciones',
    'Selección de plan de suscripción o pricing tier',
    'Encuestas y cuestionarios de opción múltiple',
  ],
  props: [
    {
      name: 'options',
      type: 'Array<{value: string, label: string, description?: string}>',
      required: true,
      description: 'Radio button options',
      description_es: 'Array de opciones para seleccionar',
    },
    {
      name: 'value',
      type: 'string',
      required: false,
      description: 'Selected value',
      description_es: 'Valor seleccionado actualmente',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      required: false,
      description: 'Selection change callback',
      description_es: 'Callback ejecutado cuando la selección cambia',
    },
    {
      name: 'orientation',
      type: '"horizontal" | "vertical"',
      required: false,
      default: '"vertical"',
      description: 'Layout orientation',
      description_es: 'Layout horizontal o vertical',
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Disable all options',
      description_es: 'Deshabilitar todas las opciones',
    },
  ],
  codeExample: {
    '/App.js': `import { useState } from 'react';
import RadioButton from './RadioButton.js';
import './styles.css';

export default function App() {
  const [selected, setSelected] = useState('option1');

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Select an Option</h2>
        <RadioButton
          name="options"
          value="option1"
          checked={selected === 'option1'}
          onChange={() => setSelected('option1')}
          label="Option 1"
        />
        <RadioButton
          name="options"
          value="option2"
          checked={selected === 'option2'}
          onChange={() => setSelected('option2')}
          label="Option 2"
        />
        <RadioButton
          name="options"
          value="option3"
          checked={selected === 'option3'}
          onChange={() => setSelected('option3')}
          label="Option 3"
        />
        <p className="hint">Selected: {selected}</p>
      </div>
    </div>
  );
}`,
    '/RadioButton.js': `export default function RadioButton({ name, value, checked, onChange, label }) {
  return (
    <div className="form-checkbox">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <label onClick={onChange}>{label}</label>
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
