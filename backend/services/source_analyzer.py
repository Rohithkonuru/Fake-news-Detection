from urllib.parse import urlparse
from typing import Dict, Any
from backend.schemas.verify import SourceCategoryType

FACT_CHECK_DOMAINS = {
    "snopes.com", "politifact.com", "factcheck.org", "fullfact.org",
    "leadstories.com", "checkyourfact.com", "climatefeedback.org",
    "healthfeedback.org", "afp.com/en/fact-check", "reuters.com/fact-check",
    "apnews.com/hub/ap-fact-check", "usatoday.com/news/factcheck"
}

GOVERNMENT_DOMAINS = {
    "who.int", "cdc.gov", "nasa.gov", "noaa.gov", "nih.gov", "fda.gov",
    "un.org", "europa.eu", "epa.gov", "whitehouse.gov", "gov.uk",
    "weather.gov", "usda.gov", "fbi.gov", "census.gov", "state.gov"
}

ACADEMIC_SCIENTIFIC_DOMAINS = {
    "nature.com", "science.org", "sciencemag.org", "thelancet.com",
    "nejm.org", "cell.com", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov",
    "arxiv.org", "sciencedirect.com", "pnas.org", "bmj.com",
    "jamanetwork.com", "springer.com", "wiley.com", "ox.ac.uk", "cam.ac.uk",
    "mit.edu", "harvard.edu", "stanford.edu"
}

ESTABLISHED_NEWS_DOMAINS = {
    "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "theguardian.com",
    "nytimes.com", "wsj.com", "washingtonpost.com", "npr.org", "bloomberg.com",
    "dw.com", "france24.com", "aljazeera.com", "cnbc.com", "economist.com",
    "ft.com", "time.com", "theatlantic.com", "pbs.org", "cbsnews.com",
    "abcnews.go.com", "nbcnews.com"
}

ORGANIZATION_DOMAINS = {
    "redcross.org", "amnesty.org", "worldbank.org", "imf.org", "weforum.org",
    "wmo.int", "iea.org", "wri.org"
}

class SourceAnalyzer:
    @classmethod
    def extract_domain(cls, url: str) -> str:
        if not url:
            return ""
        try:
            parsed = urlparse(url)
            netloc = parsed.netloc.lower()
            # Strip port and www.
            if ":" in netloc:
                netloc = netloc.split(":")[0]
            if netloc.startswith("www."):
                netloc = netloc[4:]
            return netloc
        except Exception:
            return ""

    @classmethod
    def categorize_source(cls, url: str, source_name: str = "") -> Dict[str, Any]:
        """
        Categorizes a source based on domain and known registries.
        Returns category, display label, and credibility tier weight.
        """
        domain = cls.extract_domain(url)
        name_lower = source_name.lower()

        # 1. Fact-checking organizations
        for fcd in FACT_CHECK_DOMAINS:
            if fcd in domain or fcd in url.lower() or ("fact" in name_lower and ("check" in name_lower or "snopes" in name_lower or "politifact" in name_lower)):
                return {
                    "category": "Fact-checking organization",
                    "display_name": source_name or domain,
                    "domain": domain,
                    "weight": 1.0,
                    "explanation": "Certified independent fact-checking entity."
                }

        # 2. Government / Official bodies
        if (domain.endswith(".gov") or domain.endswith(".mil") or domain.endswith(".int") or 
            any(gd in domain for gd in GOVERNMENT_DOMAINS) or 
            any(k in name_lower for k in [".gov", "nasa", "cdc", "who", "nih", "fda", "united nations", "white house", "esa"])):
            return {
                "category": "Government / Official",
                "display_name": source_name or domain,
                "domain": domain,
                "weight": 0.95,
                "explanation": "Official governmental or intergovernmental agency."
            }

        # 3. Scientific / Academic
        if (domain.endswith(".edu") or domain.endswith(".ac.uk") or 
            any(ad in domain for ad in ACADEMIC_SCIENTIFIC_DOMAINS) or
            any(k in name_lower for k in [".edu", "harvard", "mit", "oxford", "stanford", "nature", "science", "lancet", "university"])):
            return {
                "category": "Scientific / Academic",
                "display_name": source_name or domain,
                "domain": domain,
                "weight": 0.95,
                "explanation": "Peer-reviewed scientific journal or accredited academic institution."
            }

        # 4. Established News
        if any(nd in domain for nd in ESTABLISHED_NEWS_DOMAINS):
            return {
                "category": "Established News",
                "display_name": source_name or domain,
                "domain": domain,
                "weight": 0.85,
                "explanation": "Major established wire agency or news organization with public editorial standards."
            }

        # 5. Non-profit / International Organization
        if any(od in domain for od in ORGANIZATION_DOMAINS) or domain.endswith(".org"):
            return {
                "category": "Organization / Company",
                "display_name": source_name or domain,
                "domain": domain,
                "weight": 0.70,
                "explanation": "Non-governmental organization, institution, or corporate domain."
            }

        # 6. General Website
        if domain and ("." in domain):
            return {
                "category": "General Website",
                "display_name": source_name or domain,
                "domain": domain,
                "weight": 0.50,
                "explanation": "General online publication, blog, or public media portal."
            }

        return {
            "category": "Unknown",
            "display_name": source_name or "Unknown Source",
            "domain": domain or "unknown",
            "weight": 0.35,
            "explanation": "Source domain could not be classified into a verified tier."
        }
