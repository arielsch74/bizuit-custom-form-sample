/**
 * Form Error Types and User-Friendly Messages
 *
 * Provides structured error handling with clear, actionable messages for users
 */

export enum FormErrorType {
  // Form not found errors
  FORM_NOT_FOUND = 'FORM_NOT_FOUND',
  FORM_INACTIVE = 'FORM_INACTIVE',

  // Permission/Authorization errors
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Loading errors
  LOAD_FAILED = 'LOAD_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // Unknown errors
  UNKNOWN = 'UNKNOWN'
}

export interface FormErrorInfo {
  type: FormErrorType
  title: string
  message: string
  userAction: string
  technicalDetails?: string
  icon: 'not-found' | 'forbidden' | 'expired' | 'error'
  canRetry: boolean
}

/**
 * Parse error message and return structured error info
 */
export function parseFormError(error: string, formName: string): FormErrorInfo {
  const lowerError = error.toLowerCase()

  // Form not found
  if (lowerError.includes('not found') || lowerError.includes('404')) {
    return {
      type: FormErrorType.FORM_NOT_FOUND,
      title: 'Formulario No Encontrado',
      message: `El formulario "${formName}" no existe o no está publicado.`,
      userAction: 'Verifique que el nombre del formulario sea correcto o contacte al administrador del sistema.',
      icon: 'not-found',
      canRetry: false,
      technicalDetails: error
    }
  }

  // Form inactive
  if (lowerError.includes('inactive') || lowerError.includes('disabled')) {
    return {
      type: FormErrorType.FORM_INACTIVE,
      title: 'Formulario No Disponible',
      message: `El formulario "${formName}" está desactivado temporalmente.`,
      userAction: 'Este formulario no está disponible en este momento. Contacte al administrador del sistema.',
      icon: 'forbidden',
      canRetry: false,
      technicalDetails: error
    }
  }

  // Token not found or expired
  if (lowerError.includes('token not found')) {
    return {
      type: FormErrorType.TOKEN_NOT_FOUND,
      title: 'Acceso No Autorizado',
      message: 'El token de acceso no es válido o no existe en el sistema.',
      userAction: 'Este enlace puede haber sido generado incorrectamente. Por favor, acceda al formulario nuevamente desde el Dashboard de Bizuit.',
      icon: 'forbidden',
      canRetry: false,
      technicalDetails: error
    }
  }

  if (lowerError.includes('expired') || lowerError.includes('expiró')) {
    return {
      type: FormErrorType.TOKEN_EXPIRED,
      title: 'Sesión Expirada',
      message: 'Su sesión ha expirado por seguridad.',
      userAction: 'Por favor, regrese al Dashboard de Bizuit y vuelva a acceder al formulario.',
      icon: 'expired',
      canRetry: false,
      technicalDetails: error
    }
  }

  // Invalid token/encryption
  if (lowerError.includes('invalid') || lowerError.includes('decrypt') || lowerError.includes('base64')) {
    return {
      type: FormErrorType.TOKEN_INVALID,
      title: 'Token Inválido',
      message: 'El token de acceso no pudo ser validado.',
      userAction: 'El enlace puede estar corrupto. Por favor, acceda al formulario nuevamente desde el Dashboard de Bizuit.',
      icon: 'forbidden',
      canRetry: false,
      technicalDetails: error
    }
  }

  // Network errors
  if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
    return {
      type: FormErrorType.NETWORK_ERROR,
      title: 'Error de Conexión',
      message: 'No se pudo conectar con el servidor.',
      userAction: 'Verifique su conexión a internet e intente nuevamente.',
      icon: 'error',
      canRetry: true,
      technicalDetails: error
    }
  }

  // General load failure
  if (lowerError.includes('failed to load') || lowerError.includes('load')) {
    return {
      type: FormErrorType.LOAD_FAILED,
      title: 'Error al Cargar Formulario',
      message: `No se pudo cargar el formulario "${formName}".`,
      userAction: 'Intente recargar la página. Si el problema persiste, contacte al administrador del sistema.',
      icon: 'error',
      canRetry: true,
      technicalDetails: error
    }
  }

  // Default unknown error
  return {
    type: FormErrorType.UNKNOWN,
    title: 'Error Inesperado',
    message: 'Ocurrió un error al cargar el formulario.',
    userAction: 'Intente recargar la página. Si el problema persiste, contacte al administrador del sistema.',
    icon: 'error',
    canRetry: true,
    technicalDetails: error
  }
}

/**
 * Get troubleshooting tips based on error type
 */
export function getTroubleshootingTips(errorType: FormErrorType): string[] {
  switch (errorType) {
    case FormErrorType.FORM_NOT_FOUND:
      return [
        'Verifique que el nombre del formulario en la URL sea correcto',
        'Confirme que el formulario esté publicado en el sistema',
        'Contacte al administrador si el formulario debería existir'
      ]

    case FormErrorType.TOKEN_NOT_FOUND:
    case FormErrorType.TOKEN_EXPIRED:
    case FormErrorType.TOKEN_INVALID:
      return [
        'No acceda directamente mediante la URL - use el Dashboard de Bizuit',
        'El enlace puede haber expirado - genere uno nuevo',
        'Si el problema persiste, contacte al administrador del sistema'
      ]

    case FormErrorType.NETWORK_ERROR:
      return [
        'Verifique su conexión a internet',
        'Compruebe que el servidor esté accesible',
        'Intente recargar la página'
      ]

    case FormErrorType.LOAD_FAILED:
      return [
        'Recargue la página (F5 o Ctrl+R)',
        'Limpie la caché del navegador',
        'Intente acceder desde otro navegador',
        'Verifique la consola del navegador para más detalles'
      ]

    default:
      return [
        'Recargue la página',
        'Verifique la consola del navegador (F12) para más información',
        'Contacte al administrador del sistema si el problema persiste'
      ]
  }
}
