# @bizuit/ui-components

Production-ready, fully customizable UI components for Bizuit BPM forms. Built with **Radix UI**, **Tailwind CSS**, and **React** - optimized for desktop and mobile.

## Features

- ✅ **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- ✅ **Dark Mode** - Built-in dark mode support
- ✅ **100% Customizable** - Override any style with className or Tailwind
- ✅ **TypeScript** - Full type safety
- ✅ **Accessible** - WCAG 2.1 compliant (Radix UI)
- ✅ **Touch Optimized** - Native mobile gestures
- ✅ **Modern Browsers** - Chrome, Safari, Firefox, Edge
- ✅ **i18n Ready** - Spanish and English locales

## Installation

```bash
npm install @bizuit/ui-components @bizuit/form-sdk
# Peer dependencies
npm install react react-dom

# Install Tailwind CSS (if not already)
npm install -D tailwindcss postcss autoprefixer
```

### Tailwind Configuration

Add to your `tailwind.config.js`:

```js
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/@bizuit/ui-components/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      // Copy theme extension from package
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

## Usage Patterns

See **[@tyconsa/bizuit-form-sdk](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk)** for the three recommended form implementation strategies:

1. **Dynamic Fields** - Auto-generate with `DynamicFormField` (good for generic forms)
2. **Manual + Send All** - Custom UI with `formDataToParameters()` (good for simple forms)
3. **Manual + Selective** - Custom UI with `buildParameters()` ⭐ **BEST PRACTICE** (production apps)

[View full strategy guide →](https://github.com/bizuit/form-template/blob/main/packages/bizuit-form-sdk/README.md#form-implementation-strategies)

[Live examples →](https://github.com/bizuit/form-template/tree/main/example/app)

### Import Styles

In your root layout or `_app.tsx`:

```tsx
import '@bizuit/ui-components/styles.css'
```

## Components

### 📋 DynamicFormField

Auto-generate form fields from Bizuit BPM parameter definitions. Perfect for dynamic forms where fields come from the API.

```tsx
import { DynamicFormField } from '@bizuit/ui-components'
import { useBizuitSDK } from '@bizuit/form-sdk'

function DynamicForm() {
  const sdk = useBizuitSDK()
  const [parameters, setParameters] = useState([])
  const [formData, setFormData] = useState({})

  // Load parameters from Bizuit API
  useEffect(() => {
    const loadParams = async () => {
      const params = await sdk.process.getProcessParameters('MyProcess', '', token)
      const inputParams = params.filter(p =>
        !p.isSystemParameter &&
        (p.direction === 'In' || p.direction === 'InOut')
      )
      setParameters(inputParams)
    }
    loadParams()
  }, [])

  return (
    <form>
      {parameters.map(param => (
        <DynamicFormField
          key={param.name}
          parameter={param}
          value={formData[param.name]}
          onChange={(value) => setFormData({...formData, [param.name]: value})}
        />
      ))}
      <button type="submit">Submit</button>
    </form>
  )
}
```

**Props:**
- `parameter` - Bizuit parameter definition (`IParameter`)
- `value` - Current field value
- `onChange` - Change handler `(value: any) => void`
- `className` - Custom CSS class
- `disabled` - Disable input
- `required` - Mark as required

**Supported Parameter Types:**
- `SingleValue` (string/number) → Text input
- `Boolean` → Checkbox
- `Date` → Date picker
- `Xml` → Textarea (for XML/JSON)
- `ComplexObject` → Textarea (JSON)

[See live example →](https://github.com/bizuit/form-template/tree/main/example/app/example-1-dynamic)

---

### 📊 BizuitDataGrid

Advanced data grid with sorting, filtering, pagination, and row selection.

```tsx
import { BizuitDataGrid, SortableHeader, type ColumnDef } from '@bizuit/ui-components'

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'age',
    header: 'Age',
    cell: ({ row }) => <span className="font-bold">{row.getValue('age')}</span>,
  },
]

function MyGrid() {
  return (
    <BizuitDataGrid
      data={people}
      columns={columns}
      selectable="multiple"
      sortable
      filterable
      paginated
      pageSize={20}
      onRowClick={(row) => console.log('Clicked:', row)}
      onSelectionChange={(selection) => console.log('Selected:', selection)}
    />
  )
}
```

**Props:**
- `columns` - Column definitions (TanStack Table)
- `data` - Data array
- `selectable` - 'none' | 'single' | 'multiple'
- `sortable` - Enable sorting
- `filterable` - Enable filtering
- `paginated` - Enable pagination
- `pageSize` - Rows per page (default: 10)
- `onRowClick` - Row click handler
- `loading` - Show loading state
- `mobileMode` - 'card' | 'scroll' | 'stack'

---

### 🔽 BizuitCombo

Advanced combobox with search, multiselect, and async loading.

```tsx
import { BizuitCombo, type ComboOption } from '@bizuit/ui-components'

const options: ComboOption[] = [
  { label: 'Argentina', value: 'ar', group: 'Latinoamérica' },
  { label: 'Brasil', value: 'br', group: 'Latinoamérica' },
  { label: 'Chile', value: 'cl', group: 'Latinoamérica' },
  { label: 'USA', value: 'us', group: 'North America' },
]

function MyCombo() {
  const [selected, setSelected] = useState<string[]>([])

  return (
    <BizuitCombo
      options={options}
      value={selected}
      onChange={setSelected}
      multiSelect
      searchable
      placeholder="Seleccionar países"
      maxSelected={5}
      showCount
    />
  )
}
```

**Async Search Example:**

```tsx
<BizuitCombo
  options={[]}
  value={selected}
  onChange={setSelected}
  searchable
  onSearch={async (query) => {
    const results = await fetchFromAPI(query)
    return results.map(r => ({ label: r.name, value: r.id }))
  }}
/>
```

**Props:**
- `options` - Available options
- `value` - Selected value(s)
- `onChange` - Change handler
- `multiSelect` - Enable multiple selection
- `searchable` - Enable search
- `onSearch` - Async search function
- `renderOption` - Custom option render
- `maxSelected` - Max items (multiselect)
- `clearable` - Show clear button
- `mobileFullScreen` - Full screen on mobile

---

### 📅 BizuitDateTimePicker

Date/time picker with locale support and mobile optimization.

```tsx
import { BizuitDateTimePicker } from '@bizuit/ui-components'

function MyDatePicker() {
  const [date, setDate] = useState<Date>()

  return (
    <BizuitDateTimePicker
      value={date}
      onChange={setDate}
      mode="datetime"
      locale="es"
      minDate={new Date()}
      maxDate={addDays(new Date(), 30)}
      format="dd/MM/yyyy HH:mm"
      clearable
      use24Hour
    />
  )
}
```

**Props:**
- `value` - Selected date
- `onChange` - Change handler
- `mode` - 'date' | 'time' | 'datetime'
- `format` - Date format string
- `minDate` / `maxDate` - Date range
- `locale` - 'es' | 'en'
- `use24Hour` - 24-hour time format
- `clearable` - Show clear button

---

### 🎚️ BizuitSlider

Customizable slider with single/range values and marks.

```tsx
import { BizuitSlider, type SliderMark } from '@bizuit/ui-components'

const marks: SliderMark[] = [
  { value: 0, label: 'Min' },
  { value: 50, label: 'Mid' },
  { value: 100, label: 'Max' },
]

function MySlider() {
  const [value, setValue] = useState(50)

  return (
    <BizuitSlider
      value={value}
      onChange={setValue}
      min={0}
      max={100}
      step={5}
      marks={marks}
      showTooltip
      formatValue={(v) => `${v}%`}
    />
  )
}
```

**Range Slider:**

```tsx
<BizuitSlider
  value={[20, 80]}
  onChange={setRange}
  range
  min={0}
  max={100}
/>
```

**Props:**
- `value` - Current value(s)
- `onChange` - Change handler
- `min` / `max` / `step` - Range config
- `range` - Enable range (two handles)
- `marks` - Custom marks
- `showTooltip` - Show value tooltip
- `orientation` - 'horizontal' | 'vertical'
- `formatValue` - Format tooltip

---

### 📤 BizuitFileUpload

File upload with drag & drop, preview, and validation.

```tsx
import { BizuitFileUpload } from '@bizuit/ui-components'

function MyFileUpload() {
  const [files, setFiles] = useState<File[]>([])

  return (
    <BizuitFileUpload
      value={files}
      onChange={setFiles}
      accept="image/*,.pdf"
      multiple
      maxSize={10 * 1024 * 1024} // 10MB
      maxFiles={5}
      showPreview
      onError={(error) => toast.error(error)}
    />
  )
}
```

**Props:**
- `value` - Selected files
- `onChange` - Change handler
- `accept` - File types (MIME types or extensions)
- `multiple` - Allow multiple files
- `maxSize` - Max file size in bytes
- `maxFiles` - Max number of files
- `showPreview` - Show image previews
- `onError` - Validation error handler

---

### 🔘 BizuitRadioButton

Radio button group for single-selection form inputs with horizontal/vertical layouts.

```tsx
import { BizuitRadioButton, type RadioOption } from '@bizuit/ui-components'

const options: RadioOption[] = [
  {
    label: 'Opción 1',
    value: '1',
    description: 'Esta es la primera opción'
  },
  {
    label: 'Opción 2',
    value: '2',
    description: 'Esta es la segunda opción'
  },
  {
    label: 'Opción 3 (Deshabilitada)',
    value: '3',
    disabled: true
  },
]

function MyRadioGroup() {
  const [selected, setSelected] = useState('1')

  return (
    <BizuitRadioButton
      options={options}
      value={selected}
      onChange={setSelected}
      label="Seleccione una opción"
      required
      orientation="vertical"
    />
  )
}
```

**Horizontal Layout:**

```tsx
<BizuitRadioButton
  options={options}
  value={selected}
  onChange={setSelected}
  orientation="horizontal"
/>
```

**Props:**
- `options` - Array of radio options with label, value, disabled, description
- `value` - Currently selected value
- `onChange` - Change handler `(value: string) => void`
- `orientation` - 'horizontal' | 'vertical' (default: 'vertical')
- `label` - Group label
- `required` - Mark as required field
- `error` - Error message to display
- `disabled` - Disable all options
- `className` - Custom CSS class
- `name` - Form field name

**Features:**
- Accessible with Radix UI (ARIA compliant)
- Keyboard navigation support
- Optional descriptions per option
- Individual option disable
- Dark mode compatible

---

### ✍️ BizuitSignature

Canvas-based signature capture with undo, clear, and download functionality.

```tsx
import { BizuitSignature } from '@bizuit/ui-components'

function MySignature() {
  const [signature, setSignature] = useState<string>()

  const handleSubmit = () => {
    // signature is a base64 data URL
    console.log('Signature:', signature)
    // Send to API or save to state
  }

  return (
    <BizuitSignature
      value={signature}
      onChange={setSignature}
      label="Firma del cliente"
      required
      width={500}
      height={200}
      penColor="#000000"
      penWidth={2}
      backgroundColor="#ffffff"
      showDownload
    />
  )
}
```

**Mobile-Optimized Signature:**

```tsx
<BizuitSignature
  value={signature}
  onChange={setSignature}
  width={window.innerWidth - 40} // Responsive width
  height={150}
  penWidth={3} // Thicker for touch
  label="Firma aquí con tu dedo"
/>
```

**Props:**
- `value` - Signature as base64 data URL
- `onChange` - Change handler `(dataURL: string) => void`
- `width` - Canvas width in pixels (default: 500)
- `height` - Canvas height in pixels (default: 200)
- `penColor` - Drawing color (default: '#000000')
- `penWidth` - Line width (default: 2)
- `backgroundColor` - Canvas background (default: '#ffffff')
- `label` - Input label
- `required` - Mark as required field
- `error` - Error message to display
- `disabled` - Disable drawing
- `showDownload` - Show download button (default: true)
- `className` - Custom CSS class

**Features:**
- Touch support for mobile/tablet devices
- Mouse support for desktop
- Undo functionality with history management
- Clear canvas button
- Download signature as PNG
- No external dependencies (pure Canvas API)
- Dark mode compatible border

**Usage in Bizuit BPM Approval Workflows:**

```tsx
import { BizuitSignature } from '@bizuit/ui-components'
import { useBizuitSDK } from '@bizuit/form-sdk'

function ApprovalForm() {
  const sdk = useBizuitSDK()
  const [signature, setSignature] = useState<string>()
  const [formData, setFormData] = useState({
    approved: false,
    comments: '',
  })

  const handleSubmit = async () => {
    const params = sdk.buildParameters([
      { name: 'Approved', value: formData.approved },
      { name: 'Comments', value: formData.comments },
      { name: 'Signature', value: signature }, // Base64 image
      { name: 'SignedDate', value: new Date().toISOString() },
    ])

    await sdk.process.completeTask(taskId, params, token)
  }

  return (
    <form>
      <label>
        <input
          type="checkbox"
          checked={formData.approved}
          onChange={(e) => setFormData({...formData, approved: e.target.checked})}
        />
        Aprobar solicitud
      </label>

      <textarea
        value={formData.comments}
        onChange={(e) => setFormData({...formData, comments: e.target.value})}
        placeholder="Comentarios"
      />

      <BizuitSignature
        value={signature}
        onChange={setSignature}
        label="Firma de aprobación"
        required
      />

      <button onClick={handleSubmit} disabled={!signature}>
        Enviar Aprobación
      </button>
    </form>
  )
}
```

---

## Customization

### With Tailwind Classes

All components accept `className` prop:

```tsx
<BizuitCombo
  className="w-full max-w-md"
  options={options}
/>

<BizuitDataGrid
  className="border-2 border-blue-500 rounded-lg"
  data={data}
  columns={columns}
/>
```

### Custom Styles

Override CSS variables:

```css
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.75rem;
}
```

### Dark Mode

```tsx
<html className="dark">
  <body>
    <BizuitCombo options={options} />
  </body>
</html>
```

### Custom Renders

```tsx
<BizuitCombo
  options={countries}
  renderOption={(option) => (
    <div className="flex items-center gap-2">
      <img src={option.flag} className="w-4 h-4" />
      <span>{option.label}</span>
    </div>
  )}
/>
```

## Mobile Optimization

All components are touch-optimized:

- Large touch targets (44x44px minimum)
- Native mobile gestures
- Responsive layouts
- Mobile-specific UX (full-screen pickers on mobile)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 14+
- Opera (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## TypeScript

All components are fully typed:

```tsx
import type {
  DataGridProps,
  ComboOption,
  BizuitComboProps,
  SliderMark,
} from '@bizuit/ui-components'
```

## Performance

- Virtual scrolling for large lists (DataGrid, Combo)
- Lazy loading images (FileUpload)
- Debounced search (Combo)
- Optimized re-renders

## Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation
- Screen reader support
- ARIA attributes
- Focus management

## License

MIT

## Support

For issues and questions, please visit [Bizuit Support](https://bizuit.com/support)
