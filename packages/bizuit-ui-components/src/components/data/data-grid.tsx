/**
 * BizuitDataGrid Component
 * Production-ready data grid with sorting, filtering, pagination, and selection
 * Built on TanStack Table v8 - fully responsive and mobile-optimized
 */

'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface DataGridProps<TData, TValue = any> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[]
  /** Data array */
  data: TData[]
  /** Enable row selection */
  selectable?: 'none' | 'single' | 'multiple'
  /** Selected rows (controlled) */
  selectedRows?: RowSelectionState
  /** On selection change */
  onSelectionChange?: (selection: RowSelectionState) => void
  /** Enable sorting */
  sortable?: boolean
  /** Enable filtering */
  filterable?: boolean
  /** Enable pagination */
  paginated?: boolean
  /** Page size */
  pageSize?: number
  /** On row click */
  onRowClick?: (row: TData) => void
  /** Custom className */
  className?: string
  /** Empty state message */
  emptyMessage?: string
  /** Loading state */
  loading?: boolean
  /** Mobile responsive mode */
  mobileMode?: 'card' | 'scroll' | 'stack'
}

export function BizuitDataGrid<TData, TValue = any>({
  columns,
  data,
  selectable = 'none',
  selectedRows,
  onSelectionChange,
  sortable = true,
  filterable = true,
  paginated = true,
  pageSize = 10,
  onRowClick,
  className,
  emptyMessage = 'No hay datos para mostrar',
  loading = false,
  mobileMode = 'scroll',
}: DataGridProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    selectedRows || {}
  )

  // Sync controlled selection
  React.useEffect(() => {
    if (selectedRows !== undefined) {
      setRowSelection(selectedRows)
    }
  }, [selectedRows])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(sortable && {
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
    }),
    ...(filterable && {
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(paginated && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      onSelectionChange?.(newSelection)
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    ...(selectable === 'none' && { enableRowSelection: false }),
    ...(selectable === 'single' && { enableMultiRowSelection: false }),
  })

  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="rounded-md border">
          <div className="p-8 text-center text-muted-foreground">
            Cargando...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Filters */}
      {filterable && (
        <div className="flex items-center gap-2">
          {/* Global filter can be added here */}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className={cn('overflow-auto', mobileMode === 'scroll' && 'max-w-full')}>
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b transition-colors">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      'border-b transition-colors hover:bg-muted/50',
                      'data-[state=selected]:bg-muted',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {paginated && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectable !== 'none' && (
              <span>
                {table.getFilteredSelectedRowModel().rows.length} de{' '}
                {table.getFilteredRowModel().rows.length} fila(s) seleccionadas
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Filas por página</p>
              <select
                className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 text-sm"
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="h-8 w-8 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la primera página</span>
                {'<<'}
              </button>
              <button
                className="h-8 w-8 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Página anterior</span>
                {'<'}
              </button>
              <button
                className="h-8 w-8 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Página siguiente</span>
                {'>'}
              </button>
              <button
                className="h-8 w-8 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la última página</span>
                {'>>'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to create sortable column header
export function SortableHeader({ column, children }: any) {
  return (
    <button
      className="flex items-center gap-1 hover:text-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </button>
  )
}
