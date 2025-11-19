export default function TestPage() {
  return (
    <div className="min-h-screen bg-orange-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-orange-600">Test Page</h1>
        <p className="mt-4 text-slate-700">Si ves esto, Next.js está funcionando correctamente.</p>
        <div className="mt-6 space-y-2">
          <p className="text-sm text-slate-600">Frontend: ✅ OK</p>
          <p className="text-sm text-slate-600">Tailwind: ✅ OK</p>
          <p className="text-sm text-slate-600">Fuente Quicksand: ✅ OK</p>
        </div>
      </div>
    </div>
  )
}
