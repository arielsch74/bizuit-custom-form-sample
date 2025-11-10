import { ComponentDoc } from '../all-components-docs';

export const bizuit_mediaDoc: ComponentDoc = {
  id: 'bizuit-media',
  name: 'Media',
  category: 'media',
  icon: 'Component',
  description: 'Responsive media player for audio and video content',
  description_es: 'Reproductor multimedia para audio y video con controles personalizados',
  detailedDescription: 'A feature-rich media player component supporting both audio and video playback. Includes custom controls, playback speed, volume, fullscreen, captions, playlist support, and responsive design. Works with multiple media formats and streaming protocols.',
  detailedDescription_es: 'Un componente de reproductor multimedia versátil que soporta archivos de audio y video con controles personalizables. Incluye play/pause, búsqueda, volumen, pantalla completa y indicadores de progreso. Soporta múltiples formatos de medios y renderizado responsive con seguimiento de estado de reproducción.',
  useCases: [
    'Video courses and tutorials',
    'Podcast and audio content',
    'Product demonstrations',
    'Live streaming integration',
    'Media gallery and portfolio',
  ],
  useCases_es: [
    'Reproductores de video en sitios educativos o de cursos',
    'Reproductores de podcast o audiolibro',
    'Galerías de medios con reproducción',
    'Demos de producto o videos tutoriales',
    'Reproductores de música o playlist',
  ],
  props: [
    {
      name: 'src',
      type: 'string',
      required: true,
      description: 'Media source URL',
      description_es: 'URL de la fuente del archivo multimedia',
    },
    {
      name: 'type',
      type: '"audio" | "video"',
      required: false,
      default: '"video"',
      description: 'Media type',
      description_es: 'Tipo de medio (audio o video)',
    },
    {
      name: 'controls',
      type: 'boolean',
      required: false,
      default: 'true',
      description: 'Show player controls',
      description_es: 'Mostrar controles del reproductor',
    },
    {
      name: 'autoplay',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Auto-start playback',
      description_es: 'Reproducción automática al cargar',
    },
    {
      name: 'loop',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Loop playback',
      description_es: 'Bucle de reproducción',
    },
    {
      name: 'poster',
      type: 'string',
      required: false,
      description: 'Video poster image URL',
    },
  ],
  codeExample: {
    '/App.js': `import { useState, useEffect, createContext, useContext } from 'react';
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
    "title": "Reproductor de Media",
    "play": "Reproducir",
    "pause": "Pausar",
    "stop": "Detener"
  },
  "en": {
    "title": "Media Player",
    "play": "Play",
    "pause": "Pause",
    "stop": "Stop"
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

        <h2 className="card-title">Image Display</h2>
        <Media
          type="image"
          src="https://picsum.photos/600/400"
          alt="Sample image"
        />
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 className="card-title">Video Player</h2>
        <Media
          type="video"
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          controls
        />
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 className="card-title">Camera Capture</h2>
        <Media
          type="camera"
          onCapture={(dataUrl) => {
            setCapturedPhoto(dataUrl);
            console.log('Photo captured:', dataUrl);
          }}
        />
        {capturedPhoto && (
          <p className="hint" style={{ marginTop: '12px' }}>Photo captured successfully!</p>
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
    '/Media.js': `export default function Media({
  type,
  src,
  alt = 'Media content',
  width,
  height,
  controls = true,
  autoPlay = false,
  onCapture,
  onQRCodeDetected
}) {
  if (type === 'image') {
    return (
      <div className="form-field">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full rounded-lg"
        />
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="form-field">
        <video
          src={src}
          controls={controls}
          autoPlay={autoPlay}
          width={width}
          height={height}
          className="w-full rounded-lg"
        />
      </div>
    );
  }

  if (type === 'audio') {
    return (
      <div className="form-field">
        <audio
          src={src}
          controls={controls}
          autoPlay={autoPlay}
          className="w-full"
        />
      </div>
    );
  }

  if (type === 'camera') {
    return (
      <div className="form-field">
        <div className="bg-muted rounded-lg p-8 text-center" style={{ height: height || 300 }}>
          <p>Camera interface would appear here</p>
          <button
            className="btn-primary mt-4"
            onClick={() => onCapture?.('data:image/png;base64,...')}
          >
            Capture Photo
          </button>
        </div>
      </div>
    );
  }

  if (type === 'qr-scanner') {
    return (
      <div className="form-field">
        <div className="bg-muted rounded-lg p-8 text-center" style={{ height: height || 300 }}>
          <p>QR Scanner interface would appear here</p>
        </div>
      </div>
    );
  }

  return null;
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
  grid-template-columns: repeat(auto-fit, minmin(250px, 1fr));
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
