# Bizuit Form Example

Example Next.js application demonstrating integration with Bizuit BPM using the [@bizuit/form-sdk](../BizuitFormTemplate/packages/bizuit-form-sdk) and [@bizuit/ui-components](../BizuitFormTemplate/packages/bizuit-ui-components) packages.

## Features Demonstrated

This example project showcases:

### 1. Authentication & Authorization
- Token validation from Bizuit BPM
- Permission checking for process operations
- User information extraction from JWT tokens
- Support for OAuth, Azure AD, and Entra ID

### 2. Start Process Flow
- Process initialization
- Parameter binding to UI components
- Process instance creation via RaiseEvent
- Error handling and success feedback

### 3. Continue Process Flow
- Pessimistic locking implementation
- Lock status checking
- Automatic lock/unlock with `withLock` pattern
- Instance data retrieval
- Bidirectional binding for parameters/variables
- Read-only display of completed activities

### 4. UI Components
All @bizuit/ui-components are demonstrated:
- **BizuitDataGrid**: Sortable, filterable, paginated data tables
- **BizuitCombo**: Single/multi-select with search and async loading
- **BizuitDateTimePicker**: Date, time, and datetime selection
- **BizuitSlider**: Range values with custom marks
- **BizuitFileUpload**: Drag & drop file upload with previews

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Access to Bizuit BPM API

### Installation

1. Clone the repository and navigate to the example project:

```bash
cd /Users/arielschwindt/SourceCode/PlayGround/bizuit-form-example
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Bizuit BPM API configuration:

```env
NEXT_PUBLIC_BIZUIT_API_URL=https://your-bizuit-api.com
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
bizuit-form-example/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── globals.css             # Global styles with dark mode
│   ├── page.tsx                # Home page with navigation
│   ├── start-process/
│   │   └── page.tsx            # Start process example
│   └── continue-process/
│       └── page.tsx            # Continue process example
├── .env.example                # Environment variables template
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies
```

## Usage Examples

### Start Process Page

Navigate to `/start-process` to see:

1. **Authentication Form**:
   - Enter Process ID (e.g., "PROC-001")
   - Paste JWT token from Bizuit BPM
   - Click "Autenticar e Inicializar"

2. **Process Form**:
   - Fill in form fields using various UI components
   - All components are fully interactive
   - Submit to create process instance

3. **Success Screen**:
   - Confirmation of process creation
   - Option to start another process or return home

### Continue Process Page

Navigate to `/continue-process` to see:

1. **Authentication & Locking**:
   - Enter Instance ID
   - Paste JWT token
   - System checks lock status
   - Automatically locks instance for editing

2. **Process Form with History**:
   - View completed activities (read-only DataGrid)
   - Edit current activity data
   - All changes are tracked with pessimistic lock

3. **Automatic Unlock**:
   - Lock released on successful submit
   - Lock released on cancel
   - Lock released on page unload

## SDK Configuration

The SDK is configured in each page component:

```typescript
import { BizuitSDKProvider } from '@bizuit/form-sdk'

const sdkConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BIZUIT_API_URL || 'https://api.bizuit.com',
  timeout: 30000,
  retries: 3,
}

export default function MyPage() {
  return (
    <BizuitSDKProvider config={sdkConfig}>
      {/* Your component */}
    </BizuitSDKProvider>
  )
}
```

## Using the Hooks

### useAuth Hook

```typescript
import { useAuth } from '@bizuit/form-sdk'

function MyComponent() {
  const {
    validateToken,
    checkFormAuth,
    getUserInfo,
    isAuthenticated,
    user,
    loading
  } = useAuth()

  // Validate token
  const isValid = await validateToken(token)

  // Check permissions
  const authResult = await checkFormAuth(token, processId, 'start')

  // Get user info
  const userInfo = await getUserInfo(token)
}
```

### useBizuitSDK Hook

```typescript
import { useBizuitSDK } from '@bizuit/form-sdk'

function MyComponent() {
  const sdk = useBizuitSDK()

  // Initialize process
  const result = await sdk.process.initialize(
    { processId: 'PROC-001' },
    token
  )

  // Start process
  await sdk.process.raiseEvent(
    {
      processId: 'PROC-001',
      parameters: formData,
    },
    token
  )

  // Continue process with locking
  await sdk.instanceLock.withLock(
    { instanceId: 'INST-123' },
    token,
    async (sessionToken) => {
      return await sdk.process.raiseEvent(
        {
          instanceId: 'INST-123',
          parameters: formData,
          sessionToken,
        },
        token
      )
    }
  )
}
```

## UI Components Examples

### BizuitCombo

```typescript
import { BizuitCombo } from '@bizuit/ui-components'

const options = [
  { value: 'opt1', label: 'Option 1', group: 'Group A' },
  { value: 'opt2', label: 'Option 2', group: 'Group A' },
]

<BizuitCombo
  options={options}
  value={value}
  onChange={setValue}
  placeholder="Select option"
  searchable
  multiSelect={false}
/>
```

### BizuitDateTimePicker

```typescript
import { BizuitDateTimePicker } from '@bizuit/ui-components'

<BizuitDateTimePicker
  value={date}
  onChange={setDate}
  mode="datetime"
  locale="es"
/>
```

### BizuitDataGrid

```typescript
import { BizuitDataGrid } from '@bizuit/ui-components'

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
]

<BizuitDataGrid
  columns={columns}
  data={data}
  selectable="multiple"
  sortable
  filterable
  paginated
  onSelectionChange={setSelection}
/>
```

### BizuitSlider

```typescript
import { BizuitSlider } from '@bizuit/ui-components'

<BizuitSlider
  value={value}
  onChange={setValue}
  min={0}
  max={100}
  step={5}
  showTooltip
  marks={[
    { value: 0, label: '0' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
  ]}
/>
```

### BizuitFileUpload

```typescript
import { BizuitFileUpload } from '@bizuit/ui-components'

<BizuitFileUpload
  value={files}
  onChange={setFiles}
  multiple
  maxSize={5 * 1024 * 1024} // 5MB
  accept={{
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg'],
  }}
/>
```

## Dark Mode

Dark mode is supported out of the box. The theme automatically switches based on system preferences or can be manually toggled.

The theme is configured in:
- [app/globals.css](app/globals.css) - CSS variables for light/dark themes
- [tailwind.config.ts](tailwind.config.ts) - Tailwind dark mode configuration

## TypeScript

This project is fully typed with TypeScript. All SDK methods, hooks, and UI components have complete type definitions.

## Browser Support

- Chrome/Edge (latest)
- Safari (latest)
- Opera (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Localization

The example supports Spanish (es) and English (en) locales, primarily for date/time pickers.

## Troubleshooting

### Token Validation Fails

- Ensure your token is valid and not expired
- Check that the `baseUrl` in your `.env.local` matches your Bizuit API
- Verify CORS settings on your API

### Lock Errors

- If you get "Instance is locked" errors, wait for the lock to expire or contact the user who has it locked
- Ensure you're properly releasing locks with `unlock()` or using `withLock()`

### Component Styling Issues

- Make sure Tailwind CSS is properly configured
- Check that `globals.css` is imported in `layout.tsx`
- Verify CSS variables are defined for both light and dark themes

## Next Steps

To create your own forms:

1. Copy one of the example pages as a starting point
2. Modify the form fields to match your process parameters
3. Update the SDK calls with your actual process/instance IDs
4. Customize the UI components with your brand colors and styles
5. Add validation with React Hook Form + Zod (optional)

## Related Packages

- [@bizuit/form-sdk](../BizuitFormTemplate/packages/bizuit-form-sdk) - Core SDK for Bizuit BPM integration
- [@bizuit/ui-components](../BizuitFormTemplate/packages/bizuit-ui-components) - React UI components

## License

MIT
