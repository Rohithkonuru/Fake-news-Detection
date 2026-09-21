import type { AnalyticsStats } from '../types';

interface AnalyticsChartProps {
  stats: AnalyticsStats;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ stats }) => {
  const total = stats.total_analyzed || 1;
  const supportedPct = ((stats.supported_count / total) * 100) || 0;
  const contradictedPct = ((stats.contradicted_count / total) * 100) || 0;
  const unverifiedPct = ((stats.unverified_count / total) * 100) || 0;
  const misleadingPct = ((stats.misleading_count / total) * 100) || 0;

  // Source categories
  const sourceEntries = Object.entries(stats.source_categories || {}).sort((a, b) => b[1] - a[1]);
  const maxSourceCount = Math.max(...sourceEntries.map((e) => e[1]), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
      {/* 1. Verdict Distribution Breakdown */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
          Verdict Distribution
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Statistical outcome across {stats.total_analyzed} evaluated claims & articles
        </p>

        {/* Multi-segment visual progress bar */}
        <div style={{ height: '14px', width: '100%', background: '#f1f5f9', borderRadius: '7px', display: 'flex', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ width: `${supportedPct}%`, background: '#10b981', transition: 'width 0.4s ease' }} title={`Supported: ${supportedPct.toFixed(1)}%`} />
          <div style={{ width: `${contradictedPct}%`, background: '#ef4444', transition: 'width 0.4s ease' }} title={`Contradicted: ${contradictedPct.toFixed(1)}%`} />
          <div style={{ width: `${misleadingPct}%`, background: '#f97316', transition: 'width 0.4s ease' }} title={`Misleading: ${misleadingPct.toFixed(1)}%`} />
          <div style={{ width: `${unverifiedPct}%`, background: '#f59e0b', transition: 'width 0.4s ease' }} title={`Unverified: ${unverifiedPct.toFixed(1)}%`} />
        </div>

        {/* Legend stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supported</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#047857' }}>{stats.supported_count} ({supportedPct.toFixed(0)}%)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contradicted</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#b91c1c' }}>{stats.contradicted_count} ({contradictedPct.toFixed(0)}%)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Misleading</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c2410c' }}>{stats.misleading_count} ({misleadingPct.toFixed(0)}%)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unverified</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#b45309' }}>{stats.unverified_count} ({unverifiedPct.toFixed(0)}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Source Credibility Authority Tiers */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
          Evidence Source Tiers
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Distribution of retrieved reference citations by verified domain authority
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sourceEntries.slice(0, 5).map(([category, count]) => {
            const barPct = Math.round((count / maxSourceCount) * 100);
            return (
              <div key={category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{category}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{count}</span>
                </div>
                <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${barPct}%`,
                      background: 'var(--primary-gradient)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
