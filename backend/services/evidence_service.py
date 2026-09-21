import re
import logging
from typing import List, Tuple
from backend.schemas.verify import EvidenceSource, ExternalFactCheck, StanceType
from backend.services.search_service import SearchService
from backend.services.factcheck_service import FactCheckService

logger = logging.getLogger(__name__)

CONTRADICTION_CUES = [
    r'\b(?:false|hoax|debunked?|untrue|refuted?|myth|disproven|fake|fabricated|incorrect|bogus)\b',
    r'\bno\s+evidence\b',
    r'\bno\s+scientific\s+basis\b',
    r'\bnot\s+true\b',
    r'\bno\s+link\s+between\b',
    r'\bdoes\s+not\s+(?:cause|prevent|cure|exist|prove)\b',
    r'\bcontrary\s+to\s+claims\b',
    r'\bconspiracy\s+theory\b',
    r'\bmisleading\s+claim\b',
    r'\bwarns\s+against\b',
    r'\bdangerous\s+myth\b'
]

SUPPORT_CUES = [
    r'\b(?:confirmed|discovered|proves|verified|demonstrated|announced|found\s+that)\b',
    r'\b(?:detected|detects|revealed|reveals|identifies|identified|observation|findings)\b',
    r'\bevidence\s+shows\b',
    r'\bpublished\s+findings\b',
    r'\bofficially\s+reported\b',
    r'\bvalidates\s+that\b',
    r'\bclinical\s+trials\s+show\b',
    r'\bsuccessfully\s+detected\b',
    r'\breports?\s+(?:that|finding)\b'
]

class EvidenceService:
    @classmethod
    def evaluate_stance(cls, claim_text: str, snippet: str, title: str) -> StanceType:
        """
        Determines whether an evidence snippet SUPPORTS, CONTRADICTS, or provides NEUTRAL_CONTEXT for a claim.
        """
        combined = f"{title} {snippet}".lower()
        
        # Check for contradiction cues
        contradiction_hits = sum(1 for pattern in CONTRADICTION_CUES if re.search(pattern, combined))
        
        # Check for support cues
        support_hits = sum(1 for pattern in SUPPORT_CUES if re.search(pattern, combined))

        if contradiction_hits > 0 and contradiction_hits >= support_hits:
            return "CONTRADICTS"
        elif support_hits > 0 and support_hits > contradiction_hits:
            return "SUPPORTS"
            
        return "NEUTRAL_CONTEXT"

    @classmethod
    async def gather_evidence_for_claim(cls, claim_text: str) -> Tuple[List[EvidenceSource], List[ExternalFactCheck]]:
        """
        Collects real evidence and external fact-checks for a specific claim.
        """
        # Fetch web search evidence and existing fact-checks concurrently or sequentially
        raw_evidence = await SearchService.search_evidence(claim_text)
        fact_checks = await FactCheckService.search_fact_checks(claim_text)

        evidence_sources: List[EvidenceSource] = []

        for item in raw_evidence:
            snippet = item.get("snippet", "")
            title = item.get("title", "")
            stance = cls.evaluate_stance(claim_text, snippet, title)
            
            # If the source is an external fact-checker that found it false, ensure CONTRADICTS stance
            if item.get("source_type") == "Fact-checking organization" and any(w in snippet.lower() for w in ["false", "debunk", "misleading"]):
                stance = "CONTRADICTS"

            evidence_sources.append(EvidenceSource(
                title=title,
                url=item.get("url", ""),
                source_name=item.get("source_name", "Web Source"),
                source_type=item.get("source_type", "General Website"),
                snippet=snippet,
                stance=stance,
                relevance_score=item.get("relevance_score", 0.8),
                published_date=item.get("published_date")
            ))

        return evidence_sources, fact_checks
