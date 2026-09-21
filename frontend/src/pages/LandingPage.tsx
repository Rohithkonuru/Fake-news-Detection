import {
  Sparkles,
  Layers,
  Cpu,
  Globe,
  FileCheck2,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { VerificationBox } from '../components/VerificationBox';

interface LandingPageProps {
  onVerify: (type: 'claim' | 'article' | 'url', content: string) => void;
  onSelectDemo: (demoId: string) => void;
  isLoading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onVerify,
  onSelectDemo,
  isLoading
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem', paddingTop: '2rem' }}>
      {/* 1. Hero Section */}
      <section style={{ textAlign: 'center', position: 'relative', padding: '2rem 0' }}>
        {/* Top Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-full)', color: 'var(--primary-700)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          <Sparkles size={16} />
          <span>Glass Intelligence Laboratory • Production v1.0</span>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', lineHeight: 1.15, fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          See the evidence <br />
          <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            behind the news.
          </span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
          Analyze claims, discover supporting evidence, and understand what reliable sources actually say. Transparent, evidence-based claim verification.
        </p>

        {/* Hero Verification Box */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <VerificationBox
            onVerify={onVerify}
            onSelectDemo={onSelectDemo}
            isLoading={isLoading}
          />
        </div>

        {/* Floating Evidence Node Badges (Visual Intelligence Lab Aesthetic) */}
        <div className="evidence-floating-nodes" style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span>NASA / ESA Planetary Archive</span>
          </div>
          <div className="glass-card" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
            <span>Reuters & AP Wire Sync</span>
          </div>
          <div className="glass-card" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} />
            <span>Snopes & PolitiFact Database</span>
          </div>
          <div className="glass-card" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} />
            <span>SSRF-Protected URL Extraction</span>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section id="how-it-works" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto 3rem auto' }}>
          <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--primary-600)', marginBottom: '0.5rem' }}>
            System Workflow
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            How TruthLens Operates
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', marginTop: '0.5rem' }}>
            A rigorous four-stage multi-agent pipeline designed to maximize transparency and avoid hallucination.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem', textAlign: 'left' }}>
          {/* Step 1 */}
          <div className="glass-panel" style={{ padding: '2rem 1.5rem', position: 'relative' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              1
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Enter</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Submit a single claim, a news article headline, full multi-paragraph text, or a direct news URL protected by our SSRF security layer.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel" style={{ padding: '2rem 1.5rem', position: 'relative' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              2
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Investigate</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Our NLP engine decomposes complex sentences into atomic claims and triggers live searches across certified fact-checkers, news wires, and scientific journals.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel" style={{ padding: '2rem 1.5rem', position: 'relative' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              3
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Compare</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Evidence snippets undergo semantic stance classification (Supports vs Contradicts) weighted by publisher credibility tiers and linguistic style pattern detection.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-panel" style={{ padding: '2rem 1.5rem', position: 'relative' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              4
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Understand</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Review a transparent verdict (Supported, Contradicted, Unverified, or Misleading), read plain-English explanations, and click direct primary source links.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section>
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem auto' }}>
          <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--primary-600)', marginBottom: '0.5rem' }}>
            Advanced Capabilities
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Engineered for Precision & Transparency
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', marginTop: '0.5rem' }}>
            TruthLens avoids black-box claims and synthetic predictions in favor of verifiable real-world citations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Claim Extraction</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Dissects convoluted paragraphs and multi-assertion sentences into distinct, independently verifiable assertions so nuances are never conflated.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Globe size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Live Web Evidence Retrieval</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Fetches real citations from open news repositories, encyclopedias, and government releases. Zero synthetic hallucinations or fake citations.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <FileCheck2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fact-Check Integration</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Queries certified fact-check archives including Snopes, PolitiFact, Full Fact, and Google Fact Check Tools API with clear external attribution.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>ML Pattern Signal</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Trained on news corpora with TF-IDF + Logistic Regression to spot sensationalism, clickbait phrasing, and hyperbole without overriding factual evidence.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Source Quality Evaluation</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Transparently categorizes sources into Government, Scientific/Academic, Established News, Fact-Checkers, or Unknown without fabricating trust scores.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>SSRF Protection Layer</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Safely inspects URLs with DNS resolution verification, blocking private IP ranges, cloud metadata endpoints, and malicious redirect loops.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Interactive Demo Showcase Teaser */}
      <section className="glass-panel" style={{ padding: '3rem 2rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(238,242,255,0.7) 100%)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Explore Certified Reference Demonstrations
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '0.95rem' }}>
          Experience TruthLens's complete multi-claim breakdown, stance matching, and evidence inspection with verified historical benchmarks.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => onSelectDemo('supported')} className="btn-secondary">
            🟢 Supported: NASA James Webb Exoplanet
          </button>
          <button onClick={() => onSelectDemo('contradicted')} className="btn-secondary">
            🔴 Contradicted: Bleach Medical Ingestion
          </button>
          <button onClick={() => onSelectDemo('misleading')} className="btn-secondary">
            🟠 Misleading: Carrots Night Vision Folklore
          </button>
        </div>
      </section>
    </div>
  );
};
