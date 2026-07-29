import React, { useState } from 'react';
import { Truck, CheckCircle2, Navigation, Phone, MapPin, Package, LogIn, Lock, AlertCircle, MessageSquare } from 'lucide-react';
import { verifyPassword } from '../services/crypto.js';
import { generateOrderWhatsAppLink } from '../services/whatsapp.js';
import DeliveryMap from './DeliveryMap.jsx';

export default function DriverPanel({ drivers, orders, onSaveOrders }) {
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const [authenticatedDriver, setAuthenticatedDriver] = useState(null);
  const [loginError, setLoginError] = useState('');

  const handleDriverLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const driver = drivers.find(d => d.id === selectedDriverId);
    if (!driver) {
      setLoginError('Por favor selecciona tu nombre de repartidor.');
      return;
    }

    const isValid = await verifyPassword(driverPassword, driver.passwordHash);
    if (isValid) {
      setAuthenticatedDriver(driver);
      setDriverPassword('');
    } else {
      setLoginError('Contraseña incorrecta.');
    }
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    onSaveOrders(updated);
  };

  // Si no se ha autenticado el repartidor
  if (!authenticatedDriver) {
    return (
      <div style={{ maxWidth: '420px', margin: '4rem auto', padding: '1rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', width: 50, height: 50, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 20px rgba(16,185,129,0.4)' }}>
            <Truck style={{ width: 28, height: 28, color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>Portal de Repartidores</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
            Selecciona tu perfil e ingresa tu contraseña para ver tus hojas de ruta y entregas.
          </p>

          {loginError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <AlertCircle style={{ width: 16, height: 16, display: 'inline', marginRight: 4 }} />
              {loginError}
            </div>
          )}

          <form onSubmit={handleDriverLogin}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Seleccionar Repartidor</label>
              <select
                className="form-select"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                required
              >
                <option value="">-- Selecciona tu nombre --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.vehicle})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Contraseña de Repartidor</label>
              <input
                type="password"
                className="form-input"
                placeholder="Ingresa tu clave (Demo: reparto123)"
                value={driverPassword}
                onChange={(e) => setDriverPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              <LogIn style={{ width: 18, height: 18 }} />
              <span>Ingresar a mis Pedidos</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Mis Pedidos Asignados
  const myOrders = orders.filter(o => o.driverId === authenticatedDriver.id);

  // Marcadores de mapa para mis entregas
  const myMarkers = [
    { type: 'driver', lat: authenticatedDriver.lat, lng: authenticatedDriver.lng, title: `Tu Ubicación: ${authenticatedDriver.name}` },
    ...myOrders.map(o => ({ type: 'customer', lat: o.lat, lng: o.lng, title: `Entrega: ${o.customerName}`, popup: o.address }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Repartidor */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.6rem', borderRadius: '10px' }}>
            <Truck style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Hola, {authenticatedDriver.name} 👋</h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Vehículo: {authenticatedDriver.vehicle} | Pedidos Asignados: {myOrders.length}
            </span>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => setAuthenticatedDriver(null)}>
          Cerrar Sesión Repartidor
        </button>
      </div>

      {/* Mapa de Ruta del Repartidor */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tu Mapa de Entregas Activas</h3>
        <DeliveryMap markers={myMarkers} center={{ lat: authenticatedDriver.lat, lng: authenticatedDriver.lng }} zoom={13} />
      </div>

      {/* Lista de Pedidos del Repartidor */}
      <div className="grid-2">
        {myOrders.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Package style={{ width: 40, height: 40, margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, color: '#cbd5e1' }}>No tienes pedidos asignados en este momento.</p>
            <span style={{ fontSize: '0.85rem' }}>El administrador te notificará cuando se carguen nuevas entregas.</span>
          </div>
        ) : (
          myOrders.map(order => {
            const isCompleted = order.status === 'Entregado';
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address + ', Junin, Buenos Aires')}`;

            return (
              <div key={order.id} className="card" style={{ borderLeft: isCompleted ? '4px solid #10b981' : '4px solid #6366f1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 700 }}>{order.id}</span>
                  <span className={`badge badge-${order.status.toLowerCase().replace(' ', '')}`}>
                    {order.status}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>{order.customerName}</h4>
                
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin style={{ width: 16, height: 16, color: '#ef4444' }} />
                  <strong>{order.address}</strong>
                </p>

                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone style={{ width: 16, height: 16, color: '#10b981' }} />
                  <a href={`tel:${order.customerPhone}`} style={{ color: '#10b981', textDecoration: 'none' }}>{order.customerPhone}</a>
                </p>

                {order.notes && (
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
                    📝 Nota: {order.notes}
                  </div>
                )}

                <div style={{ background: '#0f172a', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  {order.items.map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{it.quantity}x {it.name}</span>
                      <span>${it.quantity * it.unitPrice}</span>
                    </div>
                  ))}
                  <div style={{ textAlign: 'right', fontWeight: 700, marginTop: '0.3rem', color: '#10b981' }}>
                    Total a cobrar: ${order.total}
                  </div>
                </div>

                {/* Acciones de entrega y notificación WhatsApp */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  
                  {/* Botón WhatsApp */}
                  <a 
                    href={generateOrderWhatsAppLink(order, authenticatedDriver, config)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{ background: '#25D366', color: '#fff', fontWeight: 700, width: '100%' }}
                  >
                    <MessageSquare style={{ width: 16, height: 16 }} />
                    <span>Avisar "En Camino" por WhatsApp</span>
                  </a>

                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <Navigation style={{ width: 15, height: 15, color: '#6366f1' }} />
                    <span>Abrir Ruta en Google Maps GPS</span>
                  </a>

                  {order.status === 'Pendiente' && (
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => {
                        handleUpdateStatus(order.id, 'En Camino');
                        // Abrir WhatsApp automáticamente al pasar a En Camino
                        window.open(generateOrderWhatsAppLink(order, authenticatedDriver, config), '_blank');
                      }}
                    >
                      <Truck style={{ width: 16, height: 16 }} />
                      <span>Iniciar "En Camino" y Notificar</span>
                    </button>
                  )}

                  {order.status === 'En Camino' && (
                    <button 
                      className="btn btn-success btn-sm" 
                      onClick={() => handleUpdateStatus(order.id, 'Entregado')}
                    >
                      <CheckCircle2 style={{ width: 16, height: 16 }} />
                      <span>Marcar como ENTREGADO</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
