import { ComponentProp } from './all-components-docs'

interface PropsTableProps {
  props: ComponentProp[]
}

export function PropsTable({ props }: PropsTableProps) {
  if (!props || props.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">No props documented for this component.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Required</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Default</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {props.map((prop, index) => (
              <tr
                key={prop.name}
                className={`
                  transition-colors hover:bg-muted/30
                  ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                `}
              >
                {/* Name Column */}
                <td className="px-4 py-3">
                  <code className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-sm font-medium text-foreground">
                    {prop.name}
                  </code>
                </td>

                {/* Type Column */}
                <td className="px-4 py-3">
                  <code className="inline-block max-w-xs break-words rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-800 dark:text-slate-200">
                    {prop.type}
                  </code>
                </td>

                {/* Required Column */}
                <td className="px-4 py-3">
                  {prop.required ? (
                    <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                      Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Optional
                    </span>
                  )}
                </td>

                {/* Default Column */}
                <td className="px-4 py-3">
                  {prop.default ? (
                    <code className="inline-block rounded bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-mono text-blue-800 dark:text-blue-300">
                      {prop.default}
                    </code>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>

                {/* Description Column */}
                <td className="px-4 py-3">
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                    {prop.description}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile-Friendly Responsive View */}
      <style jsx>{`
        @media (max-width: 768px) {
          table {
            display: block;
          }
          thead {
            display: none;
          }
          tbody {
            display: block;
          }
          tr {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.5rem;
            padding: 1rem;
            margin-bottom: 1rem;
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
          }
          td {
            display: flex;
            flex-direction: column;
            padding: 0 !important;
          }
          td::before {
            content: attr(data-label);
            font-weight: 600;
            font-size: 0.75rem;
            text-transform: uppercase;
            color: hsl(var(--muted-foreground));
            margin-bottom: 0.25rem;
          }
        }
      `}</style>
    </div>
  )
}
