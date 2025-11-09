/**
 * Comprehensive Documentation for ALL 17 Bizuit UI Components
 * This file contains complete props documentation, descriptions, use cases, and code examples
 * for every component in the Bizuit UI library.
 */

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
  useCases: string[]
  props: ComponentProp[]
  codeExample: { [filename: string]: string }
}

export const ALL_COMPONENTS_DOCS: ComponentDoc[] = [
  // ============================================================================
  // UI COMPONENTS
  // ============================================================================
  {
    id: 'button',
    name: 'Button',
    category: 'ui',
    icon: 'MousePointerClick',
    description: 'Customizable button component with multiple variants and sizes',
    detailedDescription:
      'A versatile button component built with React that extends native HTML button attributes. Provides six visual variants (default, destructive, outline, secondary, ghost, link) and four size options (default, sm, lg, icon). Includes proper focus states, disabled states, and accessibility features.',
    useCases: [
      'Form submissions and actions',
      'Navigation triggers',
      'Call-to-action elements',
      'Icon-only buttons in toolbars',
      'Destructive actions (delete, remove)',
      'Secondary actions in dialogs',
    ],
    props: [
      {
        name: 'variant',
        type: "'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'",
        required: false,
        default: 'default',
        description: 'Visual style variant of the button',
      },
      {
        name: 'size',
        type: "'default' | 'sm' | 'lg' | 'icon'",
        required: false,
        default: 'default',
        description: 'Size of the button',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disables the button',
      },
      {
        name: 'children',
        type: 'ReactNode',
        required: true,
        description: 'Button content',
      },
    ],
    codeExample: {
      'App.js': `import Button from './Button.js'
import './styles.css'

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
  )
}`,
      'Button.js': `export default function Button({
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
  }

  const variants = {
    default: { background: '#f97316', color: 'white' },
    destructive: { background: '#dc2626', color: 'white' },
    outline: { border: '1px solid #d1d5db', background: 'white', color: '#374151' },
    secondary: { background: 'white', color: '#374151', border: '1px solid #d1d5db' },
  }

  const sizes = {
    default: { height: '40px', padding: '0 24px', fontSize: '16px' },
    sm: { height: '32px', padding: '0 12px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 32px', fontSize: '18px' },
  }

  return (
    <button
      style={{ ...baseStyles, ...variants[variant], ...sizes[size] }}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
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

.preview {
  margin-top: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.preview h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #374151;
}

.preview-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  background: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  color: #1f2937;
}

@media (prefers-color-scheme: dark) {
  body { background: #111827; }
  .card { background: #1f2937; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); }
  .card-title { color: #f9fafb; }
  .form-label { color: #e5e7eb; }
  .form-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  .form-checkbox label { color: #e5e7eb; }
  .btn-secondary {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
  .btn-secondary:hover {
    background: #4b5563;
  }
  .preview {
    background: #111827;
    border-color: #374151;
  }
  .preview h3 { color: #e5e7eb; }
  .preview-code {
    background: #0f172a;
    border-color: #374151;
    color: #e5e7eb;
  }
}`,
    },
  },

  // ============================================================================
  // FORM COMPONENTS
  // ============================================================================
  {
    id: 'bizuit-slider',
    name: 'BizuitSlider',
    category: 'forms',
    icon: 'SlidersHorizontal',
    description: 'Customizable slider with single/range values, marks, and tooltips',
    detailedDescription:
      'A fully-featured slider component built on Radix UI Slider primitive. Supports single value or range selection, custom marks, tooltips with value formatting, vertical/horizontal orientation, and is fully responsive with touch support. Includes keyboard navigation and accessibility features.',
    useCases: [
      'Price range filters in e-commerce',
      'Volume or brightness controls',
      'Rating systems',
      'Age or date range selectors',
      'Percentage inputs',
      'Custom measurement scales',
    ],
    props: [
      {
        name: 'value',
        type: 'number | number[]',
        required: false,
        description: 'Current value(s) of the slider',
      },
      {
        name: 'onChange',
        type: '(value: number | number[]) => void',
        required: false,
        description: 'Callback when value changes',
      },
      {
        name: 'min',
        type: 'number',
        required: false,
        default: '0',
        description: 'Minimum value',
      },
      {
        name: 'max',
        type: 'number',
        required: false,
        default: '100',
        description: 'Maximum value',
      },
      {
        name: 'step',
        type: 'number',
        required: false,
        default: '1',
        description: 'Step increment',
      },
      {
        name: 'range',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Enable range mode with two handles',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disable the slider',
      },
      {
        name: 'marks',
        type: 'SliderMark[]',
        required: false,
        description: 'Array of marks to display. SliderMark has: { value: number, label?: string }',
      },
      {
        name: 'showTooltip',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Show tooltip with current value',
      },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        required: false,
        default: 'horizontal',
        description: 'Slider orientation',
      },
      {
        name: 'formatValue',
        type: '(value: number) => string',
        required: false,
        description: 'Custom formatter for tooltip and display values',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import Slider from './Slider.js'

export default function App() {
  const [singleValue, setSingleValue] = useState(50)
  const [rangeValue, setRangeValue] = useState([20, 80])

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Single Value: {singleValue}
        </h2>
        <Slider
          value={singleValue}
          onChange={setSingleValue}
          min={0}
          max={100}
        />
      </div>

      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Range: {rangeValue[0]} - {rangeValue[1]}
        </h2>
        <Slider
          value={rangeValue}
          onChange={setRangeValue}
          min={0}
          max={100}
          range
        />
      </div>
    </div>
  )
}`,
      'Slider.js': `export default function Slider({ value, onChange, min = 0, max = 100, range = false }) {
  const handleChange = (e, index) => {
    const newValue = Number(e.target.value)
    if (range) {
      const newRange = [...value]
      newRange[index] = newValue
      onChange(newRange)
    } else {
      onChange(newValue)
    }
  }

  return (
    <div style={{ width: '100%' }}>
      {range ? (
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          <input
            type="range"
            min={min}
            max={max}
            value={value[0]}
            onChange={(e) => handleChange(e, 0)}
            style={{ width: '100%', accentColor: '#ea580c' }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={value[1]}
            onChange={(e) => handleChange(e, 1)}
            style={{ width: '100%', accentColor: '#ea580c' }}
          />
        </div>
      ) : (
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => handleChange(e)}
          style={{ width: '100%', accentColor: '#ea580c' }}
        />
      )}
    </div>
  )
}`,
    },
  },

  {
    id: 'bizuit-combo',
    name: 'BizuitCombo',
    category: 'forms',
    icon: 'ChevronsUpDown',
    description: 'Advanced combobox with search, multiselect, and async loading',
    detailedDescription:
      'A powerful combobox component with extensive features including searchable options, single/multi-select modes, async option loading with debounce, grouped options, virtualization for large lists, mobile-optimized full-screen mode, clearable selections, and custom option rendering. Built with Radix UI Popover and CMDK.',
    useCases: [
      'Country/state selectors with search',
      'Tag selection in forms',
      'User assignment pickers',
      'Category filters',
      'Autocomplete search fields',
      'Multi-select filters in data grids',
    ],
    props: [
      {
        name: 'options',
        type: 'ComboOption[]',
        required: true,
        description:
          'Array of options. ComboOption: { label: string, value: string, disabled?: boolean, group?: string }',
      },
      {
        name: 'value',
        type: 'string | string[]',
        required: false,
        description: 'Selected value(s)',
      },
      {
        name: 'onChange',
        type: '(value: string | string[]) => void',
        required: false,
        description: 'Callback when selection changes',
      },
      {
        name: 'multiSelect',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Enable multi-select mode',
      },
      {
        name: 'searchable',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Enable search functionality',
      },
      {
        name: 'searchPlaceholder',
        type: 'string',
        required: false,
        default: 'Buscar...',
        description: 'Placeholder text for search input',
      },
      {
        name: 'placeholder',
        type: 'string',
        required: false,
        default: 'Seleccionar...',
        description: 'Placeholder for trigger button',
      },
      {
        name: 'emptyMessage',
        type: 'string',
        required: false,
        default: 'No se encontraron opciones',
        description: 'Message when no options match',
      },
      {
        name: 'onSearch',
        type: '(query: string) => Promise<ComboOption[]>',
        required: false,
        description: 'Async search function for server-side filtering',
      },
      {
        name: 'loading',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Show loading state',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disable the combobox',
      },
      {
        name: 'maxSelected',
        type: 'number',
        required: false,
        description: 'Maximum number of items that can be selected (multiselect mode)',
      },
      {
        name: 'showCount',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Show selected count in trigger when multiple items selected',
      },
      {
        name: 'clearable',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Show clear button',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import Combo from './Combo.js'

const countries = [
  { label: 'Argentina', value: 'ar' },
  { label: 'Brasil', value: 'br' },
  { label: 'Chile', value: 'cl' },
  { label: 'México', value: 'mx' },
  { label: 'Estados Unidos', value: 'us' },
]

export default function App() {
  const [selected, setSelected] = useState('')

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Select a Country
      </h2>
      <Combo
        options={countries}
        value={selected}
        onChange={setSelected}
        placeholder="Choose a country..."
      />
      <p style={{ marginTop: '16px', color: '#666' }}>
        Selected: {selected || 'None'}
      </p>
    </div>
  )
}`,
      'Combo.js': `export default function Combo({ options, value, onChange, placeholder = 'Select...' }) {
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          background: 'white',
          cursor: 'pointer',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}`,
    },
  },

  {
    id: 'bizuit-date-time-picker',
    name: 'BizuitDateTimePicker',
    category: 'forms',
    icon: 'Calendar',
    description: 'Advanced date/time picker with locale support and ranges',
    detailedDescription:
      'A comprehensive date and time picker built on react-day-picker with custom time input. Supports three modes: date-only, time-only, or combined datetime. Includes locale support (ES/EN), min/max date restrictions, clearable selections, 12/24-hour formats, and mobile-optimized popover interface.',
    useCases: [
      'Event scheduling forms',
      'Appointment booking systems',
      'Date range filters',
      'Birthday/date inputs',
      'Time tracking applications',
      'Deadline and reminder settings',
    ],
    props: [
      {
        name: 'value',
        type: 'Date',
        required: false,
        description: 'Selected date/time value',
      },
      {
        name: 'onChange',
        type: '(date: Date | undefined) => void',
        required: false,
        description: 'Callback when date/time changes',
      },
      {
        name: 'mode',
        type: "'date' | 'time' | 'datetime'",
        required: false,
        default: 'date',
        description: 'Picker mode',
      },
      {
        name: 'format',
        type: 'string',
        required: false,
        description: 'Custom date/time format string (date-fns format)',
      },
      {
        name: 'minDate',
        type: 'Date',
        required: false,
        description: 'Minimum selectable date',
      },
      {
        name: 'maxDate',
        type: 'Date',
        required: false,
        description: 'Maximum selectable date',
      },
      {
        name: 'locale',
        type: "'es' | 'en'",
        required: false,
        default: 'es',
        description: 'Locale for date formatting',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disable the picker',
      },
      {
        name: 'placeholder',
        type: 'string',
        required: false,
        description: 'Custom placeholder text',
      },
      {
        name: 'clearable',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Show clear button',
      },
      {
        name: 'use24Hour',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Use 24-hour time format',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import DateTimePicker from './DateTimePicker.js'

export default function App() {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Date Picker
        </h2>
        <DateTimePicker
          type="date"
          value={date}
          onChange={setDate}
        />
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          Selected: {date || 'None'}
        </p>
      </div>

      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Time Picker
        </h2>
        <DateTimePicker
          type="time"
          value={time}
          onChange={setTime}
        />
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          Selected: {time || 'None'}
        </p>
      </div>
    </div>
  )
}`,
      'DateTimePicker.js': `export default function DateTimePicker({ type = 'date', value, onChange }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        background: 'white',
      }}
    />
  )
}`,
    },
  },

  {
    id: 'bizuit-file-upload',
    name: 'BizuitFileUpload',
    category: 'forms',
    icon: 'Upload',
    description: 'Advanced file upload with drag & drop, preview, and validation',
    detailedDescription:
      'A feature-rich file upload component with drag-and-drop support, file previews for images, file type validation, size restrictions, multiple file support, progress indicators, and mobile camera integration. Includes visual feedback for drag states and comprehensive error handling.',
    useCases: [
      'Document uploads in forms',
      'Profile picture uploads',
      'Bulk file uploads',
      'Image galleries',
      'Resume/CV uploads',
      'Invoice and receipt uploads',
    ],
    props: [
      {
        name: 'value',
        type: 'File[]',
        required: false,
        default: '[]',
        description: 'Array of selected files',
      },
      {
        name: 'onChange',
        type: '(files: File[]) => void',
        required: false,
        description: 'Callback when files change',
      },
      {
        name: 'accept',
        type: 'string',
        required: false,
        description: 'Accepted file types (e.g., "image/*,.pdf")',
      },
      {
        name: 'multiple',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Allow multiple file selection',
      },
      {
        name: 'maxSize',
        type: 'number',
        required: false,
        default: '10485760',
        description: 'Maximum file size in bytes (default: 10MB)',
      },
      {
        name: 'maxFiles',
        type: 'number',
        required: false,
        default: '10',
        description: 'Maximum number of files',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disable the upload',
      },
      {
        name: 'showPreview',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Show image previews',
      },
      {
        name: 'uploadText',
        type: 'string',
        required: false,
        default: 'Seleccionar archivos',
        description: 'Text for upload button',
      },
      {
        name: 'dragText',
        type: 'string',
        required: false,
        default: 'Arrastra archivos aquí',
        description: 'Text shown during drag',
      },
      {
        name: 'onError',
        type: '(error: string) => void',
        required: false,
        description: 'Callback for validation errors',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import FileUpload from './FileUpload.js'

export default function App() {
  const [files, setFiles] = useState([])

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        File Upload
      </h2>
      <FileUpload
        files={files}
        onChange={setFiles}
        accept="image/*,.pdf,.doc"
      />
      <div style={{ marginTop: '16px' }}>
        <strong>Files selected: {files.length}</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          {files.map((file, i) => (
            <li key={i} style={{ fontSize: '14px', color: '#666' }}>
              {file.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}`,
      'FileUpload.js': `export default function FileUpload({ files, onChange, accept = '*' }) {
  const handleChange = (e) => {
    const newFiles = Array.from(e.target.files)
    onChange([...files, ...newFiles])
  }

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div>
      <input
        type="file"
        accept={accept}
        multiple
        onChange={handleChange}
        style={{
          padding: '10px',
          border: '2px dashed #d1d5db',
          borderRadius: '6px',
          width: '100%',
          cursor: 'pointer',
        }}
      />
      {files.length > 0 && (
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {files.map((file, i) => (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                background: '#f3f4f6',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{file.name}</span>
              <button
                onClick={() => removeFile(i)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#dc2626',
                  fontSize: '16px',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}`,
    },
  },

  {
    id: 'bizuit-radio-button',
    name: 'BizuitRadioButton',
    category: 'forms',
    icon: 'Circle',
    description: 'Radio button group with descriptions and validation',
    detailedDescription:
      'A radio button group component built on Radix UI Radio Group. Supports horizontal and vertical layouts, optional descriptions for each option, disabled states, form integration with labels and error messages, and full keyboard navigation.',
    useCases: [
      'Single-choice questions in forms',
      'Payment method selection',
      'Shipping option selection',
      'Agreement/consent choices',
      'Gender or category selection',
      'Yes/No questions',
    ],
    props: [
      {
        name: 'options',
        type: 'RadioOption[]',
        required: true,
        description:
          'Array of radio options. RadioOption: { label: string, value: string, disabled?: boolean, description?: string }',
      },
      {
        name: 'value',
        type: 'string',
        required: false,
        description: 'Selected value',
      },
      {
        name: 'onChange',
        type: '(value: string) => void',
        required: false,
        description: 'Callback when selection changes',
      },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        required: false,
        default: 'vertical',
        description: 'Layout orientation',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disable all options',
      },
      {
        name: 'label',
        type: 'string',
        required: false,
        description: 'Group label',
      },
      {
        name: 'name',
        type: 'string',
        required: false,
        description: 'Form field name',
      },
      {
        name: 'required',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Mark as required field',
      },
      {
        name: 'error',
        type: 'string',
        required: false,
        description: 'Error message to display',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import RadioGroup from './RadioGroup.js'

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
]

export default function App() {
  const [selected, setSelected] = useState('1')

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Radio Button Group
      </h2>
      <RadioGroup
        options={options}
        value={selected}
        onChange={setSelected}
      />
      <p style={{ marginTop: '16px', color: '#666' }}>
        Selected: {selected}
      </p>
    </div>
  )
}`,
      'RadioGroup.js': `export default function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {options.map((option) => (
        <label
          key={option.value}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <input
            type="radio"
            name="radio-group"
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#ea580c',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '14px' }}>{option.label}</span>
        </label>
      ))}
    </div>
  )
}`,
    },
  },

  {
    id: 'bizuit-signature',
    name: 'BizuitSignature',
    category: 'forms',
    icon: 'PenTool',
    description: 'Digital signature pad with undo, clear, and download',
    detailedDescription:
      'A canvas-based signature capture component with drawing capabilities using mouse or touch. Features include undo/redo history, clear functionality, customizable pen color and width, background color, signature download as PNG, and full mobile touch support.',
    useCases: [
      'Contract signing',
      'Delivery confirmations',
      'Authorization forms',
      'Consent documents',
      'Medical forms',
      'Legal agreements',
    ],
    props: [
      {
        name: 'value',
        type: 'string',
        required: false,
        description: 'Base64 data URL of signature',
      },
      {
        name: 'onChange',
        type: '(dataURL: string) => void',
        required: false,
        description: 'Callback when signature changes',
      },
      {
        name: 'width',
        type: 'number',
        required: false,
        default: '500',
        description: 'Canvas width in pixels',
      },
      {
        name: 'height',
        type: 'number',
        required: false,
        default: '200',
        description: 'Canvas height in pixels',
      },
      {
        name: 'penColor',
        type: 'string',
        required: false,
        default: '#000000',
        description: 'Pen color (hex/rgb)',
      },
      {
        name: 'penWidth',
        type: 'number',
        required: false,
        default: '2',
        description: 'Pen width in pixels',
      },
      {
        name: 'backgroundColor',
        type: 'string',
        required: false,
        default: '#ffffff',
        description: 'Canvas background color',
      },
      {
        name: 'label',
        type: 'string',
        required: false,
        description: 'Field label',
      },
      {
        name: 'required',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Mark as required',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disable signature input',
      },
      {
        name: 'showDownload',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Show download button',
      },
      {
        name: 'error',
        type: 'string',
        required: false,
        description: 'Error message',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState, useRef } from 'react'
import SignaturePad from './SignaturePad.js'

export default function App() {
  const [signature, setSignature] = useState(null)

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Digital Signature
      </h2>
      <SignaturePad onSave={setSignature} />
      <p style={{ marginTop: '16px', color: '#666' }}>
        {signature ? '✓ Signature captured' : 'Draw your signature above'}
      </p>
      {signature && (
        <img src={signature} alt="Signature" style={{ marginTop: '16px', border: '1px solid #ccc' }} />
      )}
    </div>
  )
}`,
      'SignaturePad.js': `import { useRef, useState } from 'react'

export default function SignaturePad({ onSave }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => setIsDrawing(false)

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const save = () => {
    const canvas = canvasRef.current
    onSave(canvas.toDataURL())
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ border: '2px solid #d1d5db', borderRadius: '6px', cursor: 'crosshair' }}
      />
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        <button onClick={clear} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Clear
        </button>
        <button onClick={save} style={{ padding: '8px 16px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Save
        </button>
      </div>
    </div>
  )
}`,
    },
  },

  {
    id: 'bizuit-document-input',
    name: 'BizuitDocumentInput',
    category: 'forms',
    icon: 'FileText',
    description: 'Document upload with drag & drop and file management',
    detailedDescription:
      'A specialized file input component optimized for document uploads (PDFs, DOCs, etc.). Features drag-and-drop, file preview generation for images, size validation, multiple file support with management, visual file list with icons, and individual file removal.',
    useCases: [
      'Resume/CV uploads',
      'Contract document uploads',
      'Invoice submissions',
      'Legal document collection',
      'ID/passport uploads',
      'Supporting document attachments',
    ],
    props: [
      {
        name: 'value',
        type: 'DocumentFile[]',
        required: false,
        default: '[]',
        description:
          'Array of document files. DocumentFile: { file: File, preview?: string, id: string }',
      },
      {
        name: 'onChange',
        type: '(files: DocumentFile[]) => void',
        required: false,
        description: 'Callback when files change',
      },
      {
        name: 'accept',
        type: 'string',
        required: false,
        default: '.pdf,.doc,.docx,.txt',
        description: 'Accepted file types',
      },
      {
        name: 'maxSize',
        type: 'number',
        required: false,
        default: '10485760',
        description: 'Maximum file size in bytes (default: 10MB)',
      },
      {
        name: 'maxFiles',
        type: 'number',
        required: false,
        default: '5',
        description: 'Maximum number of files',
      },
      {
        name: 'label',
        type: 'string',
        required: false,
        description: 'Field label',
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Helper text',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disable the input',
      },
      {
        name: 'required',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Mark as required',
      },
      {
        name: 'error',
        type: 'string',
        required: false,
        description: 'Error message',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import DocumentInput from './DocumentInput.js'

export default function App() {
  const [documents, setDocuments] = useState([])

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Document Upload
      </h2>
      <DocumentInput
        documents={documents}
        onChange={setDocuments}
        accept=".pdf,.doc,.docx"
      />
      <p style={{ marginTop: '16px', color: '#666' }}>
        {documents.length} document(s) uploaded
      </p>
    </div>
  )
}`,
      'DocumentInput.js': `export default function DocumentInput({ documents, onChange, accept = '.pdf,.doc,.docx' }) {
  const handleChange = (e) => {
    const newFiles = Array.from(e.target.files)
    onChange([...documents, ...newFiles])
  }

  const removeDocument = (index) => {
    onChange(documents.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: '6px',
          padding: '32px',
          textAlign: 'center',
          background: '#f9fafb',
        }}
      >
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label
          htmlFor="file-input"
          style={{
            padding: '10px 20px',
            background: '#ea580c',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          Choose Documents
        </label>
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          or drag and drop
        </p>
      </div>
      {documents.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {documents.map((doc, i) => (
            <div
              key={i}
              style={{
                padding: '12px',
                background: '#f3f4f6',
                borderRadius: '6px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '14px' }}>📄 {doc.name}</span>
              <button
                onClick={() => removeDocument(i)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#dc2626',
                  fontSize: '18px',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}`,
    },
  },

  {
    id: 'bizuit-geolocation',
    name: 'BizuitGeolocation',
    category: 'forms',
    icon: 'MapPin',
    description: 'Geolocation capture with map preview and accuracy info',
    detailedDescription:
      'A geolocation component that uses the browser Geolocation API to capture the user\'s current position. Displays latitude, longitude, and accuracy information. Optionally shows a link to view the location on Google Maps. Includes loading states and error handling.',
    useCases: [
      'Delivery location capture',
      'Store location finders',
      'Check-in systems',
      'Location-based services',
      'Field service apps',
      'Emergency location reporting',
    ],
    props: [
      {
        name: 'value',
        type: 'GeolocationData',
        required: false,
        description:
          'Current location. GeolocationData: { latitude: number, longitude: number, accuracy?: number, timestamp: number }',
      },
      {
        name: 'onChange',
        type: '(location: GeolocationData) => void',
        required: false,
        description: 'Callback when location changes',
      },
      {
        name: 'label',
        type: 'string',
        required: false,
        description: 'Field label',
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Helper text',
      },
      {
        name: 'showMap',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Show link to Google Maps',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disable location capture',
      },
      {
        name: 'required',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Mark as required',
      },
      {
        name: 'error',
        type: 'string',
        required: false,
        description: 'Error message',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import Geolocation from './Geolocation.js'

export default function App() {
  const [location, setLocation] = useState(null)

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Geolocation
      </h2>
      <Geolocation onLocationChange={setLocation} />
      {location && (
        <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '6px' }}>
          <strong>Location:</strong>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Latitude: {location.lat.toFixed(6)}<br />
            Longitude: {location.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}`,
      'Geolocation.js': `import { useState } from 'react'

export default function Geolocation({ onLocationChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getLocation = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
  }

  return (
    <div>
      <button
        onClick={getLocation}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: loading ? '#9ca3af' : '#ea580c',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Getting location...' : 'Get My Location'}
      </button>
      {error && (
        <p style={{ marginTop: '8px', color: '#dc2626', fontSize: '14px' }}>
          Error: {error}
        </p>
      )}
    </div>
  )
}`,
    },
  },

  {
    id: 'bizuit-subform',
    name: 'BizuitSubForm',
    category: 'forms',
    icon: 'Table',
    description: 'Dynamic table-based subform with row management',
    detailedDescription:
      'A dynamic table component for capturing multiple rows of related data. Features configurable fields (text, number, date, select), add/remove row functionality, min/max row constraints, and responsive table layout. Ideal for repeating data entry scenarios.',
    useCases: [
      'Line items in invoices',
      'Multiple contact entries',
      'Product variations',
      'Education history',
      'Work experience entries',
      'Itemized lists',
    ],
    props: [
      {
        name: 'fields',
        type: 'SubFormField[]',
        required: true,
        description:
          "Array of field definitions. SubFormField: { name: string, label: string, type: 'text' | 'number' | 'date' | 'select', options?: { label: string, value: string }[], required?: boolean }",
      },
      {
        name: 'value',
        type: 'SubFormRow[]',
        required: false,
        default: '[]',
        description: 'Array of row data. SubFormRow: { id: string, [key: string]: any }',
      },
      {
        name: 'onChange',
        type: '(rows: SubFormRow[]) => void',
        required: false,
        description: 'Callback when rows change',
      },
      {
        name: 'label',
        type: 'string',
        required: false,
        description: 'Subform label',
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Helper text',
      },
      {
        name: 'maxRows',
        type: 'number',
        required: false,
        default: '10',
        description: 'Maximum number of rows',
      },
      {
        name: 'minRows',
        type: 'number',
        required: false,
        default: '0',
        description: 'Minimum number of rows',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Disable the subform',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import SubForm from './SubForm.js'

export default function App() {
  const [rows, setRows] = useState([{ id: 1, item: '', quantity: 0, price: 0 }])

  const addRow = () => {
    setRows([...rows, { id: Date.now(), item: '', quantity: 0, price: 0 }])
  }

  const removeRow = (id) => {
    setRows(rows.filter(row => row.id !== id))
  }

  const updateRow = (id, field, value) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row))
  }

  const total = rows.reduce((sum, row) => sum + (row.quantity * row.price), 0)

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Invoice Items
      </h2>
      <SubForm rows={rows} onUpdate={updateRow} onRemove={removeRow} />
      <button
        onClick={addRow}
        style={{
          marginTop: '12px',
          padding: '8px 16px',
          background: '#ea580c',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Add Row
      </button>
      <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: 'bold' }}>
        Total: {total.toFixed(2)}
      </p>
    </div>
  )
}`,
      'SubForm.js': `export default function SubForm({ rows, onUpdate, onRemove }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db' }}>Item</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db' }}>Quantity</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db' }}>Price</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db' }}>Total</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>
                <input
                  type="text"
                  value={row.item}
                  onChange={(e) => onUpdate(row.id, 'item', e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>
                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) => onUpdate(row.id, 'quantity', Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>
                <input
                  type="number"
                  value={row.price}
                  onChange={(e) => onUpdate(row.id, 'price', Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>
                {(row.quantity * row.price).toFixed(2)}
              </td>
              <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>
                <button
                  onClick={() => onRemove(row.id)}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}`,
    },
  },

  {
    id: 'dynamic-form-field',
    name: 'DynamicFormField',
    category: 'forms',
    icon: 'Sparkles',
    description: 'Auto-renders form fields based on Bizuit process parameters',
    detailedDescription:
      'A smart component that automatically renders the appropriate input type based on Bizuit process parameter metadata. Supports string, number, boolean, date/datetime types. Integrates with BizuitDateTimePicker for date fields. Handles required field indicators and parameter type display.',
    useCases: [
      'Dynamic form generation from API schemas',
      'Bizuit process integration',
      'Workflow forms',
      'Configuration UIs',
      'Admin panels with dynamic fields',
      'API-driven forms',
    ],
    props: [
      {
        name: 'parameter',
        type: 'IBizuitProcessParameter',
        required: true,
        description:
          'Bizuit process parameter with metadata (name, type, parameterDirection, etc.)',
      },
      {
        name: 'value',
        type: 'any',
        required: true,
        description: 'Current field value',
      },
      {
        name: 'onChange',
        type: '(value: any) => void',
        required: true,
        description: 'Callback when value changes',
      },
      {
        name: 'required',
        type: 'boolean',
        required: false,
        description: 'Override required status (defaults to parameter.parameterDirection === 1)',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import DynamicField from './DynamicField.js'

const fields = [
  { name: 'name', type: 'text', label: 'Name', required: true },
  { name: 'age', type: 'number', label: 'Age', required: true },
  { name: 'email', type: 'text', label: 'Email', required: false },
  { name: 'subscribe', type: 'checkbox', label: 'Subscribe to newsletter', required: false },
]

export default function App() {
  const [formData, setFormData] = useState({})

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Dynamic Form
      </h2>
      {fields.map((field) => (
        <DynamicField
          key={field.name}
          field={field}
          value={formData[field.name]}
          onChange={(value) => handleChange(field.name, value)}
        />
      ))}
      <div style={{ marginTop: '24px', padding: '16px', background: '#f3f4f6', borderRadius: '6px' }}>
        <strong>Form Data:</strong>
        <pre style={{ fontSize: '12px', marginTop: '8px' }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  )
}`,
      'DynamicField.js': `export default function DynamicField({ field, value, onChange }) {
  const { name, type, label, required } = field

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {type === 'checkbox' ? (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: '18px', height: '18px', accentColor: '#ea580c' }}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
      )}
    </div>
  )
}`,
    },
  },

  // ============================================================================
  // LAYOUT COMPONENTS
  // ============================================================================
  {
    id: 'bizuit-tabs',
    name: 'BizuitTabs',
    category: 'layout',
    icon: 'Folders',
    description: 'Tabbed interface with multiple variants and orientations',
    detailedDescription:
      'A flexible tabs component built on Radix UI Tabs. Supports three visual variants (default, pills, underline), horizontal/vertical orientations, icons in tab labels, disabled tabs, and controlled/uncontrolled modes. Perfect for organizing content into switchable panels.',
    useCases: [
      'Settings panels',
      'Multi-step forms',
      'Dashboard sections',
      'Product information tabs',
      'Content categorization',
      'Documentation pages',
    ],
    props: [
      {
        name: 'items',
        type: 'TabItem[]',
        required: true,
        description:
          'Array of tab items. TabItem: { value: string, label: string, content: ReactNode, disabled?: boolean, icon?: ReactNode }',
      },
      {
        name: 'defaultValue',
        type: 'string',
        required: false,
        description: 'Default active tab value (uncontrolled)',
      },
      {
        name: 'value',
        type: 'string',
        required: false,
        description: 'Active tab value (controlled)',
      },
      {
        name: 'onChange',
        type: '(value: string) => void',
        required: false,
        description: 'Callback when active tab changes',
      },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        required: false,
        default: 'horizontal',
        description: 'Tab orientation',
      },
      {
        name: 'variant',
        type: "'default' | 'pills' | 'underline'",
        required: false,
        default: 'default',
        description: 'Visual variant',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import Tabs from './Tabs.js'

const tabs = [
  { id: 'profile', label: 'Profile', content: 'Profile information goes here.' },
  { id: 'settings', label: 'Settings', content: 'Settings configuration goes here.' },
  { id: 'notifications', label: 'Notifications', content: 'Notification preferences go here.' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Tabs Component
      </h2>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}`,
      'Tabs.js': `export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '16px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #ea580c' : '2px solid transparent',
              color: activeTab === tab.id ? '#ea580c' : '#6b7280',
              fontWeight: activeTab === tab.id ? '600' : '400',
              cursor: 'pointer',
              marginBottom: '-2px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px' }}>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}`,
    },
  },

  {
    id: 'bizuit-card',
    name: 'BizuitCard',
    category: 'layout',
    icon: 'LayoutGrid',
    description: 'Versatile card container with header, footer, and variants',
    detailedDescription:
      'A flexible card component for displaying content in a contained, elevated layout. Supports optional title, description, header, and footer sections. Provides three visual variants (default, outline, filled) plus hoverable and clickable states for interactive cards.',
    useCases: [
      'Product cards',
      'User profile cards',
      'Dashboard widgets',
      'Content previews',
      'Feature highlights',
      'Statistic displays',
    ],
    props: [
      {
        name: 'title',
        type: 'string',
        required: false,
        description: 'Card title',
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Card description',
      },
      {
        name: 'header',
        type: 'ReactNode',
        required: false,
        description: 'Custom header content',
      },
      {
        name: 'footer',
        type: 'ReactNode',
        required: false,
        description: 'Custom footer content',
      },
      {
        name: 'variant',
        type: "'default' | 'outline' | 'filled'",
        required: false,
        default: 'default',
        description: 'Visual variant',
      },
      {
        name: 'hoverable',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Add hover shadow effect',
      },
      {
        name: 'clickable',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Add clickable styles and animations',
      },
      {
        name: 'children',
        type: 'ReactNode',
        required: false,
        description: 'Card content',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import Card from './Card.js'

export default function App() {
  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Card Component
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <Card
          title="Default Card"
          description="A simple card component"
        >
          <p style={{ fontSize: '14px', color: '#666' }}>
            This is the card content area.
          </p>
        </Card>

        <Card
          title="Hoverable Card"
          hoverable
          onClick={() => alert('Card clicked!')}
        >
          <p style={{ fontSize: '14px', color: '#666' }}>
            Hover over me to see the effect!
          </p>
        </Card>

        <Card title="Card with Footer">
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Content with footer actions.
          </p>
          <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <button style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button style={{ padding: '6px 12px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Save
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}`,
      'Card.js': `export default function Card({ title, description, children, hoverable = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        background: 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        boxShadow: hoverable ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {title && (
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          {title}
        </h3>
      )}
      {description && (
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
          {description}
        </p>
      )}
      {children}
    </div>
  )
}`,
    },
  },

  {
    id: 'bizuit-stepper',
    name: 'BizuitStepper',
    category: 'layout',
    icon: 'GitBranch',
    description: 'Step indicator for multi-step processes and workflows',
    detailedDescription:
      'A visual step indicator component for guiding users through multi-step processes. Shows current, completed, and upcoming steps with visual states. Supports horizontal and vertical orientations, optional step icons, descriptions, and clickable steps for navigation.',
    useCases: [
      'Multi-step forms',
      'Checkout processes',
      'Onboarding flows',
      'Tutorial sequences',
      'Application processes',
      'Workflow tracking',
    ],
    props: [
      {
        name: 'steps',
        type: 'StepItem[]',
        required: true,
        description:
          'Array of steps. StepItem: { label: string, description?: string, icon?: ReactNode }',
      },
      {
        name: 'currentStep',
        type: 'number',
        required: true,
        description: 'Index of current step (0-based)',
      },
      {
        name: 'onChange',
        type: '(step: number) => void',
        required: false,
        description: 'Callback when step is clicked (if clickable)',
      },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        required: false,
        default: 'horizontal',
        description: 'Stepper orientation',
      },
      {
        name: 'clickable',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Allow clicking on steps to navigate',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import Stepper from './Stepper.js'

const steps = ['Account', 'Profile', 'Payment', 'Confirmation']

export default function App() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>
        Checkout Process
      </h2>
      <Stepper steps={steps} currentStep={currentStep} />
      <div style={{ marginTop: '32px', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Step {currentStep + 1}: {steps[currentStep]}
        </h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Complete the {steps[currentStep].toLowerCase()} information.
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          style={{
            padding: '10px 20px',
            background: currentStep === 0 ? '#e5e7eb' : '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          style={{
            padding: '10px 20px',
            background: currentStep === steps.length - 1 ? '#9ca3af' : '#ea580c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep === steps.length - 1 ? 'not-allowed' : 'pointer',
          }}
        >
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}`,
      'Stepper.js': `export default function Stepper({ steps, currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {steps.map((step, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: index <= currentStep ? '#ea580c' : '#e5e7eb',
                color: index <= currentStep ? 'white' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                marginBottom: '8px',
              }}
            >
              {index + 1}
            </div>
            <span style={{ fontSize: '14px', fontWeight: index === currentStep ? '600' : '400', color: index <= currentStep ? '#111827' : '#9ca3af' }}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: '2px',
                background: index < currentStep ? '#ea580c' : '#e5e7eb',
                marginLeft: '8px',
                marginRight: '8px',
                marginBottom: '32px',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}`,
    },
  },

  // ============================================================================
  // MEDIA COMPONENTS
  // ============================================================================
  {
    id: 'bizuit-media',
    name: 'BizuitMedia',
    category: 'media',
    icon: 'PlayCircle',
    description: 'Unified media player for images, videos, audio, camera, and QR scanner',
    detailedDescription:
      'A comprehensive media component supporting five different modes: image display, video player with controls, audio player, camera capture with front/back switching, and QR code scanner. Includes custom controls, fullscreen support, camera switching, photo capture, and QR detection capabilities.',
    useCases: [
      'Image galleries and previews',
      'Video playback in content',
      'Audio player for podcasts',
      'Profile picture capture',
      'Document scanning via camera',
      'QR code scanning for authentication',
    ],
    props: [
      {
        name: 'src',
        type: 'string',
        required: false,
        description: 'Media source URL (not used for camera/qr-scanner types)',
      },
      {
        name: 'type',
        type: "'image' | 'video' | 'audio' | 'camera' | 'qr-scanner'",
        required: true,
        description: 'Type of media to display/capture',
      },
      {
        name: 'alt',
        type: 'string',
        required: false,
        default: 'Media content',
        description: 'Alt text for images',
      },
      {
        name: 'width',
        type: 'string | number',
        required: false,
        description: 'Media width',
      },
      {
        name: 'height',
        type: 'string | number',
        required: false,
        description: 'Media height',
      },
      {
        name: 'controls',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Show media controls (video/audio)',
      },
      {
        name: 'autoPlay',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Auto-play media',
      },
      {
        name: 'loop',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Loop media playback',
      },
      {
        name: 'muted',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Mute audio/video',
      },
      {
        name: 'onCapture',
        type: '(dataUrl: string) => void',
        required: false,
        description: 'Callback when photo is captured (camera type)',
      },
      {
        name: 'onQRCodeDetected',
        type: '(data: string) => void',
        required: false,
        description: 'Callback when QR code is detected (qr-scanner type)',
      },
      {
        name: 'facingMode',
        type: "'user' | 'environment'",
        required: false,
        default: 'environment',
        description: 'Initial camera facing mode',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import Media from './Media.js'

export default function App() {
  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Media Component
      </h2>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Image</h3>
        <Media
          type="image"
          src="https://picsum.photos/400/300"
          alt="Sample image"
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Video</h3>
        <Media
          type="video"
          src="https://www.w3schools.com/html/mov_bbb.mp4"
        />
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Audio</h3>
        <Media
          type="audio"
          src="https://www.w3schools.com/html/horse.mp3"
        />
      </div>
    </div>
  )
}`,
      'Media.js': `export default function Media({ type, src, alt = 'Media content' }) {
  const mediaStyle = {
    maxWidth: '100%',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  }

  switch (type) {
    case 'image':
      return <img src={src} alt={alt} style={mediaStyle} />

    case 'video':
      return (
        <video controls style={mediaStyle}>
          <source src={src} type="video/mp4" />
          Your browser does not support video.
        </video>
      )

    case 'audio':
      return (
        <audio controls style={{ width: '100%' }}>
          <source src={src} type="audio/mpeg" />
          Your browser does not support audio.
        </audio>
      )

    default:
      return <div>Unsupported media type</div>
  }
}`,
    },
  },

  {
    id: 'bizuit-iframe',
    name: 'BizuitIFrame',
    category: 'media',
    icon: 'Globe',
    description: 'IFrame wrapper with loading states and error handling',
    detailedDescription:
      'An enhanced iframe component with built-in loading spinner, error states, lazy loading support, and responsive sizing. Automatically handles iframe lifecycle events and provides visual feedback during loading and on errors.',
    useCases: [
      'Embedding external content',
      'Integration with third-party services',
      'Displaying external dashboards',
      'Embedding payment gateways',
      'Showing external documentation',
      'Map embeds',
    ],
    props: [
      {
        name: 'src',
        type: 'string',
        required: true,
        description: 'URL of the content to embed',
      },
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Accessible title for the iframe',
      },
      {
        name: 'width',
        type: 'string | number',
        required: false,
        default: '100%',
        description: 'IFrame width',
      },
      {
        name: 'height',
        type: 'string | number',
        required: false,
        default: '500',
        description: 'IFrame height',
      },
      {
        name: 'loading',
        type: "'eager' | 'lazy'",
        required: false,
        default: 'lazy',
        description: 'Loading strategy',
      },
      {
        name: 'showLoader',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Show loading spinner',
      },
      {
        name: 'onLoad',
        type: '() => void',
        required: false,
        description: 'Callback when iframe loads',
      },
      {
        name: 'onError',
        type: '() => void',
        required: false,
        description: 'Callback when iframe fails to load',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import IFrame from './IFrame.js'

export default function App() {
  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        IFrame Component
      </h2>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          Google Maps
        </h3>
        <IFrame
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.959080638154!2d-58.38375908477068!3d-34.60373798045825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacab9f8f45d%3A0xb4e4e8c5c8e8d8e0!2sObelisco!5e0!3m2!1ses!2sar!4v1234567890"
          title="Map"
          height={400}
        />
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          YouTube Video
        </h3>
        <IFrame
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="YouTube video"
          height={400}
        />
      </div>
    </div>
  )
}`,
      'IFrame.js': `import { useState } from 'react'

export default function IFrame({ src, title, height = 400 }) {
  const [loading, setLoading] = useState(true)

  return (
    <div style={{ position: 'relative', width: '100%', height: height }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f3f4f6',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>
        </div>
      )}
      <iframe
        src={src}
        title={title}
        onLoad={() => setLoading(false)}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
        }}
        allowFullScreen
      />
    </div>
  )
}`,
    },
  },

  // ============================================================================
  // DATA COMPONENTS
  // ============================================================================
  {
    id: 'bizuit-data-grid',
    name: 'BizuitDataGrid',
    category: 'data',
    icon: 'Table2',
    description: 'Production-ready data grid with sorting, filtering, and pagination',
    detailedDescription:
      'A powerful data grid component built on TanStack Table v8. Features include sortable columns, filterable data, pagination with customizable page sizes, row selection (single/multiple), mobile-responsive modes (card/scroll/stack), loading states, empty states, and fully customizable column definitions. Optimized for performance with large datasets.',
    useCases: [
      'Admin dashboards',
      'Data management interfaces',
      'Report tables',
      'User lists',
      'Product catalogs',
      'Transaction histories',
    ],
    props: [
      {
        name: 'columns',
        type: 'ColumnDef<TData, TValue>[]',
        required: true,
        description: 'TanStack Table column definitions',
      },
      {
        name: 'data',
        type: 'TData[]',
        required: true,
        description: 'Array of data rows',
      },
      {
        name: 'selectable',
        type: "'none' | 'single' | 'multiple'",
        required: false,
        default: 'none',
        description: 'Row selection mode',
      },
      {
        name: 'selectedRows',
        type: 'RowSelectionState',
        required: false,
        description: 'Controlled selected rows state',
      },
      {
        name: 'onSelectionChange',
        type: '(selection: RowSelectionState) => void',
        required: false,
        description: 'Callback when selection changes',
      },
      {
        name: 'sortable',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Enable column sorting',
      },
      {
        name: 'filterable',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Enable filtering',
      },
      {
        name: 'paginated',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Enable pagination',
      },
      {
        name: 'pageSize',
        type: 'number',
        required: false,
        default: '10',
        description: 'Initial page size',
      },
      {
        name: 'onRowClick',
        type: '(row: TData) => void',
        required: false,
        description: 'Callback when row is clicked',
      },
      {
        name: 'emptyMessage',
        type: 'string',
        required: false,
        default: 'No hay datos para mostrar',
        description: 'Message when data is empty',
      },
      {
        name: 'loading',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Show loading state',
      },
      {
        name: 'mobileMode',
        type: "'card' | 'scroll' | 'stack'",
        required: false,
        default: 'scroll',
        description: 'Mobile display mode',
      },
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
    ],
    codeExample: {
      'App.js': `import { useState } from 'react'
import DataGrid from './DataGrid.js'

const data = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'María García', email: 'maria@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Ana Martínez', email: 'ana@example.com', role: 'Editor', status: 'Active' },
  { id: 5, name: 'Pedro Rodríguez', email: 'pedro@example.com', role: 'User', status: 'Active' },
]

export default function App() {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div style={{ padding: '32px', background: 'white' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        User Management
      </h2>
      <DataGrid data={sortedData} onSort={handleSort} sortConfig={sortConfig} />
    </div>
  )
}`,
      'DataGrid.js': `export default function DataGrid({ data, onSort, sortConfig }) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f9fafb' }}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {col.label}
                {sortConfig.key === col.key && (
                  <span style={{ marginLeft: '4px' }}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id}
              style={{
                background: i % 2 === 0 ? 'white' : '#f9fafb',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <td style={{ padding: '12px 16px', fontSize: '14px' }}>{row.id}</td>
              <td style={{ padding: '12px 16px', fontSize: '14px' }}>{row.name}</td>
              <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{row.email}</td>
              <td style={{ padding: '12px 16px', fontSize: '14px' }}>{row.role}</td>
              <td style={{ padding: '12px 16px' }}>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: row.status === 'Active' ? '#d1fae5' : '#f3f4f6',
                    color: row.status === 'Active' ? '#065f46' : '#6b7280',
                  }}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}`,
    },
  },
]
