'use client'

export function FormLoadingState({ formName }: { formName?: string }) {
  return (
    // IMPORTANTE: Esta página SIEMPRE debe estar en tema light con color naranja y en español
    // No usar clases de tema dinámico, todo hardcodeado
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="relative">
          {/* Spinner naranja */}
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white" />
          </div>
        </div>

        {/* Textos en español y colores hardcodeados */}
        <p className="text-lg font-medium mb-2 text-gray-900">Cargando formulario...</p>
        {formName && (
          <p className="text-sm text-gray-600">
            {formName}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Esto puede tomar unos segundos en la primera carga
        </p>

        {/* Puntos animados en naranja */}
        <div className="mt-6 max-w-xs mx-auto">
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
