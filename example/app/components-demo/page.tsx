'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BizuitDataGrid,
  BizuitCombo,
  BizuitDateTimePicker,
  BizuitSlider,
  BizuitFileUpload,
  Button
} from '@bizuit/ui-components'

export default function ComponentsDemo() {
  // Estados para cada componente
  const [comboValue, setComboValue] = useState('')
  const [date, setDate] = useState<Date>()
  const [sliderValue, setSliderValue] = useState(50)
  const [files, setFiles] = useState<File[]>([])

  // Datos para el combo
  const options = [
    { value: '1', label: 'Opción 1', group: 'Grupo A' },
    { value: '2', label: 'Opción 2', group: 'Grupo A' },
    { value: '3', label: 'Opción 3', group: 'Grupo B' },
    { value: '4', label: 'Opción 4', group: 'Grupo B' },
  ]

  // Datos para el DataGrid
  const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'valor', header: 'Valor' },
  ]

  const data = [
    { id: 1, nombre: 'Item 1', valor: 100 },
    { id: 2, nombre: 'Item 2', valor: 200 },
    { id: 3, nombre: 'Item 3', valor: 300 },
    { id: 4, nombre: 'Item 4', valor: 400 },
    { id: 5, nombre: 'Item 5', valor: 500 },
  ]

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver al inicio
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8">Demostración de Componentes</h1>

      <p className="text-muted-foreground mb-8">
        Prueba todos los componentes de @bizuit/ui-components de forma interactiva
      </p>

      <div className="space-y-12">
        {/* BizuitCombo */}
        <section className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">BizuitCombo</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select con búsqueda incremental y agrupación
          </p>

          <div className="max-w-md">
            <BizuitCombo
              options={options}
              value={comboValue}
              onChange={(value) => setComboValue(value as string)}
              placeholder="Selecciona una opción"
              searchable
            />
          </div>

          {comboValue && (
            <div className="mt-4 p-3 bg-muted rounded">
              <p className="text-sm">Valor seleccionado: <code className="font-mono">{comboValue}</code></p>
            </div>
          )}
        </section>

        {/* BizuitDateTimePicker */}
        <section className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">BizuitDateTimePicker</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Selector de fecha y hora con soporte de idiomas
          </p>

          <div className="max-w-md">
            <BizuitDateTimePicker
              value={date}
              onChange={setDate}
              mode="datetime"
              locale="es"
            />
          </div>

          {date && (
            <div className="mt-4 p-3 bg-muted rounded">
              <p className="text-sm">Fecha seleccionada: <code className="font-mono">{date.toLocaleString('es-ES')}</code></p>
            </div>
          )}
        </section>

        {/* BizuitSlider */}
        <section className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">BizuitSlider</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Control deslizante con marcas y tooltip
          </p>

          <div className="max-w-md">
            <BizuitSlider
              value={sliderValue}
              onChange={(value) => setSliderValue(value as number)}
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
          </div>

          <div className="mt-4 p-3 bg-muted rounded">
            <p className="text-sm">Valor actual: <code className="font-mono text-lg font-bold">{sliderValue}</code></p>
          </div>
        </section>

        {/* BizuitFileUpload */}
        <section className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">BizuitFileUpload</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Carga de archivos con drag & drop y preview
          </p>

          <BizuitFileUpload
            value={files}
            onChange={setFiles}
            multiple
            maxSize={5 * 1024 * 1024}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          />

          {files.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded">
              <p className="text-sm font-semibold mb-2">Archivos seleccionados: {files.length}</p>
              <ul className="text-sm space-y-1">
                {files.map((file, idx) => (
                  <li key={idx}>
                    <code className="font-mono">{file.name}</code> ({(file.size / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* BizuitDataGrid */}
        <section className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">BizuitDataGrid</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tabla con ordenamiento, filtrado y paginación
          </p>

          <BizuitDataGrid
            columns={columns}
            data={data}
            selectable="multiple"
            sortable
            filterable
            paginated
            onSelectionChange={(selected) => {
              console.log('Seleccionados:', selected)
            }}
          />
        </section>

        {/* Botones */}
        <section className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">Button</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Botones con diferentes variantes y tamaños
          </p>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>

            <div className="flex gap-4">
              <Button disabled>Disabled</Button>
              <Button onClick={() => alert('¡Botón clickeado!')}>
                Click Me
              </Button>
            </div>
          </div>
        </section>

        {/* Reset */}
        <section className="border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-semibold mb-4">Resetear Demos</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Limpia todos los valores seleccionados
          </p>

          <Button
            variant="outline"
            onClick={() => {
              setComboValue('')
              setDate(undefined)
              setSliderValue(50)
              setFiles([])
            }}
          >
            Resetear Todo
          </Button>
        </section>
      </div>

      <div className="mt-12 p-6 border rounded-lg bg-muted">
        <h3 className="font-semibold mb-2">💡 Tip</h3>
        <p className="text-sm text-muted-foreground">
          Todos estos componentes son completamente personalizables con Tailwind CSS y
          soportan dark mode automáticamente. Puedes ver el código fuente en{' '}
          <code className="bg-background px-1 py-0.5 rounded">packages/bizuit-ui-components/src/components/</code>
        </p>
      </div>
    </div>
  )
}
