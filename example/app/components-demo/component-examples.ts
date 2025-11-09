// Ejemplos de código para Live Code Editor

export const sliderExample = {
  '/App.js': `import { useState } from 'react';
import { BizuitSlider } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const [value, setValue] = useState(50);

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <BizuitSlider
        label="Ajusta el valor"
        value={value}
        onChange={setValue}
        min={0}
        max={100}
        step={1}
      />
      <p style={{ marginTop: '16px' }}>Valor actual: {value}</p>
    </div>
  );
}`
};

export const comboExample = {
  '/App.js': `import { useState } from 'react';
import { BizuitCombo } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const [selected, setSelected] = useState('');

  const options = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
    { value: '3', label: 'Opción 3' },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <BizuitCombo
        label="Selecciona una opción"
        options={options}
        value={selected}
        onChange={setSelected}
        placeholder="Elige una opción..."
      />
      {selected && (
        <p style={{ marginTop: '16px' }}>
          Seleccionado: {selected}
        </p>
      )}
    </div>
  );
}`
};

export const radioExample = {
  '/App.js': `import { useState } from 'react';
import { BizuitRadioButton } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const [selected, setSelected] = useState('');

  const options = [
    { value: 'option1', label: 'Primera opción' },
    { value: 'option2', label: 'Segunda opción' },
    { value: 'option3', label: 'Tercera opción' },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <BizuitRadioButton
        label="Selecciona una opción"
        options={options}
        value={selected}
        onChange={setSelected}
      />
      {selected && (
        <p style={{ marginTop: '16px' }}>
          Seleccionado: {selected}
        </p>
      )}
    </div>
  );
}`
};

export const tabsExample = {
  '/App.js': `import { useState } from 'react';
import { BizuitTabs } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const [activeTab, setActiveTab] = useState('tab1');

  const items = [
    {
      value: 'tab1',
      label: 'General',
      content: <div style={{ padding: '16px' }}>Contenido de General</div>
    },
    {
      value: 'tab2',
      label: 'Avanzado',
      content: <div style={{ padding: '16px' }}>Contenido de Avanzado</div>
    },
    {
      value: 'tab3',
      label: 'Configuración',
      content: <div style={{ padding: '16px' }}>Contenido de Configuración</div>
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <BizuitTabs
        items={items}
        value={activeTab}
        onChange={setActiveTab}
        variant="underline"
      />
    </div>
  );
}`
};

export const stepperExample = {
  '/App.js': `import { useState } from 'react';
import { BizuitStepper, Button } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: '1', label: 'Información Personal', description: 'Datos básicos' },
    { id: '2', label: 'Dirección', description: 'Ubicación' },
    { id: '3', label: 'Confirmación', description: 'Revisar' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <BizuitStepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />
      <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
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
    </div>
  );
}`
};

export const cardExample = {
  '/App.js': `import { BizuitCard, Button } from '@tyconsa/bizuit-ui-components';

export default function App() {
  return (
    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
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
  );
}`
};

export const signatureExample = {
  '/App.js': `import { useState } from 'react';
import { BizuitSignature } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const [signature, setSignature] = useState('');

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <BizuitSignature
        label="Firma aquí"
        value={signature}
        onChange={setSignature}
      />
      {signature && (
        <div style={{ marginTop: '16px' }}>
          <p>Firma capturada:</p>
          <img src={signature} alt="Firma" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
        </div>
      )}
    </div>
  );
}`
};

export const mediaExample = {
  '/App.js': `import { BizuitMedia } from '@tyconsa/bizuit-ui-components';

export default function App() {
  return (
    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
      <div>
        <h3>Imagen</h3>
        <BizuitMedia
          type="image"
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500"
          alt="Paisaje"
        />
      </div>

      <div>
        <h3>Audio</h3>
        <BizuitMedia
          type="audio"
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          controls
        />
      </div>
    </div>
  );
}`
};

export const cameraExample = {
  '/App.js': `import { BizuitMedia } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const handleCapture = (dataUrl) => {
    console.log('Foto capturada:', dataUrl);
    // Puedes guardar la foto o enviarla a un servidor
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Captura de Foto con Cámara</h3>
      <BizuitMedia
        type="camera"
        onCapture={handleCapture}
      />
      <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Haz clic en "Activar Cámara" para comenzar
      </p>
    </div>
  );
}`
};

export const qrScannerExample = {
  '/App.js': `import { BizuitMedia } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const handleQRDetected = (data) => {
    console.log('Código QR detectado:', data);
    alert(\`Código QR: \${data}\`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Lector de Código QR</h3>
      <BizuitMedia
        type="qr-scanner"
        onQRCodeDetected={handleQRDetected}
      />
      <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Nota: Requiere librería jsQR para funcionar completamente
      </p>
    </div>
  );
}`
};

export const subFormExample = {
  '/App.js': `import { useState } from 'react';
import { BizuitSubForm } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const [rows, setRows] = useState([]);

  const fields = [
    { name: 'producto', label: 'Producto', type: 'text', required: true },
    { name: 'cantidad', label: 'Cantidad', type: 'number', required: true },
    { name: 'precio', label: 'Precio', type: 'number', required: true },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <BizuitSubForm
        label="Lista de Productos"
        description="Agrega productos a tu orden"
        fields={fields}
        value={rows}
        onChange={setRows}
        maxRows={10}
      />
      {rows.length > 0 && (
        <div style={{ marginTop: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <p><strong>Total de productos:</strong> {rows.length}</p>
          <p><strong>Total:</strong> $\\{rows.reduce((sum, row) => {
            const cantidad = parseFloat(row.cantidad) || 0;
            const precio = parseFloat(row.precio) || 0;
            return sum + cantidad * precio;
          }, 0).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}`
};

export const dataGridExample = {
  '/App.js': `import { BizuitDataGrid } from '@tyconsa/bizuit-ui-components';

export default function App() {
  const data = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', edad: 30 },
    { id: 2, nombre: 'María García', email: 'maria@example.com', edad: 25 },
    { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', edad: 35 },
  ];

  const columns = [
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'edad', header: 'Edad', sortable: true },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <BizuitDataGrid
        data={data}
        columns={columns}
        onRowClick={(row) => console.log('Row clicked:', row)}
      />
    </div>
  );
}`
};
