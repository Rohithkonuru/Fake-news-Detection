import { Sparkles, AlertCircle } from 'lucide-react';
import { VerificationBox } from '../components/VerificationBox';
import { ProgressStages } from '../components/ProgressStages';
import { ResultView } from '../components/ResultView';
import type { FullVerificationResponse, StreamStage } from '../types';

interface WorkspacePageProps {
  onVerify: (type: 'claim' | 'article' | 'url', content: string) => void;
  onSelectDemo: (demoId: string) => void;
  isLoading: boolean;
  currentStage: StreamStage;
  stageMessage: string;
  progressPercentage: number;
  verificationResult: FullVerificationResponse | null;
  error: string | null;
  onReset: () => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  onVerify,
  onSelectDemo,
  isLoading,
  currentStage,
  stageMessage,
  progressPercentage,
  verificationResult,
  error,
  onReset
}) => {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 0' }}>
      {/* Header */}
      {!verificationResult && !isLoading && (
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            <Sparkles size={16} /> Factual Verification Engine
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Verification Workspace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Submit a factual claim, paste full article text, or enter a news URL to extract claims, retrieve evidence, and generate transparent verdicts.
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', borderLeft: '4px solid #ef4444', background: '#fef2f2', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#b91c1c' }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>Verification Notice</h4>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{error}</p>
          </div>
          <button onClick={onReset} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* State 1: Input Box (when not loading and no result) */}
      {!isLoading && !verificationResult && (
        <VerificationBox
          onVerify={onVerify}
          onSelectDemo={onSelectDemo}
          isLoading={isLoading}
        />
      )}

      {/* State 2: Live Progress Sequence (while loading) */}
      {isLoading && (
        <ProgressStages
          currentStage={currentStage}
          message={stageMessage}
          progressPercentage={progressPercentage}
        />
      )}

      {/* State 3: Results Dashboard */}
      {verificationResult && (
        <ResultView
          result={verificationResult}
          onReset={onReset}
        />
      )}
    </div>
  );
};
