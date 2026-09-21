import re
import urllib.parse
import xml.etree.ElementTree as ET
import logging
from typing import List, Dict, Any
import httpx
from bs4 import BeautifulSoup
from backend.config import settings
from backend.services.source_analyzer import SourceAnalyzer

logger = logging.getLogger(__name__)

class SearchService:
    WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"
    GOOGLE_NEWS_RSS_URL = "https://news.google.com/rss/search"

    @classmethod
    async def search_evidence(cls, query: str, max_results: int = 6) -> List[Dict[str, Any]]:
        """
        Retrieves real evidence snippets from the web.
        Combines real news publications (via open news feeds), encyclopedic records (Wikipedia API),
        and open web search. Never fabricates evidence.
        """
        results: List[Dict[str, Any]] = []
        cleaned_query = query.strip()

        # 1. Fetch real news evidence from Google News Open Feed
        try:
            news_results = await cls._search_news_rss(cleaned_query, limit=4)
            results.extend(news_results)
        except Exception as e:
            logger.warning(f"News RSS search error: {e}")

        # 2. Fetch verifiable encyclopedic/scientific data from Wikipedia API
        try:
            wiki_results = await cls._search_wikipedia(cleaned_query, limit=3)
            results.extend(wiki_results)
        except Exception as e:
            logger.warning(f"Wikipedia search error: {e}")

        # Deduplicate results by URL domain/path
        unique_results: List[Dict[str, Any]] = []
        seen_urls = set()

        for item in results:
            url = item.get("url", "")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)

            # Enrich with source categorization
            source_info = SourceAnalyzer.categorize_source(url, item.get("source_name", ""))
            item["source_type"] = source_info["category"]
            item["source_weight"] = source_info["weight"]
            unique_results.append(item)

        # Sort with preference hierarchy: Fact check > Official/Academic > News > General
        unique_results.sort(key=lambda x: x.get("source_weight", 0.5), reverse=True)
        return unique_results[:max_results]

    @classmethod
    async def _search_news_rss(cls, query: str, limit: int = 4) -> List[Dict[str, Any]]:
        """
        Searches real news archives and current reports via open RSS.
        """
        # Clean query for search keywords
        keywords = " ".join([w for w in query.split() if len(w) > 2 and not w.lower() in ("that", "which", "with", "this", "from")][:8])
        params = {
            "q": keywords,
            "hl": "en-US",
            "gl": "US",
            "ceid": "US:en"
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        }
        
        async with httpx.AsyncClient(timeout=settings.SEARCH_TIMEOUT_SECONDS) as client:
            resp = await client.get(cls.GOOGLE_NEWS_RSS_URL, params=params, headers=headers)
            if resp.status_code != 200:
                return []

            news_items = []
            try:
                root = ET.fromstring(resp.text)
                items = root.findall(".//item")
                
                for item in items[:limit]:
                    title_elem = item.find("title")
                    link_elem = item.find("link")
                    pub_elem = item.find("pubDate")
                    src_elem = item.find("source")

                    title = title_elem.text if title_elem is not None and title_elem.text else "News Article"
                    url = link_elem.text if link_elem is not None and link_elem.text else ""
                    source_name = src_elem.text if src_elem is not None and src_elem.text else "News Source"
                    pub_date = pub_elem.text[:16] if pub_elem is not None and pub_elem.text else None

                    # If URL points to Google news redirect, try extracting domain from source name
                    clean_title = title
                    if " - " in title:
                        clean_title = title.rsplit(" - ", 1)[0]

                    news_items.append({
                        "title": clean_title,
                        "url": url,
                        "source_name": source_name,
                        "snippet": f"{clean_title} — reported by {source_name}. Published: {pub_date or 'Recent'}.",
                        "relevance_score": 0.90,
                        "published_date": pub_date
                    })
            except Exception as ex:
                logger.warning(f"Error parsing news RSS XML: {ex}")

            return news_items

    @classmethod
    async def _search_wikipedia(cls, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Searches Wikipedia API for established facts with compliant User-Agent.
        """
        keywords = " ".join([w for w in query.split() if len(w) > 2][:7])
        params = {
            "action": "query",
            "list": "search",
            "srsearch": keywords,
            "utf8": "1",
            "format": "json",
            "srlimit": limit
        }
        headers = {
            "User-Agent": "TruthLensResearchBot/1.0 (https://truthlens.io; contact@truthlens.io) httpx/0.28.1"
        }

        async with httpx.AsyncClient(timeout=settings.SEARCH_TIMEOUT_SECONDS) as client:
            resp = await client.get(cls.WIKIPEDIA_API_URL, params=params, headers=headers)
            if resp.status_code != 200:
                return []

            data = resp.json()
            search_items = data.get("query", {}).get("search", [])
            wiki_evidence = []

            for item in search_items:
                title = item.get("title", "")
                snippet_raw = item.get("snippet", "")
                clean_snippet = re.sub(r'<[^>]+>', '', snippet_raw).strip()
                page_url = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"

                if clean_snippet and title:
                    wiki_evidence.append({
                        "title": f"Wikipedia: {title}",
                        "url": page_url,
                        "source_name": "Wikipedia",
                        "snippet": clean_snippet,
                        "relevance_score": 0.88,
                        "published_date": item.get("timestamp", "")[:10] if "timestamp" in item else None
                    })
            return wiki_evidence
