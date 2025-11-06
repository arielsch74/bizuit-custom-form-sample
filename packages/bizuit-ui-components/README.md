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

### Import Styles

In your root layout or `_app.tsx`:

```tsx
import '@bizuit/ui-components/styles.css'
```

## Components

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
