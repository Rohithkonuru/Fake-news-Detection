import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Optional, AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse

from backend.database import db_manager
from backend.schemas.verify import (
    VerifyRequest,
    FullVerificationResponse,
    ClaimVerificationResult,
    StreamStageEvent,
    EvidenceSource,
    ExternalFactCheck,
    MLPatternSignal
)
from backend.services.article_extractor import ArticleExtractor
from backend.services.claim_extractor import ClaimExtractor
from backend.services.evidence_service import EvidenceService
from backend.services.ml_detector import MLDetectorService
from backend.services.verification_engine import VerificationEngine
from backend.utils.security import get_current_user_optional

router = APIRouter(prefix="/verify", tags=["Verification"])

# Curated, real-world verified demo examples
DEMO_EXAMPLES = {
    "supported": {
        "title": "NASA James Webb Space Telescope Exoplanet Discovery",
        "input_type": "claim",
        "content": "NASA's James Webb Space Telescope detected carbon dioxide in the atmosphere of an exoplanet.",
        "claims": [
            {
                "claim_id": "demo-claim-1",
                "claim_text": "NASA's James Webb Space Telescope detected carbon dioxide in the atmosphere of an exoplanet.",
                "verdict": "SUPPORTED",
                "evidence_strength": "HIGH",
                "explanation": (
                    "This claim is corroborated by peer-reviewed research published in Nature and official announcements from NASA "
                    "and the European Space Agency. In August 2022, the James Webb Space Telescope's NIRSpec instrument confirmed the first clear "
                    "evidence for carbon dioxide in the atmosphere of gas giant exoplanet WASP-39 b."
                ),
                "evidence_sources": [
                    {
                        "title": "NASA's Webb Detects Carbon Dioxide in Exoplanet Atmosphere",
                        "url": "https://www.nasa.gov/universe/nasas-webb-detects-carbon-dioxide-in-exoplanet-atmosphere/",
                        "source_name": "NASA",
                        "source_type": "Government / Official",
                        "snippet": "NASA's James Webb Space Telescope has provided the first clear evidence for carbon dioxide in an exoplanet atmosphere. The exoplanet, WASP-39 b, is a gas giant orbiting a Sun-like star 700 light-years away.",
                        "stance": "SUPPORTS",
                        "relevance_score": 0.98,
                        "published_date": "2022-08-25"
                    },
                    {
                        "title": "Identification of carbon dioxide in an exoplanet atmosphere - Nature",
                        "url": "https://www.nature.com/articles/s41586-022-05269-w",
                        "source_name": "Nature",
                        "source_type": "Scientific / Academic",
                        "snippet": "Here we report the transmission spectrum of the gas-giant exoplanet WASP-39b obtained with the James Webb Space Telescope. We detect a prominent absorption feature of carbon dioxide at 4.3 μm.",
                        "stance": "SUPPORTS",
                        "relevance_score": 0.99,
                        "published_date": "2022-08-26"
                    },
                    {
                        "title": "Webb detects carbon dioxide on exoplanet WASP-39 b",
                        "url": "https://www.esa.int/Science_Exploration/Space_Science/Webb/Webb_detects_carbon_dioxide_on_exoplanet",
                        "source_name": "European Space Agency",
                        "source_type": "Government / Official",
                        "snippet": "Webb’s Near-Infrared Spectrograph has revealed unambiguous evidence of carbon dioxide on a distant world, marking a major milestone for exoplanet research.",
                        "stance": "SUPPORTS",
                        "relevance_score": 0.95,
                        "published_date": "2022-08-25"
                    }
                ],
                "fact_checks": [],
                "ml_signal": {
                    "pattern_signal": "CREDIBLE_PATTERN",
                    "misinformation_pattern_probability": 0.12,
                    "confidence": "HIGH",
                    "linguistic_signals": {"exclamations": 0, "questions": 0, "sensational_term_count": 0, "caps_ratio": 0.1},
                    "indicative_terms": ["nasa", "telescope", "atmosphere", "exoplanet"],
                    "disclaimer": "ML Pattern Signal reflects stylistic and vocabulary markers, not verified factual truth."
                }
            }
        ],
        "overall_verdict": "SUPPORTED",
        "overall_evidence_strength": "HIGH",
        "overall_explanation": "Verified by NASA, the European Space Agency, and peer-reviewed publication in Nature. The detection of CO2 on WASP-39 b is an established scientific finding."
    },
    "contradicted": {
        "title": "Ingesting Bleach or Disinfectant as a Medical Cure",
        "input_type": "claim",
        "content": "Drinking industrial bleach or chemical disinfectant completely cures COVID-19 without side effects.",
        "claims": [
            {
                "claim_id": "demo-claim-2",
                "claim_text": "Drinking industrial bleach or chemical disinfectant completely cures COVID-19 without side effects.",
                "verdict": "CONTRADICTED",
                "evidence_strength": "HIGH",
                "explanation": (
                    "This claim has been repeatedly debunked and refuted by international health authorities, poison control agencies, "
                    "and accredited fact-checkers. Ingesting bleach, chlorine dioxide, or disinfectant causes acute chemical burns, severe respiratory failure, "
                    "and death, and possesses zero therapeutic benefit against viral infections."
                ),
                "evidence_sources": [
                    {
                        "title": "FDA warns against drinking bleach or chlorine dioxide for medical conditions",
                        "url": "https://www.fda.gov/consumers/consumer-updates/danger-dont-drink-miracle-mineral-solution-or-similar-products",
                        "source_name": "FDA",
                        "source_type": "Government / Official",
                        "snippet": "The FDA continues to warn consumers not to purchase or drink chemical solutions containing chlorine dioxide, often marketed as Miracle Mineral Solution. These products are industrial bleaches and have caused severe and life-threatening adverse events.",
                        "stance": "CONTRADICTS",
                        "relevance_score": 0.98,
                        "published_date": "2020-04-24"
                    },
                    {
                        "title": "CDC: Health Alert on Ingestion of Disinfectants and Bleach",
                        "url": "https://www.cdc.gov/coronavirus/2019-ncov/prevent-getting-sick/disinfecting-your-home.html",
                        "source_name": "CDC",
                        "source_type": "Government / Official",
                        "snippet": "Disinfectants should never be ingested, injected, or applied directly to the human body. Doing so can result in serious health damage including poisoning, internal tissue necrosis, and fatality.",
                        "stance": "CONTRADICTS",
                        "relevance_score": 0.96,
                        "published_date": "2020-05-10"
                    }
                ],
                "fact_checks": [
                    {
                        "publisher": "PolitiFact",
                        "original_claim": "Drinking bleach or injecting disinfectant will cure COVID-19",
                        "external_rating": "Pants on Fire / False",
                        "review_date": "2020-04-24",
                        "url": "https://www.politifact.com/factchecks/2020/apr/24/viral-image/no-drinking-bleach-will-not-cure-coronavirus/",
                        "claim_author": "Viral social media posts"
                    },
                    {
                        "publisher": "Snopes",
                        "original_claim": "Can Drinking Chlorine Dioxide or Bleach Cure COVID-19?",
                        "external_rating": "False",
                        "review_date": "2020-04-25",
                        "url": "https://www.snopes.com/fact-check/bleach-cure-coronavirus/",
                        "claim_author": "Internet rumors"
                    }
                ],
                "ml_signal": {
                    "pattern_signal": "MISINFORMATION_PATTERN",
                    "misinformation_pattern_probability": 0.88,
                    "confidence": "HIGH",
                    "linguistic_signals": {"exclamations": 0, "questions": 0, "sensational_term_count": 2, "caps_ratio": 0.08},
                    "indicative_terms": ["cure", "bleach", "disinfectant", "completely"],
                    "disclaimer": "ML Pattern Signal reflects stylistic and vocabulary markers, not verified factual truth."
                }
            }
        ],
        "overall_verdict": "CONTRADICTED",
        "overall_evidence_strength": "HIGH",
        "overall_explanation": "Authoritative statements from the FDA, CDC, WHO, and multiple fact-checking organizations definitively contradict this claim, categorizing it as dangerous medical misinformation."
    },
    "misleading": {
        "title": "Carrots Provide Superhuman Infrared Night Vision",
        "input_type": "claim",
        "content": "Eating carrots gives human beings superhuman night vision like a hawk.",
        "claims": [
            {
                "claim_id": "demo-claim-3",
                "claim_text": "Eating carrots gives human beings superhuman night vision like a hawk.",
                "verdict": "MISLEADING / MISSING CONTEXT",
                "evidence_strength": "HIGH",
                "explanation": (
                    "This claim stems from a World War II British Royal Air Force propaganda campaign designed to conceal radar technology. "
                    "While carrots contain beta-carotene which the body converts into Vitamin A (necessary for healthy ocular function and preventing night blindness), "
                    "consuming them does not grant superhuman or hawk-like night vision to individuals with normal vision."
                ),
                "evidence_sources": [
                    {
                        "title": "A WWII Propaganda Campaign Popularized the Myth That Carrots Help You See in the Dark",
                        "url": "https://www.smithsonianmag.com/arts-culture/a-wwii-propaganda-campaign-popularized-the-myth-that-carrots-help-you-see-in-the-dark-28812484/",
                        "source_name": "Smithsonian Magazine",
                        "source_type": "Scientific / Academic",
                        "snippet": "During the 1940 Blitz, the UK Ministry of Information spread the story that Royal Air Force pilots ate copious carrots to acquire miraculous night vision, disguising airborne interception radar from Germany.",
                        "stance": "CONTRADICTS",
                        "relevance_score": 0.94,
                        "published_date": "2013-02-12"
                    },
                    {
                        "title": "Vitamin A and Vision Health - Harvard Health",
                        "url": "https://www.health.harvard.edu/staying-healthy/vitamin-a",
                        "source_name": "Harvard Health",
                        "source_type": "Scientific / Academic",
                        "snippet": "Vitamin A supports normal photoreceptor function in low light, but extra beta-carotene will not improve eyesight beyond normal physiological limits.",
                        "stance": "SUPPORTS",
                        "relevance_score": 0.90,
                        "published_date": "2021-06-15"
                    }
                ],
                "fact_checks": [
                    {
                        "publisher": "Full Fact",
                        "original_claim": "Carrots give you night vision",
                        "external_rating": "Missing Context / Myth",
                        "review_date": "2019-11-20",
                        "url": "https://fullfact.org/online/carrots-night-vision/",
                        "claim_author": "Folklore"
                    }
                ],
                "ml_signal": {
                    "pattern_signal": "MIXED_OR_AMBIGUOUS",
                    "misinformation_pattern_probability": 0.45,
                    "confidence": "MODERATE",
                    "linguistic_signals": {"exclamations": 0, "questions": 0, "sensational_term_count": 0, "caps_ratio": 0.05},
                    "indicative_terms": ["carrots", "vision", "superhuman"],
                    "disclaimer": "ML Pattern Signal reflects stylistic and vocabulary markers, not verified factual truth."
                }
            }
        ],
        "overall_verdict": "MISLEADING / MISSING CONTEXT",
        "overall_evidence_strength": "HIGH",
        "overall_explanation": "While Vitamin A in carrots is vital for standard optical health, the myth of superhuman night vision originated as military disinformation in WWII."
    }
}

@router.get("/demo/{example_id}", response_model=FullVerificationResponse)
async def get_demo_example(example_id: str):
    """
    Returns a certified demo example clearly labeled as Demo Example.
    Never mixed with live unverified results.
    """
    example = DEMO_EXAMPLES.get(example_id.lower())
    if not example:
        raise HTTPException(status_code=404, detail="Demo example not found. Available: 'supported', 'contradicted', 'misleading'.")

    return FullVerificationResponse(
        verification_id=f"demo-{example_id}-{str(uuid.uuid4())[:8]}",
        user_id=None,
        input_type=example["input_type"],
        original_input=example["content"],
        extracted_title=example["title"],
        overall_verdict=example["overall_verdict"],
        overall_evidence_strength=example["overall_evidence_strength"],
        overall_explanation=example["overall_explanation"],
        claims=example["claims"],
        created_at=datetime.now(timezone.utc),
        is_demo=True
    )

async def _process_verification(req: VerifyRequest, user_id: Optional[str] = None) -> FullVerificationResponse:
    extracted_title = None
    text_to_analyze = req.content.strip()

    # Step 1: Article or URL extraction
    if req.input_type == "url":
        title, body, error = await ArticleExtractor.extract_from_url(text_to_analyze)
        if error:
            raise HTTPException(status_code=400, detail=f"URL Extraction Failed: {error}")
        extracted_title = title
        text_to_analyze = f"{title}\n\n{body}" if title else body
    elif req.input_type == "article":
        title, body = ArticleExtractor.parse_raw_text(text_to_analyze)
        extracted_title = title
        text_to_analyze = body if body else text_to_analyze

    # Step 2: Claim extraction
    claim_texts = await ClaimExtractor.extract_claims(text_to_analyze)
    if not claim_texts:
        raise HTTPException(status_code=400, detail="No verifiable factual statements could be extracted from input.")

    # Step 3 & 4: Evidence gathering and individual claim evaluation
    claim_results: list[ClaimVerificationResult] = []

    for idx, c_text in enumerate(claim_texts, 1):
        claim_id = f"claim-{idx}-{str(uuid.uuid4())[:6]}"
        
        # Real evidence retrieval & fact check search
        evidence_sources, fact_checks = await EvidenceService.gather_evidence_for_claim(c_text)
        
        # ML Pattern Signal detection
        ml_signal = MLDetectorService.analyze_claim(c_text)
        
        # Transparent verification engine evaluation
        res = VerificationEngine.evaluate_claim(
            claim_id=claim_id,
            claim_text=c_text,
            evidence_sources=evidence_sources,
            fact_checks=fact_checks,
            ml_signal=ml_signal
        )
        claim_results.append(res)

    # Step 5: Synthesize overall verdict
    overall_verdict, overall_strength, overall_explanation = VerificationEngine.synthesize_overall_verdict(claim_results)

    verification_id = f"verif-{str(uuid.uuid4())}"
    now = datetime.now(timezone.utc)

    response = FullVerificationResponse(
        verification_id=verification_id,
        user_id=user_id,
        input_type=req.input_type,
        original_input=req.content,
        extracted_title=extracted_title,
        overall_verdict=overall_verdict,
        overall_evidence_strength=overall_strength,
        overall_explanation=overall_explanation,
        claims=claim_results,
        created_at=now,
        is_demo=False
    )

    # Save to database
    await _save_verification_record(response)
    return response

async def _save_verification_record(resp: FullVerificationResponse):
    db = db_manager.get_db()
    doc = resp.model_dump()
    doc["created_at"] = resp.created_at
    
    if db_manager.is_connected and db is not None:
        try:
            await db.verifications.insert_one(doc)
        except Exception as e:
            print(f"Error persisting verification to MongoDB: {e}")
    else:
        db_manager._memory_verifications.insert(0, doc)

@router.post("", response_model=FullVerificationResponse)
async def verify_content(
    req: VerifyRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Standard synchronous verification endpoint.
    """
    user_id = current_user.get("sub") if current_user else None
    return await _process_verification(req, user_id)

@router.post("/stream")
async def verify_stream_post(
    req: VerifyRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Server-Sent Events (SSE) streaming endpoint reflecting actual backend verification stages.
    """
    user_id = current_user.get("sub") if current_user else None

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            # Stage 1: READING_CONTENT
            yield f"data: {json.dumps({'stage': 'READING_CONTENT', 'message': 'Reading and validating submission...', 'progress_percentage': 15})}\n\n"
            await asyncio.sleep(0.3)
            
            extracted_title = None
            text_to_analyze = req.content.strip()

            if req.input_type == "url":
                yield f"data: {json.dumps({'stage': 'READING_CONTENT', 'message': 'Fetching webpage and inspecting SSL/SSRF safety...', 'progress_percentage': 25})}\n\n"
                title, body, error = await ArticleExtractor.extract_from_url(text_to_analyze)
                if error:
                    yield f"data: {json.dumps({'stage': 'ERROR', 'message': f'URL fetch failed: {error}', 'progress_percentage': 0})}\n\n"
                    return
                extracted_title = title
                text_to_analyze = f"{title}\n\n{body}" if title else body
            elif req.input_type == "article":
                title, body = ArticleExtractor.parse_raw_text(text_to_analyze)
                extracted_title = title
                text_to_analyze = body if body else text_to_analyze

            # Stage 2: EXTRACTING_CLAIMS
            yield f"data: {json.dumps({'stage': 'EXTRACTING_CLAIMS', 'message': 'Isolating factual assertions and key claims...', 'progress_percentage': 40})}\n\n"
            claim_texts = await ClaimExtractor.extract_claims(text_to_analyze)
            if not claim_texts:
                yield f"data: {json.dumps({'stage': 'ERROR', 'message': 'No factual claims could be extracted.', 'progress_percentage': 0})}\n\n"
                return

            yield f"data: {json.dumps({'stage': 'EXTRACTING_CLAIMS', 'message': f'Extracted {len(claim_texts)} core factual claim(s).', 'progress_percentage': 50})}\n\n"
            await asyncio.sleep(0.2)

            # Stage 3: SEARCHING_EVIDENCE
            yield f"data: {json.dumps({'stage': 'SEARCHING_EVIDENCE', 'message': 'Retrieving evidence from fact-checking databases, official registries, and news...', 'progress_percentage': 65})}\n\n"
            
            claim_results: list[ClaimVerificationResult] = []

            for idx, c_text in enumerate(claim_texts, 1):
                yield f"data: {json.dumps({'stage': 'SEARCHING_EVIDENCE', 'message': f'Gathering sources for Claim {idx}/{len(claim_texts)}...', 'progress_percentage': 65 + int(idx * 10 / len(claim_texts))})}\n\n"
                evidence_sources, fact_checks = await EvidenceService.gather_evidence_for_claim(c_text)
                
                # Stage 4: COMPARING_SOURCES
                yield f"data: {json.dumps({'stage': 'COMPARING_SOURCES', 'message': f'Analyzing source stance, credibility tiers, and ML signals for Claim {idx}...', 'progress_percentage': 82})}\n\n"
                ml_signal = MLDetectorService.analyze_claim(c_text)
                
                claim_res = VerificationEngine.evaluate_claim(
                    claim_id=f"claim-{idx}-{str(uuid.uuid4())[:6]}",
                    claim_text=c_text,
                    evidence_sources=evidence_sources,
                    fact_checks=fact_checks,
                    ml_signal=ml_signal
                )
                claim_results.append(claim_res)

            # Stage 5: GENERATING_EXPLANATION
            yield f"data: {json.dumps({'stage': 'GENERATING_EXPLANATION', 'message': 'Synthesizing transparent explanation and evidence strength...', 'progress_percentage': 95})}\n\n"
            await asyncio.sleep(0.3)

            overall_verdict, overall_strength, overall_explanation = VerificationEngine.synthesize_overall_verdict(claim_results)

            verification_id = f"verif-{str(uuid.uuid4())}"
            now = datetime.now(timezone.utc)

            final_response = FullVerificationResponse(
                verification_id=verification_id,
                user_id=user_id,
                input_type=req.input_type,
                original_input=req.content,
                extracted_title=extracted_title,
                overall_verdict=overall_verdict,
                overall_evidence_strength=overall_strength,
                overall_explanation=overall_explanation,
                claims=claim_results,
                created_at=now,
                is_demo=False
            )

            await _save_verification_record(final_response)

            # Complete Event
            payload_dict = final_response.model_dump()
            payload_dict["created_at"] = now.isoformat()
            yield f"data: {json.dumps({'stage': 'COMPLETE', 'message': 'Verification complete.', 'progress_percentage': 100, 'data': payload_dict})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'stage': 'ERROR', 'message': f'Verification encountered an error: {str(e)}', 'progress_percentage': 0})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
