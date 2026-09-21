import { useState, useEffect } from 'react';
import {
  BarChart3,
  Search,
  ArrowRight,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';
import type { AnalyticsStats, FullVerificationResponse, User } from '../types';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { apiService } from '../services/api';

interface DashboardPageProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onSelectReport: (report: FullVerificationResponse) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onOpenAuth,
  onSelectReport
}) => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [history, setHistory] = useState<FullVerificationResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, historyData] = await Promise.all([
        apiService.getAnalyticsStats().catch(() => ({
          total_analyzed: 0,
          supported_count: 0,
          contradicted_count: 0,
          unverified_count: 0,
          misleading_count: 0,
          source_categories: {},
          activity_timeline: []
        })),
        apiService.getHistory(searchQuery, verdictFilter).catch(() => [])
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (e) {
      console.warn('Error loading dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [verdictFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDashboardData();
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1.5rem 0' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            <BarChart3 size={16} /> Intelligence Dashboard
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Analytics & Verification Archive
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            System-wide statistics, evidence source distributions, and historical verification audits.
          </p>
        </div>

        <button onClick={loadDashboardData} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Auth State Banner if Guest */}
      {!currentUser && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'rgba(238, 242, 255, 0.7)', border: '1px solid rgba(199, 210, 254, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#3730a3' }}>You are viewing public verifications</p>
              <p style={{ fontSize: '0.8rem', color: '#4338ca' }}>Sign in to synchronize private verifications to your personal account.</p>
            </div>
          </div>
          <button onClick={onOpenAuth} className="btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
            Sign In / Register
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Total Evaluated
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats.total_analyzed}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Supported Claims
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#047857' }}>
              {stats.supported_count}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Contradicted
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b91c1c' }}>
              {stats.contradicted_count}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f97316' }}>
            <div style={{ fontSize: '0.8rem', color: '#c2410c', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Missing Context
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c2410c' }}>
              {stats.misleading_count}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Unverified
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b45309' }}>
              {stats.unverified_count}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {stats && <AnalyticsChart stats={stats} />}

      {/* Verification History & Filter Table */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Verification History</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Search and filter previously analyzed statements and articles
            </p>
          </div>

          {/* Search and Verdict Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-light)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search claims..."
                className="glass-input"
                style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.85rem', width: '220px' }}
              />
            </form>

            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              className="glass-input"
              style={{ width: 'auto', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem 1rem' }}
            >
              <option value="ALL">All Verdicts</option>
              <option value="SUPPORTED">Supported</option>
              <option value="CONTRADICTED">Contradicted</option>
              <option value="MISLEADING / MISSING CONTEXT">Misleading / Context</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Loading verification records...</p>
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>No verification reports found matching your criteria.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Try modifying your search or submitting a new claim.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {history.map((item) => (
              <div
                key={item.verification_id}
                onClick={() => onSelectReport(item)}
                className="glass-card"
                style={{
                  padding: '1.15rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span className={`badge-verdict ${item.overall_verdict.toLowerCase().replace(/[^a-z]/g, '')}`} style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
                      {item.overall_verdict}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {item.extracted_title || item.original_input}
                  </h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.claims?.length || 1} Claim{(item.claims?.length || 1) > 1 ? 's' : ''}
                  </span>
                  <button
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    View Report <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
