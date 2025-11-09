'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LiveCodeEditor } from '@/components/live-code-editor'
import * as examples from './component-examples'

export default function ComponentsDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-primary hover:underline flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Cat\u00e1logo Interactivo de Componentes</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Explora, edita y prueba todos los componentes de @tyconsa/bizuit-ui-components v1.3.1
          </p>
          <p className="text-sm text-muted-foreground">
            \u00a1Haz clic en "Ver/Editar C\u00f3digo" para jugar con los ejemplos en tiempo real!
          </p>
        </div>

        {/* Form Components */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold border-b-2 border-primary pb-2">Componentes de Formulario</h2>
          
          <LiveCodeEditor
            title="BizuitSlider - Control Deslizante"
            description="Control deslizante para seleccionar valores num\u00e9ricos dentro de un rango"
            files={examples.sliderExample}
          />

          <LiveCodeEditor
            title="BizuitCombo - Selector Desplegable"
            description="Selector de opciones con b\u00fasqueda y autocompletado"
            files={examples.comboExample}
          />

          <LiveCodeEditor
            title="BizuitRadioButton - Bot\u00f3n de Radio"
            description="Grupo de opciones mutuamente excluyentes"
            files={examples.radioExample}
          />

          <LiveCodeEditor
            title="BizuitSignature - Firma Digital"
            description="Captura de firmas manuscritas en canvas"
            files={examples.signatureExample}
          />

          <LiveCodeEditor
            title="BizuitSubForm - Tabla Din\u00e1mica"
            description="Tabla editable con filas din\u00e1micas para datos tabulares"
            files={examples.subFormExample}
          />
        </section>

        {/* Layout Components */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold border-b-2 border-primary pb-2">Componentes de Layout</h2>
          
          <LiveCodeEditor
            title="BizuitTabs - Pesta\u00f1as"
            description="Organizador de contenido en pesta\u00f1as con variantes de estilo"
            files={examples.tabsExample}
          />

          <LiveCodeEditor
            title="BizuitStepper - Indicador de Pasos"
            description="Indicador visual de progreso para flujos de m\u00faltiples pasos"
            files={examples.stepperExample}
          />

          <LiveCodeEditor
            title="BizuitCard - Tarjeta"
            description="Contenedor flexible para agrupar contenido relacionado"
            files={examples.cardExample}
          />
        </section>

        {/* Media Components */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold border-b-2 border-primary pb-2">Componentes de Media</h2>
          
          <LiveCodeEditor
            title="BizuitMedia - Imagen y Audio"
            description="Reproductor multimedia para im\u00e1genes, video y audio"
            files={examples.mediaExample}
          />

          <LiveCodeEditor
            title="BizuitMedia - C\u00e1mara"
            description="Captura de fotos usando la c\u00e1mara del dispositivo"
            files={examples.cameraExample}
          />

          <LiveCodeEditor
            title="BizuitMedia - Lector QR"
            description="Escaneo de c\u00f3digos QR usando la c\u00e1mara"
            files={examples.qrScannerExample}
          />
        </section>

        {/* Data Components */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold border-b-2 border-primary pb-2">Componentes de Datos</h2>
          
          <LiveCodeEditor
            title="BizuitDataGrid - Tabla de Datos"
            description="Tabla ordenable y personalizable para mostrar datos tabulares"
            files={examples.dataGridExample}
          />
        </section>

        {/* Installation & Usage */}
        <section className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Instalaci\u00f3n y Uso</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Instalar el paquete:</h3>
              <code className="block bg-gray-900 text-green-400 p-4 rounded-md">
                npm install @tyconsa/bizuit-ui-components
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Importar componentes:</h3>
              <code className="block bg-gray-900 text-green-400 p-4 rounded-md">
                import {'{'} BizuitSlider, BizuitTabs, BizuitMedia {'}'} from '@tyconsa/bizuit-ui-components'
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Documentaci\u00f3n completa:</h3>
              <p className="text-sm">
                Cada componente incluye ejemplos editables en esta p\u00e1gina. Haz clic en "Ver/Editar C\u00f3digo" 
                para ver el c\u00f3digo fuente completo y modificarlo en tiempo real.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
