import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DynamicFormField } from '../components/forms/dynamic-form-field'
import type { IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'

describe('DynamicFormField', () => {
  describe('String/Text fields', () => {
    it('should render text input for string type', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'ClientName',
        parameterType: 1,
        parameterDirection: 1,
        type: 'string',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('placeholder', 'Ingrese ClientName')
    })

    it('should render text input for text type', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Description',
        parameterType: 1,
        parameterDirection: 1,
        type: 'text',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should call onChange when user types in text input', async () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Name',
        parameterType: 1,
        parameterDirection: 1,
        type: 'string',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'John')

      expect(onChange).toHaveBeenCalledTimes(4) // Once per character
      // userEvent.type triggers onChange for each keystroke, so last call is just last character
      expect(onChange).toHaveBeenCalled()
    })

    it('should display existing value in text input', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Name',
        parameterType: 1,
        parameterDirection: 1,
        type: 'string',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="Existing Value" onChange={onChange} />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Existing Value')
    })
  })

  describe('Numeric fields', () => {
    it('should render number input for int type', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Age',
        parameterType: 1,
        parameterDirection: 1,
        type: 'int',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('spinbutton')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render number input for integer type', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Count',
        parameterType: 1,
        parameterDirection: 1,
        type: 'integer',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render number input for number type', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Amount',
        parameterType: 1,
        parameterDirection: 1,
        type: 'number',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render number input for decimal type', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Price',
        parameterType: 1,
        parameterDirection: 1,
        type: 'decimal',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render number input for double type', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Total',
        parameterType: 1,
        parameterDirection: 1,
        type: 'double',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should call onChange when user enters number', async () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Amount',
        parameterType: 1,
        parameterDirection: 1,
        type: 'number',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('spinbutton')
      await user.type(input, '123')

      expect(onChange).toHaveBeenCalledTimes(3)
      // userEvent.type triggers onChange for each keystroke
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('Boolean fields', () => {
    it('should render checkbox for bool type', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'IsActive',
        parameterType: 1,
        parameterDirection: 1,
        type: 'bool',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value={false} onChange={onChange} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })

    it('should render checkbox for boolean type', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'IsVerified',
        parameterType: 1,
        parameterDirection: 1,
        type: 'boolean',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value={false} onChange={onChange} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should call onChange with true when checkbox is checked', async () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'IsActive',
        parameterType: 1,
        parameterDirection: 1,
        type: 'bool',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<DynamicFormField parameter={mockParam} value={false} onChange={onChange} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('should call onChange with false when checkbox is unchecked', async () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'IsActive',
        parameterType: 1,
        parameterDirection: 1,
        type: 'bool',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<DynamicFormField parameter={mockParam} value={true} onChange={onChange} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(onChange).toHaveBeenCalledWith(false)
    })

    it('should display checked state correctly', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'IsActive',
        parameterType: 1,
        parameterDirection: 1,
        type: 'bool',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      const { rerender } = render(<DynamicFormField parameter={mockParam} value={false} onChange={onChange} />)

      let checkbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      rerender(<DynamicFormField parameter={mockParam} value={true} onChange={onChange} />)
      checkbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Required field handling', () => {
    it('should mark field as required when parameterDirection is 1 (In)', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'ClientName',
        parameterType: 1,
        parameterDirection: 1, // In
        type: 'string',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      expect(screen.getByText(/ClientName \*/)).toBeInTheDocument()
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('required')
    })

    it('should mark field as optional when parameterDirection is 3 (Optional)', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'ClientName',
        parameterType: 1,
        parameterDirection: 3, // Optional
        type: 'string',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      expect(screen.getByText(/ClientName \(opcional\)/)).toBeInTheDocument()
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveAttribute('required')
    })

    it('should override required status with explicit prop', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'ClientName',
        parameterType: 1,
        parameterDirection: 3, // Optional by default
        type: 'string',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} required={true} />)

      expect(screen.getByText(/ClientName \*/)).toBeInTheDocument()
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('required')
    })
  })

  describe('Unknown/Custom types', () => {
    it('should render text input for unknown types with type indicator', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'CustomField',
        parameterType: 1,
        parameterDirection: 1,
        type: 'CustomType',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(screen.getByText(/\(CustomType\)/)).toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('should apply custom className to container', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Name',
        parameterType: 1,
        parameterDirection: 1,
        type: 'string',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      const { container } = render(
        <DynamicFormField parameter={mockParam} value="" onChange={onChange} className="custom-class" />
      )

      const div = container.querySelector('.custom-class')
      expect(div).toBeInTheDocument()
    })
  })

  describe('Case insensitivity', () => {
    it('should handle uppercase type names', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Name',
        parameterType: 1,
        parameterDirection: 1,
        type: 'STRING',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should handle mixed case type names', () => {
      const mockParam: IBizuitProcessParameter = {
        name: 'Amount',
        parameterType: 1,
        parameterDirection: 1,
        type: 'InTeGeR',
        schema: '',
        value: null,
        isSystemParameter: false,
        isVariable: false,
      }

      const onChange = vi.fn()
      render(<DynamicFormField parameter={mockParam} value="" onChange={onChange} />)

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })
  })
})
