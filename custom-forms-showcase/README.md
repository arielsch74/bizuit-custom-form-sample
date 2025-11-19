# Bizuit Form Template - Example Project

> Complete Next.js example demonstrating Bizuit BPM integration with dynamic forms, process management, and reusable UI components.

**Live npm packages:**
- [@tyconsa/bizuit-form-sdk](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk) - Core SDK
- [@tyconsa/bizuit-ui-components](https://www.npmjs.com/package/@tyconsa/bizuit-ui-components) - UI Components

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18.17+**
- **npm** or **yarn**
- **Access to Bizuit BPM API**

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# Edit .env.local with your Bizuit API URL
# NEXT_PUBLIC_BIZUIT_FORMS_API_URL=https://your-bizuit-api.com/api

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

---

## 📚 Documentation for Developers

**Start here if this is your first time:**

1. **[Getting Started Guide](./docs/GETTING_STARTED.md)** - Complete step-by-step guide
   - Learn all concepts from zero
   - Authentication (URL tokens, manual login)
   - Dynamic forms vs manual forms
   - Start and continue process workflows

2. **[Quick Reference](./docs/QUICK_REFERENCE.md)** - Copy-paste code snippets
   - Common tasks with ready-to-use code
   - All SDK functions
   - Component examples

3. **[Code Examples](./docs/examples/)** - Full working examples
   - `01-dynamic-form-simple.tsx` - Easiest way to start a process
   - `06-get-instance-data.tsx` - Query instance information

---

## 🎯 What's Included

### Working Pages

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Navigation and links to all features |
| **Start Process** | `/start-process` | Initiate a new Bizuit process with dynamic forms |
| **Continue Process** | `/continue-process` | Continue an existing process instance |
| **Components Demo** | `/components-demo` | Interactive showcase of all UI components |
| **Login** | `/login` | Manual authentication page |

### Core Features

#### ✅ Authentication
- **URL Token**: Receive token from Bizuit BPM (`?token=...&eventName=...&instanceId=...`)
- **Manual Login**: User/password authentication
- **Hybrid Mode**: Support both methods seamlessly

#### ✅ Process Management
- **Start Process**:
  - Dynamic form generation from process metadata
  - Manual form creation with custom controls
  - Parameter validation and submission

- **Continue Process**:
  - Load existing instance data
  - Pre-fill forms with current values
  - Update parameters and variables
  - Handle locked instances

#### ✅ UI Components Library
All production-ready components from `@tyconsa/bizuit-ui-components`:

- `<DynamicFormField />` - Auto-generate form fields by parameter type
- `<ProcessSuccessScreen />` - Success state with process info
- `<BizuitDataGrid />` - Sortable, filterable tables
- `<BizuitCombo />` - Advanced dropdown with search
- `<BizuitDateTimePicker />` - Date/time selection
- `<BizuitSlider />` - Range values
- `<BizuitFileUpload />` - Drag & drop files
- `<BizuitLogin />` - Authentication form
- Theme & i18n support (English/Spanish)

---

## 📁 Project Structure

```
example/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   ├── start-process/           # Start process flow
│   ├── continue-process/        # Continue process flow
│   ├── components-demo/         # UI components showcase
│   ├── login/                   # Manual login page
│   └── api/bizuit/              # API proxy for CORS
│
├── components/
│   └── app-toolbar.tsx          # Theme/language selector
│
├── lib/
│   └── config.ts                # Bizuit SDK configuration
│
├── docs/                         # 📚 Developer documentation
│   ├── GETTING_STARTED.md       # Complete guide
│   ├── QUICK_REFERENCE.md       # Code snippets
│   └── examples/                # Full code examples
│       ├── 01-dynamic-form-simple.tsx
│       └── 06-get-instance-data.tsx
│
├── .env.example                  # Environment template
├── .env.local                    # Your config (create this)
├── package.json
└── README.md                     # This file
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` with:

```env
# Required: Bizuit API URLs
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=https://test.bizuit.com/your-api/api
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://test.bizuit.com/your-api
```

### SDK Setup

The SDK is configured globally in `lib/config.ts`:

```typescript
export const bizuitConfig = {
  formsApiUrl: process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL || '',
  dashboardApiUrl: process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL || '',
  timeout: 30000,
}
```

And initialized in `app/layout.tsx`:

```typescript
import { BizuitSDKProvider } from '@tyconsa/bizuit-form-sdk'
import { BizuitThemeProvider, BizuitAuthProvider } from '@tyconsa/bizuit-ui-components'

export default function RootLayout({ children }) {
  return (
    <BizuitSDKProvider config={bizuitConfig}>
      <BizuitThemeProvider>
        <BizuitAuthProvider>
          {children}
        </BizuitAuthProvider>
      </BizuitThemeProvider>
    </BizuitSDKProvider>
  )
}
```

---

## 💡 Common Use Cases

### 1. Start a Process with Dynamic Form

```typescript
import { useBizuitSDK, filterFormParameters, formDataToParameters } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField } from '@tyconsa/bizuit-ui-components'

// Get process parameters
const allParams = await sdk.process.getParameters('ProcessName', '', token)
const formParams = filterFormParameters(allParams) // Only input params

// Render form
{formParams.map(param => (
  <DynamicFormField
    key={param.name}
    parameter={param}
    value={formData[param.name]}
    onChange={(value) => setFormData({ ...formData, [param.name]: value })}
  />
))}

// Submit
const result = await sdk.process.start({
  eventName: 'ProcessName',
  parameters: formDataToParameters(formData),
}, [], token)

console.log('Instance ID:', result.instanceId)
```

### 2. Continue a Process

```typescript
import { loadInstanceDataForContinue } from '@tyconsa/bizuit-form-sdk'

// Load instance
const result = await loadInstanceDataForContinue(sdk, instanceId, token)

// result.formParameters - editable params with current values
// result.formData - pre-filled form data

setFormData(result.formData)

// Submit changes
await sdk.process.continueInstance({
  instanceId,
  eventName: 'ContinueEvent',
  parameters: formDataToParameters(formData),
}, [], token)
```

### 3. Receive Token from Bizuit BPM

When Bizuit calls your app with `?token=...&eventName=...&instanceId=...`:

```typescript
import { useSearchParams } from 'next/navigation'
import { processUrlToken } from '@tyconsa/bizuit-form-sdk'
import { useBizuitAuth } from '@tyconsa/bizuit-ui-components'

const searchParams = useSearchParams()
const { login } = useBizuitAuth()

const urlToken = searchParams.get('token')
const eventName = searchParams.get('eventName')
const instanceId = searchParams.get('instanceId')

useEffect(() => {
  if (urlToken) {
    const loginResponse = processUrlToken(urlToken)
    login(loginResponse)
  }
}, [urlToken])
```

---

## 🎨 Customization

### Styling

This project uses **Tailwind CSS** with full dark mode support.

**Customize colors**: Edit `tailwind.config.ts`
**Dark mode CSS variables**: Edit `app/globals.css`

### Components

All UI components support:
- Custom className prop
- Tailwind utility classes
- CSS variable theming
- Dark mode out of the box

---

## 🧪 Development

```bash
# Development server
npm run dev

# Type checking
npm run build

# Production build
npm run start
```

---

## 📖 Learn More

### Official Documentation
- [Getting Started Guide](./docs/GETTING_STARTED.md) - Learn everything step-by-step
- [Quick Reference](./docs/QUICK_REFERENCE.md) - Code snippets for common tasks
- [Code Examples](./docs/examples/) - Full working examples

### npm Packages
- [@tyconsa/bizuit-form-sdk](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk) - SDK documentation
- [@tyconsa/bizuit-ui-components](https://www.npmjs.com/package/@tyconsa/bizuit-ui-components) - Component docs

### Technologies
- [Next.js 15](https://nextjs.org/docs) - React framework
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS
- [TypeScript 5](https://www.typescriptlang.org/docs/) - Type safety
- [Radix UI](https://www.radix-ui.com/) - Headless UI components

---

## 🤝 Support

**Issues or questions?**
1. Check the [Getting Started Guide](./docs/GETTING_STARTED.md)
2. Review [Code Examples](./docs/examples/)
3. Consult [Quick Reference](./docs/QUICK_REFERENCE.md)

---

## 📄 License

MIT

---

## 🚀 Next Steps

1. **Read** [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md) for complete walkthrough
2. **Explore** the live pages at http://localhost:3000
3. **Review** code examples in `docs/examples/`
4. **Build** your first Bizuit process screen!

---

## 🔍 Component Validation

### validate-components.js

This script validates that all 17 UI component demos in `/components-demo` are correctly structured with proper Sandpack examples.

**What it validates:**
- ✅ All components have a `codeExample` object
- ✅ Each component has `/App.js` with proper imports
- ✅ JSX components used are properly imported
- ✅ Component files exist in the Sandpack example
- ⚠️ Warns if missing i18n controls (🇬🇧 EN / 🇪🇸 ES)
- ⚠️ Warns if missing theme controls (☀️/🌙/💻)
- ⚠️ Warns if missing color picker

**When to run:**
- Before committing changes to component demos
- After adding new component examples
- When updating Sandpack code examples
- To ensure all demos follow the same structure

**How to run:**

```bash
# From custom-forms-showcase/ directory
node validate-components.js
```

**Expected output (success):**
```
🔍 Validando componentes...

📊 Resumen de Validación:
   Total de componentes: 17
   Errores: 0
   Advertencias: 0

✅ Todos los componentes están correctos!
```

**Components validated:**
1. button
2. card
3. combo
4. data-grid
5. date-time-picker
6. document-input
7. dynamic-form-field
8. file-upload
9. geolocation
10. iframe
11. media
12. radio-button
13. signature
14. slider
15. stepper
16. subform
17. tabs

**Note:** This validation ensures consistency across all component demos and helps catch missing imports or broken Sandpack examples before they reach production.
