import { ComponentDoc } from '../all-components-docs';

export const buttonDoc: ComponentDoc = {
  id: 'button',
  name: 'Button',
  category: 'ui',
  icon: 'Component',
  description: 'Component description',
  detailedDescription: 'Detailed description',
  useCases: ['Use case 1'],
  props: [],
  codeExample: {
    '/App.js': `import Button from './Button.js';
import './styles.css';

export default function App() {
  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Button Variants</h2>
        <div className="form-actions">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
        </div>

        <h2 className="card-title" style={{ marginTop: '24px' }}>Button Sizes</h2>
        <div className="form-actions" style={{ alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>

        <h2 className="card-title" style={{ marginTop: '24px' }}>Interactive Button</h2>
        <Button onClick={() => alert('Clicked!')} className="btn-primary">
          Click me
        </Button>
      </div>
    </div>
  );
}`,
    '/Button.js': `export default function Button({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  onClick,
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: '600',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const variants = {
    default: { background: '#f97316', color: 'white' },
    destructive: { background: '#dc2626', color: 'white' },
    outline: { border: '1px solid #d1d5db', background: 'white', color: '#374151' },
    secondary: { background: 'white', color: '#374151', border: '1px solid #d1d5db' },
  };

  const sizes = {
    default: { height: '40px', padding: '0 24px', fontSize: '16px' },
    sm: { height: '32px', padding: '0 12px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 32px', fontSize: '18px' },
  };

  return (
    <button
      style={{ ...baseStyles, ...variants[variant], ...sizes[size] }}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
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
