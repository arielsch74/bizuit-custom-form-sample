import { ComponentDoc } from '../all-components-docs';

export const bizuit_tabsDoc: ComponentDoc = {
  id: 'bizuit-tabs',
  name: 'Tabs',
  category: 'forms',
  icon: 'Component',
  description: 'Tabbed navigation component for organizing content',
  description_es: 'Componente de pestañas para organizar contenido en paneles alternables',
  detailedDescription: 'A tab component for organizing content into separate views that users can switch between. Supports horizontal and vertical tab layouts, icons, badges, lazy loading, and keyboard navigation. Ideal for settings panels, dashboards, and multi-step processes.',
  detailedDescription_es: 'Un sistema de navegación por pestañas versátil que permite a los usuarios alternar entre diferentes paneles de contenido. Soporta pestañas horizontales y verticales, lazy loading de contenido de pestañas, y navegación por teclado. Ideal para organizar contenido relacionado sin abrumar al usuario.',
  useCases: [
    'Settings and configuration panels',
    'Product information sections',
    'User profile sections',
    'Multi-step forms',
    'Dashboard views',
  ],
  useCases_es: [
    'Navegación de configuración en páginas de configuración',
    'Organizar contenido de producto (descripción, specs, reviews)',
    'Dashboards con múltiples vistas de datos',
    'Formularios multipaso o wizards',
    'Perfiles de usuario con diferentes secciones',
  ],
  props: [
    {
      name: 'tabs',
      type: 'Array<{id: string, label: string, content: ReactNode, icon?: ReactNode}>',
      required: true,
      description: 'Tab definitions',
      description_es: 'Array de definiciones de pestañas',
    },
    {
      name: 'activeTab',
      type: 'string',
      required: false,
      description: 'Currently active tab ID',
      description_es: 'ID de la pestaña actualmente activa',
    },
    {
      name: 'onTabChange',
      type: '(tabId: string) => void',
      required: false,
      description: 'Tab change callback',
      description_es: 'Callback ejecutado cuando cambia la pestaña',
    },
    {
      name: 'orientation',
      type: '"horizontal" | "vertical"',
      required: false,
      default: '"horizontal"',
      description: 'Tab layout',
      description_es: 'Orientación horizontal o vertical',
    },
  ],
  codeExample: {
    '/App.js': `import { useState } from 'react';
import Tabs from './Tabs.js';
import './styles.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('tab1');

  const tabs = [
    { id: 'tab1', label: 'Profile', content: 'Profile information goes here.' },
    { id: 'tab2', label: 'Settings', content: 'Settings configuration goes here.' },
    { id: 'tab3', label: 'Notifications', content: 'Notification preferences go here.' },
  ];

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Tabs Example</h2>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}`,
    '/Tabs.js': `export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #d1d5db' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #f97316' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : '400',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px' }}>
        {tabs.find((t) => t.id === activeTab)?.content}
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
