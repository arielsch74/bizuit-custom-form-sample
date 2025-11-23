/**
 * Recubiz - Sistema de Gestión de Cobranzas
 * Professional debt collection management system
 */

import { useState } from 'react';
import { version as FORM_VERSION } from '../package.json';
import {
  BizuitCard,
  Button,
  BizuitThemeProvider,
  BizuitCombo,
  type ComboOption
} from '@tyconsa/bizuit-ui-components';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardParameters {
  instanceId?: string;
  userName?: string;
  eventName?: string;
  activityName?: string;
  token?: string;
  [key: string]: any;
}

interface FormProps {
  dashboardParams?: DashboardParameters | null;
}

interface Deuda {
  id: string;
  deudor: string;
  documento: string;
  montoTotal: number;
  deudaActual: number;
  fechaAlta: string;
  estado: 'nueva' | 'gestionando' | 'finalizada';
  direccion: string;
  telefono: string;
  email: string;
}

interface Contacto {
  id: string;
  tipo: string;
  valor: string;
  estado: string;
}

interface Accion {
  id: string;
  fecha: string;
  hora: string;
  tipo: string;
  contacto: string;
  observaciones: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DEUDAS_NUEVAS: Deuda[] = [
  {
    id: 'D-2024-001',
    deudor: 'Juan Carlos Pérez',
    documento: '20-35678901-4',
    montoTotal: 150000,
    deudaActual: 165000,
    fechaAlta: '2024-01-15',
    estado: 'nueva',
    direccion: 'Av. Colón 1234, Córdoba',
    telefono: '+54 351 123-4567',
    email: 'juan.perez@email.com'
  }
];

const MOCK_DEUDAS_HISTORIAL: Deuda[] = [
  {
    id: 'D-2023-089',
    deudor: 'María González',
    documento: '27-45678902-3',
    montoTotal: 80000,
    deudaActual: 85000,
    fechaAlta: '2023-12-10',
    estado: 'gestionando',
    direccion: 'Calle San Martín 567, Córdoba',
    telefono: '+54 351 987-6543',
    email: 'maria.gonzalez@email.com'
  },
  {
    id: 'D-2023-045',
    deudor: 'Pedro Martínez',
    documento: '23-12345678-9',
    montoTotal: 120000,
    deudaActual: 95000,
    fechaAlta: '2023-08-20',
    estado: 'gestionando',
    direccion: 'Calle 50 N° 456, La Plata',
    telefono: '+54 221 456-7890',
    email: 'pedro.martinez@email.com'
  }
];

const MOCK_CONTACTOS: Contacto[] = [
  { id: 'C1', tipo: 'Teléfono Móvil', valor: '351 663 9967', estado: 'INICIAL' },
  { id: 'C2', tipo: 'Teléfono Laboral', valor: '351 445 5566', estado: 'INICIAL' },
  { id: 'C3', tipo: 'Email Personal', valor: 'deudor@email.com', estado: 'INICIAL' }
];

const TIPOS_ACCION: ComboOption[] = [
  { label: 'Llamada Telefónica', value: 'llamada' },
  { label: 'Mensaje WhatsApp', value: 'whatsapp' },
  { label: 'Envío de Email', value: 'email' },
  { label: 'Mensaje SMS', value: 'sms' },
  { label: 'Visita Presencial', value: 'visita' },
  { label: 'Carta Documento', value: 'carta' }
];

const MOTIVOS_RECHAZO: ComboOption[] = [
  { label: 'Deuda inexistente', value: 'inexistente' },
  { label: 'Deuda ya cancelada', value: 'cancelada' },
  { label: 'Monto incorrecto', value: 'monto_incorrecto' },
  { label: 'Datos del deudor incorrectos', value: 'datos_incorrectos' },
  { label: 'Fuera de jurisdicción', value: 'jurisdiccion' },
  { label: 'Otro motivo', value: 'otro' }
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function DeudaRow({ deuda, onClick }: {
  deuda: Deuda;
  onClick: () => void;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  return (
    <tr
      onClick={onClick}
      className="hover:bg-orange-50 cursor-pointer transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">{deuda.id}</span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{deuda.deudor}</div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">{deuda.documento}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(deuda.deudaActual)}</span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {deuda.estado}
        </span>
      </td>
    </tr>
  );
}

function ContactoRow({ contacto, isSelected, onClick }: {
  contacto: Contacto;
  isSelected: boolean;
  onClick: () => void;
}) {
  const tipoText = contacto.tipo;
  const valorText = contacto.valor;
  const estadoText = contacto.estado;

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-gray-900">{tipoText}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-900">{valorText}</span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {estadoText}
        </span>
      </td>
    </tr>
  );
}

function AccionRow({ accion }: { accion: Accion }) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{accion.fecha}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{accion.hora}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{accion.tipo}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{accion.contacto}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{accion.observaciones}</td>
    </tr>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function RecubizGestionFormInner({ dashboardParams }: FormProps) {
  const [screen, setScreen] = useState<'dashboard' | 'detail' | 'management'>('dashboard');
  const [deudaActual, setDeudaActual] = useState<Deuda | null>(null);
  const [contactoSeleccionado, setContactoSeleccionado] = useState<Contacto | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [mostrarRechazo, setMostrarRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [descripcionRechazo, setDescripcionRechazo] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSeleccionarDeuda = (deuda: Deuda) => {
    setDeudaActual(deuda);
    setScreen(deuda.estado === 'nueva' ? 'detail' : 'management');
  };

  const handleSolicitarNuevaDeuda = () => {
    setDeudaActual(MOCK_DEUDAS_NUEVAS[0]);
    setScreen('detail');
  };

  const handleAceptarDeuda = () => {
    alert(`Deuda ${deudaActual?.id} aceptada para gestión`);
    setScreen('management');
  };

  const handleRechazarDeuda = () => {
    setMostrarRechazo(true);
  };

  const handleConfirmarRechazo = () => {
    if (!motivoRechazo || !descripcionRechazo.trim()) {
      alert('Complete todos los campos obligatorios');
      return;
    }
    alert(`Deuda ${deudaActual?.id} rechazada\nMotivo: ${motivoRechazo}\n${descripcionRechazo}`);
    setMostrarRechazo(false);
    setMotivoRechazo('');
    setDescripcionRechazo('');
    setDeudaActual(null);
    setScreen('dashboard');
  };

  const handleAgregarAccion = () => {
    if (!contactoSeleccionado) {
      alert('Seleccione un contacto de la tabla');
      return;
    }
    if (!observaciones.trim()) {
      alert('Complete las observaciones');
      return;
    }

    const ahora = new Date();
    const nuevaAccion: Accion = {
      id: `A${Date.now()}`,
      fecha: ahora.toLocaleDateString('es-AR'),
      hora: ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      tipo: 'Gestión',
      contacto: `${contactoSeleccionado.tipo}: ${contactoSeleccionado.valor}`,
      observaciones: observaciones
    };

    setAcciones([...acciones, nuevaAccion]);
    setObservaciones('');
    alert('Acción registrada exitosamente');
  };

  const handleFinalizarGestion = () => {
    if (acciones.length === 0) {
      alert('Registre al menos una acción antes de finalizar');
      return;
    }
    alert(`Gestión de deuda ${deudaActual?.id} finalizada\nAcciones registradas: ${acciones.length}`);
    setDeudaActual(null);
    setAcciones([]);
    setContactoSeleccionado(null);
    setScreen('dashboard');
  };

  const handleVolverDashboard = () => {
    setDeudaActual(null);
    setAcciones([]);
    setContactoSeleccionado(null);
    setScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">R</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Recubiz
                  </h1>
                  <p className="text-sm text-gray-500">
                    Sistema de Gestión de Cobranzas
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {screen !== 'dashboard' && (
                <Button variant="outline" onClick={handleVolverDashboard}>
                  ← Dashboard
                </Button>
              )}
              <div className="text-right">
                <p className="text-sm text-gray-600">{dashboardParams?.userName || 'Gestor'}</p>
                <p className="text-xs text-gray-400">v{FORM_VERSION}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* ============================================================ */}
        {/* SCREEN 1: DASHBOARD */}
        {/* ============================================================ */}
        {screen === 'dashboard' && (
          <div className="space-y-6">
            {/* Page Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
              <p className="text-gray-600">Vista general del sistema de gestión de cobranzas</p>
            </div>

            {/* Nueva Gestión Card */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-orange-500 p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Nueva Gestión</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Solicitar una nueva deuda para gestionar
                  </p>
                  <Button size="lg" onClick={handleSolicitarNuevaDeuda}>
                    Solicitar Nueva Deuda
                  </Button>
                </div>
              </div>
            </div>

            {/* Historial */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Mis Gestiones Anteriores</h3>
                <p className="text-sm text-gray-600 mt-1">{MOCK_DEUDAS_HISTORIAL.length} gestiones en proceso</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deudor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Documento</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deuda Actual</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {MOCK_DEUDAS_HISTORIAL.map((d) => (
                      <DeudaRow
                        key={d.id}
                        deuda={d}
                        onClick={() => handleSeleccionarDeuda(d)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 2: DETAIL (Accept/Reject) */}
        {/* ============================================================ */}
        {screen === 'detail' && deudaActual && (
          <div className="space-y-6">
            {/* Page Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Detalle de Deuda</h2>
              <p className="text-gray-600">{deudaActual.id}</p>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Deudor
                  </label>
                  <p className="text-xl font-semibold text-gray-900">{deudaActual.deudor}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Documento
                  </label>
                  <p className="text-xl font-semibold text-gray-900">{deudaActual.documento}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Fecha de Alta
                  </label>
                  <p className="text-lg text-gray-900">{formatDate(deudaActual.fechaAlta)}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Deuda Actual
                  </label>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatCurrency(deudaActual.deudaActual)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Dirección
                  </label>
                  <p className="text-base text-gray-900">{deudaActual.direccion}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Teléfono
                  </label>
                  <p className="text-base text-gray-900">{deudaActual.telefono}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <p className="text-base text-gray-900">{deudaActual.email}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                <Button variant="destructive" size="lg" onClick={handleRechazarDeuda}>
                  Rechazar
                </Button>
                <Button variant="default" size="lg" onClick={handleAceptarDeuda}>
                  Aceptar y Gestionar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 3: MANAGEMENT */}
        {/* ============================================================ */}
        {screen === 'management' && deudaActual && (
          <div className="space-y-6">
            {/* Page Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión Activa</h2>
              <p className="text-gray-600">{deudaActual.id} - {deudaActual.deudor}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border-l-4 border-orange-500 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deudor</p>
                    <p className="text-lg font-bold text-gray-900">{deudaActual.deudor}</p>
                    <p className="text-xs text-gray-500">{deudaActual.documento}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacto</p>
                    <p className="text-sm font-medium text-gray-900">{deudaActual.telefono}</p>
                    <p className="text-xs text-gray-500">{deudaActual.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deuda Actual</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(deudaActual.deudaActual)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contactos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Contactos del Deudor</h3>
                <p className="text-sm text-gray-600 mt-1">Seleccione un contacto para registrar acciones</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo de Contacto</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacto</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {MOCK_CONTACTOS.map((c) => (
                      <ContactoRow
                        key={c.id}
                        contacto={c}
                        isSelected={contactoSeleccionado?.id === c.id}
                        onClick={() => setContactoSeleccionado(c)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {contactoSeleccionado && (
                <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    <span className="font-bold">Seleccionado:</span> {contactoSeleccionado.tipo} - {contactoSeleccionado.valor}
                  </p>
                </div>
              )}
            </div>

            {/* Registrar Acción */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Registrar Nueva Acción</h3>
              <p className="text-sm text-gray-600 mb-6">Complete los datos de la acción realizada</p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observaciones *
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Describa la acción realizada..."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAgregarAccion} disabled={!contactoSeleccionado} size="lg">
                  + Agregar Acción
                </Button>
              </div>
            </div>

            {/* Historial Acciones */}
            {acciones.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900">Historial de Acciones</h3>
                  <p className="text-sm text-gray-600 mt-1">{acciones.length} acciones registradas</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacto</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {acciones.map((a) => (
                        <AccionRow key={a.id} accion={a} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Finalizar */}
            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={handleFinalizarGestion}>
                ✓ Finalizar Gestión
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL RECHAZO */}
        {/* ============================================================ */}
        {mostrarRechazo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Rechazar Deuda
                  </h2>
                  <p className="text-sm text-gray-600">
                    {deudaActual?.id}
                  </p>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivo de Rechazo *
                  </label>
                  <BizuitCombo
                    options={MOTIVOS_RECHAZO}
                    value={motivoRechazo}
                    onChange={(v) => setMotivoRechazo(v as string)}
                    placeholder="Seleccione un motivo..."
                    searchable={false}
                    clearable={false}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={descripcionRechazo}
                    onChange={(e) => setDescripcionRechazo(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Ingrese una descripción detallada del rechazo..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarRechazo(false);
                    setMotivoRechazo('');
                    setDescripcionRechazo('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleConfirmarRechazo} className="flex-1">
                  Confirmar Rechazo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecubizGestionForm(props: FormProps) {
  return (
    <BizuitThemeProvider defaultTheme="light" defaultColorTheme="orange">
      <RecubizGestionFormInner {...props} />
    </BizuitThemeProvider>
  );
}
