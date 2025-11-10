import { ComponentDoc } from '../all-components-docs';

export const bizuit_stepperDoc: ComponentDoc = {
  id: 'bizuit-stepper',
  name: 'Stepper',
  category: 'layout',
  icon: 'Component',
  description: 'Multi-step progress indicator for wizards and workflows',
  description_es: 'Indicador de progreso paso a paso para flujos de múltiples pasos',
  detailedDescription: 'A stepper component for visualizing multi-step processes and guiding users through sequential tasks. Features include step validation, clickable navigation, custom icons, progress tracking, and both horizontal and vertical orientations.',
  detailedDescription_es: 'Un componente de stepper que visualiza el progreso a través de un flujo de múltiples pasos. Incluye estados de completado/activo/pendiente, navegación opcional entre pasos, y diseño responsive. Perfecto para guiar a los usuarios a través de formularios complejos o procesos de onboarding.',
  useCases: [
    'Multi-step forms and wizards',
    'Onboarding flows',
    'Checkout processes',
    'Tutorial and guided tours',
    'Task progress tracking',
  ],
  useCases_es: [
    'Formularios de checkout de múltiples pasos',
    'Flujos de onboarding de usuario',
    'Wizards de configuración',
    'Procesos de solicitud en múltiples pasos',
    'Indicadores de progreso de instalación o setup',
  ],
  props: [
    {
      name: 'steps',
      type: 'Array<{label: string, description?: string, icon?: ReactNode}>',
      required: true,
      description: 'Step definitions',
      description_es: 'Array de definiciones de pasos',
    },
    {
      name: 'currentStep',
      type: 'number',
      required: true,
      description: 'Current active step index (0-based)',
      description_es: 'Índice del paso actual',
    },
    {
      name: 'onChange',
      type: '(step: number) => void',
      required: false,
      description: 'Step navigation callback',
    },
    {
      name: 'orientation',
      type: '"horizontal" | "vertical"',
      required: false,
      default: '"horizontal"',
      description: 'Layout orientation',
      description_es: 'Orientación horizontal o vertical',
    },
    {
      name: 'clickable',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Allow clicking steps to navigate',
    },
  ],
  codeExample: {
    '/App.js': `import { useState } from 'react';
import Stepper from './Stepper.js';
import './styles.css';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { label: 'Account', description: 'Create your account' },
    { label: 'Profile', description: 'Set up your profile' },
    { label: 'Preferences', description: 'Configure settings' },
    { label: 'Complete', description: 'All done!' },
  ];

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Stepper Example</h2>

        <Stepper
          steps={steps}
          currentStep={currentStep}
          clickable
          onChange={setCurrentStep}
        />

        <div className="form-actions" style={{ marginTop: '24px' }}>
          <button
            className="btn-secondary"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <button
            className="btn-primary"
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}`,
    '/Stepper.js': `export default function Stepper({
  steps,
  currentStep,
  onChange,
  orientation = 'horizontal',
  clickable = false
}) {
  let orientationClass = 'flex';
  if (orientation === 'horizontal') {
    orientationClass += ' flex-row items-center';
  } else {
    orientationClass += ' flex-col';
  }

  return (
    <div className={orientationClass}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        let circleClasses = 'flex items-center justify-center rounded-full border-2 w-10 h-10';
        if (isCompleted) circleClasses += ' bg-primary border-primary text-white';
        else if (isCurrent) circleClasses += ' border-primary text-primary';
        else circleClasses += ' border-gray-300 text-gray-400';
        if (clickable) circleClasses += ' cursor-pointer';

        let lineClasses = orientation === 'horizontal' ? 'h-[2px] flex-1 mx-4' : 'w-[2px] h-12';
        lineClasses += isCompleted ? ' bg-primary' : ' bg-gray-300';

        return (
          <div key={index} className="flex items-center">
            <div
              className={circleClasses}
              onClick={() => clickable && onChange?.(index)}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium">{step.label}</div>
              {step.description && (
                <div className="text-xs text-muted-foreground">{step.description}</div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={lineClasses} />
            )}
          </div>
        );
      })}
    </div>
  );
}`,
    '/styles.css': `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f9fafb;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmin(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  margin-top: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: system-ui, -apple-system, sans-serif;
  background: white;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Asegurar que los inputs especiales usen la misma fuente */
input[type="date"].form-input,
input[type="time"].form-input,
input[type="datetime-local"].form-input,
select.form-input {
  font-family: system-ui, -apple-system, sans-serif;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.form-checkbox input[type="checkbox"],
.form-checkbox input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-checkbox label {
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  flex: 1;
  padding: 12px 24px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #ea580c;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.hint {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}`,
  },
};
