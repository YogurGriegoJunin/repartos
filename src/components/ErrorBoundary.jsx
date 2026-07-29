import React from 'react';
import { AlertCircle, RefreshCw, KeyRound } from 'lucide-react';

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
    if (window.confirm('¿Restablecer datos locales para recuperar la aplicación?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f8fafc', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ maxWidth: '500px', padding: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', width: 50, height: 50, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertCircle style={{ width: 28, height: 28 }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Se detectó una discrepancia al ingresar</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              La aplicación ha protegido tus datos. Si cambiaste la contraseña recientemente o hubo un desfase de sesión, puedes actualizar o reiniciar.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                <RefreshCw style={{ width: 16, height: 16 }} />
                <span>Recargar la Aplicación</span>
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={this.handleResetStorage}
                style={{ fontSize: '0.8rem' }}
              >
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
