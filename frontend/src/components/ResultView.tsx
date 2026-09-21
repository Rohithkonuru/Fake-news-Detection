import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Share2,
  RotateCcw,
  ExternalLink,
  Cpu,
  ShieldAlert,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import type { FullVerificationResponse, ClaimVerificationResult, VerdictType, EvidenceStrengthType } from '../types';
import { EvidenceCard } from './EvidenceCard';

interface ResultViewProps {
  result: FullVerificationResponse;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onReset }) => {
  const [selectedClaimIndex, setSelectedClaimIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const activeClaim: ClaimVerificationResult | undefined =
    result.claims[selectedClaimIndex] || result.claims[0];

  const getVerdictBadge = (verdict: VerdictType) => {
    switch (verdict) {
      case 'SUPPORTED':
        return (
          <div className="badge-verdict supported" style={{ fontSize: '1.05rem', padding: '0.5rem 1.25rem' }}>
            <CheckCircle2 size={20} />
            <span>SUPPORTED</span>
          </div>
        );
      case 'CONTRADICTED':
        return (
          <div className="badge-verdict contradicted" style={{ fontSize: '1.05rem', padding: '0.5rem 1.25rem' }}>
            <XCircle size={20} />
            <span>CONTRADICTED</span>
          </div>
        );
      case 'MISLEADING / MISSING CONTEXT':
        return (
          <div className="badge-verdict misleading" style={{ fontSize: '1.05rem', padding: '0.5rem 1.25rem' }}>
            <AlertTriangle size={20} />
            <span>MISLEADING / MISSING CONTEXT</span>
          </div>
        );
      case 'UNVERIFIED':
      default:
        return (
          <div className="badge-verdict unverified" style={{ fontSize: '1.05rem', padding: '0.5rem 1.25rem' }}>
            <HelpCircle size={20} />
            <span>UNVERIFIED</span>
          </div>
        );
    }
  };

  const getStrengthBadge = (strength: EvidenceStrengthType) => {
    const colors: Record<EvidenceStrengthType, { text: string; bg: string }> = {
      HIGH: { text: '#047857', bg: 'rgba(16, 185, 129, 0.15)' },
      MODERATE: { text: '#2563eb', bg: 'rgba(59, 130, 246, 0.15)' },
      LOW: { text: '#b45309', bg: 'rgba(245, 158, 11, 0.15)' },
      INSUFFICIENT: { text: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
    };
    const c = colors[strength] || colors.INSUFFICIENT;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>
        <span style={{ color: 'var(--text-muted)' }}>Evidence Strength:</span>
        <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', background: c.bg, color: c.text }}>
          {strength}
        </span>
      </div>
    );
  };

  const copyReportLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Demo Notice Banner if active */}
      {result.is_demo && (
        <div className="demo-banner">
          <Info size={20} />
          <div>
            <strong>Demonstration Example:</strong> This is a certified reference case for training and evaluation. Results are based on verifiable benchmarks.
          </div>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Verification Determination
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {getVerdictBadge(result.overall_verdict)}
              {getStrengthBadge(result.overall_evidence_strength)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={copyReportLink} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Share2 size={15} /> {copied ? 'Copied!' : 'Share Report'}
            </button>
            <button onClick={onReset} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              <RotateCcw size={15} /> Verify Another
            </button>
          </div>
        </div>

        {/* Target Subject / Headline */}
        <div style={{ background: 'rgba(248, 250, 252, 0.85)', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Target Input Analyzed
          </div>
          <p style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {result.extracted_title || result.original_input}
          </p>
        </div>

        {/* AI Synthesis Analysis */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="var(--primary-600)" /> AI Evidence-Based Analysis
          </h4>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {result.overall_explanation}
          </p>
        </div>
      </div>

      {/* Multi-Claim Breakdown (if 2 or more claims) */}
      {result.claims.length > 1 && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layers size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Claim Breakdown ({result.claims.length} Extracted Claims)
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Each factual assertion was independently cross-referenced against external databases. Select a claim to inspect its dedicated evidence:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.claims.map((claim, idx) => {
              const isSelected = idx === selectedClaimIndex;
              return (
                <div
                  key={claim.claim_id}
                  onClick={() => setSelectedClaimIndex(idx)}
                  className="glass-card"
                  style={{
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: isSelected ? '2px solid var(--primary-500)' : '1px solid var(--border-glass)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-glass-card)',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: isSelected ? 'var(--primary-600)' : '#e2e8f0', color: isSelected ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {claim.claim_text}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge-verdict ${claim.verdict.toLowerCase().replace(/[^a-z]/g, '')}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                      {claim.verdict}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {claim.evidence_sources.length} sources
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Claim Details & Evidence */}
      {activeClaim && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Claim Header */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--primary-600)' }}>
                Evaluating Claim {selectedClaimIndex + 1} of {result.claims.length}
              </span>
              <span className={`badge-verdict ${activeClaim.verdict.toLowerCase().replace(/[^a-z]/g, '')}`}>
                {activeClaim.verdict}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              "{activeClaim.claim_text}"
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {activeClaim.explanation}
            </p>
          </div>

          {/* External Fact-Checks (if found) */}
          {activeClaim.fact_checks.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ShieldAlert size={18} color="#059669" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  External Fact-Checker Archives
                </h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                The following evaluations were performed independently by accredited fact-checking agencies:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {activeClaim.fact_checks.map((fc, i) => (
                  <div key={i} className="glass-card" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.9)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{fc.publisher}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c', fontWeight: 700 }}>
                        {fc.external_rating}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                      Claim evaluated: "{fc.original_claim}"
                    </p>
                    <a href={fc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
                      <span>View Fact-Check</span> <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retrieved Evidence Sources */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Retrieved External Evidence ({activeClaim.evidence_sources.length} Sources)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Live evidence retrieved across scientific journals, government portals, accredited wires, and encyclopedias.
                </p>
              </div>
            </div>

            {activeClaim.evidence_sources.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <HelpCircle size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>No conclusive evidence found for this claim across external databases.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  TruthLens does not invent or assume falsity when sources are absent.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {activeClaim.evidence_sources.map((source, sIdx) => (
                  <EvidenceCard key={sIdx} source={source} />
                ))}
              </div>
            )}
          </div>

          {/* ML Pattern Signal */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-500)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={18} color="var(--primary-600)" />
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ML Pattern Signal
                </h4>
                <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-700)', fontWeight: 600 }}>
                  {activeClaim.ml_signal.pattern_signal}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Signal Confidence: {activeClaim.ml_signal.confidence}
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {activeClaim.ml_signal.disclaimer}
            </p>

            {/* Pattern probability meter */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem', fontWeight: 600 }}>
                <span>Misinformation Style Metric</span>
                <span>{(activeClaim.ml_signal.misinformation_pattern_probability * 100).toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${activeClaim.ml_signal.misinformation_pattern_probability * 100}%`,
                    height: '100%',
                    background: activeClaim.ml_signal.misinformation_pattern_probability > 0.6 ? '#ef4444' : '#10b981',
                    borderRadius: '3px'
                  }}
                />
              </div>
            </div>

            {/* Indicative Terms */}
            {activeClaim.ml_signal.indicative_terms.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Key Vocabulary Influences:</span>
                {activeClaim.ml_signal.indicative_terms.map((term, tIdx) => (
                  <span key={tIdx} style={{ padding: '0.15rem 0.45rem', background: '#f1f5f9', borderRadius: '4px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {term}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
