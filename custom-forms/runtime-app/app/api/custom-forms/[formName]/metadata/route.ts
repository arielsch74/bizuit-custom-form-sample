import { NextRequest, NextResponse } from 'next/server'

/**
 * Mock API endpoint that simulates SQL Server response
 * GET /api/custom-forms/{formName}/metadata
 *
 * En producción, esto hará:
 * SELECT * FROM vw_CustomFormsCurrentVersion WHERE FormName = @formName
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formName: string }> }
) {
  const { formName } = await params

  // Simular delay de BD
  await new Promise(resolve => setTimeout(resolve, 50))

  // Mock de metadata de forms (simula tabla CustomForms + CustomFormVersions)
  const mockMetadata: Record<string, any> = {
    'aprobacion-gastos': {
      id: 1,
      formName: 'aprobacion-gastos',
      processName: 'AprobacionGastos',
      currentVersion: '1.0.0',
      description: 'Formulario de aprobación de gastos corporativos',
      author: 'Bizuit Team',
      status: 'active',
      sizeBytes: 2450,
      publishedAt: '2025-01-10T10:00:00Z',
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
      commitHash: 'abc123',
      metadata: {
        tags: ['finanzas', 'aprobaciones'],
        requiredRole: 'employee'
      }
    },
    'solicitud-vacaciones': {
      id: 2,
      formName: 'solicitud-vacaciones',
      processName: 'SolicitudVacaciones',
      currentVersion: '1.0.0',
      description: 'Solicitud de vacaciones para empleados',
      author: 'Bizuit Team',
      status: 'active',
      sizeBytes: 2680,
      publishedAt: '2025-01-10T11:00:00Z',
      createdAt: '2025-01-10T11:00:00Z',
      updatedAt: '2025-01-10T11:00:00Z',
      commitHash: 'def456',
      metadata: {
        tags: ['rrhh', 'vacaciones'],
        requiredRole: 'employee'
      }
    },
    'onboarding-empleado': {
      id: 3,
      formName: 'onboarding-empleado',
      processName: 'OnboardingEmpleado',
      currentVersion: '1.0.0',
      description: 'Proceso de onboarding para nuevos empleados',
      author: 'Bizuit Team',
      status: 'active',
      sizeBytes: 3200,
      publishedAt: '2025-01-10T12:00:00Z',
      createdAt: '2025-01-10T12:00:00Z',
      updatedAt: '2025-01-10T12:00:00Z',
      commitHash: 'ghi789',
      metadata: {
        tags: ['rrhh', 'onboarding'],
        requiredRole: 'hr_admin'
      }
    }
  }

  const metadata = mockMetadata[formName]

  if (!metadata) {
    return NextResponse.json(
      { error: `Form '${formName}' not found` },
      { status: 404 }
    )
  }

  console.log(`[Mock API] ✅ Metadata for: ${formName}`)

  return NextResponse.json(metadata, {
    headers: {
      'Cache-Control': 'public, max-age=300' // 5 min cache
    }
  })
}
