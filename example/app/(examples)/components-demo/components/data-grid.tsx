import { ComponentDoc } from '../all-components-docs';

export const bizuit_data_gridDoc: ComponentDoc = {
  id: 'bizuit-data-grid',
  name: 'DataGrid',
  category: 'forms',
  icon: 'Component',
  description: 'Data grid component for tabular data display',
  detailedDescription: 'A professional data grid for displaying tabular data with sorting, filtering, pagination, and row selection. Optimized for large datasets.',
  useCases: ['Displaying lists and tables', 'Data management interfaces', 'Reports and analytics', 'Master-detail views', 'Editable data grids'],
  props: [
    {
        name: "data",
        type: "any[]",
        required: true,
        description: "Array of data rows"
    },
    {
        name: "columns",
        type: "Column[]",
        required: true,
        description: "Column definitions"
    },
    {
        name: "onRowClick",
        type: "(row: any) => void",
        required: false,
        description: "Callback when row is clicked"
    },
    {
        name: "sortable",
        type: "boolean",
        required: false,
        default: "true",
        description: "Enable column sorting"
    },
    {
        name: "selectable",
        type: "boolean",
        required: false,
        default: "false",
        description: "Enable row selection"
    }
],
  codeExample: {
    '/App.js': `import { useState } from 'react';
import DataGrid from './DataGrid.js';
import './styles.css';

export default function App() {
  const [data] = useState([
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin' },
    { id: 2, name: 'María García', email: 'maria@example.com', role: 'User' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'User' },
    { id: 4, name: 'Ana Martínez', email: 'ana@example.com', role: 'Editor' },
  ]);

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', width: '100px' },
  ];

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Data Grid</h2>
        <DataGrid data={data} columns={columns} />
        <p className="hint">Showing {data.length} records</p>
      </div>
    </div>
  );
}`,
    '/DataGrid.js': `export default function DataGrid({ data, columns }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#374151',
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
