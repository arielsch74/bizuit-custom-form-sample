'use client'

import { useState, useRef, useEffect } from 'react'
import { ALL_COMPONENTS_DOCS } from './all-components-docs'
import { useTranslation, useBizuitTheme } from '@tyconsa/bizuit-ui-components'
import {
  MousePointerClick,
  SlidersHorizontal,
  ChevronsUpDown,
  Calendar,
  Upload,
  Circle,
  PenTool,
  FileText,
  MapPin,
  Table,
  Sparkles,
  Folders,
  LayoutGrid,
  GitBranch,
  PlayCircle,
  Globe,
  Table2,
  Search,
  X,
  Menu,
  ChevronDown,
} from 'lucide-react'

interface ComponentsSidebarProps {
  selectedComponentId: string | null
  onComponentSelect: (id: string) => void
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MousePointerClick,
  SlidersHorizontal,
  ChevronsUpDown,
  Calendar,
  Upload,
  Circle,
  PenTool,
  FileText,
  MapPin,
  Table,
  Sparkles,
  Folders,
  LayoutGrid,
  GitBranch,
  PlayCircle,
  Globe,
  Table2,
}

// Category icons
const categoryIcons = {
  ui: MousePointerClick,
  forms: SlidersHorizontal,
  layout: LayoutGrid,
  media: PlayCircle,
  data: Table2,
}

type Category = keyof typeof categoryIcons

export default function ComponentsSidebar({
  selectedComponentId,
  onComponentSelect,
}: ComponentsSidebarProps) {
  const { t } = useTranslation()
  const { language } = useBizuitTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(
    new Set(['ui', 'forms', 'layout', 'media', 'data'])
  )
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)

  // Category configuration with translations
  const categoryConfig = {
    ui: {
      label: t('category.ui'),
      icon: categoryIcons.ui,
      description: t('category.ui.desc'),
    },
    forms: {
      label: t('category.forms'),
      icon: categoryIcons.forms,
      description: t('category.forms.desc'),
    },
    layout: {
      label: t('category.layout'),
      icon: categoryIcons.layout,
      description: t('category.layout.desc'),
    },
    media: {
      label: t('category.media'),
      icon: categoryIcons.media,
      description: t('category.media.desc'),
    },
    data: {
      label: t('category.data'),
      icon: categoryIcons.data,
      description: t('category.data.desc'),
    },
  }

  // Group components by category
  const componentsByCategory = ALL_COMPONENTS_DOCS.reduce(
    (acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = []
      }
      acc[component.category].push(component)
      return acc
    },
    {} as Record<Category, typeof ALL_COMPONENTS_DOCS>
  )

  // Filter components based on search
  const filteredComponents = Object.keys(componentsByCategory).reduce(
    (acc, category) => {
      const filtered = componentsByCategory[category as Category].filter(
        (component) =>
          component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          component.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (filtered.length > 0) {
        acc[category as Category] = filtered
      }
      return acc
    },
    {} as Record<Category, typeof ALL_COMPONENTS_DOCS>
  )

  const toggleCategory = (category: Category) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  // Restore scroll position after re-render
  useEffect(() => {
    if (scrollContainerRef.current && scrollPositionRef.current > 0) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current
    }
  }, [selectedComponentId])

  const handleComponentClick = (id: string) => {
    // Save current scroll position BEFORE changing component
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop
    }

    onComponentSelect(id)

    // Close mobile sidebar after selection
    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t('sidebar.components')}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-white/50 dark:hover:bg-black/50 rounded transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {ALL_COMPONENTS_DOCS.length} {t('sidebar.componentsAvailable')}
        </p>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b bg-white dark:bg-gray-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('sidebar.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Component List */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {Object.keys(filteredComponents).length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('sidebar.noComponentsFound')}</p>
            <p className="text-xs mt-1">{t('sidebar.tryDifferentTerm')}</p>
          </div>
        ) : (
          Object.entries(filteredComponents).map(([category, components]) => {
            const categoryKey = category as Category
            const config = categoryConfig[categoryKey]
            const Icon = config.icon
            const isExpanded = expandedCategories.has(categoryKey)

            return (
              <div key={category} className="border-b dark:border-gray-800">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {config.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {components.length} {components.length === 1 ? t('sidebar.component') : t('sidebar.components_plural')}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Component Items */}
                {isExpanded && (
                  <div className="bg-gray-50 dark:bg-gray-900">
                    {components.map((component) => {
                      const ComponentIcon = iconMap[component.icon]
                      const isSelected = selectedComponentId === component.id

                      return (
                        <button
                          key={component.id}
                          onClick={() => handleComponentClick(component.id)}
                          className={`w-full px-4 py-3 pl-12 flex items-start gap-3 text-left transition-all ${
                            isSelected
                              ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600 dark:border-blue-400'
                              : 'hover:bg-white dark:hover:bg-gray-800 border-l-4 border-transparent'
                          }`}
                        >
                          {ComponentIcon && (
                            <ComponentIcon
                              className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                                isSelected
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-400'
                              }`}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-medium ${
                                isSelected
                                  ? 'text-blue-900 dark:text-blue-100'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {component.name}
                            </div>
                            <div
                              className={`text-xs mt-0.5 line-clamp-2 ${
                                isSelected
                                  ? 'text-blue-700 dark:text-blue-300'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {language === 'es' && component.description_es ? component.description_es : component.description}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-3 gap-2 text-center">
          {Object.entries(filteredComponents).map(([category, components]) => {
            const config = categoryConfig[category as Category]
            const Icon = config.icon
            return (
              <div
                key={category}
                className="p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <Icon className="h-4 w-4 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {components.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {category}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Open component sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-xl lg:shadow-none
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
