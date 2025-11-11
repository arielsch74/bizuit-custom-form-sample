import { NextRequest, NextResponse } from 'next/server'

/**
 * Mock API endpoint that simulates SQL Server response
 * GET /api/custom-forms/{formName}/code
 *
 * En producción, esto hará SELECT compiled_code FROM CustomFormVersions
 * Por ahora retorna un form compilado mock
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formName: string }> }
) {
  const { formName } = await params

  // Simular un pequeño delay como si fuera query a BD
  await new Promise(resolve => setTimeout(resolve, 100))

  // Mock de forms disponibles
  const mockForms: Record<string, string> = {
    'aprobacion-gastos': generateMockFormCode('AprobacionGastos'),
    'solicitud-vacaciones': generateMockFormCode('SolicitudVacaciones'),
    'onboarding-empleado': generateMockFormCode('OnboardingEmpleado'),
  }

  const compiledCode = mockForms[formName]

  if (!compiledCode) {
    return NextResponse.json(
      { error: `Form '${formName}' not found` },
      { status: 404 }
    )
  }

  // Metadata headers (simulando lo que vendría de la BD)
  const headers = new Headers()
  headers.set('Content-Type', 'application/javascript; charset=utf-8')
  headers.set('X-Form-Version', '1.0.0')
  headers.set('X-Published-At', new Date().toISOString())
  headers.set('X-Size-Bytes', compiledCode.length.toString())
  headers.set('Cache-Control', 'public, max-age=300')

  console.log(`[Mock API] ✅ Serving form: ${formName} (${compiledCode.length} bytes)`)

  return new NextResponse(compiledCode, { headers })
}

/**
 * Genera código compilado mock de un form
 *
 * IMPORTANTE: Este código simula exactamente lo que vendría desde:
 * SELECT compiled_code FROM CustomFormVersions WHERE form_name = 'aprobacion-gastos'
 *
 * El código compilado es generado por esbuild desde TypeScript/JSX
 * con React como external dependency.
 */
function generateMockFormCode(processName: string): string {
  // Este es código REAL compilado por esbuild
  // Solo modificamos:
  // 1. import React → const React = window.React
  // 2. Reemplazamos el nombre del proceso donde corresponda

  return `
// Compiled form code from esbuild (React as external)
const React = window.React;
const { useState } = React;

function ${processName}Form() {
  const [formData, setFormData] = useState({
    campo1: "",
    campo2: "",
    campo3: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      alert(\`Formulario ${processName} enviado exitosamente (MOCK)

Datos: \${JSON.stringify(formData, null, 2)}\`);
    }, 500);
  };
  if (submitted) {
    return /* @__PURE__ */ React.createElement("div", { style: {
      maxWidth: "600px",
      margin: "2rem auto",
      padding: "2rem",
      textAlign: "center",
      backgroundColor: "#f0fdf4",
      border: "1px solid #86efac",
      borderRadius: "0.5rem"
    } }, /* @__PURE__ */ React.createElement("h2", { style: { color: "#15803d", marginBottom: "1rem" } }, "✓ Formulario Enviado"), /* @__PURE__ */ React.createElement("p", { style: { color: "#166534" } }, "El formulario ${processName} ha sido procesado correctamente."), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setSubmitted(false),
        style: {
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: "0.375rem",
          cursor: "pointer"
        }
      },
      "Enviar Otro"
    ));
  }
  return /* @__PURE__ */ React.createElement("div", { style: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "2rem",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  } }, /* @__PURE__ */ React.createElement("h1", { style: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    color: "#1f2937"
  } }, "Formulario: ${processName}"), /* @__PURE__ */ React.createElement("p", { style: {
    marginBottom: "1.5rem",
    color: "#6b7280",
    fontSize: "0.875rem"
  } }, "🎯 Este form fue cargado dinámicamente desde mock API (simula BD) - compilado con esbuild"), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", gap: "1rem" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#374151" } }, "Campo 1 *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: formData.campo1,
      onChange: handleChange("campo1"),
      required: true,
      placeholder: "Ingrese campo 1",
      style: {
        width: "100%",
        padding: "0.5rem",
        border: "1px solid #d1d5db",
        borderRadius: "0.375rem",
        fontSize: "1rem",
        color: "#1f2937"
      }
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#374151" } }, "Campo 2 *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: formData.campo2,
      onChange: handleChange("campo2"),
      required: true,
      placeholder: "Ingrese campo 2",
      style: {
        width: "100%",
        padding: "0.5rem",
        border: "1px solid #d1d5db",
        borderRadius: "0.375rem",
        fontSize: "1rem",
        color: "#1f2937"
      }
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#374151" } }, "Campo 3"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: formData.campo3,
      onChange: handleChange("campo3"),
      rows: 4,
      placeholder: "Ingrese campo 3 (opcional)",
      style: {
        width: "100%",
        padding: "0.5rem",
        border: "1px solid #d1d5db",
        borderRadius: "0.375rem",
        fontSize: "1rem",
        resize: "vertical",
        color: "#1f2937"
      }
    }
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      style: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "0.375rem",
        fontSize: "1rem",
        fontWeight: "500",
        cursor: "pointer",
        marginTop: "0.5rem"
      }
    },
    "Enviar Formulario"
  )));
}
export {
  ${processName}Form as default
};
`.trim()
}
