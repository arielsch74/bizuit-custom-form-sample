// Configuración COMPLETA de documentación de componentes

export interface ComponentProp {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
}

export interface ComponentDoc {
  id: string
  name: string
  category: 'ui' | 'forms' | 'layout' | 'media' | 'data'
  icon: string
  description: string
  detailedDescription: string
  usage: string
  props: ComponentProp[]
  codeExample: { [filename: string]: string }
}

export const COMPONENT_CATEGORIES = {
  ui: { label: 'UI Components', icon: '🎨' },
  forms: { label: 'Form Components', icon: '📝' },
  layout: { label: 'Layout Components', icon: '📐' },
  media: { label: 'Media Components', icon: '🎬' },
  data: { label: 'Data Components', icon: '📊' },
}

export const COMPONENTS_DOCS: ComponentDoc[] = [
  // ========== UI COMPONENTS ==========
  {
    id: 'button',
    name: 'Button',
    category: 'ui',
    icon: '🔘',
    description: 'Botón versátil con múltiples variantes de estilo',
    detailedDescription: `El componente Button es un elemento de acción fundamental que soporta 6 variantes diferentes de estilo.
    
Características principales:
• 6 variantes: default, secondary, destructive, outline, ghost, link
• Soporte completo para estados disabled
• Compatible con iconos de Lucide React
• Totalmente accesible (ARIA)
• Theming automático con dark mode`,
    usage: `import { Button } from '@tyconsa/bizuit-ui-components'

<Button>Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>`,
    props: [
      { name: 'variant', type: "'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'", required: false, default: 'default', description: 'Variante visual del botón' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, default: 'md', description: 'Tamaño del botón' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Deshabilitar el botón' },
      { name: 'onClick', type: '() => void', required: false, description: 'Handler para el evento click' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Contenido del botón' },
      { name: 'className', type: 'string', required: false, description: 'Clases CSS adicionales' },
    ],
    codeExample: {
      '/App.js': `import { Button } from '@tyconsa/bizuit-ui-components';

export default function App() {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      <h3>Variantes de Botones</h3>
      <Button>Default Button</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link Button</Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}`
    }
  },

  // ========== FORM COMPONENTS ==========
  {
    id: 'slider',
    name: 'BizuitSlider',
    category: 'forms',
    icon: '🎚️',
    description: 'Control deslizante para valores numéricos en un rango',
    detailedDescription: `BizuitSlider permite a los usuarios seleccionar valores numéricos arrastrando un control deslizante.
    
Casos de uso ideales:
• Ajustes de volumen, brillo, zoom
• Filtros de precio en e-commerce
• Configuración de parámetros numéricos
• Selección de rangos de edad, distancia, etc.

Características:
• Valores min/max configurables
• Step personalizable para incrementos
• Etiqueta descriptiva integrada
• Visual feedback en tiempo real
• Totalmente responsive`,
    usage: `import { useState } from 'react'
import { BizuitSlider } from '@tyconsa/bizuit-ui-components'

const [value, setValue] = useState(50)

<BizuitSlider
  label="Volumen"
  value={value}
  onChange={setValue}
  min={0}
  max={100}
  step={5}
/>`,
    props: [
      { name: 'label', type: 'string', required: true, description: 'Etiqueta descriptiva del slider' },
      { name: 'value', type: 'number', required: true, description: 'Valor actual seleccionado' },
      { name: 'onChange', type: '(value: number) => void', required: true, description: 'Callback cuando el valor cambia' },
      { name: 'min', type: 'number', required: false, default: '0', description: 'Valor mínimo permitido' },
      { name: 'max', type: 'number', required: false, default: '100', description: 'Valor máximo permitido' },
      { name: 'step', type: 'number', required: false, default: '1', description: 'Incremento entre valores' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Deshabilitar el control' },
      { name: 'className', type: 'string', required: false, description: 'Clases CSS adicionales' },
    ],
    codeExample: {
      '/App.js': `import { useState } from 'react';
import { BizuitSlider } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(75);

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h3>Controles Deslizantes</h3>
      
      <BizuitSlider
        label="Volumen"
        value={volume}
        onChange={setVolume}
        min={0}
        max={100}
        step={5}
      />
      <p>Volumen: <strong>{volume}%</strong></p>

      <div style={{ marginTop: '24px' }} />
      
      <BizuitSlider
        label="Brillo de Pantalla"
        value={brightness}
        onChange={setBrightness}
        min={0}
        max={100}
        step={1}
      />
      <p>Brillo: <strong>{brightness}%</strong></p>
    </div>
  );
}`
    }
  },

  {
    id: 'combo',
    name: 'BizuitCombo',
    category: 'forms',
    icon: '📋',
    description: 'Selector desplegable con búsqueda y autocompletado',
    detailedDescription: `BizuitCombo es un selector avanzado que combina las características de un dropdown con capacidades de búsqueda.

Perfecto para:
• Listas largas de opciones (países, ciudades, productos)
• Selección con búsqueda type-ahead
• Autocompletado de formularios
• Filtrado dinámico de opciones

Características destacadas:
• Búsqueda integrada
• Teclado navigable
• Accesibilidad completa (ARIA)
• Personalizable con placeholder
• Soporte para opciones dinámicas`,
    usage: `import { BizuitCombo } from '@tyconsa/bizuit-ui-components'

const options = [
  { value: 'ar', label: 'Argentina' },
  { value: 'br', label: 'Brasil' }
]

<BizuitCombo
  label="País"
  options={options}
  value={selected}
  onChange={setSelected}
  placeholder="Selecciona..."
/>`,
    props: [
      { name: 'label', type: 'string', required: true, description: 'Etiqueta del campo' },
      { name: 'options', type: 'Array<{value: string, label: string}>', required: true, description: 'Lista de opciones disponibles' },
      { name: 'value', type: 'string', required: true, description: 'Valor actualmente seleccionado' },
      { name: 'onChange', type: '(value: string) => void', required: true, description: 'Callback al cambiar la selección' },
      { name: 'placeholder', type: 'string', required: false, default: 'Selecciona una opción...', description: 'Texto cuando no hay selección' },
      { name: 'searchable', type: 'boolean', required: false, default: 'true', description: 'Habilitar búsqueda de opciones' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Deshabilitar el componente' },
      { name: 'className', type: 'string', required: false, description: 'Clases CSS adicionales' },
    ],
    codeExample: {
      '/App.js': `import { useState } from 'react';
import { BizuitCombo } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const countries = [
    { value: 'ar', label: 'Argentina' },
    { value: 'br', label: 'Brasil' },
    { value: 'cl', label: 'Chile' },
    { value: 'uy', label: 'Uruguay' },
    { value: 'py', label: 'Paraguay' },
  ];

  const cities = [
    { value: 'bsas', label: 'Buenos Aires' },
    { value: 'cba', label: 'Córdoba' },
    { value: 'ros', label: 'Rosario' },
    { value: 'mdz', label: 'Mendoza' },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>Formulario de Ubicación</h3>
      
      <BizuitCombo
        label="Selecciona tu país"
        options={countries}
        value={country}
        onChange={setCountry}
        placeholder="Busca o selecciona..."
      />

      <div style={{ marginTop: '16px' }} />

      <BizuitCombo
        label="Selecciona tu ciudad"
        options={cities}
        value={city}
        onChange={setCity}
        disabled={!country}
        placeholder={country ? "Busca tu ciudad..." : "Primero selecciona un país"}
      />

      {country && city && (
        <div style={{ marginTop: '20px', padding: '12px', background: '#f0f0f0', borderRadius: '8px' }}>
          <strong>Ubicación seleccionada:</strong><br/>
          {countries.find(c => c.value === country)?.label} - {cities.find(c => c.value === city)?.label}
        </div>
      )}
    </div>
  );
}`
    }
  },
]

export default COMPONENTS_DOCS
