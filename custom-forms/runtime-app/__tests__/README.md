# BIZUIT Custom Forms - Test Suite

## Configuración

El proyecto utiliza **Jest** y **React Testing Library** para testing.

### Dependencias instaladas:
- `jest` - Framework de testing
- `@testing-library/react` - Testing utilities para React
- `@testing-library/jest-dom` - Matchers personalizados para DOM
- `@testing-library/user-event` - Simulación de eventos de usuario
- `jest-environment-jsdom` - Entorno DOM para tests

## Estructura de Tests

```
runtime-app/
├── __tests__/              # Tests de integración
│   └── README.md          # Este archivo
├── hooks/
│   └── __tests__/         # Tests unitarios de hooks
│       └── useLoginForm.test.ts
├── lib/
│   └── __tests__/         # Tests unitarios de librerías (pendiente)
├── components/
│   └── __tests__/         # Tests unitarios de componentes (pendiente)
└── app/
    └── __tests__/         # Tests de páginas (pendiente)
```

## Comandos

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (re-ejecuta al guardar cambios)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

## Tests Implementados

### ✅ hooks/useLoginForm.test.ts (10 tests)
- Inicialización con valores vacíos
- Actualización de username y password
- Login exitoso
- Login fallido con mensaje de error
- Login fallido sin mensaje específico
- Manejo de errores de red
- Estados de loading durante el proceso
- Uso de redirect path personalizado
- Uso de environment variable para API URL

## Tests Pendientes

### lib/__tests__
- `form-registry.test.ts` - Testing del registro de formularios
- `form-loader.test.ts` - Testing del cargador dinámico de forms

### components/__tests__
- `FormContainer.test.tsx` - Testing del contenedor de forms
- `FormErrorBoundary.test.tsx` - Testing del error boundary
- `FormLoadingState.test.tsx` - Testing del loading state

### app/__tests__
- Tes ts de integración para las páginas principales
- Tests end-to-end del flujo de login
- Tests del admin dashboard

## Configuración de Jest

Ver `jest.config.ts` para la configuración completa.

### Características:
- **Environment:** jsdom (para testing de componentes React)
- **Coverage provider:** v8
- **Setup file:** `jest.setup.ts` (configura matchers y env vars)
- **Module aliases:** `@/` apunta al root del proyecto

## Mejores Prácticas

1. **Organización:** Mantener tests cerca del código que testean (`__tests__` folder)
2. **Nomenclatura:** Usar `.test.ts` o `.test.tsx` para archivos de test
3. **Aislamiento:** Cada test debe ser independiente y no depender de otros
4. **Mocks:** Mock de dependencias externas (fetch, localStorage, next/navigation)
5. **Coverage:** Apuntar a 80%+ de cobertura en código crítico

## Próximos Pasos

1. Crear tests unitarios para `lib/form-registry.ts` y `lib/form-loader.ts`
2. Crear tests de integración para flujos completos (login → dashboard)
3. Aumentar cobertura de código al 80%+
4. Configurar CI/CD para ejecutar tests automáticamente
