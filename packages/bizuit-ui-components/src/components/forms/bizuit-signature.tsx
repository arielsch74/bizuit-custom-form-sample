'use client'

import * as React from 'react'
import { Eraser, Undo, Download } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

export interface BizuitSignatureProps {
  value?: string // Base64 data URL
  onChange?: (dataURL: string) => void
  width?: number
  height?: number
  penColor?: string
  penWidth?: number
  backgroundColor?: string
  className?: string
  label?: string
  required?: boolean
  error?: string
  disabled?: boolean
  showDownload?: boolean
}

const BizuitSignature = React.forwardRef<HTMLCanvasElement, BizuitSignatureProps>(
  (
    {
      value,
      onChange,
      width = 500,
      height = 200,
      penColor = '#000000',
      penWidth = 2,
      backgroundColor = '#ffffff',
      className,
      label,
      required = false,
      error,
      disabled = false,
      showDownload = true,
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = React.useState(false)
    const [history, setHistory] = React.useState<string[]>([])
    const [currentHistoryIndex, setCurrentHistoryIndex] = React.useState(-1)

    // Combine refs
    React.useImperativeHandle(ref, () => canvasRef.current!)

    // Initialize canvas
    React.useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)

      // Load initial value if provided
      if (value) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          saveToHistory()
        }
        img.src = value
      } else {
        saveToHistory()
      }
    }, []) // Only run once on mount

    const saveToHistory = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const dataURL = canvas.toDataURL()
      const newHistory = history.slice(0, currentHistoryIndex + 1)
      newHistory.push(dataURL)
      setHistory(newHistory)
      setCurrentHistoryIndex(newHistory.length - 1)
    }

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (disabled) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      setIsDrawing(true)
      ctx.strokeStyle = penColor
      ctx.lineWidth = penWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const point = getPoint(e, rect)
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing || disabled) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const point = getPoint(e, rect)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    }

    const stopDrawing = () => {
      if (!isDrawing) return
      setIsDrawing(false)

      const canvas = canvasRef.current
      if (!canvas) return

      const dataURL = canvas.toDataURL()
      onChange?.(dataURL)
      saveToHistory()
    }

    const getPoint = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
      rect: DOMRect
    ) => {
      if ('touches' in e) {
        const touch = e.touches[0]
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        }
      } else {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }
    }

    const handleClear = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)

      const dataURL = canvas.toDataURL()
      onChange?.(dataURL)
      saveToHistory()
    }

    const handleUndo = () => {
      if (currentHistoryIndex <= 0) return

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const newIndex = currentHistoryIndex - 1
      setCurrentHistoryIndex(newIndex)

      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0)
        onChange?.(history[newIndex])
      }
      img.src = history[newIndex]
    }

    const handleDownload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const dataURL = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'signature.png'
      link.href = dataURL
      link.click()
    }

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="text-sm font-medium leading-none">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div
          className={cn(
            'border-2 rounded-lg overflow-hidden',
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ width: `${width}px` }}
        >
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={cn(
              'touch-none',
              disabled ? 'cursor-not-allowed' : 'cursor-crosshair'
            )}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Eraser className="h-4 w-4" />
            Clear
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={disabled || currentHistoryIndex <= 0}
            className="flex items-center gap-2"
          >
            <Undo className="h-4 w-4" />
            Undo
          </Button>

          {showDownload && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

BizuitSignature.displayName = 'BizuitSignature'

export { BizuitSignature }
