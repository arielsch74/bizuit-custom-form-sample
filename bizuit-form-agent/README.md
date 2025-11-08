# 🤖 Bizuit Form Generator Agent

Agente especializado de Claude Code para generar formularios de Bizuit BPM de manera conversacional.

## 🎯 ¿Qué es este agente?

Este agente te ayuda a crear formularios para procesos de Bizuit BPM simplemente describiendo lo que necesitas en lenguaje natural. El agente entiende la arquitectura de Bizuit, los componentes disponibles, y las mejores prácticas.

## 🚀 Cómo usar el agente

### Opción 1: Invocar el agente directamente

En Claude Code, escribe:

```
@bizuit-form-generator crea un formulario para SolicitudVacaciones con:
- Campo empleado (textbox)
- Campo tipoVacacion (combo: Anuales, Enfermedad, Personales)
- Campo motivo (textarea)
- Botón "Comenzar" color primary
- Botón "Cancelar" color secondary
```

### Opción 2: Conversación natural

```
Tú: Necesito crear un formulario para iniciar un proceso de vacaciones

Agente: Entendido. ¿Qué campos necesitas en el formulario?

Tú: Campo de empleado, tipo de vacación en un combo, y motivo en textarea

Agente: Perfecto. ¿Qué opciones debe tener el combo de tipo de vacación?

Tú: Anuales, Enfermedad, y Personales

Agente: *Genera el código completo del formulario*
```

## 📋 Capacidades del Agente

### ✅ Tipos de Formularios

**1. Inicio de Proceso (Start Process)**
- Formularios con campos fijos
- Formularios dinámicos (auto-genera desde API de Bizuit)
- Con validación
- Con manejo de errores
- Con pantalla de éxito

**2. Continuación de Proceso (Continue Process)**
- Con bloqueo pesimista automático
- Carga de datos existentes
- Formulario editable
- Historial de actividades
- Auto-unlock al salir

**3. Solo Lectura (Readonly Display)**
- Mostrar datos en cards
- Historial completo
- Sin edición

### ✅ Features Incluidas

- ✅ TypeScript completo
- ✅ Validación con Zod
- ✅ Dark mode
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Internacionalización (i18n)
- ✅ Tests unitarios (opcional)
- ✅ Accesibilidad (WCAG 2.1 AA)

### ✅ Componentes Disponibles

El agente conoce todos estos componentes y puede usarlos:

- `DynamicFormField` - Genera campos automáticamente
- `BizuitDataGrid` - Tablas con sorting, filtering, pagination
- `BizuitCombo` - Select con búsqueda y multiselect
- `BizuitDateTimePicker` - Selector de fecha/hora
- `BizuitSlider` - Control deslizante
- `BizuitFileUpload` - Carga de archivos con drag & drop
- `ProcessSuccessScreen` - Pantalla de éxito reutilizable
- `Button` - Botones con múltiples variantes

## 💡 Ejemplos de Uso

### Ejemplo 1: Formulario Simple

```
Tú: Crea un formulario para SolicitudCompra con campos:
    - proveedor (textbox)
    - monto (number)
    - fecha (datepicker)
    - urgente (checkbox)
    - Botón "Enviar Solicitud"

Agente: *Genera app/solicitud-compra/page.tsx con todos los campos*
```

### Ejemplo 2: Formulario Dinámico desde API

```
Tú: Crea un formulario dinámico para el proceso AprobacionGastos

Agente: ¿Quieres que obtenga los parámetros desde la API de Bizuit?

Tú: Sí, API: https://test.bizuit.com/api, Token: xxxxx

Agente: *Llama a getProcessParameters()*
       *Encuentra 5 parámetros*
       *Genera formulario dinámico con DynamicFormField*
```

### Ejemplo 3: Continuar Proceso con Readonly

```
Tú: Crea un form para continuar AprobacionVacaciones que muestre:
    - Card readonly con: empleado, fechas, motivo
    - Combo aprobado (Sí, No)
    - Textarea observaciones
    - Botón "Aprobar" verde, "Rechazar" rojo

Agente: *Genera formulario con:*
       - Lock pesimista automático
       - Card con datos readonly
       - Campos editables
       - Botones personalizados
       - Success screen
```

### Ejemplo 4: Proyecto Completo desde Cero

```
Tú: Crea un proyecto Bizuit completo

Agente: ¿Qué nombre quieres para el proyecto?

Tú: sistema-rrhh

Agente: *Crea:*
       - next.config.js
       - tailwind.config.ts
       - tsconfig.json
       - package.json con dependencias
       - app/layout.tsx con providers
       - lib/config.ts
       - .env.example
       *Instala paquetes npm*

       ✅ Proyecto creado. ¿Quieres que genere un formulario ahora?
```

## 🎨 Personalización

### Estilos y Colores

```
Tú: El botón debe ser color azul #3B82F6 y el card con borde verde

Agente: *Genera código con estilos personalizados inline*
```

### Validación

```
Tú: El campo monto debe ser mayor a 1000 y menor a 100000

Agente: *Genera schema Zod con validaciones:*
       z.number().min(1000).max(100000)
```

### Layouts

```
Tú: Los campos deben estar en 2 columnas en desktop y 1 en mobile

Agente: *Genera grid responsive:*
       className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

## 🛠️ Configuración

### Requisitos Previos

Para usar el agente en un proyecto existente:

1. Next.js 14+ con App Router
2. Node.js 18+
3. npm o yarn

El agente puede:
- ✅ Detectar si tienes proyecto Next.js
- ✅ Instalar paquetes automáticamente
- ✅ Configurar todo lo necesario
- ✅ O crear proyecto desde cero

### Variables de Entorno

El agente te recordará configurar:

```.env
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=https://tu-servidor.com/api
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://tu-servidor.com/dashboard
```

## 📚 Conocimiento del Agente

El agente tiene conocimiento completo de:

1. **Documentación de Bizuit**
   - GETTING_STARTED.md completo
   - QUICK_REFERENCE.md
   - Ejemplos de código

2. **Componentes UI**
   - Props completos
   - Ejemplos de uso
   - Cuándo usar cada uno

3. **APIs de Bizuit**
   - Endpoints
   - Estructura de datos
   - Headers requeridos
   - Manejo de errores

4. **Patrones**
   - Estados de formulario
   - Lock/unlock
   - Error handling
   - Loading states

## 🎯 Modos de Operación

### Modo 1: Descriptivo (Manual)

Le dices exactamente qué quieres:
- Nombres de campos
- Tipos de componentes
- Opciones de combos
- Colores de botones
- Validaciones

### Modo 2: Automático (API)

Le das acceso a la API de Bizuit:
- Obtiene parámetros automáticamente
- Genera formulario dinámico
- Infiere tipos de campos
- Configura validaciones

### Modo 3: Híbrido

Combina ambos:
- Usa API para parámetros básicos
- Personalizas campos específicos
- Añades campos custom
- Modificas estilos

## 🐛 Troubleshooting

### El agente no encuentra los componentes

```
Tú: No encuentra BizuitCombo

Agente: Voy a verificar la instalación de paquetes...
       *Detecta que falta @tyconsa/bizuit-ui-components*
       ¿Quieres que lo instale?

Tú: Sí

Agente: *Ejecuta npm install @tyconsa/bizuit-ui-components*
```

### Errores de compilación

El agente puede:
- Leer errores de TypeScript
- Corregir imports
- Ajustar tipos
- Regenerar código

### El formulario no se ve bien

```
Tú: Los campos están muy juntos

Agente: Voy a añadir espaciado...
       *Añade className="space-y-4"*
```

## 📖 Documentación Adicional

- [Documentación Completa Bizuit](../example/docs/GETTING_STARTED.md)
- [Referencia Rápida](../example/docs/QUICK_REFERENCE.md)
- [Ejemplos de Código](../example/docs/examples/)
- [Paquetes npm](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk)

## 🤝 Contribuir

Si quieres mejorar el agente:

1. Modifica `.claude/agents/bizuit-form-generator.md`
2. Añade/modifica templates en `templates/`
3. Actualiza knowledge base en `knowledge/`

## 📝 Notas

- El agente NO modifica archivos existentes sin tu confirmación
- Siempre explica qué va a hacer antes de hacerlo
- Puedes pedirle que regenere código si no te gusta
- Puede generar tests unitarios si se lo pides

## 💬 Feedback

Si el agente no entiende algo o comete un error:

```
Tú: Esto no es lo que quería

Agente: Discul

pa, ¿puedes explicarme mejor qué necesitas?

Tú: [Explicas más claramente]

Agente: *Regenera con la información correcta*
```

---

**Creado para:** Proyecto Bizuit Form Template
**Versión:** 1.0.0
**Última actualización:** Noviembre 2025
