import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProcessSuccessScreen } from '../components/process-success-screen'

describe('ProcessSuccessScreen', () => {
  describe('Default rendering', () => {
    it('should render with default title and subtitle', () => {
      const processData = {
        instanceId: 'test-instance-123',
        status: 'Completed',
      }

      render(<ProcessSuccessScreen processData={processData} />)

      expect(screen.getByText('Proceso Iniciado Exitosamente')).toBeInTheDocument()
      expect(screen.getByText('El proceso ha sido creado correctamente en el BPMS Bizuit')).toBeInTheDocument()
    })

    it('should render success icon', () => {
      const processData = { instanceId: 'test-123' }
      const { container } = render(<ProcessSuccessScreen processData={processData} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('text-green-600')
    })
  })

  describe('Custom props', () => {
    it('should render custom title', () => {
      const processData = { instanceId: 'test-123' }
      render(<ProcessSuccessScreen processData={processData} title="Custom Success Title" />)

      expect(screen.getByText('Custom Success Title')).toBeInTheDocument()
      expect(screen.queryByText('Proceso Iniciado Exitosamente')).not.toBeInTheDocument()
    })

    it('should render custom subtitle', () => {
      const processData = { instanceId: 'test-123' }
      render(<ProcessSuccessScreen processData={processData} subtitle="Custom subtitle message" />)

      expect(screen.getByText('Custom subtitle message')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const processData = { instanceId: 'test-123' }
      const { container } = render(
        <ProcessSuccessScreen processData={processData} className="custom-class" />
      )

      const mainDiv = container.querySelector('.custom-class')
      expect(mainDiv).toBeInTheDocument()
    })
  })

  describe('Process data display', () => {
    it('should display instance ID when provided', () => {
      const processData = {
        instanceId: 'abc-123-def-456',
      }

      render(<ProcessSuccessScreen processData={processData} />)

      expect(screen.getByText('Instance ID:')).toBeInTheDocument()
      expect(screen.getByText('abc-123-def-456')).toBeInTheDocument()
    })

    it('should display status when provided', () => {
      const processData = {
        instanceId: 'test-123',
        status: 'Completed',
      }

      render(<ProcessSuccessScreen processData={processData} />)

      expect(screen.getByText('Status:')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('should display return parameters when provided', () => {
      const processData = {
        instanceId: 'test-123',
        tyconParameters: {
          param1: 'value1',
          param2: 'value2',
        },
      }

      render(<ProcessSuccessScreen processData={processData} />)

      expect(screen.getByText('Parámetros de Retorno:')).toBeInTheDocument()
      const pre = screen.getByText(/"param1": "value1"/)
      expect(pre).toBeInTheDocument()
    })

    it('should not display section when processData is empty', () => {
      const processData = {}

      render(<ProcessSuccessScreen processData={processData} />)

      expect(screen.queryByText('Instance ID:')).not.toBeInTheDocument()
      expect(screen.queryByText('Status:')).not.toBeInTheDocument()
    })

    it('should handle null processData gracefully', () => {
      render(<ProcessSuccessScreen processData={null as any} />)

      expect(screen.getByText('Proceso Iniciado Exitosamente')).toBeInTheDocument()
      expect(screen.queryByText('Instance ID:')).not.toBeInTheDocument()
    })
  })

  describe('Action buttons', () => {
    it('should render "New Process" button when onNewProcess is provided', () => {
      const processData = { instanceId: 'test-123' }
      const onNewProcess = vi.fn()

      render(<ProcessSuccessScreen processData={processData} onNewProcess={onNewProcess} />)

      const button = screen.getByRole('button', { name: /Iniciar Otro Proceso/i })
      expect(button).toBeInTheDocument()
    })

    it('should render "Back to Home" button when onBackToHome is provided', () => {
      const processData = { instanceId: 'test-123' }
      const onBackToHome = vi.fn()

      render(<ProcessSuccessScreen processData={processData} onBackToHome={onBackToHome} />)

      const button = screen.getByRole('button', { name: /Volver al Inicio/i })
      expect(button).toBeInTheDocument()
    })

    it('should call onNewProcess when button is clicked', async () => {
      const processData = { instanceId: 'test-123' }
      const onNewProcess = vi.fn()
      const user = userEvent.setup()

      render(<ProcessSuccessScreen processData={processData} onNewProcess={onNewProcess} />)

      const button = screen.getByRole('button', { name: /Iniciar Otro Proceso/i })
      await user.click(button)

      expect(onNewProcess).toHaveBeenCalledTimes(1)
    })

    it('should call onBackToHome when button is clicked', async () => {
      const processData = { instanceId: 'test-123' }
      const onBackToHome = vi.fn()
      const user = userEvent.setup()

      render(<ProcessSuccessScreen processData={processData} onBackToHome={onBackToHome} />)

      const button = screen.getByRole('button', { name: /Volver al Inicio/i })
      await user.click(button)

      expect(onBackToHome).toHaveBeenCalledTimes(1)
    })

    it('should render both buttons when both callbacks are provided', () => {
      const processData = { instanceId: 'test-123' }
      const onNewProcess = vi.fn()
      const onBackToHome = vi.fn()

      render(
        <ProcessSuccessScreen
          processData={processData}
          onNewProcess={onNewProcess}
          onBackToHome={onBackToHome}
        />
      )

      expect(screen.getByRole('button', { name: /Iniciar Otro Proceso/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Volver al Inicio/i })).toBeInTheDocument()
    })

    it('should not render default buttons when neither callback is provided', () => {
      const processData = { instanceId: 'test-123' }

      render(<ProcessSuccessScreen processData={processData} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Custom actions', () => {
    it('should render custom actions instead of default buttons', () => {
      const processData = { instanceId: 'test-123' }
      const customActions = (
        <div>
          <button>Custom Action 1</button>
          <button>Custom Action 2</button>
        </div>
      )

      render(
        <ProcessSuccessScreen
          processData={processData}
          onNewProcess={vi.fn()}
          onBackToHome={vi.fn()}
          customActions={customActions}
        />
      )

      expect(screen.getByRole('button', { name: 'Custom Action 1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Custom Action 2' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Iniciar Otro Proceso/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Volver al Inicio/i })).not.toBeInTheDocument()
    })
  })

  describe('Complete process data', () => {
    it('should render all process information when fully populated', () => {
      const processData = {
        instanceId: 'full-test-instance-123',
        status: 'Active',
        tyconParameters: {
          outputParam1: 'result1',
          outputParam2: 42,
        },
        additionalField: 'some value',
      }

      render(<ProcessSuccessScreen processData={processData} />)

      expect(screen.getByText('full-test-instance-123')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText(/"outputParam1": "result1"/)).toBeInTheDocument()
      expect(screen.getByText(/"outputParam2": 42/)).toBeInTheDocument()
    })
  })

  describe('JSON formatting', () => {
    it('should properly format complex return parameters', () => {
      const processData = {
        instanceId: 'test-123',
        tyconParameters: {
          nestedObject: {
            level1: {
              level2: 'deep value',
            },
          },
          array: [1, 2, 3],
          boolean: true,
          number: 123,
        },
      }

      render(<ProcessSuccessScreen processData={processData} />)

      // Should find the formatted JSON
      const jsonText = screen.getByText(/"nestedObject":/)
      expect(jsonText).toBeInTheDocument()
      expect(screen.getByText(/"array":/)).toBeInTheDocument()
      expect(screen.getByText(/"boolean": true/)).toBeInTheDocument()
      expect(screen.getByText(/"number": 123/)).toBeInTheDocument()
    })
  })
})
