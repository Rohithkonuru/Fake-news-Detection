import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem', padding: '1.5rem 0' }}>
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
          <ShieldCheck size={16} /> Architectural Framework
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          TruthLens Methodology & Decision Architecture
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto' }}>
          Understanding the deterministic and multi-stage evaluation pipeline behind our claim verification engine.
        </p>
      </div>

      {/* 1. Core Verdict Philosophy */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          1. Verdict Classification Standard
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          TruthLens operates under strict evidentiary standards. A statement is never assigned a binary mathematical certainty or arbitrary "truth percentage." Instead, transparent evidentiary categories are applied:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} color="#059669" />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#047857' }}>🟢 SUPPORTED</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Multiple independent, authoritative sources (such as peer-reviewed scientific journals, government registries, or wire agencies) corroborate the assertion with verifiable facts and data. No credible refutations found.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <XCircle size={18} color="#dc2626" />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#b91c1c' }}>🔴 CONTRADICTED</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Authoritative reports, certified fact-checking organizations (Snopes, PolitiFact, Full Fact), or official public health/science bodies provide direct counter-evidence demonstrating the claim is false or disproven.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f97316' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={18} color="#ea580c" />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#c2410c' }}>🟠 MISLEADING / MISSING CONTEXT</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              The claim contains an element of factual truth or refers to a real occurrence, but exaggerates the scope, removes critical caveats, or selectively quotes out of context in a manner that produces a deceptive impression.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <HelpCircle size={18} color="#d97706" />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#b45309' }}>🟡 UNVERIFIED</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Sufficient credible evidence could not be retrieved from reliable public sources. <strong>Crucial Rule:</strong> Absence of evidence is never converted into a "Fake" or "False" determination.
            </p>
          </div>
        </div>
      </div>

      {/* 2. ML Pattern Signal vs Factual Truth */}
      <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid var(--primary-500)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <Cpu size={22} color="var(--primary-600)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            2. ML Pattern Signal Standard
          </h2>
        </div>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          TruthLens implements a machine learning classifier (TF-IDF sublinear vectorization + regularized Logistic Regression) trained on deceptive and legitimate news corpora.
        </p>
        <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(238, 242, 255, 0.65)', border: '1px solid rgba(199, 210, 254, 0.8)', fontSize: '0.85rem', color: '#3730a3', lineHeight: 1.55 }}>
          <strong>Distinction of Roles:</strong> The ML model evaluates <em>stylistic and linguistic features</em> (e.g., hyperbole, sensationalist buzzwords, excessive capitalization, and exclamation density). It is labeled strictly as an <strong>ML Pattern Signal</strong> and is never presented as proof of factual truth. A headline may be written with sensationalist vocabulary while still being factually true, or written neutrally while being entirely fabricated. The factual verdict is always anchored in verified external evidence.
        </div>
      </div>

      {/* 3. Source Credibility Hierarchy */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          3. Source Authority Tiering
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Not all internet domains possess equivalent editorial oversight. Retrieved evidence is categorized into transparent tiers:
        </p>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <li style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#047857' }}>Fact-Checking Organizations:</strong> Certified signatories of the International Fact-Checking Network (Snopes, PolitiFact, FactCheck.org, Full Fact).
          </li>
          <li style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#1d4ed8' }}>Government / Official Bodies:</strong> Official agencies, public health registries (.gov, .mil, WHO, CDC, NASA, NOAA).
          </li>
          <li style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#6d28d9' }}>Scientific & Academic:</strong> Peer-reviewed scientific journals (.edu, Nature, Science, The Lancet, PubMed, arXiv).
          </li>
          <li style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#0369a1' }}>Established News Organizations:</strong> Recognized wire agencies and major periodicals with public editorial boards (Reuters, AP, BBC, NYT, The Guardian).
          </li>
          <li style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#475569' }}>General Web / Unknown:</strong> Public blogs, social media commentary, and unclassified domains.
          </li>
        </ul>
      </div>
    </div>
  );
};
