import { hashPassword } from './crypto.js';

const STORAGE_KEYS = {
  DRIVERS: 'logistica_drivers_v1',
  PRODUCTS: 'logistica_products_v1',
  ORDERS: 'logistica_orders_v1',
  ADMIN_HASH: 'logistica_admin_hash_v1',
  CONFIG: 'logistica_config_v1'
};

const JUNIN_BASE = { lat: -34.5932, lng: -60.9472 };

// Inicialización de almacenamiento con semillas
export async function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({
      storeName: 'Yogur Griego Junín',
      storeAddress: 'Centro de Distribución Junín',
      baseCoords: JUNIN_BASE
    }));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_HASH)) {
    const initialAdminHash = await hashPassword('admin123');
    localStorage.setItem(STORAGE_KEYS.ADMIN_HASH, initialAdminHash);
  }

  if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
    const defaultDriverHash = await hashPassword('reparto123');
    const defaultDrivers = [
      {
        id: 'drv_1',
        name: 'Carlos Gómez',
        phone: '2364-551122',
        vehicle: 'Moto Honda GLH 150',
        status: 'Disponible',
        passwordHash: defaultDriverHash,
        lat: -34.5935,
        lng: -60.9475
      },
      {
        id: 'drv_2',
        name: 'Lucas Rodríguez',
        phone: '2364-667788',
        vehicle: 'Camioneta Utilitaria',
        status: 'En Ruta',
        passwordHash: defaultDriverHash,
        lat: -34.5880,
        lng: -60.9520
      }
    ];
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(defaultDrivers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    const defaultProducts = [
      {
        id: 'prod_1',
        name: 'Yogur Griego Natural 500g',
        category: 'Lácteos',
        price: 2500,
        stock: 45,
        description: 'Yogur artesanal natural súper cremoso y proteico'
      },
      {
        id: 'prod_2',
        name: 'Yogur Griego Frutos Rojos 500g',
        category: 'Lácteos',
        price: 2800,
        stock: 30,
        description: 'Con colchón de frutal natural artesanal'
      },
      {
        id: 'prod_3',
        name: 'Combo Familiar (4 x 500g)',
        category: 'Combos',
        price: 9500,
        stock: 20,
        description: 'Pack ahorro con variedad de sabores'
      },
      {
        id: 'prod_4',
        name: 'Granola Crocante Miel & Almendras 250g',
        category: 'Toppings',
        price: 1800,
        stock: 50,
        description: 'Granola horneada artesanalmente'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    const defaultOrders = [
      {
        id: 'ORD-1001',
        customerName: 'María Fernández',
        customerPhone: '2364-443322',
        address: 'Av. San Martín 450, Junín',
        lat: -34.5910,
        lng: -60.9450,
        items: [
          { productId: 'prod_1', name: 'Yogur Griego Natural 500g', quantity: 2, unitPrice: 2500 },
          { productId: 'prod_4', name: 'Granola Crocante Miel & Almendras 250g', quantity: 1, unitPrice: 1800 }
        ],
        total: 6800,
        driverId: 'drv_1',
        status: 'En Camino',
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
        notes: 'Timbre 2B - Entregar en mano'
      },
      {
        id: 'ORD-1002',
        customerName: 'Roberto Paz',
        customerPhone: '2364-112233',
        address: 'Rivadavia 120, Junín',
        lat: -34.5970,
        lng: -60.9510,
        items: [
          { productId: 'prod_3', name: 'Combo Familiar (4 x 500g)', quantity: 1, unitPrice: 9500 }
        ],
        total: 9500,
        driverId: 'drv_2',
        status: 'Pendiente',
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
        notes: 'Paga con transferencia'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(defaultOrders));
  }
}

// Getters
export function getDrivers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVERS) || '[]');
}

export function getProducts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
}

export function getOrders() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
}

export function getAdminHash() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_HASH) || '';
}

export function getConfig() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || '{}');
}

// Setters & CRUD
export function saveDrivers(drivers) {
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function saveAdminHash(hash) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_HASH, hash);
}

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

// --- BACKUP & RESTORE DE SISTEMA COMPLETO ---

/**
 * Genera un objeto JSON completo con toda la información del sistema.
 */
export function exportFullBackup() {
  const backupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    appName: 'Yogur Griego Junín - Logística 2027',
    data: {
      drivers: getDrivers(),
      products: getProducts(),
      orders: getOrders(),
      adminHash: getAdminHash(),
      config: getConfig()
    }
  };
  return backupData;
}

/**
 * Restaura una copia de seguridad JSON importada.
 * @param {object} backupObject - Objeto de respaldo des-serializado
 */
export function importFullBackup(backupObject) {
  if (!backupObject || !backupObject.data) {
    throw new Error('El archivo de copia de seguridad no tiene un formato válido.');
  }

  const { drivers, products, orders, adminHash, config } = backupObject.data;

  if (Array.isArray(drivers)) saveDrivers(drivers);
  if (Array.isArray(products)) saveProducts(products);
  if (Array.isArray(orders)) saveOrders(orders);
  if (typeof adminHash === 'string' && adminHash) saveAdminHash(adminHash);
  if (config && typeof config === 'object') saveConfig(config);

  return true;
}
