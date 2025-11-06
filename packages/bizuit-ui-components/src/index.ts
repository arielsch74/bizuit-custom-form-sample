/**
 * @bizuit/ui-components
 * Production-ready, fully customizable UI components for Bizuit BPM forms
 */

// Utilities
export * from './lib/utils'

// UI Components
export { Button } from './components/ui/button'
export type { ButtonProps } from './components/ui/button'

// Data Components
export { BizuitDataGrid, SortableHeader } from './components/data/data-grid'
export type { DataGridProps } from './components/data/data-grid'

// Form Components
export { BizuitCombo } from './components/forms/bizuit-combo'
export type { BizuitComboProps, ComboOption } from './components/forms/bizuit-combo'

export { BizuitDateTimePicker } from './components/forms/bizuit-date-time-picker'
export type { BizuitDateTimePickerProps } from './components/forms/bizuit-date-time-picker'

export { BizuitSlider } from './components/forms/bizuit-slider'
export type { BizuitSliderProps, SliderMark } from './components/forms/bizuit-slider'

export { BizuitFileUpload } from './components/forms/bizuit-file-upload'
export type { BizuitFileUploadProps } from './components/forms/bizuit-file-upload'

// Version
export const VERSION = '1.0.0'
