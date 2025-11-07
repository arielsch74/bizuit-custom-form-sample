/**
 * BizuitFileUpload Component
 * Advanced file upload with drag & drop, preview, and validation
 * Mobile-optimized with camera support
 */

'use client'

import * as React from 'react'
import { Upload, X, File, Image as ImageIcon, FileText } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface BizuitFileUploadProps {
  /** Selected files */
  value?: File[]
  /** On change callback */
  onChange?: (files: File[]) => void
  /** Accept file types */
  accept?: string
  /** Multiple files */
  multiple?: boolean
  /** Max file size in bytes */
  maxSize?: number
  /** Max number of files */
  maxFiles?: number
  /** Disabled state */
  disabled?: boolean
  /** Show preview */
  showPreview?: boolean
  /** Custom className */
  className?: string
  /** Upload text */
  uploadText?: string
  /** Drag text */
  dragText?: string
  /** Validation error callback */
  onError?: (error: string) => void
}

export function BizuitFileUpload({
  value = [],
  onChange,
  accept,
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  disabled = false,
  showPreview = true,
  className,
  uploadText = 'Seleccionar archivos',
  dragText = 'Arrastra archivos aquí',
  onError,
}: BizuitFileUploadProps) {
  const [files, setFiles] = React.useState<File[]>(value)
  const [isDragging, setIsDragging] = React.useState(false)
  const [previews, setPreviews] = React.useState<Record<string, string>>({})
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sync with external value (only when length or content changes)
  React.useEffect(() => {
    // Only update if the arrays are actually different
    if (value.length !== files.length ||
        value.some((file, i) => file !== files[i])) {
      setFiles(value)
    }
  }, [value, files])

  // Generate previews for images
  React.useEffect(() => {
    if (!showPreview) return

    const newPreviews: Record<string, string> = {}

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        newPreviews[file.name] = url
      }
    })

    setPreviews(newPreviews)

    // Cleanup
    return () => {
      Object.values(newPreviews).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files, showPreview])

  // Validate file
  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `El archivo "${file.name}" excede el tamaño máximo de ${formatBytes(maxSize)}`
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map((t) => t.trim())
      const fileExtension = `.${file.name.split('.').pop()}`
      const mimeType = file.type

      const isAccepted = acceptedTypes.some(
        (type) =>
          type === mimeType ||
          type === fileExtension ||
          (type.endsWith('/*') && mimeType.startsWith(type.replace('/*', '')))
      )

      if (!isAccepted) {
        return `El archivo "${file.name}" no es un tipo válido`
      }
    }

    return null
  }

  // Handle files
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return

    const fileArray = Array.from(newFiles)
    const validFiles: File[] = []

    // Validate each file
    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        onError?.(error)
        continue
      }
      validFiles.push(file)
    }

    // Check max files
    const combinedFiles = multiple ? [...files, ...validFiles] : validFiles
    const finalFiles = combinedFiles.slice(0, maxFiles)

    if (combinedFiles.length > maxFiles) {
      onError?.(`Se pueden subir un máximo de ${maxFiles} archivos`)
    }

    setFiles(finalFiles)
    onChange?.(finalFiles)
  }

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    handleFiles(e.dataTransfer.files)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset input
    e.target.value = ''
  }

  // Remove file
  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onChange?.(newFiles)
  }

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (file.type.includes('pdf')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          'cursor-pointer hover:border-primary hover:bg-accent/50',
          'touch-manipulation',
          isDragging && 'border-primary bg-accent',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
        />

        <Upload className="h-10 w-10 text-muted-foreground mb-2" />

        <div className="text-center">
          <p className="text-sm font-medium">{uploadText}</p>
          <p className="text-xs text-muted-foreground mt-1">{dragText}</p>
          {maxSize && (
            <p className="text-xs text-muted-foreground mt-1">
              Tamaño máximo: {formatBytes(maxSize)}
            </p>
          )}
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border p-3 bg-card"
            >
              {/* Preview or icon */}
              {showPreview && previews[file.name] ? (
                <img
                  src={previews[file.name]}
                  alt={file.name}
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                  {getFileIcon(file)}
                </div>
              )}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </p>
              </div>

              {/* Remove button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
