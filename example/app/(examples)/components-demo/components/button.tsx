import { ComponentDoc } from '../all-components-docs';

export const buttonDoc: ComponentDoc = {
  id: 'button',
  name: 'Button',
  category: 'ui',
  icon: 'Component',
  description: 'Versatile button component with multiple variants and sizes',
  description_es: 'Componente de botón versátil con múltiples variantes y tamaños',
  detailedDescription: 'A highly customizable button component that supports different visual styles (variants), sizes, and states. Built with accessibility in mind and includes hover states, focus indicators, and disabled states. Follows modern UI design patterns with smooth transitions and consistent spacing.',
  detailedDescription_es: 'Un componente de botón altamente personalizable que soporta diferentes estilos visuales (variantes), tamaños y estados. Construido pensando en la accesibilidad e incluye estados hover, indicadores de foco y estados deshabilitados. Sigue patrones modernos de diseño UI con transiciones suaves y espaciado consistente.',
  useCases: [
    'Primary actions in forms (Submit, Save, Create)',
    'Secondary actions (Cancel, Back, Reset)',
    'Destructive actions (Delete, Remove, Clear)',
    'Call-to-action buttons in marketing sections',
    'Navigation and menu interactions',
  ],
  useCases_es: [
    'Acciones principales en formularios (Enviar, Guardar, Crear)',
    'Acciones secundarias (Cancelar, Atrás, Resetear)',
    'Acciones destructivas (Eliminar, Remover, Limpiar)',
    'Botones de llamada a la acción en secciones de marketing',
    'Navegación e interacciones de menú',
  ],
  props: [
    {
      name: 'variant',
      type: "'default' | 'destructive' | 'outline' | 'secondary'",
      required: false,
      default: "'default'",
      description: 'Visual style variant of the button',
      description_es: 'Variante del estilo visual del botón',
    },
    {
      name: 'size',
      type: "'sm' | 'default' | 'lg'",
      required: false,
      default: "'default'",
      description: 'Size of the button (small, default, large)',
      description_es: 'Tamaño del botón (pequeño, predeterminado, grande)',
    },
    {
      name: 'onClick',
      type: '() => void',
      required: false,
      description: 'Click event handler',
      description_es: 'Manejador del evento click',
    },
    {
      name: 'className',
      type: 'string',
      required: false,
      description: 'Additional CSS classes',
      description_es: 'Clases CSS adicionales',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Button content (text, icons, or elements)',
      description_es: 'Contenido del botón (texto, íconos o elementos)',
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Disables the button',
      description_es: 'Deshabilita el botón',
    },
  ],
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
