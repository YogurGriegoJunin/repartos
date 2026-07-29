import React, { useState } from 'react';
import { KeyRound, Lock, CheckCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { hashPassword, verifyPassword } from '../services/crypto.js';

export default function PasswordModal({ 
  isOpen, 
  onClose, 
  title, 
  targetUser, 
  onSavePassword 
}) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    // Limpiar campos de memoria por seguridad
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!newPass || newPass.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Verificar contraseña actual si la requiere
    if (targetUser?.currentHash) {
      const isValid = await verifyPassword(currentPass, targetUser.currentHash);
      if (!isValid) {
        setError('La contraseña actual es incorrecta.');
        return;
      }
    }

    setLoading(true);
    try {
      // Generar Hash criptográfico SHA-256 no reversible
      const newHash = await hashPassword(newPass);
      
      await onSavePassword(newHash, targetUser);
      
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      setError('Error al encriptar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.5rem', borderRadius: '8px', color: '#6366f1' }}>
              <ShieldCheck style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title || 'Cambiar Contraseña'}</h3>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                🔒 Máxima Seguridad Criptográfica (SHA-256)
              </span>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: '#ef4444', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            fontSize: '0.85rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <AlertCircle style={{ width: 18, height: 18 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.15)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            color: '#10b981', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            fontSize: '0.85rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle style={{ width: 18, height: 18 }} />
            <span>Contraseña encriptada y guardada como hash seguro.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {targetUser?.currentHash && (
            <div className="form-group">
              <label className="form-label">Contraseña Actual</label>
              <input
                type="password"
                className="form-input"
                placeholder="Ingresa clave actual..."
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nueva Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="Ingresa nueva contraseña..."
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="Repite la nueva contraseña..."
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
            />
          </div>

          <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
            🔒 La nueva contraseña será procesada mediante un algoritmo unidireccional SHA-256. Nunca se almacenará ni podrá leerse en texto plano desde el código o el navegador.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Encriptando...' : 'Guardar Hash Seguro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
