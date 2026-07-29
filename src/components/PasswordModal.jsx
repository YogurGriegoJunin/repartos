import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle, AlertCircle, X } from 'lucide-react';
import { hashPassword, verifyPassword } from '../services/crypto.js';

export default function PasswordModal({ 
  isOpen, 
  onClose, 
  title, 
  targetUser, // { type: 'admin' | 'driver', driverId?: string, currentHash?: string }
  onSavePassword 
}) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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

    // Si requiere verificar clave actual (por ejemplo para el Admin)
    if (targetUser?.currentHash) {
      const isValid = await verifyPassword(currentPass, targetUser.currentHash);
      if (!isValid) {
        setError('La contraseña actual es incorrecta.');
        return;
      }
    }

    setLoading(true);
    try {
      // Generar Hash SHA-256 seguro
      const newHash = await hashPassword(newPass);
      
      // Callback para guardar el hash generado
      await onSavePassword(newHash, targetUser);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        onClose();
      }, 1200);
    } catch (err) {
      setError('Error al procesar el hash de la contraseña.');
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
              <KeyRound style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title || 'Cambiar Contraseña'}</h3>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Protegido con encriptación criptográfica SHA-256
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
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
            <span>Contraseña actualizada de forma segura (Haseada).</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {targetUser?.currentHash && (
            <div className="form-group">
              <label className="form-label">Contraseña Actual</label>
              <input
                type={showPass ? 'text' : 'password'}
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
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Ingresa nueva contraseña..."
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {showPass ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Nueva Contraseña</label>
            <input
              type={showPass ? 'text' : 'password'}
              className="form-input"
              placeholder="Repite la nueva contraseña..."
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando Hash...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
