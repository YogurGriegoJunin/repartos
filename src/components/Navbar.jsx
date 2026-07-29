import React from 'react';
import { ShieldCheck, Truck, Search, ShoppingBag, Store } from 'lucide-react';

export default function Navbar({ activeRole, setActiveRole, config }) {
  const storeName = config?.storeName || 'Yogur Griego Junín';
  const tagline = config?.tagline || 'Sistema de Repartos & Logística';

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo & Name dinámicos por comercio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #10b981)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            <Store style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(90deg, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {storeName}
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              {tagline}
            </span>
          </div>
        </div>

        {/* Selector de Vistas / Roles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          
          <button
            onClick={() => setActiveRole('admin')}
            className={`btn btn-sm ${activeRole === 'admin' ? 'btn-primary' : ''}`}
            style={{ background: activeRole === 'admin' ? undefined : 'transparent', color: activeRole === 'admin' ? undefined : '#94a3b8' }}
          >
            <ShieldCheck style={{ width: 16, height: 16 }} />
            <span>Admin</span>
          </button>

          <button
            onClick={() => setActiveRole('driver')}
            className={`btn btn-sm ${activeRole === 'driver' ? 'btn-primary' : ''}`}
            style={{ background: activeRole === 'driver' ? undefined : 'transparent', color: activeRole === 'driver' ? undefined : '#94a3b8' }}
          >
            <Truck style={{ width: 16, height: 16 }} />
            <span>Repartidores</span>
          </button>

          <button
            onClick={() => setActiveRole('customer')}
            className={`btn btn-sm ${activeRole === 'customer' ? 'btn-primary' : ''}`}
            style={{ background: activeRole === 'customer' ? undefined : 'transparent', color: activeRole === 'customer' ? undefined : '#94a3b8' }}
          >
            <Search style={{ width: 16, height: 16 }} />
            <span>Rastreo Cliente</span>
          </button>

        </div>

      </div>
    </header>
  );
}
