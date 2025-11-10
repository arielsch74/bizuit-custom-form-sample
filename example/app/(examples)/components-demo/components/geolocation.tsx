import { ComponentDoc } from '../all-components-docs';

export const bizuit_geolocationDoc: ComponentDoc = {
  id: 'bizuit-geolocation',
  name: 'Geolocation',
  category: 'forms',
  icon: 'Component',
  description: 'GPS coordinate capture with map integration',
  description_es: 'Selector de ubicación con integración de mapa y búsqueda de dirección',
  detailedDescription: 'A geolocation component for capturing and displaying GPS coordinates. Features automatic location detection, manual coordinate entry, map preview, address geocoding, and location accuracy indicators.',
  detailedDescription_es: 'Un componente de geolocalización que combina selección de mapa, entrada de búsqueda de dirección y detección de ubicación actual del dispositivo. Incluye integración de API de geocodificación, selección de pin en mapa y formateo de direcciones. Soporta búsqueda por coordenadas o dirección de texto.',
  useCases: [
    'Delivery and shipping address capture',
    'Store locator applications',
    'Location-based services',
    'Asset tracking and field service',
    'Event location registration',
  ],
  useCases_es: [
    'Formularios de dirección de envío',
    'Selección de ubicación de tienda o sucursal',
    'Campos de ubicación de evento',
    'Formularios de listado de propiedades',
    'Check-in basado en ubicación o formularios de asistencia',
  ],
  props: [
    {
      name: 'value',
      type: '{lat: number, lng: number}',
      required: false,
      description: 'Coordinates object',
      description_es: 'Valor de ubicación actual (lat, lng, address)',
    },
    {
      name: 'onChange',
      type: '(coords: {lat: number, lng: number}) => void',
      required: false,
      description: 'Coordinate change callback',
      description_es: 'Callback ejecutado cuando la ubicación cambia',
    },
    {
      name: 'autoDetect',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Auto-detect location on mount',
    },
    {
      name: 'showMap',
      type: 'boolean',
      required: false,
      default: 'true',
      description: 'Display map preview',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
import Geolocation from './Geolocation.js';
import './styles.css';

// 🌐 Contexto de Internacionalización (i18n)
const I18nContext = createContext();

const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation debe usarse dentro de I18nProvider');
  return context;
};

const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');

  const translations = {
  "es": {
    "title": "Geolocalización",
    "getLocation": "Obtener ubicación",
    "latitude": "Latitud",
    "longitude": "Longitud"
  },
  "en": {
    "title": "Geolocation",
    "getLocation": "Get location",
    "latitude": "Latitude",
    "longitude": "Longitude"
  }
};

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

// 🎨 Contexto de Tema (Dark/Light/System)
const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
};

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('system');
  const [primaryColor, setPrimaryColor] = useState('#a855f7');

  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const effectiveTheme = mode === 'system' ? getSystemTheme() : mode;
  const isDark = effectiveTheme === 'dark';

  useEffect(() => {
    document.body.className = isDark ? 'dark' : 'light';
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark, primaryColor, setPrimaryColor }}>
      <div className={isDark ? 'dark' : 'light'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

function App() {
  const { t, language, setLanguage } = useTranslation();
  const { mode, setMode, isDark, primaryColor, setPrimaryColor } = useTheme();

  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setError('');
        },
        (err) => {
          setError('Unable to retrieve location: ' + err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  return (
<div className="container">
      <div className="card">
      {/* Theme and Language Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          style={{
            padding: '6px 12px',
            background: isDark ? '#374151' : '#f3f4f6',
            color: isDark ? '#f9fafb' : '#111827',
            border: '1px solid ' + (isDark ? '#4b5563' : '#d1d5db'),
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {language === 'es' ? '🇬🇧 EN' : '🇪🇸 ES'}
        </button>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['light', 'dark', 'system'].map(themeMode => (
              <button
                key={themeMode}
                type="button"
                onClick={() => setMode(themeMode)}
                style={{
                  padding: '6px 12px',
                  background: mode === themeMode ? primaryColor : (isDark ? '#374151' : '#f3f4f6'),
                  color: mode === themeMode ? 'white' : (isDark ? '#f9fafb' : '#111827'),
                  border: '1px solid ' + (mode === themeMode ? primaryColor : (isDark ? '#4b5563' : '#d1d5db')),
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {themeMode === 'light' ? '☀️' : themeMode === 'dark' ? '🌙' : '💻'}
              </button>
            ))}
          </div>

          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            style={{
              width: '40px',
              height: '32px',
              border: '1px solid ' + (isDark ? '#4b5563' : '#d1d5db'),
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Color primario"
          />
        </div>
      </div>

        <h2 className="card-title">Geolocation</h2>
        <Geolocation
          location={location}
          onGetLocation={handleGetLocation}
          error={error}
        />
        {location && (
          <p className="hint">
            Latitude: {location.lat.toFixed(6)}, Longitude: {location.lng.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AppWithProviders() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </I18nProvider>
  );
}`,
    '/Geolocation.js': `export default function Geolocation({ location, onGetLocation, error }) {
  return (
    <div className="form-field">
      <button
        onClick={onGetLocation}
        className="btn-primary"
        style={{ width: '100%' }}
      >
        📍 Get Current Location
      </button>

      {location && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Latitude:</strong> {location.lat.toFixed(6)}
          </div>
          <div>
            <strong>Longitude:</strong> {location.lng.toFixed(6)}
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px' }}>
          {error}
        </div>
      )}
    </div>
  );
}`,
    '/styles.css': `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f9fafb;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  margin-top: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: system-ui, -apple-system, sans-serif;
  background: white;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Asegurar que los inputs especiales usen la misma fuente */
input[type="date"].form-input,
input[type="time"].form-input,
input[type="datetime-local"].form-input,
select.form-input {
  font-family: system-ui, -apple-system, sans-serif;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.form-checkbox input[type="checkbox"],
.form-checkbox input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-checkbox label {
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  flex: 1;
  padding: 12px 24px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #ea580c;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.hint {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}`,
  },
};
