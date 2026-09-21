import React from 'react';
import { Check, Loader2, Circle } from 'lucide-react';
import type { StreamStage } from '../types';

interface ProgressStagesProps {
  currentStage: StreamStage;
  message: string;
  progressPercentage: number;
}

const STAGES = [
  { key: 'READING_CONTENT', label: 'Reading Content & Safety Check' },
  { key: 'EXTRACTING_CLAIMS', label: 'Extracting Factual Claims' },
  { key: 'SEARCHING_EVIDENCE', label: 'Searching Live Evidence & Fact-Checks' },
  { key: 'COMPARING_SOURCES', label: 'Comparing Sources & Stance Alignment' },
  { key: 'GENERATING_EXPLANATION', label: 'Synthesizing Transparent Verdict' },
];

export const ProgressStages: React.FC<ProgressStagesProps> = ({
  currentStage,
  message,
  progressPercentage
}) => {
  const getStageIndex = (stage: StreamStage): number => {
    switch (stage) {
      case 'READING_CONTENT': return 0;
      case 'EXTRACTING_CLAIMS': return 1;
      case 'SEARCHING_EVIDENCE': return 2;
      case 'COMPARING_SOURCES': return 3;
      case 'GENERATING_EXPLANATION': return 4;
      case 'COMPLETE': return 5;
      default: return 0;
    }
  };

  const activeIndex = getStageIndex(currentStage);

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '720px', margin: '2rem auto', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Investigation in Progress
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Executing live verification pipeline via TruthLens Server-Sent Events
          </p>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-600)' }}>
          {progressPercentage}%
        </div>
      </div>

      {/* Glowing Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.75rem', position: 'relative' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercentage}%`,
            background: 'var(--primary-gradient)',
            borderRadius: '4px',
            transition: 'width 300ms ease-out',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)'
          }}
        />
      </div>

      {/* Real-time Stage Sequence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {STAGES.map((s, idx) => {
          const isCompleted = activeIndex > idx || currentStage === 'COMPLETE';
          const isCurrent = activeIndex === idx && currentStage !== 'COMPLETE';

          return (
            <div
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: isCurrent ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                border: isCurrent ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted ? '#10b981' : isCurrent ? 'var(--primary-600)' : '#e2e8f0',
                  color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  boxShadow: isCurrent ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none'
                }}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : isCurrent ? (
                  <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Circle size={10} fill="currentColor" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                    color: isCurrent ? 'var(--primary-700)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  {s.label}
                </span>
                {isCurrent && message && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
