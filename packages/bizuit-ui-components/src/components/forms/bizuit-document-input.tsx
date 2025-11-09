'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Upload, File, X, FileText, Image as ImageIcon } from 'lucide-react'

export interface DocumentFile {
  file: File
  preview?: string
  id: string
}

export interface BizuitDocumentInputProps {
  value?: DocumentFile[]
  onChange?: (files: DocumentFile[]) => void
  accept?: string
  maxSize?: number // in bytes
  maxFiles?: number
  label?: string
  description?: string
  className?: string
  disabled?: boolean
  required?: boolean
  error?: string
}

const BizuitDocumentInput = React.forwardRef<HTMLDivElement, BizuitDocumentInputProps>(
  (
    {
      value = [],
      onChange,
      accept = '.pdf,.doc,.docx,.txt',
      maxSize = 10 * 1024 * 1024, // 10MB default
      maxFiles = 5,
      label,
      description,
      className,
      disabled = false,
      required = false,
      error,
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    const handleFiles = (files: FileList | null) => {
      if (!files || !onChange) return

      const newFiles: DocumentFile[] = []
      const currentCount = value.length

      for (let i = 0; i < files.length && currentCount + newFiles.length < maxFiles; i++) {
        const file = files[i]

        if (file.size > maxSize) {
          continue
        }

        const documentFile: DocumentFile = {
          file,
          id: `${Date.now()}-${i}`,
        }

        // Generate preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onloadend = () => {
            documentFile.preview = reader.result as string
          }
          reader.readAsDataURL(file)
        }

        newFiles.push(documentFile)
      }

      onChange([...value, ...newFiles])
    }

    const removeFile = (id: string) => {
      if (onChange) {
        onChange(value.filter((f) => f.id !== id))
      }
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = () => {
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    }

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {label && (
          <label className="text-sm font-medium leading-none">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {description && <p className="text-sm text-muted-foreground">{description}</p>}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragging && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500'
          )}
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Máx. {maxFiles} archivos, {(maxSize / (1024 * 1024)).toFixed(0)}MB cada uno
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="hidden"
        />

        {value.length > 0 && (
          <div className="space-y-2">
            {value.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {doc.preview ? (
                  <ImageIcon className="h-8 w-8 text-muted-foreground shrink-0" />
                ) : (
                  <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(doc.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(doc.id)
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  disabled={disabled}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

BizuitDocumentInput.displayName = 'BizuitDocumentInput'

export { BizuitDocumentInput }
