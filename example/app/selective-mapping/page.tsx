'use client'

import React, { useState } from 'react'
import { buildParameters } from '@tyconsa/bizuit-form-sdk'
import { Card } from '@tyconsa/bizuit-ui-components'

/**
 * Selective Parameter Mapping Example
 *
 * This example demonstrates how to use buildParameters() to selectively map
 * form fields to specific Bizuit parameters/variables instead of sending all form data.
 */
export default function SelectiveMappingPage() {
  const [formData, setFormData] = useState({
    empleado: 'Juan Pérez',
    legajo: '12345',
    monto: '1500.50',
    categoria: 'Viajes',
    descripcion: 'Viaje a cliente en Buenos Aires',
    aprobadoDirector: true,
    fechaSolicitud: new Date().toISOString().split('T')[0],
    // Extra fields that won't be mapped
    comentariosInternos: 'Revisar con recursos humanos',
    prioridad: 'Alta',
  })

  const [mappedParameters, setMappedParameters] = useState<any[]>([])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMapSimple = () => {
    // Simple mapping: form field name → parameter name
    const mapping = {
      'empleado': { parameterName: 'pEmpleado' },
      'monto': { parameterName: 'pMonto' },
      'categoria': { parameterName: 'pCategoria' },
    }

    const parameters = buildParameters(mapping, formData)
    setMappedParameters(parameters)
  }

  const handleMapWithTransform = () => {
    // Mapping with transformations
    const mapping = {
      'empleado': {
        parameterName: 'pEmpleado',
        transform: (val: string) => val.toUpperCase(),
      },
      'monto': {
        parameterName: 'pMonto',
        transform: (val: string) => parseFloat(val).toFixed(2),
      },
      'categoria': { parameterName: 'pCategoria' },
      'descripcion': { parameterName: 'pDescripcion' },
    }

    const parameters = buildParameters(mapping, formData)
    setMappedParameters(parameters)
  }

  const handleMapWithVariables = () => {
    // Mix of parameters and variables
    const mapping = {
      'empleado': { parameterName: 'pEmpleado' },
      'legajo': { parameterName: 'pLegajo' },
      'monto': {
        parameterName: 'pMonto',
        transform: (val: string) => parseFloat(val).toFixed(2),
      },
      'categoria': { parameterName: 'pCategoria' },
      'aprobadoDirector': {
        parameterName: 'vAprobadoDirector',
        isVariable: true,
        transform: (val: boolean) => (val ? 'SI' : 'NO'),
      },
    }

    const parameters = buildParameters(mapping, formData)
    setMappedParameters(parameters)
  }

  const handleMapComplete = () => {
    // Complete mapping with all features
    const mapping = {
      'empleado': {
        parameterName: 'pEmpleado',
        transform: (val: string) => val.toUpperCase(),
      },
      'legajo': { parameterName: 'pLegajo' },
      'monto': {
        parameterName: 'pMonto',
        transform: (val: string) => parseFloat(val).toFixed(2),
      },
      'categoria': { parameterName: 'pCategoria' },
      'descripcion': { parameterName: 'pDescripcion' },
      'fechaSolicitud': {
        parameterName: 'pFecha',
        transform: (val: string) => new Date(val).toISOString(),
      },
      'aprobadoDirector': {
        parameterName: 'vAprobadoDirector',
        isVariable: true,
        transform: (val: boolean) => (val ? 'SI' : 'NO'),
      },
    }

    const parameters = buildParameters(mapping, formData)
    setMappedParameters(parameters)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Selective Parameter Mapping</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Data */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Form Data</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Empleado</label>
                <input
                  type="text"
                  value={formData.empleado}
                  onChange={(e) => handleChange('empleado', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Legajo</label>
                <input
                  type="text"
                  value={formData.legajo}
                  onChange={(e) => handleChange('legajo', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => handleChange('monto', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                >
                  <option value="Viajes">Viajes</option>
                  <option value="Comidas">Comidas</option>
                  <option value="Alojamiento">Alojamiento</option>
                  <option value="Transporte">Transporte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha Solicitud</label>
                <input
                  type="date"
                  value={formData.fechaSolicitud}
                  onChange={(e) => handleChange('fechaSolicitud', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="aprobado"
                  checked={formData.aprobadoDirector}
                  onChange={(e) => handleChange('aprobadoDirector', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="aprobado" className="text-sm font-medium">
                  Aprobado por Director
                </label>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Extra fields (won't be mapped):</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Comentarios Internos</label>
                    <input
                      type="text"
                      value={formData.comentariosInternos}
                      onChange={(e) => handleChange('comentariosInternos', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prioridad</label>
                    <input
                      type="text"
                      value={formData.prioridad}
                      onChange={(e) => handleChange('prioridad', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Mapping Strategies */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Mapping Strategies</h2>
            <div className="space-y-3">
              <button
                onClick={handleMapSimple}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                1. Simple Mapping
              </button>
              <p className="text-sm text-muted-foreground">
                Maps only 3 fields: empleado, monto, categoria
              </p>

              <button
                onClick={handleMapWithTransform}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                2. With Transformations
              </button>
              <p className="text-sm text-muted-foreground">
                Maps 4 fields with value transformations (uppercase, decimal formatting)
              </p>

              <button
                onClick={handleMapWithVariables}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                3. Parameters + Variables
              </button>
              <p className="text-sm text-muted-foreground">
                Maps 5 fields, including one variable (vAprobadoDirector)
              </p>

              <button
                onClick={handleMapComplete}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                4. Complete Mapping
              </button>
              <p className="text-sm text-muted-foreground">
                Maps 7 fields with all features: transformations, variables, dates
              </p>
            </div>
          </Card>

          {/* Results */}
          {mappedParameters.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Mapped Parameters</h2>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {mappedParameters.length} parameters will be sent to Bizuit:
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs max-h-96">
                  {JSON.stringify(mappedParameters, null, 2)}
                </pre>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Summary:</p>
                <ul className="text-sm space-y-1">
                  {mappedParameters.map((param) => (
                    <li key={param.name} className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
                        {param.name}
                      </span>
                      <span className="text-muted-foreground">=</span>
                      <span className="font-mono text-xs">
                        {param.value.length > 40 ? param.value.substring(0, 40) + '...' : param.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Code Examples */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Code Examples</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">1. Simple Mapping</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`const mapping = {
  'empleado': { parameterName: 'pEmpleado' },
  'monto': { parameterName: 'pMonto' },
  'categoria': { parameterName: 'pCategoria' },
}

const parameters = buildParameters(mapping, formData)
// Only sends 3 parameters, ignoring all other form fields`}</pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. With Transformations</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`const mapping = {
  'empleado': {
    parameterName: 'pEmpleado',
    transform: (val) => val.toUpperCase(),
  },
  'monto': {
    parameterName: 'pMonto',
    transform: (val) => parseFloat(val).toFixed(2),
  },
}

const parameters = buildParameters(mapping, formData)`}</pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Variables</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`const mapping = {
  'aprobadoDirector': {
    parameterName: 'vAprobadoDirector',
    isVariable: true,
    transform: (val) => val ? 'SI' : 'NO',
  },
}

const parameters = buildParameters(mapping, formData)`}</pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Use with raiseEvent</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`// Define your selective mapping
const mapping = {
  'empleado': { parameterName: 'pEmpleado' },
  'monto': {
    parameterName: 'pMonto',
    transform: (val) => parseFloat(val).toFixed(2),
  },
}

// Build parameters from form data
const parameters = buildParameters(mapping, formData)

// Use with raiseEvent
const result = await raiseEvent(bizuitApiUrl, token, processAlias, parameters)`}</pre>
          </div>
        </div>
      </Card>
    </div>
  )
}
