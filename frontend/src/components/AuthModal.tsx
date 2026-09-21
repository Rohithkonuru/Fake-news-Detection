import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const { user } = await authService.register(username.trim(), email.trim(), password);
        onSuccess(user);
        onClose();
      } else {
        const { user } = await authService.login(email.trim() || username.trim(), password);
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.25rem',
          background: '#ffffff',
          position: 'relative',
          boxShadow: 'var(--shadow-glass-intense)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'var(--primary-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '0.75rem'
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            {isRegister ? 'Join TruthLens Intelligence' : 'Sign In to TruthLens'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isRegister ? 'Create an account to save claim verifications' : 'Access your personalized verification history and analytics'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 'var(--radius-full)', padding: '0.25rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: !isRegister ? '#ffffff' : 'transparent',
              color: !isRegister ? 'var(--primary-700)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: !isRegister ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: isRegister ? '#ffffff' : 'transparent',
              color: isRegister ? 'var(--primary-700)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: isRegister ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-sm)', color: '#b91c1c', fontSize: '0.82rem', marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex_researcher"
                  className="glass-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              {isRegister ? 'Email Address' : 'Email or Username'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type={isRegister ? 'email' : 'text'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRegister ? 'alex@example.com' : 'Enter email or username'}
                className="glass-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {isLoading ? 'Processing...' : isRegister ? 'Create Free Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
