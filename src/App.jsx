import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import DriverPanel from './components/DriverPanel.jsx';
import CustomerTracking from './components/CustomerTracking.jsx';
import { 
  initializeStorage, 
  getDrivers, 
  getProducts, 
  getOrders, 
  getAdminHash,
  getConfig,
  saveDrivers, 
  saveProducts, 
  saveOrders, 
  saveAdminHash,
  saveConfig
} from './services/storage.js';

export default function App() {
  const [activeRole, setActiveRole] = useState('admin'); // 'admin' | 'driver' | 'customer'
  const [isReady, setIsReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [drivers, setDriversState] = useState([]);
  const [products, setProductsState] = useState([]);
  const [orders, setOrdersState] = useState([]);
  const [adminHash, setAdminHashState] = useState('');
  const [config, setConfigState] = useState({});

  // Inicialización de Almacenamiento Local y Semillas
  useEffect(() => {
    async function loadData() {
      try {
        await initializeStorage();
        setDriversState(getDrivers());
        setProductsState(getProducts());
        setOrdersState(getOrders());
        setAdminHashState(getAdminHash());
        setConfigState(getConfig());
      } catch (err) {
        console.error("Error al inicializar almacenamiento:", err);
        setErrorMsg("Error inicializando datos locales: " + err.message);
      } finally {
        setIsReady(true);
      }
    }
    loadData();
  }, []);

  const handleSaveDrivers = (updatedDrivers) => {
    setDriversState(updatedDrivers);
    saveDrivers(updatedDrivers);
  };

  const handleSaveProducts = (updatedProducts) => {
    setProductsState(updatedProducts);
    saveProducts(updatedProducts);
  };

  const handleSaveOrders = (updatedOrders) => {
    setOrdersState(updatedOrders);
    saveOrders(updatedOrders);
  };

  const handleSaveAdminHash = (newHash) => {
    setAdminHashState(newHash);
    saveAdminHash(newHash);
  };

  const handleSaveConfig = (newConfig) => {
    setConfigState(newConfig);
    saveConfig(newConfig);
  };

  const handleReloadFullSystem = () => {
    setDriversState(getDrivers());
    setProductsState(getProducts());
    setOrdersState(getOrders());
    setAdminHashState(getAdminHash());
    setConfigState(getConfig());
  };

  if (!isReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#94a3b8', padding: '1rem', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #334155', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Cargando Sistema de Repartos...</p>
        <span style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>{config?.storeName || 'Logística Comercial'}</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <Navbar 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
        config={config}
      />

      <main className="app-container">
        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        {activeRole === 'admin' && (
          <AdminPanel
            drivers={drivers}
            products={products}
            orders={orders}
            adminHash={adminHash}
            config={config}
            onSaveDrivers={handleSaveDrivers}
            onSaveProducts={handleSaveProducts}
            onSaveOrders={handleSaveOrders}
            onSaveAdminHash={handleSaveAdminHash}
            onSaveConfig={handleSaveConfig}
            onReloadFullSystem={handleReloadFullSystem}
          />
        )}

        {activeRole === 'driver' && (
          <DriverPanel
            drivers={drivers}
            orders={orders}
            onSaveOrders={handleSaveOrders}
          />
        )}

        {activeRole === 'customer' && (
          <CustomerTracking
            orders={orders}
            drivers={drivers}
          />
        )}
      </main>
    </div>
  );
}
