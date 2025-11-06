# Bizuit Form Template

Template completo para desarrollo de formularios web integrados con Bizuit BPMS.

## 📦 Estructura del Proyecto

```
BizuitFormTemplate/
├── packages/                    # Paquetes NPM reutilizables
│   ├── bizuit-form-sdk/        # SDK core para integración con Bizuit BPM
│   └── bizuit-ui-components/   # Biblioteca de componentes UI
├── example/                     # Proyecto de ejemplo Next.js 15
└── README.md                    # Este archivo
```

## 🚀 Inicio Rápido

### 1. Instalar Dependencias de los Paquetes

```bash
# SDK
cd packages/bizuit-form-sdk
npm install
npm run build

# UI Components
cd ../bizuit-ui-components
npm install
npm run build

# Volver a la raíz
cd ../..
```

### 2. Ejecutar el Ejemplo

```bash
cd example
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver el ejemplo.

## 📚 Paquetes

### @bizuit/form-sdk

SDK completo para integración con Bizuit BPM que incluye:

- **Autenticación y Autorización**: Validación de tokens, verificación de permisos
- **Gestión de Procesos**: Inicialización, ejecución de eventos (RaiseEvent)
- **Bloqueo de Instancias**: Implementación de bloqueo pesimista
- **Cliente HTTP**: Con headers personalizados BZ-*
- **React Hooks**: `useBizuitSDK`, `useAuth`
- **Utilidades**: Parser de parámetros complejos (JSON/XML)

[Ver documentación completa →](packages/bizuit-form-sdk/README.md)

### @bizuit/ui-components

Biblioteca de componentes React altamente personalizables:

- **BizuitDataGrid**: Tabla con ordenamiento, filtrado, paginación (TanStack Table v8)
- **BizuitCombo**: Select con búsqueda incremental y multiselección
- **BizuitDateTimePicker**: Selector de fecha, hora y datetime
- **BizuitSlider**: Control deslizante con marcas personalizadas
- **BizuitFileUpload**: Carga de archivos con drag & drop
- **Button**: Componente de botón con múltiples variantes

**Características**:
- ✅ 100% personalizables con Tailwind CSS
- ✅ Soporte para modo oscuro
- ✅ Responsive y mobile-friendly
- ✅ Basados en Radix UI (accesibles)
- ✅ TypeScript completo

[Ver documentación completa →](packages/bizuit-ui-components/README.md)

## 📱 Proyecto de Ejemplo

El directorio [example/](example/) contiene una aplicación Next.js 15 completa que demuestra:

### Página: Iniciar Proceso ([/start-process](example/app/start-process/page.tsx))

1. Autenticación con token JWT
2. Validación de permisos
3. Inicialización de proceso
4. Formulario con todos los componentes UI
5. Ejecución de RaiseEvent para crear instancia

### Página: Continuar Proceso ([/continue-process](example/app/continue-process/page.tsx))

1. Autenticación con token JWT
2. Verificación de estado de bloqueo
3. Bloqueo pesimista de instancia
4. Carga de datos existentes
5. Edición con desbloqueo automático
6. Historial de actividades (solo lectura)

[Ver documentación del ejemplo →](example/README.md)

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS
- **Componentes Base**: Radix UI
- **Tabla de Datos**: TanStack Table v8
- **Gestión de Formularios**: React Hook Form
- **Validación**: Zod
- **HTTP Client**: Axios
- **Bundler**: tsup (para paquetes)

## 🎯 Funcionalidades Principales

### 1. Autenticación y Autorización

```typescript
const { validateToken, checkFormAuth, getUserInfo } = useAuth()

// Validar token
const isValid = await validateToken(token)

// Verificar permisos
const hasAccess = await checkFormAuth({
  processName: 'MiProceso',
  userName: 'usuario'
})
```

### 2. Iniciar Proceso

```typescript
const sdk = useBizuitSDK()

// Inicializar proceso
const processData = await sdk.process.initialize({
  processName: 'MiProceso',
  token
})

// Ejecutar proceso
const result = await sdk.process.raiseEvent(
  {
    eventName: 'StartProcess',
    parameters: []
  },
  [] // files
)
```

### 3. Continuar Proceso con Bloqueo

```typescript
// Con desbloqueo automático
await sdk.instanceLock.withLock(
  {
    instanceId: 'INST-123',
    activityName: 'MiActividad',
    operation: 1,
    processName: 'MiProceso'
  },
  token,
  async (sessionToken) => {
    // Ejecutar operaciones con la instancia bloqueada
    return await sdk.process.raiseEvent(
      {
        eventName: 'ContinueProcess',
        instanceId,
        parameters: []
      },
      [],
      sessionToken
    )
  }
)
// La instancia se desbloquea automáticamente
```

### 4. Usar Componentes UI

```typescript
import {
  BizuitDataGrid,
  BizuitCombo,
  BizuitDateTimePicker,
  BizuitSlider,
  BizuitFileUpload
} from '@bizuit/ui-components'

// Combo con búsqueda
<BizuitCombo
  options={[
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' }
  ]}
  value={value}
  onChange={setValue}
  searchable
  multiSelect
/>

// Data Grid
<BizuitDataGrid
  columns={columns}
  data={data}
  selectable="multiple"
  sortable
  filterable
  paginated
/>
```

## 🌙 Modo Oscuro

Todos los componentes soportan modo oscuro automáticamente usando la estrategia `class` de Tailwind CSS.

```typescript
// En tu app/layout.tsx
<html className="dark">
  {/* ... */}
</html>
```

## 🌍 Internacionalización

Los componentes de fecha soportan múltiples idiomas:

```typescript
<BizuitDateTimePicker
  value={date}
  onChange={setDate}
  locale="es" // o "en"
/>
```

## 📦 Publicar Paquetes

Para publicar los paquetes a NPM (cuando estés listo):

```bash
# SDK
cd packages/bizuit-form-sdk
npm publish --access public

# UI Components
cd ../bizuit-ui-components
npm publish --access public
```

## 🔧 Desarrollo

### Estructura de Desarrollo

1. Haz cambios en los paquetes (`packages/`)
2. Reconstruye los paquetes: `npm run build`
3. Los cambios se reflejan automáticamente en el ejemplo

### Scripts Disponibles

Cada paquete tiene:
- `npm run build` - Compilar paquete
- `npm run dev` - Modo desarrollo con watch (algunos paquetes)
- `npm run lint` - Verificar código

El ejemplo tiene:
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter

## 📝 Variables de Entorno

Crea un archivo `.env.local` en el directorio `example/`:

```env
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=https://tu-api.com/forms
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://tu-api.com/dashboard
```

Ver [example/.env.example](example/.env.example) para más detalles.

## 🎨 Personalización

### Temas y Colores

Los componentes usan variables CSS que puedes personalizar en tu `globals.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... más variables */
}
```

### Tailwind Config

Personaliza los estilos en tu `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        // ...
      }
    }
  }
}
```

## 🌐 Compatibilidad de Navegadores

- Chrome/Edge (última versión)
- Safari (última versión)
- Opera (última versión)
- Firefox (última versión)
- Navegadores móviles (iOS Safari, Chrome Mobile)

## 📄 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Soporte

Para preguntas o problemas, abre un issue en el repositorio.

---

**Creado con ❤️ para el ecosistema Bizuit BPM**
