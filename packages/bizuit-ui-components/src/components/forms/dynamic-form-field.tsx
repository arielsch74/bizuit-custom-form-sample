'use client'

import React from 'react'
import { BizuitDateTimePicker } from './bizuit-date-time-picker'
import type { IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'

export interface DynamicFormFieldProps {
  parameter: IBizuitProcessParameter
  value: any
  onChange: (value: any) => void
  required?: boolean
  className?: string
  /** Show if this is a variable (for continue-process scenario) */
  showVariableLabel?: boolean
}

/**
 * DynamicFormField - Renders a form field based on Bizuit process parameter metadata
 *
 * Automatically selects the appropriate input type based on the parameter's type:
 * - string/text -> text input
 * - int/integer/number/decimal/double -> number input
 * - bool/boolean -> checkbox
 * - date/datetime/timestamp -> DateTimePicker component
 * - Unknown types -> text input with type indicator
 *
 * @param parameter - The Bizuit process parameter metadata
 * @param value - Current value of the field
 * @param onChange - Callback when value changes
 * @param required - Override required status (defaults to parameter.parameterDirection === 1)
 * @param className - Additional CSS classes for the container div
 * @param showVariableLabel - If true, shows (variable) label for variables instead of (opcional)
 */
export function DynamicFormField({
  parameter,
  value,
  onChange,
  required,
  className = '',
  showVariableLabel = false,
}: DynamicFormFieldProps) {
  // Determine if field is required
  // Variables are not required, input parameters (direction === 1) are required
  const isVariable = (parameter as any).isVariable === true
  const isRequired = required !== undefined ? required : (!isVariable && parameter.parameterDirection === 1)

  // Build label with appropriate suffix
  let labelSuffix = ''
  if (showVariableLabel && isVariable) {
    labelSuffix = ' (variable)'
  } else if (isRequired) {
    labelSuffix = ' *'
  } else {
    labelSuffix = ' (opcional)'
  }
  const label = `${parameter.name}${labelSuffix}`

  // Determine field type based on parameter metadata
  const paramType = parameter.type.toLowerCase()

  // String types
  if (paramType === 'string' || paramType === 'text') {
    return (
      <div className={className}>
        <label className="block text-sm font-medium mb-2">
          {label}
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ingrese ${parameter.name}`}
          required={isRequired}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
        />
      </div>
    )
  }

  // Numeric types
  if (
    paramType === 'int' ||
    paramType === 'integer' ||
    paramType === 'number' ||
    paramType === 'decimal' ||
    paramType === 'double'
  ) {
    return (
      <div className={className}>
        <label className="block text-sm font-medium mb-2">
          {label}
        </label>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ingrese ${parameter.name}`}
          required={isRequired}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
        />
      </div>
    )
  }

  // Boolean types
  if (paramType === 'bool' || paramType === 'boolean') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <input
          type="checkbox"
          id={parameter.name}
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 border rounded"
        />
        <label htmlFor={parameter.name} className="text-sm font-medium">
          {label}
        </label>
      </div>
    )
  }

  // Date/DateTime types
  if (paramType === 'date' || paramType === 'datetime' || paramType === 'timestamp') {
    return (
      <div className={className}>
        <label className="block text-sm font-medium mb-2">
          {label}
        </label>
        <BizuitDateTimePicker
          value={value}
          onChange={onChange}
          mode={paramType === 'date' ? 'date' : 'datetime'}
          locale="es"
        />
      </div>
    )
  }

  // Default to text input for unknown types
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">
        {label}
        <span className="text-xs text-muted-foreground ml-2">({parameter.type})</span>
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Ingrese ${parameter.name}`}
        required={isRequired}
        className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
      />
    </div>
  )
}
