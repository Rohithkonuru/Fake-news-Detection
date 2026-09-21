import re
from typing import Tuple, Optional
from bs4 import BeautifulSoup
from backend.utils.ssrf import safe_fetch_url, is_safe_url

class ArticleExtractor:
    @staticmethod
    async def extract_from_url(url: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Safely fetches and extracts clean article title, publication date, and body text.
        Returns: (title, text, error_message)
        """
        html, error = await safe_fetch_url(url)
        if error:
            return None, None, error

        try:
            soup = BeautifulSoup(html, "html.parser")
            
            # Remove non-content tags
            for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form", "iframe", "noscript", "svg"]):
                tag.decompose()

            # Extract Title
            title = None
            og_title = soup.find("meta", property="og:title") or soup.find("meta", attrs={"name": "twitter:title"})
            if og_title and og_title.get("content"):
                title = og_title["content"].strip()
            elif soup.title and soup.title.string:
                title = soup.title.string.strip()
            elif soup.find("h1"):
                title = soup.find("h1").get_text().strip()

            # Extract Main Body Content
            body_paragraphs = []
            
            # Check for <article> or <main> container first
            container = soup.find("article") or soup.find("main") or soup.find("div", class_=re.compile(r'content|article|post|story|entry', re.I))
            if container:
                paragraphs = container.find_all(["p", "h2", "h3"])
            else:
                paragraphs = soup.find_all("p")

            for p in paragraphs:
                txt = p.get_text().strip()
                # Ignore cookie banners, copyright notices, and tiny navigation fragments
                if len(txt) > 35 and not re.search(r'cookie|all rights reserved|privacy policy|terms of service|subscribe now', txt, re.I):
                    body_paragraphs.append(txt)

            full_text = "\n\n".join(body_paragraphs)
            if not full_text:
                # Fallback to general text extraction
                full_text = soup.get_text(separator=" ", strip=True)
                full_text = re.sub(r'\s+', ' ', full_text)[:10000]

            if not full_text or len(full_text) < 40:
                return None, None, "Could not extract readable article text from the provided webpage."

            return title or "Extracted Web Article", full_text, None

        except Exception as e:
            return None, None, f"Error parsing webpage structure: {str(e)}"

    @staticmethod
    def parse_raw_text(raw_text: str) -> Tuple[Optional[str], str]:
        """
        Separates potential headline from article body for text submissions.
        """
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        if not lines:
            return None, ""
        if len(lines) == 1:
            return None, lines[0]
        
        # First line is likely the headline if it's relatively short
        first_line = lines[0]
        if len(first_line) < 200 and not first_line.endswith("."):
            title = first_line
            body = "\n\n".join(lines[1:])
            return title, body
        else:
            return None, raw_text
