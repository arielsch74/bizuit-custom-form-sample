import { ComponentDoc } from '../all-components-docs';

export const dynamic_form_fieldDoc: ComponentDoc = {
  id: 'dynamic-form-field',
  name: 'DynamicFormField',
  category: 'forms',
  icon: 'Component',
  description: 'Dynamic form field that renders different input types',
  detailedDescription: 'A versatile form field component that dynamically renders the appropriate input type (text, number, date, select, etc.) based on field configuration.',
  useCases: ['Dynamic form generation', 'Runtime field configuration', 'CMS-driven forms', 'Workflow-based forms', 'Multi-type data entry'],
  props: [
    {
        name: "field",
        type: "FieldConfig",
        required: true,
        description: "Field configuration object"
    },
    {
        name: "value",
        type: "any",
        required: false,
        description: "Current field value"
    },
    {
        name: "onChange",
        type: "(value: any) => void",
        required: false,
        description: "Callback when value changes"
    },
    {
        name: "errors",
        type: "string[]",
        required: false,
        description: "Validation error messages"
    }
],
  codeExample: {
    '/App.js': `import { useState } from 'react';
import DynamicFormField from './DynamicFormField.js';
import './styles.css';

export default function App() {
  const [values, setValues] = useState({
    name: '',
    age: '',
    email: '',
    country: '',
  });

  const fields = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'John Doe' },
    { name: 'age', label: 'Age', type: 'number', placeholder: '25' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
    { name: 'country', label: 'Country', type: 'select', options: ['USA', 'Canada', 'Mexico'] },
  ];

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Dynamic Form Fields</h2>
        {fields.map((field) => (
          <DynamicFormField
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(value) => setValues({ ...values, [field.name]: value })}
          />
        ))}
        <p className="hint">
          Values: {JSON.stringify(values, null, 2)}
        </p>
      </div>
    </div>
  );
}`,
    '/DynamicFormField.js': `export default function DynamicFormField({ field, value, onChange }) {
  const renderInput = () => {
    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form-input"
        >
          <option value="">Select {field.label}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="form-input"
      />
    );
  };

  return (
    <div className="form-field">
      <label className="form-label">{field.label}</label>
      {renderInput()}
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
