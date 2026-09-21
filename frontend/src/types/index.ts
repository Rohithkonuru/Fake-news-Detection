export type VerdictType =
  | 'SUPPORTED'
  | 'CONTRADICTED'
  | 'UNVERIFIED'
  | 'MISLEADING / MISSING CONTEXT';

export type EvidenceStrengthType = 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT';

export type SourceCategoryType =
  | 'Government / Official'
  | 'Scientific / Academic'
  | 'Fact-checking organization'
  | 'Established News'
  | 'Organization / Company'
  | 'General Website'
  | 'Unknown';

export type StanceType = 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL_CONTEXT';

export interface EvidenceSource {
  title: string;
  url: string;
  source_name: string;
  source_type: SourceCategoryType;
  snippet: string;
  stance: StanceType;
  relevance_score: number;
  published_date?: string | null;
}

export interface ExternalFactCheck {
  publisher: string;
  original_claim: string;
  external_rating: string;
  review_date?: string | null;
  url: string;
  claim_author?: string | null;
}

export interface MLPatternSignal {
  pattern_signal: 'CREDIBLE_PATTERN' | 'MISINFORMATION_PATTERN' | 'MIXED_OR_AMBIGUOUS' | 'INCONCLUSIVE';
  misinformation_pattern_probability: number;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  linguistic_signals: Record<string, any>;
  indicative_terms: string[];
  disclaimer: string;
}

export interface ClaimVerificationResult {
  claim_id: string;
  claim_text: string;
  verdict: VerdictType;
  evidence_strength: EvidenceStrengthType;
  explanation: string;
  evidence_sources: EvidenceSource[];
  fact_checks: ExternalFactCheck[];
  ml_signal: MLPatternSignal;
}

export interface FullVerificationResponse {
  verification_id: string;
  user_id?: string | null;
  input_type: 'claim' | 'article' | 'url';
  original_input: string;
  extracted_title?: string | null;
  overall_verdict: VerdictType;
  overall_evidence_strength: EvidenceStrengthType;
  overall_explanation: string;
  claims: ClaimVerificationResult[];
  created_at: string;
  is_demo: boolean;
}

export type StreamStage =
  | 'IDLE'
  | 'READING_CONTENT'
  | 'EXTRACTING_CLAIMS'
  | 'SEARCHING_EVIDENCE'
  | 'COMPARING_SOURCES'
  | 'GENERATING_EXPLANATION'
  | 'COMPLETE'
  | 'ERROR';

export interface StreamStageEvent {
  stage: StreamStage;
  message: string;
  progress_percentage: number;
  data?: FullVerificationResponse;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  role: string;
}

export interface AnalyticsStats {
  total_analyzed: number;
  supported_count: number;
  contradicted_count: number;
  unverified_count: number;
  misleading_count: number;
  source_categories: Record<string, number>;
  activity_timeline: Array<{ date: string; count: number }>;
}
