import { ComponentDoc } from '../all-components-docs';

export const bizuit_cardDoc: ComponentDoc = {
  id: 'bizuit-card',
  name: 'Card',
  category: 'layout',
  icon: 'Component',
  description: 'Versatile container component for grouping related content',
  description_es: 'Componente contenedor flexible para agrupar contenido relacionado',
  detailedDescription: 'A flexible card component that provides a clean container for displaying grouped information. Supports headers, footers, images, and various content layouts. Includes hover effects, shadows, and responsive design patterns for modern UI layouts.',
  detailedDescription_es: 'Un componente de tarjeta versátil que proporciona un contenedor visual con secciones consistentes de encabezado, cuerpo y pie. Soporta múltiples variantes de estilo, estados elevados y diseño responsive. Ideal para organizar contenido en layouts de dashboard o presentar información agrupada de forma visual.',
  useCases: [
    'Product displays in e-commerce',
    'User profile cards',
    'Dashboard widgets and statistics',
    'Blog post previews',
    'Feature showcases',
  ],
  useCases_es: [
    'Tarjetas de producto en sitios de comercio electrónico',
    'Tarjetas de perfil de usuario',
    'Widgets de dashboard y paneles de información',
    'Tarjetas de artículo o vista previa de blog',
    'Tarjetas de contenido en galerías y grids',
  ],
  props: [
    {
      name: 'title',
      type: 'string',
      required: false,
      description: 'Card title text',
      description_es: 'Título que aparece en el encabezado de la tarjeta',
    },
    {
      name: 'description',
      type: 'string',
      required: false,
      description: 'Card description or subtitle',
    },
    {
      name: 'footer',
      type: 'ReactNode',
      required: false,
      description: 'Footer content',
      description_es: 'Contenido opcional del pie de la tarjeta',
    },
    {
      name: 'image',
      type: 'string',
      required: false,
      description: 'Header image URL',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Card body content',
      description_es: 'Contenido principal de la tarjeta',
    },
    {
      name: 'hoverable',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Enable hover effect',
    },
  ],
  codeExample: {
    '/App.js': `import { useState } from 'react';
import Card from './Card.js';
import './styles.css';

export default function App() {
  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Card Variants</h2>

        <Card
          title="Default Card"
          description="This is a default card with basic styling"
        >
          <p className="hint">Card content goes here</p>
        </Card>

        <Card
          variant="outline"
          title="Outline Card"
          description="Card with outlined border"
          hoverable
        >
          <p className="hint">Hover over this card</p>
        </Card>

        <Card
          variant="filled"
          title="Filled Card"
          description="Card with filled background"
          clickable
        >
          <p className="hint">This card is clickable</p>
        </Card>
      </div>
    </div>
  );
}`,
    '/Card.js': `export default function Card({
  title,
  description,
  header,
  footer,
  children,
  variant = 'default',
  hoverable = false,
  clickable = false,
  className = '',
  ...props
}) {
  const variantClasses = {
    default: 'border bg-card shadow-sm',
    outline: 'border-2',
    filled: 'bg-muted border-none',
  };

  const classes = [
    'rounded-lg text-card-foreground',
    variantClasses[variant],
    hoverable && 'transition-shadow hover:shadow-md',
    clickable && 'cursor-pointer transition-all hover:scale-[1.02]',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {header && <div className="p-6 pb-0">{header}</div>}

      {(title || description) && (
        <div className="p-6">
          {title && <h3 className="text-2xl font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1.5">{description}</p>}
        </div>
      )}

      {children && <div className="p-6 pt-0">{children}</div>}

      {footer && <div className="flex items-center p-6 pt-0">{footer}</div>}
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
  grid-template-columns: repeat(auto-fit, minmin(250px, 1fr));
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
