import { ComponentDoc } from '../all-components-docs';

export const bizuit_subformDoc: ComponentDoc = {
  id: 'bizuit-subform',
  name: 'Subform',
  category: 'forms',
  icon: 'Component',
  description: 'Nested subform component for complex data structures',
  detailedDescription: 'A subform component that allows embedding forms within forms, supporting repeatable sections, nested data structures, and array management.',
  useCases: ['Invoice line items', 'Contact lists', 'Repeatable form sections', 'Dynamic field groups', 'Nested data entry'],
  props: [
    {
        name: "value",
        type: "any[]",
        required: false,
        description: "Array of subform data"
    },
    {
        name: "onChange",
        type: "(value: any[]) => void",
        required: false,
        description: "Callback when subform data changes"
    },
    {
        name: "fields",
        type: "Field[]",
        required: true,
        description: "Field definitions for subform"
    },
    {
        name: "minItems",
        type: "number",
        required: false,
        default: "0",
        description: "Minimum number of items"
    },
    {
        name: "maxItems",
        type: "number",
        required: false,
        description: "Maximum number of items"
    }
],
  codeExample: {
    '/App.js': `import { useState } from 'react';
import Subform from './Subform.js';
import './styles.css';

export default function App() {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', quantity: 1, price: 100 },
  ]);

  const handleAddItem = () => {
    setItems([...items, {
      id: items.length + 1,
      name: '',
      quantity: 1,
      price: 0
    }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Subform - Invoice Items</h2>
        <Subform
          items={items}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onChangeItem={handleChangeItem}
        />
        <p className="hint">
          Total: $\{total.toFixed(2)\} (\{items.length\} items)
        </p>
      </div>
    </div>
  );
}`,
    '/Subform.js': `export default function Subform({ items, onAddItem, onRemoveItem, onChangeItem }) {
  return (
    <div className="form-field">
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            marginBottom: '12px',
            backgroundColor: '#f9fafb',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <strong>Item #{index + 1}</strong>
            <button
              onClick={() => onRemoveItem(index)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Remove
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                Name
              </label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => onChangeItem(index, 'name', e.target.value)}
                className="form-input"
                placeholder="Item name"
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                Qty
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
                Price
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
            Subtotal: $\{(item.quantity * item.price).toFixed(2)\}
          </div>
        </div>
      ))}

      <button
        onClick={onAddItem}
        className="btn-secondary"
        style={{ width: '100%' }}
      >
        + Add Item
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
