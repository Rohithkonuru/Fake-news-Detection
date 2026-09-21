import logging
import httpx
from typing import List, Optional
from urllib.parse import quote_plus
from backend.config import settings
from backend.schemas.verify import ExternalFactCheck

logger = logging.getLogger(__name__)

class FactCheckService:
    GOOGLE_FACTCHECK_URL = "https://factchecktools.googleapis.com/v1alpha1/claims:search"

    @classmethod
    async def search_fact_checks(cls, claim_text: str) -> List[ExternalFactCheck]:
        """
        Retrieves real-world fact-checks matching the claim from Google Fact Check Tools API
        or accredited fact-checking repositories.
        """
        results: List[ExternalFactCheck] = []
        
        # 1. Check Google Fact Check Tools API if configured
        if settings.GOOGLE_FACT_CHECK_API_KEY:
            try:
                api_results = await cls._query_google_factcheck(claim_text)
                results.extend(api_results)
            except Exception as e:
                logger.warning(f"Google Fact Check API query failed: {e}")

        # 2. Query open fact check databases via DuckDuckGo lite / instant query targeting fact-check domains
        if len(results) == 0:
            try:
                open_results = await cls._query_open_factcheck_sites(claim_text)
                results.extend(open_results)
            except Exception as e:
                logger.warning(f"Open fact check query failed: {e}")

        return results[:4]

    @classmethod
    async def _query_google_factcheck(cls, query: str) -> List[ExternalFactCheck]:
        params = {
            "query": query[:120],
            "key": settings.GOOGLE_FACT_CHECK_API_KEY,
            "languageCode": "en"
        }
        async with httpx.AsyncClient(timeout=settings.SEARCH_TIMEOUT_SECONDS) as client:
            resp = await client.get(cls.GOOGLE_FACTCHECK_URL, params=params)
            if resp.status_code != 200:
                return []
            
            data = resp.json()
            claims = data.get("claims", [])
            fact_checks: List[ExternalFactCheck] = []
            
            for item in claims:
                original_claim = item.get("text", "")
                claim_reviews = item.get("claimReview", [])
                for cr in claim_reviews:
                    publisher = cr.get("publisher", {}).get("name", "Fact-Checking Agency")
                    rating = cr.get("textualRating", "Evaluated")
                    url = cr.get("url", "")
                    review_date = cr.get("reviewDate", None)
                    claim_author = item.get("claimant", None)

                    if url and original_claim:
                        fact_checks.append(ExternalFactCheck(
                            publisher=publisher,
                            original_claim=original_claim,
                            external_rating=rating,
                            review_date=review_date[:10] if review_date else None,
                            url=url,
                            claim_author=claim_author
                        ))
            return fact_checks

    @classmethod
    async def _query_open_factcheck_sites(cls, claim_text: str) -> List[ExternalFactCheck]:
        """
        Queries trusted fact check publishers directly via search queries when no API key is present.
        """
        # Build a targeted search query for known fact check sites
        keywords = " ".join([w for w in claim_text.split()[:8] if len(w) > 3])
        search_query = f"{keywords} site:snopes.com OR site:politifact.com OR site:factcheck.org"
        
        url = f"https://html.duckduckgo.com/html/?q={quote_plus(search_query)}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (TruthLens/1.0)"
        }
        
        async with httpx.AsyncClient(timeout=settings.SEARCH_TIMEOUT_SECONDS) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                return []

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(resp.text, "html.parser")
            results: List[ExternalFactCheck] = []
            
            links = soup.find_all("div", class_="result")
            for link in links[:3]:
                title_tag = link.find("a", class_="result__snippet") or link.find("a", class_="result__title")
                snippet_tag = link.find("a", class_="result__snippet") or link.find("div", class_="result__snippet")
                url_tag = link.find("a", class_="result__url")
                
                title = title_tag.get_text(strip=True) if title_tag else ""
                snippet = snippet_tag.get_text(strip=True) if snippet_tag else ""
                raw_href = title_tag.get("href") if title_tag else (url_tag.get("href") if url_tag else "")
                
                # Unpack DuckDuckGo redirect url if needed
                actual_url = raw_href
                if "uddg=" in raw_href:
                    import urllib.parse
                    parsed_qs = urllib.parse.parse_qs(urllib.parse.urlparse(raw_href).query)
                    if "uddg" in parsed_qs:
                        actual_url = parsed_qs["uddg"][0]
                
                if not actual_url or not actual_url.startswith("http"):
                    continue

                publisher = "Independent Fact-Checker"
                if "snopes.com" in actual_url:
                    publisher = "Snopes"
                elif "politifact.com" in actual_url:
                    publisher = "PolitiFact"
                elif "factcheck.org" in actual_url:
                    publisher = "FactCheck.org"
                elif "fullfact.org" in actual_url:
                    publisher = "Full Fact"

                # Extract rating cues from snippet/title
                rating = "Fact Checked"
                text_content = (title + " " + snippet).lower()
                if "false" in text_content or "debunked" in text_content or "pants on fire" in text_content:
                    rating = "False / Debunked"
                elif "mostly false" in text_content:
                    rating = "Mostly False"
                elif "misleading" in text_content or "missing context" in text_content:
                    rating = "Missing Context / Misleading"
                elif "true" in text_content or "correct" in text_content:
                    rating = "True / Verified"

                results.append(ExternalFactCheck(
                    publisher=publisher,
                    original_claim=claim_text,
                    external_rating=rating,
                    review_date=None,
                    url=actual_url,
                    claim_author=None
                ))

            return results
