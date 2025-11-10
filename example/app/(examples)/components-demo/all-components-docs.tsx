/**
 * Comprehensive Documentation for ALL 17 Bizuit UI Components
 * This file imports all individual component documentation files and exports them as a single array.
 *
 * Architecture: Each component has its own file in /components/ for better maintainability.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ComponentProp {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
  description_es?: string
}

export interface ComponentDoc {
  id: string
  name: string
  category: 'ui' | 'forms' | 'layout' | 'media' | 'data'
  icon: string
  description: string
  description_es?: string
  detailedDescription: string
  detailedDescription_es?: string
  useCases: string[]
  useCases_es?: string[]
  props: ComponentProp[]
  codeExample: { [filename: string]: string }
}

// ============================================================================
// COMPONENT IMPORTS
// ============================================================================

import { buttonDoc } from './components/button'
import { bizuit_sliderDoc } from './components/slider'
import { bizuit_comboDoc } from './components/combo'
import { bizuit_date_time_pickerDoc } from './components/date-time-picker'
import { bizuit_file_uploadDoc } from './components/file-upload'
import { bizuit_radio_buttonDoc } from './components/radio-button'
import { bizuit_signatureDoc } from './components/signature'
import { bizuit_document_inputDoc } from './components/document-input'
import { bizuit_geolocationDoc } from './components/geolocation'
import { bizuit_subformDoc } from './components/subform'
import { dynamic_form_fieldDoc } from './components/dynamic-form-field'
import { bizuit_tabsDoc } from './components/tabs'
import { bizuit_cardDoc } from './components/card'
import { bizuit_stepperDoc } from './components/stepper'
import { bizuit_mediaDoc } from './components/media'
import { bizuit_iframeDoc } from './components/iframe'
import { bizuit_data_gridDoc } from './components/data-grid'

// ============================================================================
// CONSOLIDATED EXPORT
// ============================================================================

export const ALL_COMPONENTS_DOCS: ComponentDoc[] = [
  buttonDoc,
  bizuit_sliderDoc,
  bizuit_comboDoc,
  bizuit_date_time_pickerDoc,
  bizuit_file_uploadDoc,
  bizuit_radio_buttonDoc,
  bizuit_signatureDoc,
  bizuit_document_inputDoc,
  bizuit_geolocationDoc,
  bizuit_subformDoc,
  dynamic_form_fieldDoc,
  bizuit_tabsDoc,
  bizuit_cardDoc,
  bizuit_stepperDoc,
  bizuit_mediaDoc,
  bizuit_iframeDoc,
  bizuit_data_gridDoc,
];
