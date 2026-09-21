import pytest
from backend.services.source_analyzer import SourceAnalyzer

def test_source_categorization():
    # Fact-checking
    fc = SourceAnalyzer.categorize_source("https://www.snopes.com/fact-check/test")
    assert fc["category"] == "Fact-checking organization"
    assert fc["weight"] == 1.0

    # Government
    gov = SourceAnalyzer.categorize_source("https://www.cdc.gov/flu/weekly")
    assert gov["category"] == "Government / Official"
    assert gov["weight"] == 0.95

    # Scientific / Academic
    sci = SourceAnalyzer.categorize_source("https://www.nature.com/articles/s41586-022")
    assert sci["category"] == "Scientific / Academic"

    # Established News
    news = SourceAnalyzer.categorize_source("https://www.reuters.com/world/europe")
    assert news["category"] == "Established News"

    # Unknown
    unk = SourceAnalyzer.categorize_source("https://completely-random-xyz123.com")
    assert unk["category"] == "General Website" or unk["category"] == "Unknown"
