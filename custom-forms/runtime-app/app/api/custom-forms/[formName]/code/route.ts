import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * API endpoint para obtener código compilado del form
 *
 * GET /api/custom-forms/{formName}/code
 * Retorna el código JavaScript compilado del form
 *
 * En desarrollo: Lee desde forms-examples
 * En producción: SELECT CompiledCode FROM CustomFormVersions WHERE FormName = @formName AND IsCurrent = 1
 */

// En desarrollo, servimos desde el directorio de forms-examples
// En producción, esto vendría de la BD (CustomFormVersions table)
const FORMS_DIR = path.join(process.cwd(), '../forms-examples')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formName: string }> }
) {
  try {
    const { formName } = await params
    const version = request.nextUrl.searchParams.get('version')

    console.log(`[Form Code API] GET /${formName}/code${version ? `?version=${version}` : ''}`)

    // Ruta al form compilado (simula query a BD)
    const formPath = path.join(FORMS_DIR, formName, 'dist/form.js')
    const metaPath = path.join(FORMS_DIR, formName, 'dist/form.meta.json')

    // Verificar que el form existe
    if (!fs.existsSync(formPath)) {
      console.error(`[Form Code API] Form not found: ${formPath}`)
      return NextResponse.json(
        { error: `Form '${formName}' not found` },
        { status: 404 }
      )
    }

    // Leer código compilado (simula SELECT CompiledCode FROM CustomFormVersions)
    const compiledCode = fs.readFileSync(formPath, 'utf-8')

    // Leer metadata si existe
    let metadata = {
      version: '1.0.0',
      builtAt: new Date().toISOString(),
      sizeBytes: compiledCode.length,
    }

    if (fs.existsSync(metaPath)) {
      const metaContent = fs.readFileSync(metaPath, 'utf-8')
      metadata = JSON.parse(metaContent)
    }

    console.log(`[Form Code API] ✅ Serving ${formName}@${metadata.version} (${metadata.sizeBytes} bytes)`)

    // Retornar código JavaScript
    return new NextResponse(compiledCode, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Form-Version': metadata.version,
        'X-Published-At': metadata.builtAt,
        'X-Size-Bytes': metadata.sizeBytes.toString(),
      },
    })

  } catch (error: any) {
    console.error('[Form Code API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
