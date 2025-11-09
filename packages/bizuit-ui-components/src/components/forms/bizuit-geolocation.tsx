'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'

export interface GeolocationData {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: number
}

export interface BizuitGeolocationProps {
  value?: GeolocationData
  onChange?: (location: GeolocationData) => void
  label?: string
  description?: string
  showMap?: boolean
  className?: string
  disabled?: boolean
  required?: boolean
  error?: string
}

const BizuitGeolocation = React.forwardRef<HTMLDivElement, BizuitGeolocationProps>(
  (
    {
      value,
      onChange,
      label,
      description,
      showMap = false,
      className,
      disabled = false,
      required = false,
      error,
    },
    ref
  ) => {
    const [loading, setLoading] = React.useState(false)
    const [geoError, setGeoError] = React.useState<string>()

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        setGeoError('Geolocalización no soportada en este navegador')
        return
      }

      setLoading(true)
      setGeoError(undefined)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }
          onChange?.(location)
          setLoading(false)
        },
        (error) => {
          setGeoError(error.message)
          setLoading(false)
        },
        { enableHighAccuracy: true }
      )
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

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={getCurrentLocation}
            disabled={disabled || loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <MapPin className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Obteniendo ubicación...' : 'Obtener ubicación actual'}
          </Button>
        </div>

        {value && (
          <div className="p-4 border rounded-lg bg-card space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Latitud:</span>
                <p className="font-mono">{value.latitude.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Longitud:</span>
                <p className="font-mono">{value.longitude.toFixed(6)}</p>
              </div>
              {value.accuracy && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Precisión:</span>
                  <p className="font-mono">{value.accuracy.toFixed(2)} metros</p>
                </div>
              )}
            </div>

            {showMap && (
              <div className="mt-2">
                <a
                  href={`https://www.google.com/maps?q=${value.latitude},${value.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Ver en Google Maps
                </a>
              </div>
            )}
          </div>
        )}

        {(geoError || error) && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{geoError || error}</span>
          </div>
        )}
      </div>
    )
  }
)

BizuitGeolocation.displayName = 'BizuitGeolocation'

export { BizuitGeolocation }
