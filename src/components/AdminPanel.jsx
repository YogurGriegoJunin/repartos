import React, { useState } from 'react';
import { 
  Users, ShoppingBag, Truck, ShieldCheck, Plus, Trash2, Edit3, KeyRound, 
  MapPin, CheckCircle, Clock, AlertTriangle, Phone, LogIn, Lock, Sparkles, Filter 
} from 'lucide-react';
import DeliveryMap from './DeliveryMap.jsx';
import PasswordModal from './PasswordModal.jsx';
import { verifyPassword, hashPassword } from '../services/crypto.js';

export default function AdminPanel({
  drivers,
  products,
  orders,
  adminHash,
  onSaveDrivers,
  onSaveProducts,
  onSaveOrders,
  onSaveAdminHash
}) {
  // Estado de Autenticación de Admin
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLoginPass, setAdminLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Pestaña activa en Admin (pedidos | repartidores | productos | mapa)
  const [activeTab, setActiveTab] = useState('pedidos');

  // Modales
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passTarget, setPassTarget] = useState(null); // { type: 'admin' } o { type: 'driver', driverId: '...' }

  // Formulario Nuevo Repartidor
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehicle: '', password: '' });
  const [showDriverForm, setShowDriverForm] = useState(false);

  // Formulario Nuevo Producto / Ítem
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Lácteos', price: '', stock: '', description: '' });
  const [showProductForm, setShowProductForm] = useState(false);

  // Formulario Nuevo Pedido
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    lat: -34.5932,
    lng: -60.9472,
    driverId: '',
    items: [],
    notes: ''
  });
  const [selectedProdId, setSelectedProdId] = useState('');
  const [selectedProdQty, setSelectedProdQty] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Filtros
  const [orderFilter, setOrderFilter] = useState('Todos');

  // Login de Administrador
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const isValid = await verifyPassword(adminLoginPass, adminHash);
    if (isValid) {
      setIsAdminAuthenticated(true);
      setAdminLoginPass('');
    } else {
      setLoginError('Contraseña de Administrador incorrecta.');
    }
  };

  // --- REPARTIDORES ---
  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone || !newDriver.password) return;
    
    // Hash seguro de la contraseña inicial del repartidor
    const passwordHash = await hashPassword(newDriver.password);

    const createdDriver = {
      id: 'drv_' + Date.now(),
      name: newDriver.name,
      phone: newDriver.phone,
      vehicle: newDriver.vehicle || 'Vehículo Particular',
      status: 'Disponible',
      passwordHash,
      lat: -34.5932 + (Math.random() - 0.5) * 0.02,
      lng: -60.9472 + (Math.random() - 0.5) * 0.02
    };

    onSaveDrivers([...drivers, createdDriver]);
    setNewDriver({ name: '', phone: '', vehicle: '', password: '' });
    setShowDriverForm(false);
  };

  const handleDeleteDriver = (driverId) => {
    if (window.confirm('¿Estás seguro de eliminar este repartidor?')) {
      onSaveDrivers(drivers.filter(d => d.id !== driverId));
    }
  };

  // --- PRODUCTOS / ÍTEMS ---
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const createdProduct = {
      id: 'prod_' + Date.now(),
      name: newProduct.name,
      category: newProduct.category || 'Varios',
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      description: newProduct.description
    };

    onSaveProducts([...products, createdProduct]);
    setNewProduct({ name: '', category: 'Lácteos', price: '', stock: '', description: '' });
    setShowProductForm(false);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto del catálogo?')) {
      onSaveProducts(products.filter(p => p.id !== productId));
    }
  };

  // --- PEDIDOS ---
  const handleAddItemToNewOrder = () => {
    if (!selectedProdId) return;
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;

    const existingIndex = newOrder.items.findIndex(i => i.productId === selectedProdId);
    let updatedItems = [...newOrder.items];

    if (existingIndex >= 0) {
      updatedItems[existingIndex].quantity += parseInt(selectedProdQty);
    } else {
      updatedItems.push({
        productId: prod.id,
        name: prod.name,
        quantity: parseInt(selectedProdQty),
        unitPrice: prod.price
      });
    }

    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const handleRemoveItemFromNewOrder = (prodId) => {
    setNewOrder({ ...newOrder, items: newOrder.items.filter(i => i.productId !== prodId) });
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!newOrder.customerName || !newOrder.address || newOrder.items.length === 0) return;

    const total = newOrder.items.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);

    const createdOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      address: newOrder.address,
      lat: -34.5932 + (Math.random() - 0.5) * 0.03,
      lng: -60.9472 + (Math.random() - 0.5) * 0.03,
      items: newOrder.items,
      total,
      driverId: newOrder.driverId || (drivers[0] ? drivers[0].id : ''),
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
      notes: newOrder.notes
    };

    onSaveOrders([createdOrder, ...orders]);
    setNewOrder({
      customerName: '',
      customerPhone: '',
      address: '',
      lat: -34.5932,
      lng: -60.9472,
      driverId: '',
      items: [],
      notes: ''
    });
    setShowOrderForm(false);
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    onSaveOrders(updated);
  };

  const handleOrderDriverChange = (orderId, newDriverId) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, driverId: newDriverId } : o);
    onSaveOrders(updated);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
      onSaveOrders(orders.filter(o => o.id !== orderId));
    }
  };

  // --- CAMBIO DE CONTRASEÑA ---
  const handleSavePasswordFromModal = async (newHash, target) => {
    if (target.type === 'admin') {
      onSaveAdminHash(newHash);
    } else if (target.type === 'driver' && target.driverId) {
      const updated = drivers.map(d => d.id === target.driverId ? { ...d, passwordHash: newHash } : d);
      onSaveDrivers(updated);
    }
  };

  // --- VISTA LOGIN DE ADMIN ---
  if (!isAdminAuthenticated) {
    return (
      <div style={{ maxWidth: '420px', margin: '4rem auto', padding: '1rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', width: 50, height: 50, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 20px rgba(99,102,241,0.4)' }}>
            <ShieldCheck style={{ width: 28, height: 28, color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>Panel Administrador</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
            Ingresa tu contraseña de administrador para gestionar repartos, repartidores e ítems.
          </p>

          {loginError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Contraseña de Admin</label>
              <input
                type="password"
                className="form-input"
                placeholder="Ingresa clave (Demo: admin123)"
                value={adminLoginPass}
                onChange={(e) => setAdminLoginPass(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              <LogIn style={{ width: 18, height: 18 }} />
              <span>Iniciar Sesión de Admin</span>
            </button>
          </form>

          <span style={{ display: 'block', marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
            🔒 Las contraseñas están haseadas con SHA-256 y nunca se almacenan en texto plano.
          </span>
        </div>
      </div>
    );
  }

  // Filtrado de pedidos
  const filteredOrders = orderFilter === 'Todos' 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  // Marcadores de Mapa para vista general
  const mapMarkers = [
    { type: 'store', lat: -34.5932, lng: -60.9472, title: 'Yogur Griego Junín (Local Base)', popup: 'Centro de Salida' },
    ...drivers.map(d => ({ type: 'driver', lat: d.lat, lng: d.lng, title: `Repartidor: ${d.name}`, popup: `Tel: ${d.phone} | Estado: ${d.status}` })),
    ...orders.map(o => ({ type: 'customer', lat: o.lat, lng: o.lng, title: `Pedido ${o.id}: ${o.customerName}`, popup: `${o.address} | Status: ${o.status}` }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Admin Top Actions & Tabs */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', padding: '0.6rem', borderRadius: '10px' }}>
            <ShieldCheck style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Administración Central</h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Logística de Envíos & Catálogo</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setPassTarget({ type: 'admin', currentHash: adminHash });
              setIsPassModalOpen(true);
            }}
          >
            <KeyRound style={{ width: 16, height: 16 }} />
            <span>Cambiar Clave Admin</span>
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => setIsAdminAuthenticated(false)}
          >
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
          onClick={() => setActiveTab('pedidos')}
        >
          📦 Pedidos ({orders.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'repartidores' ? 'active' : ''}`}
          onClick={() => setActiveTab('repartidores')}
        >
          🛵 Repartidores ({drivers.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
          onClick={() => setActiveTab('productos')}
        >
          🏷️ Productos ({products.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'mapa' ? 'active' : ''}`}
          onClick={() => setActiveTab('mapa')}
        >
          🗺️ Mapa en Vivo
        </button>
      </div>

      {/* TAB 1: PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter style={{ width: 16, height: 16, color: '#94a3b8' }} />
              <select 
                className="form-select" 
                style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
              >
                <option value="Todos">Todos los Estados</option>
                <option value="Pendiente">Pendientes</option>
                <option value="En Camino">En Camino</option>
                <option value="Entregado">Entregados</option>
                <option value="Cancelado">Cancelados</option>
              </select>
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => setShowOrderForm(!showOrderForm)}
            >
              <Plus style={{ width: 18, height: 18 }} />
              <span>Crear Nuevo Pedido</span>
            </button>
          </div>

          {/* Formulario Crear Pedido */}
          {showOrderForm && (
            <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#6366f1' }}>Nuevo Pedido de Cliente</h3>
              <form onSubmit={handleCreateOrder}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Nombre del Cliente</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: María Fernández"
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono de Contacto</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: 2364-443322"
                      value={newOrder.customerPhone}
                      onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Dirección de Entrega</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: Av. San Martín 450, Junín"
                      value={newOrder.address}
                      onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Asignar Repartidor</label>
                    <select
                      className="form-select"
                      value={newOrder.driverId}
                      onChange={(e) => setNewOrder({ ...newOrder, driverId: e.target.value })}
                    >
                      <option value="">Sin Asignar / Seleccionar Repartidor</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.vehicle})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Agregar Ítems al Pedido */}
                <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Agregar Productos al Pedido</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <select 
                      className="form-select" 
                      style={{ flex: 1, minWidth: '200px' }}
                      value={selectedProdId}
                      onChange={(e) => setSelectedProdId(e.target.value)}
                    >
                      <option value="">-- Seleccionar Producto del Catálogo --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                      ))}
                    </select>

                    <input 
                      type="number" 
                      min="1" 
                      className="form-input" 
                      style={{ width: '80px' }}
                      value={selectedProdQty}
                      onChange={(e) => setSelectedProdQty(e.target.value)}
                    />

                    <button type="button" className="btn btn-secondary" onClick={handleAddItemToNewOrder}>
                      + Agregar
                    </button>
                  </div>

                  {newOrder.items.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ítems en este pedido:</span>
                      <ul style={{ listStyle: 'none', marginTop: '0.4rem' }}>
                        {newOrder.items.map(item => (
                          <li key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span>{item.quantity}x {item.name}</span>
                            <div>
                              <strong style={{ marginRight: '0.75rem' }}>${item.quantity * item.unitPrice}</strong>
                              <button type="button" onClick={() => handleRemoveItemFromNewOrder(item.productId)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div style={{ textAlign: 'right', marginTop: '0.5rem', fontWeight: 700, color: '#10b981' }}>
                        Total: ${newOrder.items.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0)}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowOrderForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={newOrder.items.length === 0}>
                    Guardar Pedido
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Pedidos */}
          <div className="grid-2">
            {filteredOrders.map(order => {
              const driver = drivers.find(d => d.id === order.driverId);
              const statusBadgeClass = 
                order.status === 'Pendiente' ? 'badge-pendiente' :
                order.status === 'En Camino' ? 'badge-encamino' :
                order.status === 'Entregado' ? 'badge-entregado' : 'badge-cancelado';

              return (
                <div key={order.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700 }}>{order.id}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{order.customerName}</h4>
                    </div>
                    <span className={`badge ${statusBadgeClass}`}>{order.status}</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin style={{ width: 15, height: 15, color: '#ef4444' }} />
                    {order.address}
                  </p>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone style={{ width: 15, height: 15, color: '#10b981' }} />
                    {order.customerPhone}
                  </p>

                  {/* Resumen de Ítems */}
                  <div style={{ background: '#0f172a', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    {order.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                        <span>{it.quantity}x {it.name}</span>
                        <span>${it.quantity * it.unitPrice}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.4rem', paddingTop: '0.4rem', fontWeight: 700, textAlign: 'right', color: '#10b981', fontSize: '0.9rem' }}>
                      Total: ${order.total}
                    </div>
                  </div>

                  {/* Controles de Estado y Repartidor */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span className="form-label" style={{ fontSize: '0.7rem' }}>Repartidor Asignado:</span>
                      <select 
                        className="form-select" 
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                        value={order.driverId || ''}
                        onChange={(e) => handleOrderDriverChange(order.id, e.target.value)}
                      >
                        <option value="">Sin Asignar</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="form-label" style={{ fontSize: '0.7rem' }}>Estado:</span>
                      <select 
                        className="form-select" 
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                        value={order.status}
                        onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Camino">En Camino</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: REPARTIDORES */}
      {activeTab === 'repartidores' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Gestión de Repartidores</h3>
            <button className="btn btn-primary" onClick={() => setShowDriverForm(!showDriverForm)}>
              <Plus style={{ width: 18, height: 18 }} />
              <span>Nuevo Repartidor</span>
            </button>
          </div>

          {/* Formulario Crear Repartidor */}
          {showDriverForm && (
            <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#6366f1' }}>Registrar Repartidor</h4>
              <form onSubmit={handleAddDriver}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Nombre Completo</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: Carlos Gómez"
                      value={newDriver.name}
                      onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono de Contacto</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: 2364-551122"
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Vehículo</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: Moto Honda 150cc"
                      value={newDriver.vehicle}
                      onChange={(e) => setNewDriver({ ...newDriver, vehicle: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contraseña Inicial (Protegida)</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Contraseña de ingreso del repartidor"
                      value={newDriver.password}
                      onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDriverForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Repartidor
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid de Repartidores */}
          <div className="grid-3">
            {drivers.map(driver => (
              <div key={driver.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.6rem', borderRadius: '10px' }}>
                    <Truck style={{ width: 22, height: 22 }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{driver.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{driver.vehicle}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                  📞 {driver.phone}
                </p>
                
                <div style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', marginBottom: '1rem', display: 'inline-block' }}>
                  🔑 Contraseña: <span style={{ fontFamily: 'monospace' }}>●●●●●●●● (SHA-256)</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setPassTarget({ type: 'driver', driverId: driver.id });
                      setIsPassModalOpen(true);
                    }}
                  >
                    <KeyRound style={{ width: 14, height: 14 }} />
                    <span>Cambiar Clave</span>
                  </button>

                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteDriver(driver.id)}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTOS / CATÁLOGO */}
      {activeTab === 'productos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Catálogo de Productos del Comercio</h3>
            <button className="btn btn-primary" onClick={() => setShowProductForm(!showProductForm)}>
              <Plus style={{ width: 18, height: 18 }} />
              <span>Nuevo Producto</span>
            </button>
          </div>

          {/* Formulario Crear Producto */}
          {showProductForm && (
            <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#6366f1' }}>Agregar Ítem al Catálogo</h4>
              <form onSubmit={handleAddProduct}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Nombre del Producto</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: Yogur Griego 500g"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: Lácteos, Combos, Toppings"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Precio ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="Ej: 2500"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Disponible</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Ej: 50"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción Breve</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Elaborado artesanalmente en Junín"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProductForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid de Productos */}
          <div className="grid-3">
            {products.map(prod => (
              <div key={prod.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', background: '#334155', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {prod.category}
                  </span>
                  <button 
                    onClick={() => handleDeleteProduct(prod.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{prod.name}</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>{prod.description}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.6rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>${prod.price}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Stock: {prod.stock} un.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MAPA EN VIVO */}
      {activeTab === 'mapa' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Visualizador de Entregas y Repartidores en Junín</h3>
          <DeliveryMap markers={mapMarkers} center={{ lat: -34.5932, lng: -60.9472 }} zoom={13} />
        </div>
      )}

      {/* Modal Seguro de Cambio de Contraseña */}
      <PasswordModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        title={passTarget?.type === 'admin' ? 'Cambiar Contraseña de Administrador' : 'Cambiar Contraseña de Repartidor'}
        targetUser={passTarget}
        onSavePassword={handleSavePasswordFromModal}
      />
    </div>
  );
}
