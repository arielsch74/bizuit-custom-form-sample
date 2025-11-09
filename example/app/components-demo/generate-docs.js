// Script para generar documentación completa de todos los componentes

const fs = require('fs');
const path = require('path');

// Leer todos los ejemplos existentes
const examples = require('./component-examples.ts');

// Definir todos los componentes con su documentación
const componentsDocs = {
  // UI Components
  button: {
    category: 'ui',
    name: 'Button',
    description: 'Botón versátil con múltiples variantes de estilo',
    props: [
      { name: 'variant', type: "'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'", required: false, default: 'default' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, default: 'md' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false' },
      { name: 'onClick', type: '() => void', required: false },
    ]
  },
  // Forms
  slider: { category: 'forms', name: 'BizuitSlider' },
  combo: { category: 'forms', name: 'BizuitCombo' },
  dateTime: { category: 'forms', name: 'BizuitDateTimePicker' },
  fileUpload: { category: 'forms', name: 'BizuitFileUpload' },
  radio: { category: 'forms', name: 'BizuitRadioButton' },
  signature: { category: 'forms', name: 'BizuitSignature' },
  documentInput: { category: 'forms', name: 'BizuitDocumentInput' },
  geolocation: { category: 'forms', name: 'BizuitGeolocation' },
  subform: { category: 'forms', name: 'BizuitSubForm' },
  // Layout
  tabs: { category: 'layout', name: 'BizuitTabs' },
  card: { category: 'layout', name: 'BizuitCard' },
  stepper: { category: 'layout', name: 'BizuitStepper' },
  // Media  
  media: { category: 'media', name: 'BizuitMedia' },
  iframe: { category: 'media', name: 'BizuitIFrame' },
  // Data
  dataGrid: { category: 'data', name: 'BizuitDataGrid' },
};

console.log('Documentation structure generated for', Object.keys(componentsDocs).length, 'components');
