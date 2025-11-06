/**
 * Bizuit Authentication Service
 * Handles token validation, user info, and auth checks
 */

import { BizuitHttpClient } from './http-client'
import type {
  IAuthCheckResponse,
  IUserInfo,
  IRequestCheckFormAuth,
  ILoginSettings,
  IBizuitConfig,
} from '../types'

export class BizuitAuthService {
  private client: BizuitHttpClient
  private formsApiUrl: string

  constructor(config: IBizuitConfig) {
    this.client = new BizuitHttpClient(config)
    this.formsApiUrl = config.formsApiUrl
  }

  /**
   * Check form authentication and authorization
   * Validates token and returns login configuration
   */
  async checkFormAuth(
    request: IRequestCheckFormAuth,
    token?: string
  ): Promise<IAuthCheckResponse> {
    const headers: Record<string, string> = {
      'BZ-FORM-VIEWER': 'true',
    }

    if (token) {
      headers['BZ-AUTH-TOKEN'] = token
    }

    if (request.formId) {
      headers['BZ-FORM-ID'] = String(request.formId)
    }

    if (request.formName) {
      headers['BZ-FORM-NAME'] = request.formName
    }

    if (request.processName) {
      headers['BZ-PROCESS-NAME'] = request.processName
    }

    try {
      const response = await this.client.post<IAuthCheckResponse>(
        `${this.formsApiUrl}/Login/CheckFormAuth`,
        request,
        { headers }
      )

      return response
    } catch (error: any) {
      return {
        success: false,
        canRetry: error.statusCode !== 401,
        errorMessage: error.message,
        errorType: error.code,
      }
    }
  }

  /**
   * Get current user information from token
   */
  async getUserInfo(token: string, userName: string): Promise<IUserInfo> {
    this.client.withBizuitHeaders({
      'BZ-AUTH-TOKEN': token,
      'BZ-USER-NAME': userName,
    })

    const userInfo = await this.client.get<IUserInfo>(
      `${this.formsApiUrl}/Login/UserInfo`
    )

    this.client.clearBizuitHeaders()

    return userInfo
  }

  /**
   * Get login configuration (OAuth, AD, etc.)
   */
  async getLoginConfiguration(): Promise<Partial<ILoginSettings>> {
    const config = await this.client.get<Partial<ILoginSettings>>(
      `${this.formsApiUrl}/Login/LoginConfiguration`
    )

    return config
  }

  /**
   * Validate token and get user data
   * Returns null if token is invalid
   */
  async validateToken(token: string): Promise<IUserInfo | null> {
    try {
      // Extract username from token (Basic auth: base64(username:password))
      const decoded = atob(token.replace('Basic ', ''))
      const userName = decoded.split(':')[0]

      const userInfo = await this.getUserInfo(token, userName)
      return userInfo
    } catch (error) {
      console.error('[BizuitAuthService] Token validation failed:', error)
      return null
    }
  }

  /**
   * Check if user has required permissions
   */
  async checkPermissions(
    token: string,
    userName: string,
    requiredRoles: string[]
  ): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo(token, userName)

      if (!userInfo.roles || requiredRoles.length === 0) {
        return true
      }

      return requiredRoles.some((role) => userInfo.roles.includes(role))
    } catch (error) {
      console.error('[BizuitAuthService] Permission check failed:', error)
      return false
    }
  }

  /**
   * Login methods (delegated to Bizuit Dashboard API)
   */
  async azureLogin(idToken: string, accessToken: string): Promise<any> {
    return this.client.post(`${this.formsApiUrl}/Login/AzureLogin`, {
      idToken,
      accessToken,
    })
  }

  async oauthLogin(code: string, redirectUri: string): Promise<any> {
    return this.client.get(
      `${this.formsApiUrl}/Login/GetOauthLoginAsync?code=${code}&redirectUri=${redirectUri}`
    )
  }

  async socialLogin(token: string, type: 'google' | 'facebook'): Promise<any> {
    return this.client.get(`${this.formsApiUrl}/Login/SocialLogin?type=${type}`, {
      headers: {
        Authorization: `Basic ${token}`,
      },
    })
  }
}
