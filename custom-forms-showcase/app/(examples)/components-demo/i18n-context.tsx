'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'es'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // UI Labels
    'ui.overview': 'Overview',
    'ui.props': 'Props',
    'ui.liveExample': 'Live Example',
    'ui.sourceCode': 'Source Code',
    'ui.description': 'Description',
    'ui.useCases': 'Use Cases',
    'ui.installation': 'Installation',
    'ui.noPropsDocumented': 'No props documented for this component.',
    'ui.backToHome': '← Back to home',
    'ui.componentName': 'Name',
    'ui.componentType': 'Type',
    'ui.componentRequired': 'Required',
    'ui.componentDefault': 'Default',
    'ui.componentDescription': 'Description',
    'ui.yes': 'Yes',
    'ui.no': 'No',
    'ui.example': 'Example',
    'ui.editCodeDescription': 'Edit the code and see changes in real-time',
    'ui.viewSourceCode': 'View the source code for',
    'ui.inYourProject': 'in your project files or on GitHub.',
    'ui.copy': 'Copy',
    'ui.codeCopied': 'Code copied to clipboard!',

    // Welcome Screen
    'welcome.title': 'Bizuit UI Components',
    'welcome.subtitle': 'A complete library of professional React components to build modern enterprise applications',
    'welcome.version': 'v1.3.1 • @tyconsa/bizuit-ui-components',
    'welcome.totalComponents': 'Total Components',
    'welcome.totalComponentsDesc': 'From forms to data visualization',
    'welcome.categories': 'Categories',
    'welcome.categoriesDesc': 'UI, Forms, Layout, Media and Data',
    'welcome.typescript': 'TypeScript',
    'welcome.typescriptDesc': 'Complete types and autocomplete',
    'welcome.startExploring': 'Start Exploring',
    'welcome.selectComponent': 'Select a component from the sidebar to see:',
    'welcome.detailedDescription': 'Detailed description',
    'welcome.detailedDescriptionText': 'and use cases',
    'welcome.completeProps': 'Complete props documentation',
    'welcome.completePropsText': 'with types and default values',
    'welcome.interactiveExamples': 'Interactive code examples',
    'welcome.interactiveExamplesText': 'that you can edit in real-time',
    'welcome.quickInstall': 'Quick Install',
    'welcome.thenImport': 'Then import the components you need:',

    // Sidebar
    'sidebar.components': 'Components',
    'sidebar.componentsAvailable': 'components available',
    'sidebar.searchPlaceholder': 'Search components...',
    'sidebar.noComponentsFound': 'No components found',
    'sidebar.tryDifferentTerm': 'Try a different search term',
    'sidebar.component': 'component',
    'sidebar.components_plural': 'components',

    // Categories
    'category.ui': 'UI Components',
    'category.ui.desc': 'Buttons, cards, and visual elements',
    'category.forms': 'Form Components',
    'category.forms.desc': 'Input fields and form controls',
    'category.layout': 'Layout Components',
    'category.layout.desc': 'Tabs, cards, and containers',
    'category.media': 'Media Components',
    'category.media.desc': 'Images, videos, and media players',
    'category.data': 'Data Components',
    'category.data.desc': 'Tables and data displays',
  },
  es: {
    // UI Labels
    'ui.overview': 'Vista General',
    'ui.props': 'Propiedades',
    'ui.liveExample': 'Ejemplo en Vivo',
    'ui.sourceCode': 'Código Fuente',
    'ui.description': 'Descripción',
    'ui.useCases': 'Casos de Uso',
    'ui.installation': 'Instalación',
    'ui.noPropsDocumented': 'No hay propiedades documentadas para este componente.',
    'ui.backToHome': '← Volver al inicio',
    'ui.componentName': 'Nombre',
    'ui.componentType': 'Tipo',
    'ui.componentRequired': 'Requerido',
    'ui.componentDefault': 'Por Defecto',
    'ui.componentDescription': 'Descripción',
    'ui.yes': 'Sí',
    'ui.no': 'No',
    'ui.example': 'Ejemplo',
    'ui.editCodeDescription': 'Edita el código y verás los cambios en tiempo real',
    'ui.viewSourceCode': 'Ver el código fuente de',
    'ui.inYourProject': 'en los archivos de tu proyecto o en GitHub.',
    'ui.copy': 'Copiar',
    'ui.codeCopied': '¡Código copiado al portapapeles!',

    // Welcome Screen
    'welcome.title': 'Bizuit UI Components',
    'welcome.subtitle': 'Una biblioteca completa de componentes React profesionales para construir aplicaciones empresariales modernas',
    'welcome.version': 'v1.3.1 • @tyconsa/bizuit-ui-components',
    'welcome.totalComponents': 'Componentes totales',
    'welcome.totalComponentsDesc': 'Desde formularios hasta visualización de datos',
    'welcome.categories': 'Categorías',
    'welcome.categoriesDesc': 'UI, Formularios, Layout, Media y Datos',
    'welcome.typescript': 'TypeScript',
    'welcome.typescriptDesc': 'Tipos completos y autocompletado',
    'welcome.startExploring': 'Comienza explorando',
    'welcome.selectComponent': 'Selecciona un componente desde la barra lateral para ver:',
    'welcome.detailedDescription': 'Descripción detallada',
    'welcome.detailedDescriptionText': 'y casos de uso',
    'welcome.completeProps': 'Documentación completa de props',
    'welcome.completePropsText': 'con tipos y valores por defecto',
    'welcome.interactiveExamples': 'Ejemplos de código interactivos',
    'welcome.interactiveExamplesText': 'que puedes editar en tiempo real',
    'welcome.quickInstall': 'Instalación rápida',
    'welcome.thenImport': 'Luego importa los componentes que necesites:',

    // Sidebar
    'sidebar.components': 'Componentes',
    'sidebar.componentsAvailable': 'componentes disponibles',
    'sidebar.searchPlaceholder': 'Buscar componentes...',
    'sidebar.noComponentsFound': 'No se encontraron componentes',
    'sidebar.tryDifferentTerm': 'Intenta con un término diferente',
    'sidebar.component': 'componente',
    'sidebar.components_plural': 'componentes',

    // Categories
    'category.ui': 'Componentes UI',
    'category.ui.desc': 'Botones, tarjetas y elementos visuales',
    'category.forms': 'Componentes de Formulario',
    'category.forms.desc': 'Campos de entrada y controles de formulario',
    'category.layout': 'Componentes de Layout',
    'category.layout.desc': 'Pestañas, tarjetas y contenedores',
    'category.media': 'Componentes de Media',
    'category.media.desc': 'Imágenes, videos y reproductores multimedia',
    'category.data': 'Componentes de Datos',
    'category.data.desc': 'Tablas y visualización de datos',
  },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('components-demo-language')
      return (saved === 'es' || saved === 'en') ? saved : 'en'
    }
    return 'en'
  })

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('components-demo-language', lang)
    }
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
