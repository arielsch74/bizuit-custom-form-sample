'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Check } from 'lucide-react'

export interface StepItem {
  label: string
  description?: string
  icon?: React.ReactNode
}

export interface BizuitStepperProps {
  steps: StepItem[]
  currentStep: number
  onChange?: (step: number) => void
  orientation?: 'horizontal' | 'vertical'
  clickable?: boolean
  className?: string
}

const BizuitStepper = React.forwardRef<HTMLDivElement, BizuitStepperProps>(
  (
    {
      steps,
      currentStep,
      onChange,
      orientation = 'horizontal',
      clickable = false,
      className,
    },
    ref
  ) => {
    const handleStepClick = (index: number) => {
      if (clickable && onChange) {
        onChange(index)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
          className
        )}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <React.Fragment key={index}>
              <div
                className={cn(
                  'flex items-center',
                  orientation === 'vertical' && 'w-full'
                )}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full border-2 transition-all',
                    'min-w-[40px] w-10 h-10',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary',
                    isUpcoming && 'border-muted-foreground/30 text-muted-foreground',
                    clickable && 'cursor-pointer hover:scale-110'
                  )}
                  onClick={() => handleStepClick(index)}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div
                  className={cn(
                    'ml-3',
                    orientation === 'horizontal' && 'max-w-[150px]'
                  )}
                >
                  <div
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-foreground',
                      (isCompleted || isUpcoming) && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'bg-muted-foreground/30',
                    orientation === 'horizontal'
                      ? 'h-[2px] flex-1 mx-4'
                      : 'w-[2px] h-12 ml-5 my-2',
                    isCompleted && 'bg-primary'
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }
)

BizuitStepper.displayName = 'BizuitStepper'

export { BizuitStepper }
