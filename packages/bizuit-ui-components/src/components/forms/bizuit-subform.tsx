'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'

export interface SubFormRow {
  id: string
  [key: string]: any
}

export interface SubFormField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select'
  options?: { label: string; value: string }[]
  required?: boolean
}

export interface BizuitSubFormProps {
  fields: SubFormField[]
  value?: SubFormRow[]
  onChange?: (rows: SubFormRow[]) => void
  label?: string
  description?: string
  maxRows?: number
  minRows?: number
  className?: string
  disabled?: boolean
}

const BizuitSubForm = React.forwardRef<HTMLDivElement, BizuitSubFormProps>(
  (
    {
      fields,
      value = [],
      onChange,
      label,
      description,
      maxRows = 10,
      minRows = 0,
      className,
      disabled = false,
    },
    ref
  ) => {
    const addRow = () => {
      if (value.length >= maxRows) return

      const newRow: SubFormRow = {
        id: `row-${Date.now()}`,
      }

      fields.forEach((field) => {
        newRow[field.name] = ''
      })

      onChange?.([...value, newRow])
    }

    const removeRow = (id: string) => {
      if (value.length <= minRows) return
      onChange?.(value.filter((row) => row.id !== id))
    }

    const updateRow = (id: string, fieldName: string, fieldValue: any) => {
      onChange?.(
        value.map((row) =>
          row.id === id ? { ...row, [fieldName]: fieldValue } : row
        )
      )
    }

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {label && (
          <label className="text-sm font-medium leading-none">{label}</label>
        )}

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        <div className="border rounded-lg overflow-hidden">
          {value.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b">
                  <tr>
                    {fields.map((field) => (
                      <th
                        key={field.name}
                        className="text-left p-3 text-sm font-medium"
                      >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </th>
                    ))}
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {value.map((row, rowIndex) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      {fields.map((field) => (
                        <td key={field.name} className="p-2">
                          {field.type === 'select' ? (
                            <select
                              value={row[field.name] || ''}
                              onChange={(e) =>
                                updateRow(row.id, field.name, e.target.value)
                              }
                              disabled={disabled}
                              className="w-full px-3 py-2 border rounded-md bg-background"
                            >
                              <option value="">Seleccionar...</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              value={row[field.name] || ''}
                              onChange={(e) =>
                                updateRow(row.id, field.name, e.target.value)
                              }
                              disabled={disabled}
                              className="w-full px-3 py-2 border rounded-md bg-background"
                            />
                          )}
                        </td>
                      ))}
                      <td className="p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(row.id)}
                          disabled={disabled || value.length <= minRows}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {value.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No hay filas agregadas
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          disabled={disabled || value.length >= maxRows}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar fila
        </Button>

        {value.length >= maxRows && (
          <p className="text-xs text-muted-foreground">
            Máximo {maxRows} filas permitidas
          </p>
        )}
      </div>
    )
  }
)

BizuitSubForm.displayName = 'BizuitSubForm'

export { BizuitSubForm }
