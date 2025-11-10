#!/usr/bin/env node
/**
 * Script para validar que todos los componentes tienen sus imports correctos
 * en el codeExample
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'example/app/(examples)/components-demo/components');

// Lista de todos los componentes
const components = [
  'button', 'card', 'combo', 'data-grid', 'date-time-picker',
  'document-input', 'dynamic-form-field', 'file-upload',
  'geolocation', 'iframe', 'media', 'radio-button',
  'signature', 'slider', 'stepper', 'subform', 'tabs'
];

const errors = [];
const warnings = [];
let totalChecks = 0;

console.log('🔍 Validando componentes...\n');

components.forEach(componentName => {
  const fileName = `${componentName}.tsx`;
  const filePath = path.join(componentsDir, fileName);

  if (!fs.existsSync(filePath)) {
    errors.push(`❌ ${fileName}: Archivo no encontrado`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  totalChecks++;

  // Extraer el codeExample - más flexible con el patrón
  const codeExampleStart = content.indexOf('codeExample: {');
  if (codeExampleStart === -1) {
    errors.push(`❌ ${fileName}: No se encontró codeExample`);
    return;
  }

  // Buscar el cierre del codeExample
  let braceCount = 1;
  let pos = codeExampleStart + 'codeExample: {'.length;
  while (pos < content.length && braceCount > 0) {
    if (content[pos] === '{') braceCount++;
    if (content[pos] === '}') braceCount--;
    pos++;
  }

  const codeExample = content.substring(codeExampleStart, pos);

  // Extraer la sección /App.js - patrón más flexible
  const appJsMatch = codeExample.match(/\/App\.js['"]:\s*`([\s\S]*?)`\s*[,\}]/);
  if (!appJsMatch) {
    errors.push(`❌ ${fileName}: No se encontró /App.js en codeExample`);
    return;
  }

  const appJsCode = appJsMatch[1];

  // Buscar componentes usados en JSX (con mayúscula)
  const jsxComponentsUsed = new Set();
  const jsxComponentRegex = /<([A-Z][a-zA-Z0-9]*)\b/g;
  let match;

  while ((match = jsxComponentRegex.exec(appJsCode)) !== null) {
    const compName = match[1];
    // Ignorar fragmentos, componentes estándar, y tags de una letra (como <I> en HTML)
    if (compName.length > 1 &&
        compName !== 'Fragment' &&
        compName !== 'ThemeProvider' &&
        compName !== 'I18nProvider' &&
        compName !== 'ThemeContext' &&
        compName !== 'I18nContext' &&
        compName !== 'App') {
      jsxComponentsUsed.add(compName);
    }
  }

  // Verificar que cada componente usado tenga su import
  jsxComponentsUsed.forEach(comp => {
    const importPattern = new RegExp(`import\\s+${comp}\\s+from\\s+['"]\\.\/${comp}\\.js['"]`);

    if (!importPattern.test(appJsCode)) {
      errors.push(`❌ ${fileName}: Componente <${comp}> usado pero no importado`);
    }

    // Verificar que el archivo del componente existe en codeExample
    const componentFilePattern = new RegExp(`['"]\\/${comp}\\.js['"]: `);
    if (!componentFilePattern.test(codeExample)) {
      errors.push(`❌ ${fileName}: Archivo /${comp}.js no existe en codeExample`);
    }
  });

  // Verificar que useState está siendo usado si hay estados
  const stateVarsUsed = new Set();

  // Buscar variables que parecen estados (usadas con set...)
  const setStateRegex = /\{([a-z][a-zA-Z]*)\}/g;
  while ((match = setStateRegex.exec(appJsCode)) !== null) {
    stateVarsUsed.add(match[1]);
  }

  // Buscar declaraciones useState
  const useStateRegex = /const\s+\[([a-zA-Z]+),\s*set[A-Z][a-zA-Z]*\]\s*=\s*useState/g;
  const declaredStates = new Set();

  while ((match = useStateRegex.exec(appJsCode)) !== null) {
    declaredStates.add(match[1]);
  }

  // Verificar controles de i18n y tema
  if (!appJsCode.includes('🇬🇧 EN')) {
    warnings.push(`⚠️  ${fileName}: Falta control de idioma (🇬🇧 EN / 🇪🇸 ES)`);
  }

  if (!appJsCode.includes('☀️') || !appJsCode.includes('🌙')) {
    warnings.push(`⚠️  ${fileName}: Falta control de tema (☀️/🌙/💻)`);
  }

  if (!appJsCode.includes('type="color"')) {
    warnings.push(`⚠️  ${fileName}: Falta selector de color primario`);
  }
});

console.log(`\n📊 Resumen de Validación:`);
console.log(`   Total de componentes: ${totalChecks}`);
console.log(`   Errores: ${errors.length}`);
console.log(`   Advertencias: ${warnings.length}`);

if (errors.length > 0) {
  console.log('\n🚨 ERRORES ENCONTRADOS:\n');
  errors.forEach(err => console.log(err));
}

if (warnings.length > 0) {
  console.log('\n⚠️  ADVERTENCIAS:\n');
  warnings.forEach(warn => console.log(warn));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ Todos los componentes están correctos!\n');
  process.exit(0);
} else {
  console.log('\n❌ Se encontraron problemas que deben corregirse.\n');
  process.exit(1);
}
