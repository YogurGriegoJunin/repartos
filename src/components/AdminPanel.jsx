import React, { useState, useRef } from 'react';
import { 
  Users, ShoppingBag, Truck, ShieldCheck, Plus, Trash2, Edit3, KeyRound, 
  MapPin, CheckCircle, Clock, AlertTriangle, Phone, LogIn, Lock, Sparkles, Filter,
  Download, Upload, RefreshCw, Database, Store, DollarSign, Award, UserCheck, PackageCheck, MessageSquare
} from 'lucide-react';
import DeliveryMap from './DeliveryMap.jsx';
import PasswordModal from './PasswordModal.jsx';
import { verifyPassword, hashPassword } from '../services/crypto.js';
import { exportFullBackup, importFullBackup, createTenantConfig } from '../services/storage.js';
import { generateOrderWhatsAppLink } from '../services/whatsapp.js';

export default function AdminPanel({
  drivers,
  products,
  orders,
  adminHash,
  config,
  onSaveDrivers,
  onSaveProducts,
  onSaveOrders,
  onSaveAdminHash,
  onSaveConfig,
  onReloadFullSystem
}) {
  // Estado de Autenticación de Admin
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLoginPass, setAdminLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Pestaña activa (pedidos | repartidores | productos | mapa | backup | saas)
  const [activeTab, setActiveTab] = useState('pedidos');

  // Modales
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passTarget, setPassTarget] = useState(null);

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
    lat: config?.baseCoords?.lat || -34.5932,
    lng: config?.baseCoords?.lng || -60.9472,
    driverId: '',
    items: [],
    notes: ''
  });
  const [selectedProdId, setSelectedProdId] = useState('');
  const [selectedProdQty, setSelectedProdQty] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Formulario de Configuración de Comercio (White-Label)
  const [storeForm, setStoreForm] = useState({
    storeName: config?.storeName || '',
    tagline: config?.tagline || '',
    phone: config?.phone || '',
    address: config?.address || '',
    currencySymbol: config?.currencySymbol || '$',
    lat: config?.baseCoords?.lat || -34.5932,
    lng: config?.baseCoords?.lng || -60.9472,
    licensePlan: config?.licensePlan || 'Plan Comercial Pro'
  });
  const [configSaveMsg, setConfigSaveMsg] = useState('');

  // Formulario Creación de Nuevo Comercio para Cliente (Vender App)
  const [newTenantForm, setNewTenantForm] = useState({
    storeName: '',
    tagline: '',
    phone: '',
    address: '',
    currencySymbol: '$',
    lat: -34.5932,
    lng: -60.9472,
    adminPassword: '',
    licensePlan: 'Plan Mensual ($15.000 / mes)'
  });

  // Filtros y Respaldos
  const [orderFilter, setOrderFilter] = useState('Todos');
  const [backupMessage, setBackupMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

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
    
    const passwordHash = await hashPassword(newDriver.password);

    const createdDriver = {
      id: 'drv_' + Date.now(),
      name: newDriver.name,
      phone: newDriver.phone,
      vehicle: newDriver.vehicle || 'Vehículo Particular',
      status: 'Disponible',
      passwordHash,
      lat: (config?.baseCoords?.lat || -34.5932) + (Math.random() - 0.5) * 0.02,
      lng: (config?.baseCoords?.lng || -60.9472) + (Math.random() - 0.5) * 0.02
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
      lat: (config?.baseCoords?.lat || -34.5932) + (Math.random() - 0.5) * 0.03,
      lng: (config?.baseCoords?.lng || -60.9472) + (Math.random() - 0.5) * 0.03,
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
      lat: config?.baseCoords?.lat || -34.5932,
      lng: config?.baseCoords?.lng || -60.9472,
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

  // --- SAAS: GUARDAR CONFIGURACIÓN DE MARCA DEL COMERCIO ---
  const handleSaveStoreConfig = (e) => {
    e.preventDefault();
    const updatedConfig = {
      ...config,
      storeName: storeForm.storeName,
      tagline: storeForm.tagline,
      phone: storeForm.phone,
      address: storeForm.address,
      currencySymbol: storeForm.currencySymbol,
      baseCoords: { lat: parseFloat(storeForm.lat), lng: parseFloat(storeForm.lng) },
      licensePlan: storeForm.licensePlan
    };

    onSaveConfig(updatedConfig);
    setConfigSaveMsg('¡Configuración de marca y comercio guardada exitosamente!');
    setTimeout(() => setConfigSaveMsg(''), 3000);
  };

  // --- SAAS: CREAR Y EXPORTAR INSTANCIA PARA UN NUEVO CLIENTE ---
  const handleCreateNewTenantClient = async (e) => {
    e.preventDefault();
    if (!newTenantForm.storeName || !newTenantForm.adminPassword) return;

    if (window.confirm(`¿Crear e instalar la aplicación para el nuevo cliente "${newTenantForm.storeName}"?`)) {
      const newConfig = await createTenantConfig(newTenantForm);
      onSaveConfig(newConfig);
      if (onReloadFullSystem) onReloadFullSystem();

      alert(`¡Instancia creada con éxito para ${newTenantForm.storeName}! Se ha reconfigurado el sistema con el nuevo comercio.`);
      setNewTenantForm({
        storeName: '',
        tagline: '',
        phone: '',
        address: '',
        currencySymbol: '$',
        lat: -34.5932,
        lng: -60.9472,
        adminPassword: '',
        licensePlan: 'Plan Mensual ($15.000 / mes)'
      });
      window.location.reload();
    }
  };

  // --- BACKUP & RESTAURACIÓN ---
  const handleDownloadBackup = () => {
    try {
      const backupObj = exportFullBackup();
      const jsonString = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${config?.storeName?.toLowerCase().replace(/\s+/g, '_')}_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBackupMessage({ type: 'success', text: 'Copia de seguridad descargada exitosamente en formato JSON.' });
    } catch (err) {
      setBackupMessage({ type: 'error', text: 'Error al generar la copia de seguridad: ' + err.message });
    }
  };

  const handleRestoreBackupFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        importFullBackup(parsed);
        setBackupMessage({ type: 'success', text: '¡Sistema restaurado con éxito desde la copia de seguridad!' });
        if (onReloadFullSystem) onReloadFullSystem();
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        setBackupMessage({ type: 'error', text: 'Error al restaurar: El archivo no tiene un formato válido.' });
      }
    };
    reader.readAsText(file);
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
            {config?.storeName || 'Comercio'} - Ingresa tu contraseña de administrador.
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
        </div>
      </div>
    );
  }

  // Filtrado de pedidos
  const filteredOrders = orderFilter === 'Todos' 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  // Marcadores de Mapa
  const baseLat = config?.baseCoords?.lat || -34.5932;
  const baseLng = config?.baseCoords?.lng || -60.9472;

  const mapMarkers = [
    { type: 'store', lat: baseLat, lng: baseLng, title: `${config?.storeName || 'Comercio'} (Local Base)` },
    ...drivers.map(d => ({ type: 'driver', lat: d.lat, lng: d.lng, title: `Repartidor: ${d.name}`, popup: `Tel: ${d.phone} | Estado: ${d.status}` })),
    ...orders.map(o => ({ type: 'customer', lat: o.lat, lng: o.lng, title: `Pedido ${o.id}: ${o.customerName}`, popup: `${o.address} | Status: ${o.status}` }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Admin Top Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', padding: '0.6rem', borderRadius: '10px' }}>
            <Store style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{config?.storeName || 'Panel Administrador'}</h2>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              {config?.licensePlan || 'Licencia Comercial Activa'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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

        <button
          className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          💾 Respaldos
        </button>

        <button
          className={`tab-btn ${activeTab === 'saas' ? 'active' : ''}`}
          onClick={() => setActiveTab('saas')}
        >
          💼 Vender App / Configurar Comercio
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
                      placeholder="Ej: Av. San Martín 450"
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
                        <option key={p.id} value={p.id}>{p.name} - {config?.currencySymbol || '$'}{p.price}</option>
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
                              <strong style={{ marginRight: '0.75rem' }}>{config?.currencySymbol || '$'}{item.quantity * item.unitPrice}</strong>
                              <button type="button" onClick={() => handleRemoveItemFromNewOrder(item.productId)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div style={{ textAlign: 'right', marginTop: '0.5rem', fontWeight: 700, color: '#10b981' }}>
                        Total: {config?.currencySymbol || '$'}{newOrder.items.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0)}
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

          <div className="grid-2">
            {filteredOrders.map(order => {
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

                  <div style={{ background: '#0f172a', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    {order.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                        <span>{it.quantity}x {it.name}</span>
                        <span>{config?.currencySymbol || '$'}{it.quantity * it.unitPrice}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.4rem', paddingTop: '0.4rem', fontWeight: 700, textAlign: 'right', color: '#10b981', fontSize: '0.9rem' }}>
                      Total: {config?.currencySymbol || '$'}{order.total}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span className="form-label" style={{ fontSize: '0.7rem' }}>Repartidor:</span>
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a 
                      href={generateOrderWhatsAppLink(order, driver, config)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{ background: '#25D366', color: '#fff', fontWeight: 700 }}
                    >
                      <MessageSquare style={{ width: 14, height: 14 }} />
                      <span>Notificar por WhatsApp</span>
                    </a>

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
                    <label className="form-label">Precio ({config?.currencySymbol || '$'})</label>
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
                    placeholder="Ej: Elaborado artesanalmente"
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
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>{config?.currencySymbol || '$'}{prod.price}</span>
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Mapa de Entregas - {config?.storeName || 'Comercio'}</h3>
          <DeliveryMap markers={mapMarkers} center={{ lat: baseLat, lng: baseLng }} zoom={13} />
        </div>
      )}

      {/* TAB 5: BACKUP & RESTAURACIÓN */}
      {activeTab === 'backup' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', padding: '0.6rem', borderRadius: '12px' }}>
                <Database style={{ width: 28, height: 28 }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Copias de Seguridad y Restauración Completa</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Exporta e importa la base de datos completa de este comercio.
                </p>
              </div>
            </div>

            {backupMessage.text && (
              <div style={{ 
                background: backupMessage.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                border: backupMessage.type === 'success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                color: backupMessage.type === 'success' ? '#10b981' : '#ef4444',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem'
              }}>
                {backupMessage.text}
              </div>
            )}

            <div className="grid-2" style={{ gap: '1.5rem' }}>
              <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#10b981' }}>
                  <Download style={{ width: 20, height: 20 }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Descargar Backup</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                  Genera un archivo `.json` con todos los repartidores, pedidos y productos para respaldo.
                </p>
                <button className="btn btn-success" style={{ width: '100%' }} onClick={handleDownloadBackup}>
                  <Download style={{ width: 18, height: 18 }} />
                  <span>Descargar Backup (.JSON)</span>
                </button>
              </div>

              <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#6366f1' }}>
                  <Upload style={{ width: 20, height: 20 }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Restaurar Backup</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                  Carga un archivo `.json` para restaurar el sistema.
                </p>
                
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  onChange={handleRestoreBackupFile} 
                  style={{ display: 'none' }} 
                />

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }} 
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <Upload style={{ width: 18, height: 18 }} />
                  <span>Cargar y Restaurar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MÓDULO COMERCIAL & VENDER APP A OTROS COMERCIOS (SaaS) */}
      {activeTab === 'saas' && (
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Formulario 1: Editar Marca de Mi Comercio */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.6rem', borderRadius: '12px' }}>
                <Store style={{ width: 28, height: 28 }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Personalización de Marca del Comercio (White-Label)</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Personaliza el nombre, eslogan, moneda y ubicación base para este negocio.
                </p>
              </div>
            </div>

            {configSaveMsg && (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                {configSaveMsg}
              </div>
            )}

            <form onSubmit={handleSaveStoreConfig}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nombre del Comercio / Negocio</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Pizzería Don Juan, Heladería Saverio, Yogur Griego"
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Eslogan / Rubro</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Lácteos & Postres Artesanales"
                    value={storeForm.tagline}
                    onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Teléfono de Contacto</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: 2364-551122"
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Símbolo de Moneda</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: $, USD, EUR"
                    value={storeForm.currencySymbol}
                    onChange={(e) => setStoreForm({ ...storeForm, currencySymbol: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Latitud de Ciudad/Comercio</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={storeForm.lat}
                    onChange={(e) => setStoreForm({ ...storeForm, lat: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Longitud de Ciudad/Comercio</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={storeForm.lng}
                    onChange={(e) => setStoreForm({ ...storeForm, lng: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Plan de Licencia Asignado</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Plan Anual $25.000 / mes"
                  value={storeForm.licensePlan}
                  onChange={(e) => setStoreForm({ ...storeForm, licensePlan: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-success">
                  Guardar Datos de Marca
                </button>
              </div>
            </form>
          </div>

          {/* Formulario 2: Asistente para Vender e Instalar la App a un NUEVO CLIENTE */}
          <div className="card" style={{ padding: '2rem', border: '1px solid rgba(99,102,241,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #6366f1, #10b981)', color: '#fff', padding: '0.6rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                <Award style={{ width: 28, height: 28 }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🪄 Asistente para Vender a un Nuevo Cliente</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Crea e inicializa una aplicación limpia pre-configurada para un nuevo dueño de comercio con su cobro/tarifa.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNewTenantClient}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nombre del Nuevo Comercio Cliente</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Rotisería El Sol, Panadería Junín"
                    value={newTenantForm.storeName}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, storeName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Eslogan del Comercio Cliente</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Envío a Domicilio Rápido"
                    value={newTenantForm.tagline}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, tagline: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Contraseña Inicial de Admin para el Cliente</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Clave inicial para el dueño (ej: cliente2026)"
                    value={newTenantForm.adminPassword}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, adminPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tarifa / Precio a Cobrar Definido por Ti</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: $20.000 / mes o Pago Único $150.000"
                    value={newTenantForm.licensePlan}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, licensePlan: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', margin: '1rem 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                💡 <strong>¿Cómo entregas la app a tu cliente?</strong><br/>
                Al hacer clic en <strong>"Crear Instancia para Nuevo Cliente"</strong>, la aplicación se configurará a nombre de su negocio. Puedes entregarle el link directo o exportarle su copia de seguridad pre-cargada.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  <Sparkles style={{ width: 18, height: 18 }} />
                  <span>Crear Instancia para Nuevo Cliente</span>
                </button>
              </div>
            </form>
          </div>

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
