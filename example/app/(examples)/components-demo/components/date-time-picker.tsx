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
    '/App.js': `import { useState } from 'react';
import DateTimePicker from './DateTimePicker.js';
import './styles.css';

export default function App() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  return (
    <div className="container">
      <div className="card">
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
