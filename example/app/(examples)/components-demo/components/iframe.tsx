import { ComponentDoc } from '../all-components-docs';

export const bizuit_iframeDoc: ComponentDoc = {
  id: 'bizuit-iframe',
  name: 'Iframe',
  category: 'media',
  icon: 'Component',
  description: 'Secure iframe component for embedding external content',
  description_es: 'Contenedor de iframe seguro para embeber contenido externo',
  detailedDescription: 'A safe iframe wrapper component for embedding external websites, videos, or documents. Includes sandbox security, responsive sizing, loading states, and error handling. Supports common embed providers with optimized configurations.',
  detailedDescription_es: 'Un wrapper de iframe seguro con atributos sandbox configurables, manejo de errores de carga y diseño responsive. Incluye estados de carga, manejo de errores y controles de altura automática. Soporta comunicación segura entre frames y restricciones CSP.',
  useCases: [
    'YouTube and Vimeo video embeds',
    'PDF document viewers',
    'External dashboard integration',
    'Interactive maps',
    'Third-party widget integration',
  ],
  useCases_es: [
    'Embeber videos externos (YouTube, Vimeo)',
    'Mostrar mapas de terceros o widgets',
    'Embeber contenido de documentos externos',
    'Integración de formularios o aplicaciones de terceros',
    'Vista previa de contenido externo en modo sandbox',
  ],
  props: [
    {
      name: 'src',
      type: 'string',
      required: true,
      description: 'Source URL to embed',
      description_es: 'URL de la fuente del iframe',
    },
    {
      name: 'title',
      type: 'string',
      required: false,
      description: 'Iframe title for accessibility',
      description_es: 'Título accesible para el iframe',
    },
    {
      name: 'width',
      type: 'string | number',
      required: false,
      default: '"100%"',
      description: 'Frame width',
      description_es: 'Ancho del iframe',
    },
    {
      name: 'height',
      type: 'string | number',
      required: false,
      default: '"400px"',
      description: 'Frame height',
      description_es: 'Altura del iframe',
    },
    {
      name: 'sandbox',
      type: 'string',
      required: false,
      description: 'Sandbox restrictions',
      description_es: 'Permisos de sandbox del iframe',
    },
  ],
  codeExample: {
    '/App.js': `import { useState } from 'react';
import Iframe from './Iframe.js';
import './styles.css';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Embedded Website</h2>
        <Iframe
          src="https://www.example.com"
          title="Example Website"
          height={400}
          onLoad={() => {
            setIsLoaded(true);
            console.log('Iframe loaded successfully');
          }}
          onError={() => console.error('Failed to load iframe')}
        />
        {isLoaded && (
          <p className="hint" style={{ marginTop: '12px' }}>Content loaded successfully</p>
        )}
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 className="card-title">Google Maps Embed</h2>
        <Iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412634346395!2d-73.98823492346653!3d40.74844097138558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus"
          title="Google Maps"
          height={450}
          loading="lazy"
        />
      </div>
    </div>
  );
}`,
    '/Iframe.js': `export default function Iframe({
  src,
  title,
  width = '100%',
  height = 500,
  loading = 'lazy',
  showLoader = true,
  onLoad,
  onError,
  ...props
}) {
  return (
    <div className="form-field" style={{ width, height }}>
      <iframe
        src={src}
        title={title}
        width="100%"
        height="100%"
        loading={loading}
        onLoad={onLoad}
        onError={onError}
        className="rounded-lg border"
        {...props}
      />
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
