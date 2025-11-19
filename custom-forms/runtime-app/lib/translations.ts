export const translations = {
  en: {
    // Home page
    'home.title': 'BIZUIT Custom Forms',
    'home.subtitle': 'Dynamic forms system for BIZUIT BPM',
    'home.adminPanel': 'Administration Panel',
    'home.adminDescription': 'Access the admin panel to manage forms, upload deployments, and view statistics',
    'home.goToAdmin': 'Go to Admin',
    'home.documentation': 'Documentation:',
    'home.adminPanel.link': 'Admin Panel',

    // Features
    'features.hotReload.title': 'Hot Reload',
    'features.hotReload.description': 'Automatic detection of new versions every 10 seconds',
    'features.versioning.title': 'Versioning',
    'features.versioning.description': 'Version control with complete history',
    'features.registry.title': 'Form Registry',
    'features.registry.description': 'Centralized registry with form metadata',
    'features.dynamic.title': 'Dynamic Loading',
    'features.dynamic.description': 'Forms loaded on demand from BIZUIT',

    // Info box
    'info.howItWorks': 'How does it work?',
    'info.description': 'Forms are loaded dynamically when BIZUIT requests them using security tokens. You don\'t need to manually navigate to forms - BIZUIT will automatically open them at',
    'info.formPath': '/form/[form-name]',
    'info.whenNeeded': 'when needed.',
  },
  es: {
    // Home page
    'home.title': 'BIZUIT Custom Forms',
    'home.subtitle': 'Sistema de formularios dinámicos para BIZUIT BPM',
    'home.adminPanel': 'Panel de Administración',
    'home.adminDescription': 'Accede al panel de administración para gestionar formularios, subir deployments y ver estadísticas',
    'home.goToAdmin': 'Ir al Admin',
    'home.documentation': 'Documentación:',
    'home.adminPanel.link': 'Panel Admin',

    // Features
    'features.hotReload.title': 'Hot Reload',
    'features.hotReload.description': 'Detección automática de nuevas versiones cada 10 segundos',
    'features.versioning.title': 'Versionado',
    'features.versioning.description': 'Control de versiones con historial completo',
    'features.registry.title': 'Form Registry',
    'features.registry.description': 'Registro centralizado con metadata de forms',
    'features.dynamic.title': 'Carga Dinámica',
    'features.dynamic.description': 'Formularios cargados a demanda desde BIZUIT',

    // Info box
    'info.howItWorks': '¿Cómo funciona?',
    'info.description': 'Los formularios se cargan dinámicamente cuando BIZUIT los solicita mediante tokens de seguridad. No es necesario navegar manualmente a los formularios - BIZUIT los abrirá automáticamente en',
    'info.formPath': '/form/[nombre-formulario]',
    'info.whenNeeded': 'cuando sea necesario.',
  },
}

export type TranslationKey = keyof typeof translations.en
export type Language = 'en' | 'es'
