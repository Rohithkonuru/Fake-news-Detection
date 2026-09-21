import re
import json
import logging
from typing import List
from backend.config import settings

logger = logging.getLogger(__name__)

ATTRIBUTION_PATTERNS = [
    r'^(?:scientists|researchers|doctors|experts|whistleblowers|reports|studies|officials)\s+(?:say|claim|reveal|state|warn|show|admit|argue|suggest)(?:\s+that)?\s+',
    r'^(?:according\s+to\s+[^,]+,\s*)',
    r'^(?:it\s+has\s+been\s+reported\s+that\s+)',
    r'^(?:new\s+evidence\s+shows\s+that\s+)',
    r'^(?:sources\s+confirm\s+that\s+)',
    r'^(?:viral\s+posts\s+claim\s+that\s+)',
    r'^(?:whistleblower\s+reveals\s+that\s+)',
]

class ClaimExtractor:
    @classmethod
    async def extract_claims(cls, text: str, max_claims: int = 5) -> List[str]:
        """
        Extracts atomic, verifiable factual claims from raw text or article body.
        Uses LLM if available; otherwise uses deterministic NLP clause parser.
        """
        if not text or not text.strip():
            return []

        cleaned_input = text.strip()

        # Try LLM extraction if an API key is configured
        if settings.GEMINI_API_KEY or settings.OPENAI_API_KEY:
            try:
                llm_claims = await cls._extract_with_llm(cleaned_input, max_claims)
                if llm_claims and len(llm_claims) > 0:
                    return llm_claims[:max_claims]
            except Exception as e:
                logger.warning(f"LLM claim extraction failed, falling back to deterministic parser: {e}")

        # Deterministic Fallback Parser
        return cls._deterministic_extract(cleaned_input, max_claims)

    @classmethod
    def _clean_claim_text(cls, sentence: str) -> str:
        s = sentence.strip()
        # Remove attribution wrapper
        for pattern in ATTRIBUTION_PATTERNS:
            s = re.sub(pattern, '', s, flags=re.I)
        
        # Remove leading numbers/bullet points like "1. ", "- "
        s = re.sub(r'^(?:\d+[\.\)]|\-|\*)\s*', '', s)
        s = s.strip()
        if s:
            s = s[0].upper() + s[1:]
        if s and not s.endswith(('.', '!', '?')):
            s += '.'
        return s

    @classmethod
    def _deterministic_extract(cls, text: str, max_claims: int = 5) -> List[str]:
        """
        Decomposes compound sentences and isolates core factual assertions.
        """
        # Split into sentences
        sentence_candidates = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"“])', text)
        
        extracted: List[str] = []

        for candidate in sentence_candidates:
            candidate = candidate.strip()
            if not candidate or len(candidate) < 15:
                continue

            # Skip pure questions or short exclamations
            if candidate.endswith('?') and not any(k in candidate.lower() for k in ["why", "how", "what", "is"]):
                continue

            cleaned = cls._clean_claim_text(candidate)

            # Check for compound predicates joined by 'and', e.g.:
            # "Drinking coffee prevents cancer and increases lifespan."
            # -> "Drinking coffee prevents cancer.", "Drinking coffee increases lifespan."
            compound_match = re.match(
                r'^([A-Z][^,\.;]+?\s+(?:prevents?|cures?|causes?|destroys?|creates?|reduces?|increases?|improves?|contains?|eliminates?|leads to|results in))\s+([^,\.;]+?)\s+and\s+((?:prevents?|cures?|causes?|destroys?|creates?|reduces?|increases?|improves?|contains?|eliminates?)\s+[^,\.;]+)[\.!]?$',
                cleaned,
                re.I
            )
            
            if compound_match:
                prefix_with_verb = compound_match.group(1)
                first_object = compound_match.group(2)
                second_verb_phrase = compound_match.group(3)
                
                # Extract subject before first verb
                subject_match = re.match(r'^(.*?)\s+(?:prevents?|cures?|causes?|destroys?|creates?|reduces?|increases?|improves?|contains?|eliminates?|leads to|results in)', prefix_with_verb, re.I)
                subject = subject_match.group(1) if subject_match else ""
                
                claim_1 = f"{prefix_with_verb} {first_object}."
                claim_2 = f"{subject} {second_verb_phrase}.".strip()
                if subject and not claim_2.startswith(subject[0].upper()):
                    claim_2 = claim_2[0].upper() + claim_2[1:]
                
                extracted.append(claim_1)
                extracted.append(claim_2)
                continue

            # Standard clause segmentation for multi-assertion paragraphs
            if len(cleaned) > 25:
                extracted.append(cleaned)

            if len(extracted) >= max_claims:
                break

        # Deduplicate while preserving order
        unique_claims = []
        seen = set()
        for c in extracted:
            normalized = c.lower().strip()
            if normalized not in seen:
                seen.add(normalized)
                unique_claims.append(c)

        # If empty, return original trimmed input as single claim
        if not unique_claims and text.strip():
            single = cls._clean_claim_text(text.strip())
            return [single]

        return unique_claims[:max_claims]

    @classmethod
    async def _extract_with_llm(cls, text: str, max_claims: int) -> List[str]:
        """
        Uses configured LLM to isolate factual claims in structured format.
        """
        # Note: If Gemini/OpenAI are installed, call their client
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                prompt = (
                    f"Extract up to {max_claims} atomic, verifiable factual claims from the following text.\n"
                    "Remove attribution like 'scientists say'. Return ONLY a JSON list of strings.\n\n"
                    f"Text:\n{text[:3000]}"
                )
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                raw = response.text.strip()
                if raw.startswith("```json"):
                    raw = raw[7:-3].strip()
                elif raw.startswith("```"):
                    raw = raw[3:-3].strip()
                claims = json.loads(raw)
                if isinstance(claims, list):
                    return [str(c).strip() for c in claims if str(c).strip()]
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}")

        return []
