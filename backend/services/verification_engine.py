import uuid
from typing import List, Tuple
from backend.schemas.verify import (
    ClaimVerificationResult,
    EvidenceSource,
    ExternalFactCheck,
    MLPatternSignal,
    VerdictType,
    EvidenceStrengthType
)
from backend.services.source_analyzer import SourceAnalyzer

class VerificationEngine:
    @classmethod
    def evaluate_claim(
        cls,
        claim_id: str,
        claim_text: str,
        evidence_sources: List[EvidenceSource],
        fact_checks: List[ExternalFactCheck],
        ml_signal: MLPatternSignal
    ) -> ClaimVerificationResult:
        """
        Synthesizes retrieved evidence, fact-checker verdicts, source authority, and ML pattern signals
        to produce a transparent, explainable verification result.
        """
        supporting_sources = [s for s in evidence_sources if s.stance == "SUPPORTS"]
        contradicting_sources = [s for s in evidence_sources if s.stance == "CONTRADICTS"]
        neutral_sources = [s for s in evidence_sources if s.stance == "NEUTRAL_CONTEXT"]

        # Factor in external fact-checks
        fc_contradicts = False
        fc_supports = False
        fc_misleading = False
        
        for fc in fact_checks:
            rating_lower = fc.external_rating.lower()
            if any(term in rating_lower for term in ["false", "debunk", "incorrect", "pants on fire", "untrue", "fake"]):
                fc_contradicts = True
            elif any(term in rating_lower for term in ["true", "correct", "verified", "accurate"]):
                fc_supports = True
            elif any(term in rating_lower for term in ["misleading", "missing context", "half true", "unproven"]):
                fc_misleading = True

        # Compute source weight sums
        def get_source_weight(source: EvidenceSource) -> float:
            cat = source.source_type
            if cat == "Fact-checking organization":
                return 1.0
            if cat in ("Government / Official", "Scientific / Academic"):
                return 0.95
            if cat == "Established News":
                return 0.85
            if cat == "Organization / Company":
                return 0.70
            if cat == "General Website":
                return 0.50
            return 0.35

        support_weight = sum(get_source_weight(s) for s in supporting_sources)
        contradict_weight = sum(get_source_weight(s) for s in contradicting_sources)
        if fc_contradicts:
            contradict_weight += 2.0
        if fc_supports:
            support_weight += 2.0

        total_sources = len(evidence_sources)

        # 1. Evaluate Evidence Strength
        if total_sources == 0 and len(fact_checks) == 0:
            evidence_strength: EvidenceStrengthType = "INSUFFICIENT"
        elif support_weight >= 1.8 or contradict_weight >= 1.8:
            evidence_strength = "HIGH"
        elif support_weight >= 0.8 or contradict_weight >= 0.8:
            evidence_strength = "MODERATE"
        elif total_sources > 0:
            evidence_strength = "LOW"
        else:
            evidence_strength = "INSUFFICIENT"

        # 2. Determine Verdict
        verdict: VerdictType = "UNVERIFIED"
        explanation = ""

        # Case A: Insufficient evidence
        if evidence_strength == "INSUFFICIENT" or (support_weight < 0.4 and contradict_weight < 0.4 and not fc_misleading):
            verdict = "UNVERIFIED"
            explanation = (
                "We could not find enough reliable evidence from reputable news, official databases, or academic "
                "sources to establish whether this claim is accurate. An 'Unverified' status indicates absence of sufficient "
                "credible confirmation or refutation, not proof that the statement is false."
            )

        # Case B: Misleading or Missing Context
        elif fc_misleading or (support_weight > 0.6 and contradict_weight > 0.6):
            verdict = "MISLEADING / MISSING CONTEXT"
            high_rep_names = [s.source_name for s in evidence_sources if s.source_type in ("Established News", "Scientific / Academic", "Government / Official")]
            sources_summary = ", ".join(high_rep_names[:3]) if high_rep_names else "reporting sources"
            explanation = (
                f"This claim contains elements of truth or references genuine events, but is presented without critical context, "
                f"exaggerates findings, or exhibits conflicting evidence across reputable outlets ({sources_summary}). "
                f"External assessments indicate crucial caveats were omitted."
            )

        # Case C: Contradicted
        elif contradict_weight > support_weight and (contradict_weight >= 0.8 or fc_contradicts):
            verdict = "CONTRADICTED"
            contradicting_publishers = [s.source_name for s in contradicting_sources]
            if fact_checks and fc_contradicts:
                contradicting_publishers.extend([fc.publisher for fc in fact_checks])
            publishers_str = ", ".join(list(dict.fromkeys(contradicting_publishers))[:3]) or "authoritative sources"
            explanation = (
                f"Retrieved documentation and fact-check archives from {publishers_str} directly contradict or debunk this claim. "
                f"Authoritative reports indicate the statement lacks factual foundation or has been formally disproven."
            )

        # Case D: Supported
        elif support_weight > contradict_weight and support_weight >= 0.8:
            verdict = "SUPPORTED"
            supporting_publishers = [s.source_name for s in supporting_sources]
            publishers_str = ", ".join(list(dict.fromkeys(supporting_publishers))[:3]) or "reputable outlets"
            explanation = (
                f"This claim is corroborated by verified documentation and reporting from {publishers_str}. "
                f"Available evidence aligns with the factual assertion, and no credible refutations were found."
            )

        # Case E: Default fallback
        else:
            verdict = "UNVERIFIED"
            explanation = (
                "The available search results did not provide conclusive evidence to definitively verify or refute this claim. "
                "Further independent investigation or primary source documentation is recommended."
            )

        # Incorporate stylistic ML notice if noticeable dissonance
        if ml_signal.pattern_signal == "MISINFORMATION_PATTERN" and verdict == "SUPPORTED":
            explanation += " (Note: The headline utilizes sensationalist framing or high-emotion punctuation, but the factual assertion itself is supported by reliable sources.)"

        return ClaimVerificationResult(
            claim_id=claim_id,
            claim_text=claim_text,
            verdict=verdict,
            evidence_strength=evidence_strength,
            explanation=explanation,
            evidence_sources=evidence_sources,
            fact_checks=fact_checks,
            ml_signal=ml_signal
        )

    @classmethod
    def synthesize_overall_verdict(
        cls,
        claim_results: List[ClaimVerificationResult]
    ) -> Tuple[VerdictType, EvidenceStrengthType, str]:
        """
        Synthesizes an overall verdict across all extracted claims in an article.
        """
        if not claim_results:
            return "UNVERIFIED", "INSUFFICIENT", "No claims could be evaluated."

        verdicts = [c.verdict for c in claim_results]
        strengths = [c.evidence_strength for c in claim_results]

        # Overall strength is minimum or average
        if all(s == "HIGH" for s in strengths):
            overall_strength: EvidenceStrengthType = "HIGH"
        elif any(s in ("HIGH", "MODERATE") for s in strengths):
            overall_strength = "MODERATE"
        elif any(s == "LOW" for s in strengths):
            overall_strength = "LOW"
        else:
            overall_strength = "INSUFFICIENT"

        if all(v == "SUPPORTED" for v in verdicts):
            return "SUPPORTED", overall_strength, "All evaluated claims within this submission are corroborated by reliable external evidence."

        if all(v == "CONTRADICTED" for v in verdicts):
            return "CONTRADICTED", overall_strength, "All evaluated claims within this submission were found to be contradicted or debunked by reliable sources."

        if "CONTRADICTED" in verdicts:
            return "CONTRADICTED", overall_strength, f"The article contains contradicted assertions ({verdicts.count('CONTRADICTED')} of {len(verdicts)} claims disproven). Review the claim breakdown below."

        if "MISLEADING / MISSING CONTEXT" in verdicts:
            return "MISLEADING / MISSING CONTEXT", overall_strength, "The submission contains claims that lack essential context or distort verified facts."

        if any(v == "SUPPORTED" for v in verdicts):
            return "SUPPORTED", overall_strength, "Key factual claims in this submission are supported, though some points remain unverified."

        return "UNVERIFIED", overall_strength, "We could not find sufficient reliable evidence across available sources to verify the claims in this submission."
