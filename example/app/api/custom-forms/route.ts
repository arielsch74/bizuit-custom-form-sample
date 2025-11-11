import { NextResponse } from 'next/server'

/**
 * Mock API endpoint that simulates SQL Server response
 * GET /api/custom-forms
 *
 * En producción, esto hará:
 * SELECT * FROM vw_CustomFormsCurrentVersion WHERE Status = 'active' ORDER BY FormName
 */
export async function GET() {
  // Simular delay de BD
  await new Promise(resolve => setTimeout(resolve, 80))

  // Mock de lista de forms (simula JOIN de CustomForms + CustomFormVersions)
  const mockForms = [
    {
      id: 1,
      formName: 'aprobacion-gastos',
      processName: 'AprobacionGastos',
      currentVersion: '1.0.0',
      description: 'Formulario de aprobación de gastos corporativos',
      author: 'Bizuit Team',
      status: 'active',
      sizeBytes: 2450,
      publishedAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z'
    },
    {
      id: 2,
      formName: 'solicitud-vacaciones',
      processName: 'SolicitudVacaciones',
      currentVersion: '1.0.0',
      description: 'Solicitud de vacaciones para empleados',
      author: 'Bizuit Team',
      status: 'active',
      sizeBytes: 2680,
      publishedAt: '2025-01-10T11:00:00Z',
      updatedAt: '2025-01-10T11:00:00Z'
    },
    {
      id: 3,
      formName: 'onboarding-empleado',
      processName: 'OnboardingEmpleado',
      currentVersion: '1.0.0',
      description: 'Proceso de onboarding para nuevos empleados',
      author: 'Bizuit Team',
      status: 'active',
      sizeBytes: 3200,
      publishedAt: '2025-01-10T12:00:00Z',
      updatedAt: '2025-01-10T12:00:00Z'
    }
  ]

  console.log(`[Mock API] ✅ Listing ${mockForms.length} forms`)

  return NextResponse.json(mockForms, {
    headers: {
      'Cache-Control': 'public, max-age=300' // 5 min cache
    }
  })
}
