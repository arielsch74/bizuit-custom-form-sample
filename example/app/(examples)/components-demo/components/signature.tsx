import { ComponentDoc } from '../all-components-docs';

export const bizuit_signatureDoc: ComponentDoc = {
  id: 'bizuit-signature',
  name: 'Signature',
  category: 'forms',
  icon: 'Component',
  description: 'Digital signature capture component',
  detailedDescription: 'A canvas-based signature component for capturing handwritten signatures on touch devices and desktops. Supports pen pressure, smoothing, and export to image.',
  useCases: ['Document signing', 'Contract approval', 'Delivery confirmation', 'Authorization signatures', 'Digital agreements'],
  props: [
    {
        name: "value",
        type: "string",
        required: false,
        description: "Base64 encoded signature image"
    },
    {
        name: "onChange",
        type: "(signatureData: string) => void",
        required: false,
        description: "Callback with signature data"
    },
    {
        name: "width",
        type: "number",
        required: false,
        default: "400",
        description: "Canvas width in pixels"
    },
    {
        name: "height",
        type: "number",
        required: false,
        default: "200",
        description: "Canvas height in pixels"
    },
    {
        name: "penColor",
        type: "string",
        required: false,
        default: "'#000000'",
        description: "Signature pen color"
    }
],
  codeExample: {
    '/App.js': `import { useState } from 'react';
import Signature from './Signature.js';
import './styles.css';

export default function App() {
  const [signature, setSignature] = useState('');

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Digital Signature</h2>
        <Signature
          value={signature}
          onChange={setSignature}
        />
        <p className="hint">
          {signature ? 'Signature captured' : 'Draw your signature above'}
        </p>
      </div>
    </div>
  );
}`,
    '/Signature.js': `export default function Signature({ value, onChange }) {
  const handleClear = () => {
    onChange('');
  };

  const handleSign = () => {
    onChange('SIGNED_' + Date.now());
  };

  return (
    <div className="form-field">
      <div
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: '6px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value ? (
          <div style={{ fontSize: '24px', fontFamily: 'cursive', color: '#374151' }}>
            ✓ Signature Captured
          </div>
        ) : (
          <div style={{ color: '#9ca3af' }}>
            Click "Sign" button to simulate signature
          </div>
        )}
      </div>

      <div className="form-actions">
        <button onClick={handleSign} className="btn-primary">
          ✍️ Sign
        </button>
        <button onClick={handleClear} className="btn-secondary">
          Clear
        </button>
      </div>
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
