import React from 'react';
import { AlertCircle, RefreshCw, KeyRound, CheckCircle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary ha capturado una excepción:", error, errorInfo);
  }

  handleResetStorage = () => {
    if (window.confirm('¿Restablecer la contraseña de administrador a "admin123" y limpiar sesión?')) {
      try {
        localStorage.removeItem('logistica_admin_hash_v1');
        sessionStorage.clear();
      } catch (e) {}
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f8fafc', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', width: 52, height: 52, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertCircle style={{ width: 28, height: 28 }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Aviso de Protección de Datos</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Se detectó una inconsistencia de sesión o clave al ingresar. Puedes recargar la página o restablecer la clave de administrador a la clave por defecto (admin123).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  sessionStorage.clear();
                  window.location.reload();
                }}
              >
                <RefreshCw style={{ width: 16, height: 16 }} />
                <span>Recargar la Aplicación</span>
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={this.handleResetStorage}
                style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
              >
                <KeyRound style={{ width: 16, height: 16, color: '#10b981' }} />
                <span>Restablecer Clave Admin por Defecto (admin123)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
