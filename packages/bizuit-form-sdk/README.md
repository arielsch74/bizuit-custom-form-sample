# @bizuit/form-sdk

Core SDK for Bizuit BPM form integration. Provides authentication, process management, and instance locking capabilities for building custom forms that interact with Bizuit BPM.

## Features

- ✅ **Authentication & Authorization** - Token validation, user info, permission checks
- ✅ **Process Management** - Initialize processes, execute RaiseEvent, handle parameters
- ✅ **Instance Locking** - Pessimistic locking for concurrent access control
- ✅ **TypeScript Support** - Full type safety with TypeScript definitions
- ✅ **React Hooks** - Easy integration with React applications
- ✅ **Complex Parameters** - Handle scalar and complex (JSON/XML) parameters
- ✅ **Error Handling** - Comprehensive error handling and logging

## Installation

```bash
npm install @bizuit/form-sdk
# or
yarn add @bizuit/form-sdk
# or
pnpm add @bizuit/form-sdk
```

## Quick Start

### 1. Setup SDK Provider (React)

```tsx
import { BizuitSDKProvider } from '@bizuit/form-sdk'

function App() {
  return (
    <BizuitSDKProvider
      config={{
        formsApiUrl: 'https://your-server.com/api',
        dashboardApiUrl: 'https://your-server.com/api',
        timeout: 120000,
      }}
    >
      <YourApp />
    </BizuitSDKProvider>
  )
}
```

### 2. Use Authentication

```tsx
import { useAuth } from '@bizuit/form-sdk'

function LoginComponent() {
  const { validateToken, user, isAuthenticated, error } = useAuth()

  const handleLogin = async (token: string) => {
    const success = await validateToken(token)
    if (success) {
      console.log('User:', user)
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.displayName}!</p>
      ) : (
        <button onClick={() => handleLogin('your-token')}>Login</button>
      )}
    </div>
  )
}
```

### 3. Start a Process

```tsx
import { useBizuitSDK } from '@bizuit/form-sdk'

function StartProcessForm() {
  const sdk = useBizuitSDK()

  const handleSubmit = async (formData: Record<string, any>) => {
    // 1. Initialize process to get parameters
    const processData = await sdk.process.initialize({
      processName: 'MyProcess',
      token: 'your-auth-token',
      userName: 'john.doe',
    })

    // 2. Merge form data with parameters
    const parameters = processData.parameters.map((param) => ({
      ...param,
      value: formData[param.name] || param.value,
    }))

    // 3. Execute RaiseEvent
    const result = await sdk.process.raiseEvent({
      eventName: 'MyProcess',
      parameters,
    })

    console.log('Process started:', result.instanceId)
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

### 4. Continue a Process (with Locking)

```tsx
import { useBizuitSDK } from '@bizuit/form-sdk'

function ContinueProcessForm({ instanceId }: { instanceId: string }) {
  const sdk = useBizuitSDK()

  const handleSubmit = async (formData: Record<string, any>) => {
    const token = 'your-auth-token'

    // Use withLock for automatic lock/unlock
    await sdk.instanceLock.withLock(
      {
        instanceId,
        activityName: 'MyActivity',
        operation: 2, // Continue operation
        processName: 'MyProcess',
      },
      token,
      async (sessionToken) => {
        // 1. Get instance data
        const instanceData = await sdk.process.getInstanceData(
          instanceId,
          sessionToken
        )

        // 2. Update parameters
        const parameters = instanceData.parameters.map((param) => ({
          ...param,
          value: formData[param.name] || param.value,
        }))

        // 3. Execute RaiseEvent
        const result = await sdk.process.raiseEvent(
          {
            eventName: 'MyProcess',
            instanceId,
            parameters,
          },
          undefined, // no files
          sessionToken
        )

        console.log('Process continued:', result)
      }
    )
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

## API Reference

### BizuitSDK

Main SDK class providing access to all services.

```typescript
const sdk = new BizuitSDK({
  formsApiUrl: string
  dashboardApiUrl: string
  timeout?: number
  defaultHeaders?: Record<string, string>
})

// Access services
sdk.auth          // BizuitAuthService
sdk.process       // BizuitProcessService
sdk.instanceLock  // BizuitInstanceLockService
```

### BizuitAuthService

```typescript
// Validate token
const user = await sdk.auth.validateToken(token)

// Check form authentication
const response = await sdk.auth.checkFormAuth({
  formId: 123,
  processName: 'MyProcess',
})

// Get user info
const userInfo = await sdk.auth.getUserInfo(token, userName)

// Check permissions
const hasAccess = await sdk.auth.checkPermissions(token, userName, [
  'Admin',
  'User',
])
```

### BizuitProcessService

```typescript
// Initialize process
const processData = await sdk.process.initialize({
  processName: 'MyProcess',
  version: '1.0.0',
  token: 'auth-token',
  userName: 'john.doe',
})

// Execute RaiseEvent
const result = await sdk.process.raiseEvent({
  eventName: 'MyProcess',
  parameters: [
    { name: 'param1', value: 'value1', type: 'SingleValue', direction: 'In' },
  ],
})

// With files
const result = await sdk.process.raiseEvent(
  {
    eventName: 'MyProcess',
    parameters: [...],
  },
  [file1, file2], // File objects
  sessionToken,
  userName
)
```

### BizuitInstanceLockService

```typescript
// Check lock status
const status = await sdk.instanceLock.checkLockStatus(
  instanceId,
  activityName,
  token
)

// Lock instance
const lockResult = await sdk.instanceLock.lock(
  {
    instanceId,
    activityName,
    operation: 2,
    processName: 'MyProcess',
  },
  token
)

// Unlock instance
await sdk.instanceLock.unlock(
  {
    instanceId,
    activityName,
    sessionToken,
  },
  token
)

// Auto lock/unlock
await sdk.instanceLock.withLock(lockRequest, token, async (sessionToken) => {
  // Your logic here
  // Instance will be unlocked automatically even if error occurs
})
```

### ParameterParser Utilities

```typescript
import { ParameterParser } from '@bizuit/form-sdk'

// Flatten parameters for form
const formData = ParameterParser.flattenParameters(parameters)

// Convert form data back to parameters
const updatedParams = ParameterParser.mergeWithFormData(parameters, formData)

// Get only input parameters
const inputs = ParameterParser.getInputParameters(parameters)

// Validate required fields
const validation = ParameterParser.validateRequired(parameters, formData)
if (!validation.valid) {
  console.log('Missing fields:', validation.missing)
}
```

## React Hooks

### useAuth

```typescript
const {
  user,
  isAuthenticated,
  isLoading,
  error,
  validateToken,
  checkFormAuth,
  getUserInfo,
  checkPermissions,
  logout,
} = useAuth({
  token: 'optional-token',
  userName: 'optional-username',
  autoValidate: true, // Auto-validate token on mount
})
```

### useBizuitSDK

```typescript
const sdk = useBizuitSDK()

// Access all services
sdk.auth.validateToken(...)
sdk.process.initialize(...)
sdk.instanceLock.lock(...)
```

## TypeScript Support

All types are exported and available:

```typescript
import type {
  IBizuitConfig,
  IUserInfo,
  IParameter,
  IProcessData,
  IRaiseEventParams,
  IRaiseEventResult,
  ILockStatus,
  // ... and many more
} from '@bizuit/form-sdk'
```

## Error Handling

```typescript
import { BizuitError, handleError } from '@bizuit/form-sdk'

try {
  await sdk.process.raiseEvent(...)
} catch (error) {
  const bizuitError = handleError(error)

  if (bizuitError.isAuthError()) {
    // Handle authentication error
  } else if (bizuitError.isNetworkError()) {
    // Handle network error
  } else {
    console.error(bizuitError.message)
  }
}
```

## License

MIT

## Support

For issues and questions, please visit [Bizuit Support](https://bizuit.com/support)
