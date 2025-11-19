/**
 * Dashboard Parameters Parser
 *
 * Extracts and parses query string parameters sent from Bizuit Dashboard.
 *
 * Dashboard sends URLs like:
 * ?InstanceId=12345&UserName=admin&s=aAAV/9xqhAE=&eventName=MyProcess&activityName=Task1&token=Basic123
 */

export interface DashboardQueryParams {
  // Required: encrypted security token
  s?: string  // Encrypted TokenId (TripleDES)

  // Optional: additional parameters
  InstanceId?: string
  UserName?: string
  eventName?: string
  activityName?: string
  token?: string  // Auth token (different from 's')
}

export interface DashboardParameters {
  // From Dashboard query string
  instanceId?: string
  userName?: string
  eventName?: string
  activityName?: string
  token?: string

  // From SecurityTokens table (after validation)
  tokenId?: string
  operation?: number
  requesterAddress?: string
  expirationDate?: string
}

export interface ValidateDashboardTokenResponse {
  valid: boolean
  parameters?: DashboardParameters
  error?: string
}

/**
 * Extract Dashboard parameters from URL query string
 */
export function extractDashboardParams(): DashboardQueryParams | null {
  if (typeof window === 'undefined') {
    return null
  }

  const searchParams = new URLSearchParams(window.location.search)

  const params: DashboardQueryParams = {
    s: searchParams.get('s') || undefined,
    InstanceId: searchParams.get('InstanceId') || undefined,
    UserName: searchParams.get('UserName') || undefined,
    eventName: searchParams.get('eventName') || undefined,
    activityName: searchParams.get('activityName') || undefined,
    token: searchParams.get('token') || undefined,
  }

  // Return null if no 's' parameter (not from Dashboard)
  if (!params.s) {
    return null
  }

  return params
}

/**
 * Validate Dashboard token with backend API
 */
export async function validateDashboardToken(
  params: DashboardQueryParams
): Promise<ValidateDashboardTokenResponse> {
  try {
    if (!params.s) {
      return {
        valid: false,
        error: 'Missing encrypted token parameter (s)'
      }
    }

    const response = await fetch('http://localhost:8000/api/dashboard/validate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encryptedToken: params.s,
        instanceId: params.InstanceId,
        userName: params.UserName,
        eventName: params.eventName,
        activityName: params.activityName,
        token: params.token,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ValidateDashboardTokenResponse = await response.json()
    return result

  } catch (error) {
    console.error('[Dashboard Params] Validation error:', error)
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Check if current page load is from Dashboard
 */
export function isFromDashboard(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.has('s')
}

/**
 * Get complete Dashboard parameters (extract + validate)
 *
 * This is the main function to use in components.
 */
export async function getDashboardParameters(): Promise<{
  valid: boolean
  parameters?: DashboardParameters
  error?: string
}> {
  try {
    console.log('[Dashboard Params] Checking for Dashboard parameters...')

    // 1. Extract query params
    const queryParams = extractDashboardParams()

    if (!queryParams) {
      console.log('[Dashboard Params] No Dashboard parameters found')
      return {
        valid: false,
        error: 'Not loaded from Dashboard (missing "s" parameter)'
      }
    }

    console.log('[Dashboard Params] Found Dashboard parameters:', {
      hasEncryptedToken: !!queryParams.s,
      instanceId: queryParams.InstanceId,
      userName: queryParams.UserName,
      eventName: queryParams.eventName,
      activityName: queryParams.activityName,
      hasToken: !!queryParams.token,
    })

    // 2. Validate with backend
    console.log('[Dashboard Params] Validating token with backend...')
    const validation = await validateDashboardToken(queryParams)

    if (validation.valid) {
      console.log('[Dashboard Params] ✅ Validation successful:', validation.parameters)
    } else {
      console.error('[Dashboard Params] ❌ Validation failed:', validation.error)
    }

    return validation

  } catch (error) {
    console.error('[Dashboard Params] Error getting parameters:', error)
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
