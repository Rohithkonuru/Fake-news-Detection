import React, { useState } from 'react';
import { ShieldCheck, Search, BarChart3, HelpCircle, User as UserIcon, LogOut, Menu, X, Sparkles } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  currentTab: 'landing' | 'workspace' | 'dashboard' | 'how-it-works';
  setCurrentTab: (tab: 'landing' | 'workspace' | 'dashboard' | 'how-it-works') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <nav className="glass-nav" aria-label="Main Navigation">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <div
          onClick={() => { setCurrentTab('landing'); setMobileMenuOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            <ShieldCheck size={26} strokeWidth={2.2} />
          </div>
          <div>
            <span className="brand-font" style={{ fontSize: '1.4rem', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TruthLens
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Intelligence Lab
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-links">
          <button
            onClick={() => setCurrentTab('landing')}
            style={{
              background: currentTab === 'landing' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: currentTab === 'landing' ? 'var(--primary-600)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={16} /> Home
          </button>

          <button
            onClick={() => setCurrentTab('workspace')}
            style={{
              background: currentTab === 'workspace' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: currentTab === 'workspace' ? 'var(--primary-600)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Search size={16} /> Workspace
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            style={{
              background: currentTab === 'dashboard' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: currentTab === 'dashboard' ? 'var(--primary-600)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={16} /> Analytics & History
          </button>

          <button
            onClick={() => setCurrentTab('how-it-works')}
            style={{
              background: currentTab === 'how-it-works' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: currentTab === 'how-it-works' ? 'var(--primary-600)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <HelpCircle size={16} /> Methodology
          </button>
        </div>

        {/* Action Controls / User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.9rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid var(--border-glass-subtle)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={16} />
                </div>
                <span>{currentUser.username}</span>
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '210px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass-subtle)',
                    boxShadow: 'var(--shadow-glass-hover)',
                    padding: '0.5rem',
                    zIndex: 200
                  }}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.username}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => { setCurrentTab('dashboard'); setUserDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <BarChart3 size={16} /> My Dashboard
                  </button>
                  <button
                    onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: '#dc2626'
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
              Sign In
            </button>
          )}

          <button
            onClick={() => setCurrentTab('workspace')}
            className="btn-primary"
            style={{ padding: '0.55rem 1.35rem', fontSize: '0.9rem' }}
          >
            Verify Claim
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              padding: '0.4rem',
              cursor: 'pointer'
            }}
            className="mobile-menu-btn"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ background: '#ffffff', padding: '1rem', borderBottom: '1px solid var(--border-glass-subtle)' }} className="mobile-drawer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => { setCurrentTab('landing'); setMobileMenuOpen(false); }}
              style={{ textAlign: 'left', padding: '0.75rem', background: 'none', border: 'none', fontWeight: 600 }}
            >
              Home
            </button>
            <button
              onClick={() => { setCurrentTab('workspace'); setMobileMenuOpen(false); }}
              style={{ textAlign: 'left', padding: '0.75rem', background: 'none', border: 'none', fontWeight: 600 }}
            >
              Workspace
            </button>
            <button
              onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
              style={{ textAlign: 'left', padding: '0.75rem', background: 'none', border: 'none', fontWeight: 600 }}
            >
              Analytics & History
            </button>
            <button
              onClick={() => { setCurrentTab('how-it-works'); setMobileMenuOpen(false); }}
              style={{ textAlign: 'left', padding: '0.75rem', background: 'none', border: 'none', fontWeight: 600 }}
            >
              Methodology
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-links { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
};
