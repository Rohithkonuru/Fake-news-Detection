import React from 'react';
import { ShieldCheck, BookOpen, Lock, Cpu } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'landing' | 'workspace' | 'dashboard' | 'how-it-works') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer style={{ marginTop: '5rem', borderTop: '1px solid rgba(226, 232, 240, 0.8)', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(16px)', padding: '3.5rem 0 2rem 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <ShieldCheck size={20} />
              </div>
              <span className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                TruthLens
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '300px' }}>
              Next-generation AI claim verification and evidence retrieval laboratory. Dissecting assertions with transparent source attribution.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <li>
                <button onClick={() => onNavigate('workspace')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}>
                  Verification Workspace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}>
                  Analytics & History
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}>
                  Methodology & Stance Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Technology Stack</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.78rem' }}>
              {['React 19', 'TypeScript', 'FastAPI', 'Python 3.14', 'Scikit-Learn', 'TF-IDF', 'MongoDB 8.2', 'SSRF Guard'].map((tech) => (
                <span key={tech} style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(241, 245, 249, 0.85)', border: '1px solid #e2e8f0', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Standards & Security */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Integrity & Security</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={15} color="#10b981" />
                <span>SSRF Protected URL Extraction</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={15} color="#6366f1" />
                <span>Zero Synthetic Evidence Policy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={15} color="#8b5cf6" />
                <span>Open Fact-Check Registry Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsible AI Disclaimer Alert */}
        <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(238, 242, 255, 0.65)', border: '1px solid rgba(199, 210, 254, 0.8)', fontSize: '0.82rem', color: '#3730a3', lineHeight: 1.5, marginBottom: '2rem' }}>
          <strong>Responsible AI Notice:</strong> TruthLens does not establish absolute mathematical truth. It provides evidence-based claim analysis using available sources, fact-checks, retrieval methods, and machine-learning signals. Final interpretation should always be exercised alongside primary source documentation.
        </div>

        {/* Bottom Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} TruthLens System. Built for verifiable journalism and public intelligence.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>API Docs (/docs)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
