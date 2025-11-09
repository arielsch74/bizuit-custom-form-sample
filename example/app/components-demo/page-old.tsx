'use client'

import { useState } from 'react'
import {
  Button,
  BizuitDataGrid,
  BizuitCombo,
  BizuitDateTimePicker,
  BizuitSlider,
  BizuitFileUpload,
  DynamicFormField,
  BizuitRadioButton,
  BizuitSignature,
  BizuitTabs,
  BizuitCard,
  BizuitStepper,
  BizuitMedia,
  BizuitIFrame,
  BizuitDocumentInput,
  BizuitGeolocation,
  BizuitSubForm,
  type TabItem,
  type StepItem,
  type DocumentFile,
  type GeolocationData,
  type SubFormRow,
  type SubFormField,
} from '@tyconsa/bizuit-ui-components'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ComponentsDemo() {
  // States for various components
  const [activeTab, setActiveTab] = useState('tab1')
  const [currentStep, setCurrentStep] = useState(0)
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [location, setLocation] = useState<GeolocationData | undefined>()
  const [rows, setRows] = useState<SubFormRow[]>([])
  const [sliderValue, setSliderValue] = useState(50)
  const [selectedCombo, setSelectedCombo] = useState<string>('')
  const [selectedRadio, setSelectedRadio] = useState<string>('')
  const [dateTime, setDateTime] = useState<Date | undefined>()
  const [signature, setSignature] = useState<string>('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Sample data
  const tabItems: TabItem[] = [
    { value: 'tab1', label: 'General', content: <div className="p-4">Contenido de pestaña General</div> },
    { value: 'tab2', label: 'Avanzado', content: <div className="p-4">Contenido de pestaña Avanzado</div> },
    { value: 'tab3', label: 'Configuración', content: <div className="p-4">Contenido de pestaña Configuración</div> },
  ]

  const steps: StepItem[] = [
    { id: '1', label: 'Información Personal', description: 'Datos básicos' },
    { id: '2', label: 'Dirección', description: 'Ubicación' },
    { id: '3', label: 'Confirmación', description: 'Revisar y enviar' },
  ]

  const subformFields: SubFormField[] = [
    { name: 'producto', label: 'Producto', type: 'text', required: true },
    { name: 'cantidad', label: 'Cantidad', type: 'number', required: true },
    { name: 'precio', label: 'Precio', type: 'number', required: true },
  ]

  const comboOptions = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
    { value: '3', label: 'Opción 3' },
  ]

  const radioOptions = [
    { value: 'option1', label: 'Primera opción' },
    { value: 'option2', label: 'Segunda opción' },
    { value: 'option3', label: 'Tercera opción' },
  ]

  const gridData = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', edad: 30 },
    { id: 2, nombre: 'María García', email: 'maria@example.com', edad: 25 },
    { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', edad: 35 },
  ]

  const gridColumns = [
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'edad', header: 'Edad', sortable: true },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-primary hover:underline flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>

        <h1 className="text-4xl font-bold">Catálogo Completo de Componentes v1.3.0</h1>
        <p className="text-muted-foreground">
          Todos los componentes disponibles en @tyconsa/bizuit-ui-components
        </p>

        {/* UI Components Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold border-b pb-2">Componentes de UI</h2>

          {/* Button */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">Button</h3>
            <BizuitCard>
              <div className="flex gap-4 flex-wrap">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </BizuitCard>
          </section>
        </div>

        {/* Form Components Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold border-b pb-2">Componentes de Formulario</h2>

          {/* BizuitCombo */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitCombo</h3>
            <BizuitCard>
              <BizuitCombo
                label="Selecciona una opción"
                options={comboOptions}
                value={selectedCombo}
                onChange={setSelectedCombo}
                placeholder="Elige una opción..."
              />
              {selectedCombo && <p className="mt-2 text-sm">Seleccionado: {selectedCombo}</p>}
            </BizuitCard>
          </section>

          {/* BizuitDateTimePicker */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitDateTimePicker</h3>
            <BizuitCard>
              <BizuitDateTimePicker
                label="Selecciona fecha y hora"
                value={dateTime}
                onChange={setDateTime}
              />
              {dateTime && <p className="mt-2 text-sm">Fecha seleccionada: {dateTime.toLocaleString()}</p>}
            </BizuitCard>
          </section>

          {/* BizuitSlider */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitSlider</h3>
            <BizuitCard>
              <BizuitSlider
                label="Ajusta el valor"
                value={sliderValue}
                onChange={setSliderValue}
                min={0}
                max={100}
                step={1}
              />
              <p className="mt-2 text-sm">Valor actual: {sliderValue}</p>
            </BizuitCard>
          </section>

          {/* BizuitFileUpload */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitFileUpload</h3>
            <BizuitCard>
              <BizuitFileUpload
                label="Subir archivos"
                onChange={setUploadedFiles}
                accept=".pdf,.doc,.docx"
                multiple
              />
              {uploadedFiles.length > 0 && (
                <p className="mt-2 text-sm">Archivos cargados: {uploadedFiles.length}</p>
              )}
            </BizuitCard>
          </section>

          {/* BizuitRadioButton */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitRadioButton</h3>
            <BizuitCard>
              <BizuitRadioButton
                label="Selecciona una opción"
                options={radioOptions}
                value={selectedRadio}
                onChange={setSelectedRadio}
              />
              {selectedRadio && <p className="mt-2 text-sm">Seleccionado: {selectedRadio}</p>}
            </BizuitCard>
          </section>

          {/* BizuitSignature */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitSignature</h3>
            <BizuitCard>
              <BizuitSignature
                label="Firma aquí"
                value={signature}
                onChange={setSignature}
              />
            </BizuitCard>
          </section>

          {/* BizuitDocumentInput */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitDocumentInput</h3>
            <BizuitCard>
              <BizuitDocumentInput
                label="Subir Documentos"
                description="Arrastra o selecciona hasta 5 archivos"
                value={documents}
                onChange={setDocuments}
                maxFiles={5}
                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              />
            </BizuitCard>
          </section>

          {/* BizuitGeolocation */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitGeolocation</h3>
            <BizuitCard>
              <BizuitGeolocation
                label="Capturar Ubicación"
                description="Obtén tu ubicación actual"
                value={location}
                onChange={setLocation}
              />
              {location && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Latitud:</strong> {location.latitude.toFixed(6)}
                  </p>
                  <p className="text-sm">
                    <strong>Longitud:</strong> {location.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm">
                    <strong>Precisión:</strong> {location.accuracy.toFixed(2)}m
                  </p>
                </div>
              )}
            </BizuitCard>
          </section>

          {/* BizuitSubForm */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitSubForm</h3>
            <BizuitCard>
              <BizuitSubForm
                label="Lista de Productos"
                description="Agrega productos a tu orden"
                fields={subformFields}
                value={rows}
                onChange={setRows}
                maxRows={10}
              />
              {rows.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Total de productos: {rows.length}
                  </p>
                  <p className="text-sm">
                    Total: $
                    {rows.reduce((sum, row) => {
                      const cantidad = parseFloat(row.cantidad) || 0
                      const precio = parseFloat(row.precio) || 0
                      return sum + cantidad * precio
                    }, 0).toFixed(2)}
                  </p>
                </div>
              )}
            </BizuitCard>
          </section>

          {/* DynamicFormField */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">DynamicFormField</h3>
            <BizuitCard>
              <p className="text-sm text-muted-foreground mb-4">
                Campo dinámico que se adapta según la configuración del API
              </p>
              <div className="space-y-4">
                <DynamicFormField
                  parameter={{
                    name: 'Campo de Texto',
                    type: 'string',
                    parameterDirection: 1,
                    processParameterId: 'text-1',
                  }}
                  value=""
                  onChange={(value) => console.log('Text value:', value)}
                />
                <DynamicFormField
                  parameter={{
                    name: 'Campo Numérico',
                    type: 'number',
                    parameterDirection: 1,
                    processParameterId: 'num-1',
                  }}
                  value=""
                  onChange={(value) => console.log('Number value:', value)}
                />
                <DynamicFormField
                  parameter={{
                    name: 'Campo Booleano',
                    type: 'boolean',
                    parameterDirection: 0,
                    processParameterId: 'bool-1',
                  }}
                  value={false}
                  onChange={(value) => console.log('Boolean value:', value)}
                />
              </div>
            </BizuitCard>
          </section>
        </div>

        {/* Data Components Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold border-b pb-2">Componentes de Datos</h2>

          {/* BizuitDataGrid */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitDataGrid</h3>
            <BizuitCard>
              <BizuitDataGrid
                data={gridData}
                columns={gridColumns}
                onRowClick={(row) => console.log('Row clicked:', row)}
              />
            </BizuitCard>
          </section>
        </div>

        {/* Layout Components Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold border-b pb-2">Componentes de Layout</h2>

          {/* BizuitCard */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitCard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BizuitCard
                title="Tarjeta Simple"
                description="Una tarjeta con título y descripción"
              >
                <p>Contenido de la tarjeta</p>
              </BizuitCard>

              <BizuitCard
                title="Tarjeta con Footer"
                variant="outlined"
                footer={<Button>Acción</Button>}
              >
                <p>Tarjeta con botón en el footer</p>
              </BizuitCard>
            </div>
          </section>

          {/* BizuitTabs */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitTabs</h3>
            <BizuitCard>
              <BizuitTabs
                items={tabItems}
                value={activeTab}
                onChange={setActiveTab}
                variant="underline"
              />
            </BizuitCard>
          </section>

          {/* BizuitStepper */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitStepper</h3>
            <BizuitCard>
              <BizuitStepper
                steps={steps}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
              <div className="mt-6 flex gap-4">
                <Button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  variant="secondary"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                >
                  Siguiente
                </Button>
              </div>
            </BizuitCard>
          </section>
        </div>

        {/* Media Components Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold border-b pb-2">Componentes de Media</h2>

          {/* BizuitMedia */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitMedia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <BizuitCard title="Imagen">
                <BizuitMedia
                  type="image"
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500"
                  alt="Paisaje de montaña"
                />
              </BizuitCard>

              <BizuitCard title="Video">
                <BizuitMedia
                  type="video"
                  src="https://www.w3schools.com/html/mov_bbb.mp4"
                  controls
                />
              </BizuitCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <BizuitCard title="Audio">
                <BizuitMedia
                  type="audio"
                  src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                  controls
                />
              </BizuitCard>

              <BizuitCard title="Cámara - Captura de Foto">
                <BizuitMedia
                  type="camera"
                  onCapture={(dataUrl) => {
                    console.log('Foto capturada:', dataUrl)
                  }}
                />
              </BizuitCard>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <BizuitCard title="Lector de Código QR">
                <BizuitMedia
                  type="qr-scanner"
                  onQRCodeDetected={(data) => {
                    console.log('Código QR detectado:', data)
                    alert(`Código QR detectado: ${data}`)
                  }}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Nota: Para escanear códigos QR, se requiere una librería adicional como jsQR.
                  Esta demostración muestra la interfaz de usuario.
                </p>
              </BizuitCard>
            </div>
          </section>

          {/* BizuitIFrame */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">BizuitIFrame</h3>
            <BizuitCard>
              <BizuitIFrame
                src="https://www.openstreetmap.org/export/embed.html?bbox=-58.4,-34.6,-58.3,-34.5&layer=mapnik"
                title="Mapa de Buenos Aires"
                height={400}
              />
            </BizuitCard>
          </section>
        </div>
      </div>
    </div>
  )
}
