import React, { useState } from 'react';
import { Search, MapPin, Truck, CheckCircle2, Clock, Phone, AlertCircle } from 'lucide-react';
import DeliveryMap from './DeliveryMap.jsx';

export default function CustomerTracking({ orders, drivers }) {
  const [query, setQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    if (!query.trim()) {
      setFoundOrder(null);
      return;
    }

    const cleanQuery = query.trim().toLowerCase();
    const result = orders.find(o => 
      o.id.toLowerCase() === cleanQuery || 
      o.customerPhone.includes(cleanQuery) ||
      o.customerName.toLowerCase().includes(cleanQuery)
    );

    setFoundOrder(result || null);
  };

  const assignedDriver = foundOrder ? drivers.find(d => d.id === foundOrder.driverId) : null;

  // Marcadores de mapa para el cliente
  const trackingMarkers = foundOrder ? [
    { type: 'store', lat: -34.5932, lng: -60.9472, title: 'Comercio Base: Yogur Griego Junín' },
    { type: 'customer', lat: foundOrder.lat, lng: foundOrder.lng, title: `Tu Domicilio: ${foundOrder.address}` },
    ...(assignedDriver ? [{ type: 'driver', lat: assignedDriver.lat, lng: assignedDriver.lng, title: `Repartidor: ${assignedDriver.name}` }] : [])
  ] : [];

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Buscador */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', width: 48, height: 48, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 6px 16px rgba(6,182,212,0.4)' }}>
          <Search style={{ width: 24, height: 24, color: '#fff' }} />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>Rastreo de Pedido en Tiempo Real</h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
          Ingresa tu número de pedido (ej: ORD-1001) o tu número de teléfono de contacto.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px', margin: '0 auto' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ej: ORD-1001 o 2364-443322"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <Search style={{ width: 18, height: 18 }} />
            <span>Buscar</span>
          </button>
        </form>
      </div>

      {/* Resultados de Búsqueda */}
      {searched && !foundOrder && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          <AlertCircle style={{ width: 36, height: 36, color: '#ef4444', margin: '0 auto 0.5rem' }} />
          <h4 style={{ color: '#f8fafc', fontWeight: 700 }}>No encontramos ningún pedido activo con esa información</h4>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Verifica que el número de pedido o teléfono coincidan con los datos de tu compra.</p>
        </div>
      )}

      {foundOrder && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Card Detalle Pedido */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 700 }}>Número de Pedido</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{foundOrder.id}</h3>
              </div>
              <span className={`badge badge-${foundOrder.status.toLowerCase().replace(' ', '')}`} style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}>
                {foundOrder.status}
              </span>
            </div>

            {/* Timeline del Estado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '1.5rem 0', padding: '0 1rem' }}>
              
              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <div style={{ background: '#10b981', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem' }}>
                  <CheckCircle2 style={{ width: 18, height: 18 }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Recibido</span>
              </div>

              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <div style={{ background: foundOrder.status === 'En Camino' || foundOrder.status === 'Entregado' ? '#6366f1' : '#334155', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem' }}>
                  <Truck style={{ width: 18, height: 18 }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>En Camino</span>
              </div>

              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <div style={{ background: foundOrder.status === 'Entregado' ? '#10b981' : '#334155', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem' }}>
                  <CheckCircle2 style={{ width: 18, height: 18 }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Entregado</span>
              </div>

            </div>

            {/* Info del Repartidor */}
            {assignedDriver ? (
              <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#6366f1', color: '#fff', padding: '0.5rem', borderRadius: '8px' }}>
                    <Truck style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Repartidor Asignado</span>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{assignedDriver.name}</h5>
                  </div>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>🛵 {assignedDriver.vehicle}</span>
              </div>
            ) : (
              <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                ⏳ Tu pedido se está preparando en el comercio y pronto se le asignará un repartidor.
              </div>
            )}
          </div>

          {/* Mapa con Seguimiento */}
          <div className="card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Mapa de Rastreo de la Entrega</h4>
            <DeliveryMap markers={trackingMarkers} center={{ lat: foundOrder.lat, lng: foundOrder.lng }} zoom={14} />
          </div>

          {/* Detalle de Productos */}
          <div className="card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Resumen de Tu Compra</h4>
            <div style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '8px' }}>
              {foundOrder.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                  <span>{it.quantity}x {it.name}</span>
                  <span style={{ fontWeight: 600 }}>${it.quantity * it.unitPrice}</span>
                </div>
              ))}
              <div style={{ textAlign: 'right', marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                Total a abonar: ${foundOrder.total}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
