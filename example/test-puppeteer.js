/**
 * Puppeteer E2E Tests for Bizuit Form Template
 *
 * Este script prueba automáticamente todas las páginas y componentes
 * del proyecto y genera screenshots.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-screenshots');
const REPORT_FILE = path.join(__dirname, 'test-report.md');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Resultados de las pruebas
const testResults = [];

// Utilidad para logging
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Crear directorio de screenshots si no existe
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Función para tomar screenshot
async function takeScreenshot(page, name) {
  const filename = `${name.replace(/\s+/g, '-').toLowerCase()}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({
    path: filepath,
    fullPage: true
  });
  log(`  📸 Screenshot guardado: ${filename}`, 'cyan');
  return filename;
}

// Función para esperar a que la página cargue
async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    log('  ⚠️  Timeout esperando networkidle, continuando...', 'yellow');
  });
}

// Test 1: Home Page
async function testHomePage(browser) {
  log('\n🧪 Test 1: Home Page', 'blue');

  const page = await browser.newPage();
  const result = {
    name: 'Home Page',
    status: 'pending',
    errors: [],
    screenshots: []
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });

    // Verificar título
    const title = await page.title();
    log(`  ✓ Título: ${title}`, 'green');

    // Verificar contenido principal
    const h1 = await page.$eval('h1', el => el.textContent);
    log(`  ✓ H1 encontrado: ${h1}`, 'green');

    // Verificar enlaces
    const startProcessLink = await page.$('a[href="/start-process"]');
    const continueProcessLink = await page.$('a[href="/continue-process"]');

    if (startProcessLink) {
      log('  ✓ Enlace a Start Process encontrado', 'green');
    } else {
      throw new Error('Enlace a Start Process no encontrado');
    }

    if (continueProcessLink) {
      log('  ✓ Enlace a Continue Process encontrado', 'green');
    } else {
      throw new Error('Enlace a Continue Process no encontrado');
    }

    // Screenshot
    const screenshot = await takeScreenshot(page, 'home-page');
    result.screenshots.push(screenshot);

    result.status = 'passed';
    log('  ✅ Test PASADO', 'green');

  } catch (error) {
    result.status = 'failed';
    result.errors.push(error.message);
    log(`  ❌ Test FALLADO: ${error.message}`, 'red');
  } finally {
    await page.close();
    testResults.push(result);
  }
}

// Test 2: Start Process Page
async function testStartProcessPage(browser) {
  log('\n🧪 Test 2: Start Process Page', 'blue');

  const page = await browser.newPage();
  const result = {
    name: 'Start Process Page',
    status: 'pending',
    errors: [],
    screenshots: []
  };

  try {
    await page.goto(`${BASE_URL}/start-process`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Verificar formulario de autenticación
    const processIdInput = await page.$('input[placeholder*="PROC"]');
    const tokenInput = await page.$('textarea[placeholder*="token"]');

    if (processIdInput) {
      log('  ✓ Campo Process ID encontrado', 'green');
    } else {
      throw new Error('Campo Process ID no encontrado');
    }

    if (tokenInput) {
      log('  ✓ Campo Token encontrado', 'green');
    } else {
      throw new Error('Campo Token no encontrado');
    }

    // Screenshot estado inicial
    let screenshot = await takeScreenshot(page, 'start-process-initial');
    result.screenshots.push(screenshot);

    // Simular ingreso de datos
    await page.type('input[placeholder*="PROC"]', 'TEST-PROC-001');
    await page.type('textarea[placeholder*="token"]', 'test-jwt-token-123456');
    log('  ✓ Datos de prueba ingresados', 'green');

    // Screenshot con datos
    screenshot = await takeScreenshot(page, 'start-process-filled');
    result.screenshots.push(screenshot);

    result.status = 'passed';
    log('  ✅ Test PASADO', 'green');

  } catch (error) {
    result.status = 'failed';
    result.errors.push(error.message);
    log(`  ❌ Test FALLADO: ${error.message}`, 'red');
  } finally {
    await page.close();
    testResults.push(result);
  }
}

// Test 3: Continue Process Page
async function testContinueProcessPage(browser) {
  log('\n🧪 Test 3: Continue Process Page', 'blue');

  const page = await browser.newPage();
  const result = {
    name: 'Continue Process Page',
    status: 'pending',
    errors: [],
    screenshots: []
  };

  try {
    await page.goto(`${BASE_URL}/continue-process`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Verificar formulario de autenticación
    const instanceIdInput = await page.$('input[placeholder*="INST"]');
    const tokenInput = await page.$('textarea[placeholder*="token"]');

    if (instanceIdInput) {
      log('  ✓ Campo Instance ID encontrado', 'green');
    } else {
      throw new Error('Campo Instance ID no encontrado');
    }

    if (tokenInput) {
      log('  ✓ Campo Token encontrado', 'green');
    } else {
      throw new Error('Campo Token no encontrado');
    }

    // Screenshot
    const screenshot = await takeScreenshot(page, 'continue-process-initial');
    result.screenshots.push(screenshot);

    // Simular ingreso de datos
    await page.type('input[placeholder*="INST"]', 'TEST-INST-12345');
    await page.type('textarea[placeholder*="token"]', 'test-jwt-token-123456');
    log('  ✓ Datos de prueba ingresados', 'green');

    result.status = 'passed';
    log('  ✅ Test PASADO', 'green');

  } catch (error) {
    result.status = 'failed';
    result.errors.push(error.message);
    log(`  ❌ Test FALLADO: ${error.message}`, 'red');
  } finally {
    await page.close();
    testResults.push(result);
  }
}

// Test 4: Dark Mode
async function testDarkMode(browser) {
  log('\n🧪 Test 4: Dark Mode', 'blue');

  const page = await browser.newPage();
  const result = {
    name: 'Dark Mode',
    status: 'pending',
    errors: [],
    screenshots: []
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });

    // Activar dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Screenshot en dark mode
    const screenshot = await takeScreenshot(page, 'home-page-dark-mode');
    result.screenshots.push(screenshot);

    log('  ✓ Dark mode activado y screenshot tomado', 'green');

    result.status = 'passed';
    log('  ✅ Test PASADO', 'green');

  } catch (error) {
    result.status = 'failed';
    result.errors.push(error.message);
    log(`  ❌ Test FALLADO: ${error.message}`, 'red');
  } finally {
    await page.close();
    testResults.push(result);
  }
}

// Test 5: Responsive Design
async function testResponsive(browser) {
  log('\n🧪 Test 5: Responsive Design', 'blue');

  const page = await browser.newPage();
  const result = {
    name: 'Responsive Design',
    status: 'pending',
    errors: [],
    screenshots: []
  };

  try {
    // Desktop
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    let screenshot = await takeScreenshot(page, 'responsive-desktop');
    result.screenshots.push(screenshot);
    log('  ✓ Screenshot Desktop (1920x1080)', 'green');

    // Tablet
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload({ waitUntil: 'networkidle0' });
    screenshot = await takeScreenshot(page, 'responsive-tablet');
    result.screenshots.push(screenshot);
    log('  ✓ Screenshot Tablet (768x1024)', 'green');

    // Mobile
    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle0' });
    screenshot = await takeScreenshot(page, 'responsive-mobile');
    result.screenshots.push(screenshot);
    log('  ✓ Screenshot Mobile (375x667)', 'green');

    result.status = 'passed';
    log('  ✅ Test PASADO', 'green');

  } catch (error) {
    result.status = 'failed';
    result.errors.push(error.message);
    log(`  ❌ Test FALLADO: ${error.message}`, 'red');
  } finally {
    await page.close();
    testResults.push(result);
  }
}

// Test 6: Navigation
async function testNavigation(browser) {
  log('\n🧪 Test 6: Navigation', 'blue');

  const page = await browser.newPage();
  const result = {
    name: 'Navigation',
    status: 'pending',
    errors: [],
    screenshots: []
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });

    // Navegar a Start Process
    await page.click('a[href="/start-process"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });

    let url = page.url();
    if (url.includes('/start-process')) {
      log('  ✓ Navegación a Start Process exitosa', 'green');
    } else {
      throw new Error('No se navegó a Start Process');
    }

    // Volver al home
    await page.click('a[href="/"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });

    // Navegar a Continue Process
    await page.click('a[href="/continue-process"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });

    url = page.url();
    if (url.includes('/continue-process')) {
      log('  ✓ Navegación a Continue Process exitosa', 'green');
    } else {
      throw new Error('No se navegó a Continue Process');
    }

    result.status = 'passed';
    log('  ✅ Test PASADO', 'green');

  } catch (error) {
    result.status = 'failed';
    result.errors.push(error.message);
    log(`  ❌ Test FALLADO: ${error.message}`, 'red');
  } finally {
    await page.close();
    testResults.push(result);
  }
}

// Generar reporte en Markdown
function generateReport() {
  log('\n📊 Generando reporte...', 'blue');

  const passed = testResults.filter(r => r.status === 'passed').length;
  const failed = testResults.filter(r => r.status === 'failed').length;
  const total = testResults.length;

  let report = `# 🧪 Reporte de Tests E2E - Bizuit Form Template

**Fecha**: ${new Date().toLocaleString('es-ES')}
**Total de Tests**: ${total}
**Pasados**: ✅ ${passed}
**Fallados**: ❌ ${failed}
**Porcentaje de Éxito**: ${((passed / total) * 100).toFixed(2)}%

---

`;

  testResults.forEach(result => {
    const icon = result.status === 'passed' ? '✅' : '❌';
    report += `## ${icon} ${result.name}\n\n`;
    report += `**Estado**: ${result.status === 'passed' ? 'PASADO' : 'FALLADO'}\n\n`;

    if (result.errors.length > 0) {
      report += `**Errores**:\n`;
      result.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }

    if (result.screenshots.length > 0) {
      report += `**Screenshots**:\n`;
      result.screenshots.forEach(screenshot => {
        report += `- ![${screenshot}](test-screenshots/${screenshot})\n`;
      });
      report += '\n';
    }

    report += '---\n\n';
  });

  report += `## 📸 Galería de Screenshots

`;

  testResults.forEach(result => {
    if (result.screenshots.length > 0) {
      report += `### ${result.name}\n\n`;
      result.screenshots.forEach(screenshot => {
        report += `![${screenshot}](test-screenshots/${screenshot})\n\n`;
      });
    }
  });

  fs.writeFileSync(REPORT_FILE, report);
  log(`✅ Reporte generado: ${REPORT_FILE}`, 'green');
}

// Main
async function runTests() {
  log('🚀 Iniciando Tests E2E con Puppeteer\n', 'cyan');
  log(`📍 URL Base: ${BASE_URL}`, 'cyan');
  log(`📁 Screenshots: ${SCREENSHOTS_DIR}\n`, 'cyan');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Ejecutar todos los tests
    await testHomePage(browser);
    await testStartProcessPage(browser);
    await testContinueProcessPage(browser);
    await testDarkMode(browser);
    await testResponsive(browser);
    await testNavigation(browser);

    // Generar reporte
    generateReport();

    // Resumen
    log('\n' + '='.repeat(50), 'cyan');
    log('📊 RESUMEN DE TESTS', 'cyan');
    log('='.repeat(50), 'cyan');

    const passed = testResults.filter(r => r.status === 'passed').length;
    const failed = testResults.filter(r => r.status === 'failed').length;

    log(`\n✅ Tests Pasados: ${passed}`, 'green');
    log(`❌ Tests Fallados: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`📊 Total: ${testResults.length}`, 'blue');
    log(`📈 Porcentaje de Éxito: ${((passed / testResults.length) * 100).toFixed(2)}%\n`, 'cyan');

    if (failed === 0) {
      log('🎉 ¡TODOS LOS TESTS PASARON!', 'green');
    } else {
      log('⚠️  Algunos tests fallaron. Revisa el reporte para más detalles.', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Error ejecutando tests: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await browser.close();
    log('\n✅ Tests completados', 'green');
  }
}

// Ejecutar
runTests().catch(console.error);
