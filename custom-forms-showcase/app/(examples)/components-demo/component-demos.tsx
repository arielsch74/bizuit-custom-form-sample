'use client'

import { useState } from 'react'
import {
  Button,
  BizuitSlider,
  BizuitCombo,
  BizuitDateTimePicker,
  BizuitFileUpload,
  BizuitRadioButton,
  BizuitSubForm,
  BizuitTabs,
  type SubFormRow,
  type TabItem,
} from '@tyconsa/bizuit-ui-components'

// Live interactive demos for each component
export const ComponentDemos: Record<string, React.ComponentType> = {
  button: () => (
    <div className="p-8 space-y-8 bg-white dark:bg-slate-900 rounded-lg">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button Variants</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button Sizes</h3>
        <div className="flex gap-3 items-center flex-wrap">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">⚙</Button>
        </div>
      </div>
    </div>
  ),

  'bizuit-slider': () => {
    const [value, setValue] = useState(50)
    const [rangeValue, setRangeValue] = useState([25, 75])

    return (
      <div className="p-8 space-y-8 max-w-2xl bg-white dark:bg-slate-900 rounded-lg">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Single Value: {value}</h3>
          <BizuitSlider
            value={value}
            onChange={(val) => setValue(val as number)}
            min={0}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Range: {rangeValue[0]} - {rangeValue[1]}
          </h3>
          <BizuitSlider
            value={rangeValue}
            onChange={(val) => setRangeValue(val as number[])}
            min={0}
            max={100}
            step={5}
          />
        </div>
      </div>
    )
  },

  'bizuit-combo': () => {
    const [value, setValue] = useState('')
    const options = [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' },
      { value: 'svelte', label: 'Svelte' },
    ]

    return (
      <div className="p-8 space-y-4 max-w-md bg-white dark:bg-slate-900 rounded-lg">
        <h3 className="text-lg font-semibold">Selected: {value || 'None'}</h3>
        <BizuitCombo
          options={options}
          value={value}
          onChange={(val) => setValue(Array.isArray(val) ? val[0] : val)}
          placeholder="Select a framework..."
        />
      </div>
    )
  },

  // NOTE: These components have TypeScript errors due to missing/incorrect prop definitions
  // Commenting them out until the component types are fixed in @bizuit/ui-components

  // 'bizuit-date-time-picker': () => { ... },
  // 'bizuit-file-upload': () => { ... },
  // 'bizuit-radio-button': () => { ... },
  // 'bizuit-sub-form': () => { ... },

  'bizuit-tabs': () => {
    const tabItems: TabItem[] = [
      {
        value: 'profile',
        label: 'Profile',
        content: (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-2">Profile Settings</h3>
            <p className="text-muted-foreground">
              Manage your profile settings here.
            </p>
          </div>
        ),
      },
      {
        value: 'account',
        label: 'Account',
        content: (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-2">Account Settings</h3>
            <p className="text-muted-foreground">
              Update your account information.
            </p>
          </div>
        ),
      },
    ]

    return (
      <div className="p-8 max-w-2xl bg-white dark:bg-slate-900 rounded-lg">
        <BizuitTabs items={tabItems} defaultValue="profile" />
      </div>
    )
  },
}
