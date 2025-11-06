# 🧪 Testing con Puppeteer

Este proyecto incluye tests automatizados E2E (End-to-End) usando Puppeteer.

## 🚀 Ejecución Rápida

```bash
# 1. Iniciar servidor de desarrollo
npm run dev

# 2. En otra terminal, ejecutar tests
npm run test:e2e
```

## 📋 ¿Qué se Prueba?

Los tests verifican automáticamente:

### 1. **Home Page**
- Carga correcta de la página
- Presencia de elementos principales
- Enlaces funcionando

### 2. **Start Process Page**
- Formulario de autenticación
- Campos de entrada de datos
- Capacidad de ingresar datos

### 3. **Continue Process Page**
- Formulario de continuación
- Campos de instancia
- Mensajes de bloqueo

### 4. **Dark Mode**
- Activación de modo oscuro
- Cambio de estilos
- Visibilidad de elementos

### 5. **Responsive Design**
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### 6. **Navigation**
- Navegación entre páginas
- URLs correctas
- Transiciones

## 📸 Screenshots

Los tests generan automáticamente screenshots en: `test-screenshots/`

## 📊 Reportes

Después de ejecutar los tests, encontrarás:

- **test-report.md** - Reporte completo en Markdown
- **test-screenshots/** - Carpeta con todas las capturas
- **Consola** - Salida con colores indicando éxito/fallo

## 🎨 Ejemplo de Salida

```
🚀 Iniciando Tests E2E con Puppeteer

🧪 Test 1: Home Page
  ✓ Título: Bizuit Form Example
  ✓ H1 encontrado
  ✓ Enlaces presentes
  📸 Screenshot guardado
  ✅ Test PASADO

...

📊 RESUMEN DE TESTS
✅ Tests Pasados: 6
❌ Tests Fallados: 0
📊 Total: 6
📈 Porcentaje de Éxito: 100.00%

🎉 ¡TODOS LOS TESTS PASARON!
```

## 🛠️ Configuración

### Cambiar URL Base

El script detecta automáticamente el puerto que usa Next.js. Si el puerto 3000 está ocupado, Next.js usará 3001, 3002, etc.

Para forzar un puerto específico:

```bash
# Opción 1: Variable de entorno para el script de test
BASE_URL=http://localhost:3000 npm run test:e2e

# Opción 2: Especificar puerto para Next.js
PORT=3002 npm run dev
```

### Modificar Tests

Edita el archivo: `test-puppeteer.js`

## 📦 Dependencias

```json
{
  "puppeteer": "^24.29.1"
}
```

Ya está instalado. No necesitas instalar nada adicional.

## 🔧 Troubleshooting

### Error: "Cannot connect to localhost:3001"

**Solución**: Asegúrate de que el servidor esté corriendo:
```bash
npm run dev
```

### Tests muy lentos

**Solución**: Los tests toman ~15 segundos. Es normal para Puppeteer.

### Screenshots no se generan

**Solución**: Verifica permisos de escritura en la carpeta del proyecto.

## 🎯 CI/CD

Para integrar en CI/CD, usa:

```bash
# Instalar dependencias
npm install

# Build del proyecto
npm run build

# Iniciar servidor
npm run start &

# Esperar que el servidor inicie
sleep 5

# Ejecutar tests
npm run test:e2e

# Detener servidor
pkill -f "next start"
```

## 📚 Más Información

- [Puppeteer Docs](https://pptr.dev/)
- [Reporte de Tests](./test-report.md)
- [Resultados Completos](../TESTING_RESULTS.md)

---

✅ **Última ejecución**: 6 de Noviembre 2025 - 100% de tests pasados
