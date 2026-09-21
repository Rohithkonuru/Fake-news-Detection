from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

VerdictType = Literal[
    "SUPPORTED",
    "CONTRADICTED",
    "UNVERIFIED",
    "MISLEADING / MISSING CONTEXT"
]

EvidenceStrengthType = Literal[
    "HIGH",
    "MODERATE",
    "LOW",
    "INSUFFICIENT"
]

SourceCategoryType = Literal[
    "Government / Official",
    "Scientific / Academic",
    "Fact-checking organization",
    "Established News",
    "Organization / Company",
    "General Website",
    "Unknown"
]

StanceType = Literal[
    "SUPPORTS",
    "CONTRADICTS",
    "NEUTRAL_CONTEXT"
]

class VerifyRequest(BaseModel):
    input_type: Literal["claim", "article", "url"] = Field(..., description="Type of verification input")
    content: str = Field(..., min_length=3, max_length=25000, description="Headline, claim, article text, or URL")
    is_demo: bool = Field(False, description="Flag indicating whether this is a demo example")

class EvidenceSource(BaseModel):
    title: str
    url: str
    source_name: str
    source_type: SourceCategoryType
    snippet: str
    stance: StanceType
    relevance_score: float = 0.8
    published_date: Optional[str] = None

class ExternalFactCheck(BaseModel):
    publisher: str
    original_claim: str
    external_rating: str
    review_date: Optional[str] = None
    url: str
    claim_author: Optional[str] = None

class MLPatternSignal(BaseModel):
    pattern_signal: Literal["CREDIBLE_PATTERN", "MISINFORMATION_PATTERN", "MIXED_OR_AMBIGUOUS", "INCONCLUSIVE"]
    misinformation_pattern_probability: float
    confidence: Literal["HIGH", "MODERATE", "LOW"]
    linguistic_signals: Dict[str, Any]
    indicative_terms: List[str]
    disclaimer: str = "ML Pattern Signal reflects stylistic and vocabulary markers, not verified factual truth."

class ClaimVerificationResult(BaseModel):
    claim_id: str
    claim_text: str
    verdict: VerdictType
    evidence_strength: EvidenceStrengthType
    explanation: str
    evidence_sources: List[EvidenceSource] = []
    fact_checks: List[ExternalFactCheck] = []
    ml_signal: MLPatternSignal

class FullVerificationResponse(BaseModel):
    verification_id: str
    user_id: Optional[str] = None
    input_type: Literal["claim", "article", "url"]
    original_input: str
    extracted_title: Optional[str] = None
    overall_verdict: VerdictType
    overall_evidence_strength: EvidenceStrengthType
    overall_explanation: str
    claims: List[ClaimVerificationResult]
    created_at: datetime
    is_demo: bool = False

class StreamStageEvent(BaseModel):
    stage: Literal[
        "READING_CONTENT",
        "EXTRACTING_CLAIMS",
        "SEARCHING_EVIDENCE",
        "COMPARING_SOURCES",
        "GENERATING_EXPLANATION",
        "COMPLETE",
        "ERROR"
    ]
    message: str
    progress_percentage: int
    data: Optional[Dict[str, Any]] = None
