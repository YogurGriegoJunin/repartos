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
  saveDrivers, 
  saveProducts, 
  saveOrders, 
  saveAdminHash 
} from './services/storage.js';

export default function App() {
  const [activeRole, setActiveRole] = useState('admin'); // 'admin' | 'driver' | 'customer'
  const [isReady, setIsReady] = useState(false);

  const [drivers, setDriversState] = useState([]);
  const [products, setProductsState] = useState([]);
  const [orders, setOrdersState] = useState([]);
  const [adminHash, setAdminHashState] = useState('');

  // Inicialización de Almacenamiento Local y Semillas
  useEffect(() => {
    async function loadData() {
      await initializeStorage();
      setDriversState(getDrivers());
      setProductsState(getProducts());
      setOrdersState(getOrders());
      setAdminHashState(getAdminHash());
      setIsReady(true);
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

  if (!isReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#94a3b8' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cargando sistema de repartos y criptografía...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <Navbar 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
      />

      <main className="app-container">
        {activeRole === 'admin' && (
          <AdminPanel
            drivers={drivers}
            products={products}
            orders={orders}
            adminHash={adminHash}
            onSaveDrivers={handleSaveDrivers}
            onSaveProducts={handleSaveProducts}
            onSaveOrders={handleSaveOrders}
            onSaveAdminHash={handleSaveAdminHash}
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
