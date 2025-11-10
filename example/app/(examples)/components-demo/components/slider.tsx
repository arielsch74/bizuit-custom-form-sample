import { ComponentDoc } from '../all-components-docs';

export const bizuit_sliderDoc: ComponentDoc = {
  id: 'bizuit-slider',
  name: 'Slider',
  category: 'ui',
  icon: 'Component',
  description: 'Interactive range slider for selecting numeric values',
  description_es: 'Control deslizante interactivo para seleccionar valores numéricos',
  detailedDescription: 'A versatile slider component that supports both single value selection and range selection (min-max). Features smooth dragging, precise value selection, and visual feedback. Perfect for filtering, price ranges, volume controls, and any numeric input within a defined range.',
  detailedDescription_es: 'Un componente deslizante versátil que soporta tanto selección de valor único como selección de rango (mín-máx). Incluye arrastre suave, selección precisa de valores y retroalimentación visual. Perfecto para filtros, rangos de precios, controles de volumen y cualquier entrada numérica dentro de un rango definido.',
  useCases: [
    'Price range filters in e-commerce',
    'Volume and playback controls in media players',
    'Date range selection',
    'Age or quantity range inputs',
    'Zoom level and opacity controls',
  ],
  useCases_es: [
    'Filtros de rango de precios en comercio electrónico',
    'Controles de volumen y reproducción en reproductores multimedia',
    'Selección de rango de fechas',
    'Entradas de rango de edad o cantidad',
    'Controles de zoom y opacidad',
  ],
  props: [
    {
      name: 'value',
      type: 'number | number[]',
      required: true,
      description: 'Current value (single number) or range (array of two numbers)',
      description_es: 'Valor actual (número único) o rango (array de dos números)',
    },
    {
      name: 'onChange',
      type: '(value: number | number[]) => void',
      required: true,
      description: 'Callback fired when value changes',
      description_es: 'Callback ejecutado cuando el valor cambia',
    },
    {
      name: 'min',
      type: 'number',
      required: false,
      default: '0',
      description: 'Minimum allowed value',
      description_es: 'Valor mínimo permitido',
    },
    {
      name: 'max',
      type: 'number',
      required: false,
      default: '100',
      description: 'Maximum allowed value',
      description_es: 'Valor máximo permitido',
    },
    {
      name: 'range',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Enable range selection mode (two handles)',
      description_es: 'Habilitar modo de selección de rango (dos manijas)',
    },
    {
      name: 'step',
      type: 'number',
      required: false,
      default: '1',
      description: 'Step increment for value changes',
      description_es: 'Incremento de paso para cambios de valor',
    },
  ],
  codeExample: {
    '/App.js': `import { useState } from 'react';
import Slider from './Slider.js';
import './styles.css';

export default function App() {
  const [singleValue, setSingleValue] = useState(50);
  const [rangeValue, setRangeValue] = useState([20, 80]);

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Single Value: {singleValue}</h2>
        <Slider
          value={singleValue}
          onChange={setSingleValue}
          min={0}
          max={100}
        />

        <h2 className="card-title" style={{ marginTop: '24px' }}>Range: {rangeValue[0]} - {rangeValue[1]}</h2>
        <Slider
          value={rangeValue}
          onChange={setRangeValue}
          min={0}
          max={100}
          range
        />
      </div>
    </div>
  );
}`,
    '/Slider.js': `export default function Slider({ value, onChange, min = 0, max = 100, range = false }) {
  const handleChange = (e, index) => {
    const newValue = Number(e.target.value);
    if (range) {
      const newRange = [...value];
      newRange[index] = newValue;
      onChange(newRange);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {range ? (
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          <input
            type="range"
            min={min}
            max={max}
            value={value[0]}
            onChange={(e) => handleChange(e, 0)}
            style={{ width: '100%', accentColor: '#ea580c' }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={value[1]}
            onChange={(e) => handleChange(e, 1)}
            style={{ width: '100%', accentColor: '#ea580c' }}
          />
        </div>
      ) : (
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => handleChange(e)}
          style={{ width: '100%', accentColor: '#ea580c' }}
        />
      )}
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
