import React from 'react';
import { ExternalLink, CheckCircle2, XCircle, HelpCircle, Calendar, Globe, Building2, GraduationCap, ShieldCheck } from 'lucide-react';
import type { EvidenceSource, SourceCategoryType } from '../types';

interface EvidenceCardProps {
  source: EvidenceSource;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ source }) => {
  const getSourceIcon = (category: SourceCategoryType) => {
    switch (category) {
      case 'Government / Official':
        return <Building2 size={13} color="#2563eb" />;
      case 'Scientific / Academic':
        return <GraduationCap size={13} color="#7c3aed" />;
      case 'Fact-checking organization':
        return <ShieldCheck size={13} color="#059669" />;
      case 'Established News':
        return <Globe size={13} color="#0284c7" />;
      default:
        return <Globe size={13} color="#64748b" />;
    }
  };

  const getSourceBadgeClass = (category: SourceCategoryType) => {
    switch (category) {
      case 'Government / Official': return 'badge-source gov';
      case 'Scientific / Academic': return 'badge-source academic';
      case 'Fact-checking organization': return 'badge-source factcheck';
      case 'Established News': return 'badge-source news';
      default: return 'badge-source';
    }
  };

  const getStanceBadge = (stance: string) => {
    if (stance === 'SUPPORTS') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)' }}>
          <CheckCircle2 size={13} /> Corroborates
        </span>
      );
    }
    if (stance === 'CONTRADICTS') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', background: 'rgba(239, 68, 68, 0.1)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)' }}>
          <XCircle size={13} /> Contradicts / Refutes
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569', background: 'rgba(100, 116, 139, 0.1)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)' }}>
        <HelpCircle size={13} /> Contextual Mention
      </span>
    );
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
      <div>
        {/* Header Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className={getSourceBadgeClass(source.source_type)}>
            {getSourceIcon(source.source_type)}
            <span>{source.source_type}</span>
          </div>
          {getStanceBadge(source.stance)}
        </div>

        {/* Source Title */}
        <h4 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {source.title}
        </h4>

        {/* Evidence Snippet */}
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem', background: 'rgba(248, 250, 252, 0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #f1f5f9' }}>
          "{source.snippet}"
        </p>
      </div>

      {/* Footer Info & Clickable Link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{source.source_name}</span>
          {source.published_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} /> {source.published_date}
            </span>
          )}
        </div>

        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: 'var(--primary-600)',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.82rem',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(99, 102, 241, 0.08)'
          }}
        >
          <span>View Source</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};
