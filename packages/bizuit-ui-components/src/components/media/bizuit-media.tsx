'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Play, Pause, Volume2, VolumeX, Maximize, Camera, RotateCw, X, QrCode } from 'lucide-react'

export interface BizuitMediaProps {
  src?: string
  type: 'image' | 'video' | 'audio' | 'camera' | 'qr-scanner'
  alt?: string
  width?: string | number
  height?: string | number
  controls?: boolean
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  className?: string
  onLoad?: () => void
  onError?: () => void
  onCapture?: (dataUrl: string) => void
  onQRCodeDetected?: (data: string) => void
  facingMode?: 'user' | 'environment'
}

const BizuitMedia = React.forwardRef<HTMLDivElement, BizuitMediaProps>(
  (
    {
      src,
      type,
      alt = 'Media content',
      width,
      height,
      controls = true,
      autoPlay = false,
      loop = false,
      muted = false,
      className,
      onLoad,
      onError,
      onCapture,
      onQRCodeDetected,
      facingMode = 'environment',
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = React.useState(autoPlay)
    const [isMuted, setIsMuted] = React.useState(muted)
    const [isCameraActive, setIsCameraActive] = React.useState(false)
    const [capturedImage, setCapturedImage] = React.useState<string | null>(null)
    const [currentFacingMode, setCurrentFacingMode] = React.useState<'user' | 'environment'>(facingMode)
    const [qrDetected, setQrDetected] = React.useState<string | null>(null)

    const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement>(null)
    const cameraVideoRef = React.useRef<HTMLVideoElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const streamRef = React.useRef<MediaStream | null>(null)
    const qrScanIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        stopCamera()
      }
    }, [])

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (qrScanIntervalRef.current) {
        clearInterval(qrScanIntervalRef.current)
        qrScanIntervalRef.current = null
      }
      setIsCameraActive(false)
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: currentFacingMode },
          audio: false,
        })

        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream
          streamRef.current = stream
          setIsCameraActive(true)

          // For QR scanner, start scanning
          if (type === 'qr-scanner') {
            startQRScanning()
          }
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
        onError?.()
      }
    }

    const startQRScanning = () => {
      if (!cameraVideoRef.current || !canvasRef.current) return

      const video = cameraVideoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context) return

      qrScanIntervalRef.current = setInterval(() => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = detectQRCode(imageData)

          if (code) {
            setQrDetected(code)
            onQRCodeDetected?.(code)
            stopCamera()
          }
        }
      }, 100) // Scan every 100ms
    }

    // Simple QR code detection (placeholder - in production use a library like jsQR)
    const detectQRCode = (imageData: ImageData): string | null => {
      // This is a placeholder. In a real implementation, you would use a library like jsQR
      // For now, we'll just return null to indicate no QR code detected
      // To implement: npm install jsqr and use it here
      try {
        // @ts-ignore - jsQR would be imported: import jsQR from 'jsqr'
        if (typeof window !== 'undefined' && (window as any).jsQR) {
          const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height)
          return code ? code.data : null
        }
      } catch (err) {
        console.error('QR detection error:', err)
      }
      return null
    }

    const capturePhoto = () => {
      if (!cameraVideoRef.current || !canvasRef.current) return

      const video = cameraVideoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL('image/png')
      setCapturedImage(dataUrl)
      onCapture?.(dataUrl)
      stopCamera()
    }

    const retakePhoto = () => {
      setCapturedImage(null)
      startCamera()
    }

    const switchCamera = async () => {
      stopCamera()
      setCurrentFacingMode(prev => prev === 'user' ? 'environment' : 'user')
      // Wait a bit before restarting
      setTimeout(() => {
        startCamera()
      }, 100)
    }

    const togglePlay = () => {
      if (mediaRef.current) {
        if (isPlaying) {
          mediaRef.current.pause()
        } else {
          mediaRef.current.play()
        }
        setIsPlaying(!isPlaying)
      }
    }

    const toggleMute = () => {
      if (mediaRef.current) {
        mediaRef.current.muted = !isMuted
        setIsMuted(!isMuted)
      }
    }

    const toggleFullscreen = () => {
      if (mediaRef.current && 'requestFullscreen' in mediaRef.current) {
        mediaRef.current.requestFullscreen()
      }
    }

    // Image type
    if (type === 'image') {
      return (
        <div ref={ref} className={cn('relative overflow-hidden rounded-lg', className)}>
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={onLoad}
            onError={onError}
            className="w-full h-full object-cover"
          />
        </div>
      )
    }

    // Video type
    if (type === 'video') {
      return (
        <div ref={ref} className={cn('relative overflow-hidden rounded-lg bg-black', className)} style={{ width, height }}>
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={src}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            onLoadedData={onLoad}
            onError={onError}
            className="w-full h-full object-contain"
            controls={controls}
          />
          {!controls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="text-white hover:text-primary transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-primary transition-colors ml-auto"
                aria-label="Fullscreen"
              >
                <Maximize className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      )
    }

    // Audio type
    if (type === 'audio') {
      return (
        <div ref={ref} className={cn('rounded-lg bg-card border p-4', className)}>
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={src}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            onLoadedData={onLoad}
            onError={onError}
            controls={controls}
            className="w-full"
          />
        </div>
      )
    }

    // Camera type
    if (type === 'camera') {
      return (
        <div ref={ref} className={cn('relative overflow-hidden rounded-lg bg-black', className)} style={{ width: width || '100%', height: height || 400 }}>
          <canvas ref={canvasRef} className="hidden" />

          {!isCameraActive && !capturedImage && (
            <div className="flex items-center justify-center h-full">
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-2 text-white hover:text-primary transition-colors"
              >
                <Camera className="h-12 w-12" />
                <span>Activar Cámara</span>
              </button>
            </div>
          )}

          {isCameraActive && !capturedImage && (
            <>
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-center justify-center gap-4">
                <button
                  onClick={switchCamera}
                  className="text-white hover:text-primary transition-colors"
                  aria-label="Switch camera"
                >
                  <RotateCw className="h-6 w-6" />
                </button>
                <button
                  onClick={capturePhoto}
                  className="bg-white rounded-full p-4 hover:bg-gray-200 transition-colors"
                  aria-label="Capture photo"
                >
                  <Camera className="h-8 w-8 text-black" />
                </button>
                <button
                  onClick={stopCamera}
                  className="text-white hover:text-primary transition-colors"
                  aria-label="Close camera"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </>
          )}

          {capturedImage && (
            <>
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-center justify-center gap-4">
                <button
                  onClick={retakePhoto}
                  className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Tomar otra foto
                </button>
              </div>
            </>
          )}
        </div>
      )
    }

    // QR Scanner type
    if (type === 'qr-scanner') {
      return (
        <div ref={ref} className={cn('relative overflow-hidden rounded-lg bg-black', className)} style={{ width: width || '100%', height: height || 400 }}>
          <canvas ref={canvasRef} className="hidden" />

          {!isCameraActive && !qrDetected && (
            <div className="flex items-center justify-center h-full">
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-2 text-white hover:text-primary transition-colors"
              >
                <QrCode className="h-12 w-12" />
                <span>Escanear Código QR</span>
              </button>
            </div>
          )}

          {isCameraActive && !qrDetected && (
            <>
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-4 border-primary w-64 h-64 rounded-lg"></div>
              </div>
              <div className="absolute top-4 left-0 right-0 text-center">
                <p className="text-white bg-black/50 inline-block px-4 py-2 rounded-md">
                  Coloca el código QR dentro del recuadro
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-center justify-center">
                <button
                  onClick={stopCamera}
                  className="text-white hover:text-primary transition-colors"
                  aria-label="Close scanner"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </>
          )}

          {qrDetected && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="bg-green-500 text-white p-4 rounded-full mb-4">
                <QrCode className="h-12 w-12" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">¡Código QR detectado!</h3>
              <p className="text-gray-300 mb-4 break-all max-w-md">{qrDetected}</p>
              <button
                onClick={() => {
                  setQrDetected(null)
                  startCamera()
                }}
                className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Escanear otro código
              </button>
            </div>
          )}
        </div>
      )
    }

    return null
  }
)

BizuitMedia.displayName = 'BizuitMedia'

export { BizuitMedia }
