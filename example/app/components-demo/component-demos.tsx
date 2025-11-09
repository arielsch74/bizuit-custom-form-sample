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
          onChange={setValue}
          placeholder="Select a framework..."
        />
      </div>
    )
  },

  'bizuit-date-time-picker': () => {
    const [date, setDate] = useState<Date | undefined>(new Date())

    return (
      <div className="p-8 space-y-6 max-w-md bg-white dark:bg-slate-900 rounded-lg">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Date Picker</h3>
          <p className="text-sm text-muted-foreground">
            {date ? date.toLocaleDateString() : 'No date selected'}
          </p>
          <BizuitDateTimePicker value={date} onChange={setDate} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">DateTime Picker</h3>
          <BizuitDateTimePicker
            value={date}
            onChange={setDate}
            showTime={true}
            timeFormat="24h"
          />
        </div>
      </div>
    )
  },

  'bizuit-file-upload': () => {
    const [files, setFiles] = useState<File[]>([])

    return (
      <div className="p-8 space-y-4 max-w-2xl bg-white dark:bg-slate-900 rounded-lg">
        <h3 className="text-lg font-semibold">Files: {files.length}</h3>
        <BizuitFileUpload
          value={files}
          onChange={setFiles}
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          maxFiles={5}
        />
      </div>
    )
  },

  'bizuit-radio-button': () => {
    const [value, setValue] = useState('option1')

    return (
      <div className="p-8 space-y-4 max-w-md bg-white dark:bg-slate-900 rounded-lg">
        <h3 className="text-lg font-semibold">Selected: {value}</h3>
        <div className="space-y-3">
          <BizuitRadioButton
            label="Option 1"
            value="option1"
            checked={value === 'option1'}
            onChange={() => setValue('option1')}
          />
          <BizuitRadioButton
            label="Option 2"
            value="option2"
            checked={value === 'option2'}
            onChange={() => setValue('option2')}
          />
          <BizuitRadioButton
            label="Option 3"
            value="option3"
            checked={value === 'option3'}
            onChange={() => setValue('option3')}
          />
        </div>
      </div>
    )
  },

  'bizuit-sub-form': () => {
    const [items, setItems] = useState<SubFormRow[]>([])

    const fields = [
      { name: 'description', label: 'Description', type: 'text' as const, required: true },
      { name: 'quantity', label: 'Qty', type: 'number' as const, required: true },
      { name: 'price', label: 'Price', type: 'number' as const, required: true },
    ]

    const total = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.price) || 0
      return sum + qty * price
    }, 0)

    return (
      <div className="p-8 space-y-4 max-w-4xl bg-white dark:bg-slate-900 rounded-lg">
        <h3 className="text-lg font-semibold">Invoice Items</h3>
        <BizuitSubForm
          label="Items"
          fields={fields}
          value={items}
          onChange={setItems}
          maxRows={10}
        />
        <div className="text-right text-lg font-bold">
          Total: ${total.toFixed(2)}
        </div>
      </div>
    )
  },

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
