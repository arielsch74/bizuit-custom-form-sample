import { NextRequest, NextResponse } from 'next/server'

/**
 * Mock API endpoint para hot reload
 *
 * GET /api/custom-forms/versions
 * Retorna versiones actuales de todos los forms
 * En producción: SELECT FormName, CurrentVersion, UpdatedAt FROM vw_CustomFormsCurrentVersion
 *
 * POST /api/custom-forms/versions
 * Publica una nueva versión (simula GitHub Actions)
 * En producción: INSERT INTO CustomFormVersions + UPDATE CustomForms
 */

// Store en memoria (simula tabla CustomFormVersions en SQL Server)
// En producción esto sería una consulta real a la BD
const versionsStore = new Map<string, { version: string; updatedAt: string }>([
  ['aprobacion-gastos', { version: '1.0.0', updatedAt: '2025-01-10T10:00:00Z' }],
  ['solicitud-vacaciones', { version: '1.0.0', updatedAt: '2025-01-10T11:00:00Z' }],
  ['onboarding-empleado', { version: '1.0.0', updatedAt: '2025-01-10T12:00:00Z' }]
])

export async function GET() {
  // Simular delay de BD
  await new Promise(resolve => setTimeout(resolve, 30))

  // Retornar versiones (simula query a BD)
  const versions: Record<string, { version: string; updatedAt: string }> = {}

  versionsStore.forEach((value, key) => {
    versions[key] = value
  })

  console.log('[Versions API] GET - Current versions:', versions)

  return NextResponse.json(versions, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formName, version } = body

    if (!formName || !version) {
      return NextResponse.json(
        { error: 'formName and version are required' },
        { status: 400 }
      )
    }

    // Actualizar versión (simula UPDATE en BD)
    versionsStore.set(formName, {
      version,
      updatedAt: new Date().toISOString()
    })

    console.log(`[Versions API] POST - Published ${formName}@${version}`)

    return NextResponse.json({
      success: true,
      formName,
      version,
      updatedAt: versionsStore.get(formName)!.updatedAt,
      message: `Form ${formName} published with version ${version}`
    })

  } catch (error: any) {
    console.error('[Versions API] POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish' },
      { status: 500 }
    )
  }
}
