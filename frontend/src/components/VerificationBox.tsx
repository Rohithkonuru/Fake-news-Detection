import React, { useState } from 'react';
import { Search, Link, FileText, Sparkles, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface VerificationBoxProps {
  onVerify: (type: 'claim' | 'article' | 'url', content: string) => void;
  onSelectDemo: (demoId: string) => void;
  isLoading: boolean;
  initialContent?: string;
  initialType?: 'claim' | 'article' | 'url';
}

export const VerificationBox: React.FC<VerificationBoxProps> = ({
  onVerify,
  onSelectDemo,
  isLoading,
  initialContent = '',
  initialType = 'claim'
}) => {
  const [activeTab, setActiveTab] = useState<'claim' | 'article' | 'url'>(initialType);
  const [content, setContent] = useState<string>(initialContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;
    onVerify(activeTab, content);
  };

  const placeholders = {
    claim: 'Paste a headline or claim (e.g. "Scientists say drinking coffee prevents cancer and increases lifespan")...',
    article: 'Paste full article text or paragraphs here to extract multiple claims and verify each independently...',
    url: 'Paste a verified news URL (e.g. https://www.reuters.com/... or https://www.nasa.gov/...)...'
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '880px', margin: '0 auto', position: 'relative' }}>
      {/* Input Mode Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('claim'); }}
          style={{
            background: activeTab === 'claim' ? 'var(--primary-100)' : 'transparent',
            color: activeTab === 'claim' ? 'var(--primary-700)' : 'var(--text-secondary)',
            border: 'none',
            padding: '0.55rem 1.1rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Search size={16} /> Enter Claim / Headline
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('article'); }}
          style={{
            background: activeTab === 'article' ? 'var(--primary-100)' : 'transparent',
            color: activeTab === 'article' ? 'var(--primary-700)' : 'var(--text-secondary)',
            border: 'none',
            padding: '0.55rem 1.1rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={16} /> Full Article
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('url'); }}
          style={{
            background: activeTab === 'url' ? 'var(--primary-100)' : 'transparent',
            color: activeTab === 'url' ? 'var(--primary-700)' : 'var(--text-secondary)',
            border: 'none',
            padding: '0.55rem 1.1rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Link size={16} /> News Web URL
        </button>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          {activeTab === 'url' ? (
            <input
              type="url"
              className="glass-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholders.url}
              disabled={isLoading}
              style={{ fontSize: '1.05rem', padding: '1rem 1.25rem' }}
              required
            />
          ) : (
            <textarea
              className="glass-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholders[activeTab]}
              rows={activeTab === 'article' ? 6 : 3}
              disabled={isLoading}
              style={{ fontSize: '1.05rem', resize: 'vertical', lineHeight: 1.5 }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
              required
            />
          )}

          {content && !isLoading && (
            <button
              type="button"
              onClick={() => setContent('')}
              style={{
                position: 'absolute',
                top: '0.85rem',
                right: '0.85rem',
                background: 'rgba(226, 232, 240, 0.7)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}
              title="Clear input"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls & Character Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {content.length} characters {activeTab === 'claim' ? '(Ctrl+Enter to verify)' : ''}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="btn-primary"
              style={{
                padding: '0.8rem 2rem',
                fontSize: '1rem',
                opacity: isLoading || !content.trim() ? 0.6 : 1,
                cursor: isLoading || !content.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Investigating Evidence...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Verify Claim
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Try Example Buttons */}
      <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px dashed rgba(226, 232, 240, 0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Try Certified Examples:
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Demo Mode)</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => onSelectDemo('supported')}
            className="glass-card"
            style={{
              padding: '0.5rem 0.9rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--text-primary)'
            }}
          >
            <CheckCircle2 size={15} color="#10b981" />
            <span>NASA Exoplanet Atmosphere</span>
            <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>🟢 Supported</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectDemo('contradicted')}
            className="glass-card"
            style={{
              padding: '0.5rem 0.9rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--text-primary)'
            }}
          >
            <XCircle size={15} color="#ef4444" />
            <span>Bleach Disinfectant Cure</span>
            <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 700 }}>🔴 Contradicted</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectDemo('misleading')}
            className="glass-card"
            style={{
              padding: '0.5rem 0.9rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              color: 'var(--text-primary)'
            }}
          >
            <AlertTriangle size={15} color="#f97316" />
            <span>Carrots & Superhuman Night Vision</span>
            <span style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 700 }}>🟠 Misleading</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
