import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'
process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL = '/api/bizuit'
process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL = '/api/bizuit'
