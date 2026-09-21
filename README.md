# TruthLens — AI-Powered News & Claim Verification System

[![Python 3.14](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)](https://www.typescriptlang.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.8-F7931E.svg)](https://scikit-learn.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.2-green.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Responsible AI Notice:** TruthLens does not establish absolute mathematical truth. It provides evidence-based claim analysis using available sources, fact-checks, retrieval methods, and machine-learning signals.

---

## 1. Overview

**TruthLens** is a complete, production-quality full-stack intelligence system designed to analyze headlines, factual assertions, news articles, and URLs. Rather than relying on black-box predictions or claiming mathematical omniscience, TruthLens breaks submissions into atomic claims, retrieves verifiable real-world evidence from reliable external databases, evaluates publisher credibility, and synthesizes transparent, explainable verdicts with clickable primary source citations.

---

## 2. Core Capabilities

- **Multi-Modal Claim Ingestion**: Supports direct text statements, multi-paragraph news articles, and live article URLs.
- **SSRF-Protected Web Scraping**: Validates URLs, checks against private IPv4/IPv6 ranges (RFC 1918, RFC 3927, loopback, cloud metadata endpoints), enforces safe redirection policies, and strips boilerplate ads/trackers.
- **NLP Claim Decomposition**: Isolates atomic factual claims from complex compound sentences (e.g. *"Drinking coffee prevents cancer and increases lifespan"* &rarr; Claim 1: *"Drinking coffee prevents cancer"*, Claim 2: *"Drinking coffee increases lifespan"*).
- **Multi-Tier Live Evidence Retrieval**: Gathers live citations from open news repositories, encyclopedic records (Wikipedia API), and accredited fact-checking organizations without hallucinated or synthetic citations.
- **Fact-Checker Synchronization**: Connects to the Google Fact Check Tools API and open fact-checking repositories (Snopes, PolitiFact, Full Fact) to locate existing certified reviews.
- **Source Authority Categorization**: Classifies sources into verified tiers (*Government / Official*, *Scientific / Academic*, *Established News*, *Fact-checking organization*, *Organization*, or *General Website*).
- **ML Pattern Signal (TF-IDF + Logistic Regression)**: Identifies sensationalism, hyperbole, and clickbait phrasing. Strictly labeled in the UI as an **ML Pattern Signal**, never as a "Truth Probability."
- **Server-Sent Events (SSE) Live Pipeline**: Streams real-time progress sequence (`READING_CONTENT` &rarr; `EXTRACTING_CLAIMS` &rarr; `SEARCHING_EVIDENCE` &rarr; `COMPARING_SOURCES` &rarr; `GENERATING_EXPLANATION`).
- **Certified Demo Mode**: Includes three pre-verified benchmarks (🟢 Supported, 🔴 Contradicted, 🟠 Misleading) clearly segregated from live unverified queries.
- **Full History & Analytics Dashboard**: Stores historical verifications in MongoDB (with in-memory fallback), providing search, filtering, and visual SVG analytics.
- **JWT Authentication**: Secure user registration, bcrypt password hashing, and token-based sessions.

---

## 3. Verdict Standards

| Verdict | Meaning | Evidentiary Requirement |
| :--- | :--- | :--- |
| 🟢 **SUPPORTED** | The claim is accurate and corroborated. | Multiple authoritative sources (Academic, Government, Major News) confirm the statement with verifiable evidence; no credible refutations found. |
| 🔴 **CONTRADICTED** | The claim is false or disproven. | Established sources or accredited fact-checking bodies (Snopes, PolitiFact, CDC, FDA) provide direct counter-evidence debunking the statement. |
| 🟠 **MISLEADING / MISSING CONTEXT** | Partially true but deceptive. | The claim refers to genuine events or partial facts, but removes vital caveats, exaggerates findings, or takes quotes out of context. |
| 🟡 **UNVERIFIED** | Inconclusive or insufficient evidence. | Insufficient reliable evidence could be located. **Strict Rule:** Absence of evidence is never converted into "Fake" or "False." |

---

## 4. System Architecture

```
TruthLens/
├── backend/
│   ├── main.py                  # FastAPI entrypoint, lifespan, CORS, error handling
│   ├── config.py                # Pydantic v2 application configuration
│   ├── database.py              # Async Motor MongoDB driver & in-memory fallback
│   ├── api/
│   │   ├── auth.py              # Registration, login, JWT issuance, profile
│   │   ├── health.py            # System health, DB status, ML model status
│   │   ├── history.py           # Historical verifications, analytics & search
│   │   └── verify.py            # Verification engine & SSE streaming endpoint
│   ├── services/
│   │   ├── article_extractor.py # BeautifulSoup HTML parsing & text extraction
│   │   ├── claim_extractor.py   # Atomic claim segmentation & NLP parser
│   │   ├── evidence_service.py  # Stance classification (Supports vs Contradicts)
│   │   ├── factcheck_service.py # Google Fact Check API & open archives
│   │   ├── ml_detector.py       # ML Pattern Signal bridge
│   │   ├── search_service.py    # Open news RSS, Wikipedia API, web retrieval
│   │   ├── source_analyzer.py   # Domain authority & category classifier
│   │   └── verification_engine.py# Transparent verdict synthesizer
│   ├── schemas/                 # Strict Pydantic models (auth & verify)
│   ├── utils/                   # SSRF protection & bcrypt security
│   └── tests/                   # Complete Pytest test suite (12 tests)
├── ml/
│   ├── dataset/                 # Balanced training & test datasets
│   ├── models/                  # Serialized TF-IDF vectorizer & Logistic Regression
│   ├── preprocess.py            # Text normalization & linguistic cues
│   ├── train.py                 # Model training pipeline
│   ├── evaluate.py              # Accuracy, precision, recall, F1, confusion matrix
│   └── inference.py             # High-performance inference detector
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Footer, VerificationBox, ProgressStages,
│   │   │                        # ResultView, EvidenceCard, AuthModal, AnalyticsChart
│   │   ├── pages/               # LandingPage, WorkspacePage, DashboardPage, HowItWorks
│   │   ├── services/            # SSE client, REST API, JWT auth client
│   │   ├── types/               # TypeScript interfaces
│   │   ├── index.css            # Bright Glass Intelligence Laboratory design system
│   │   ├── App.tsx              # Root component & state orchestration
│   │   └── main.tsx             # React 19 entrypoint
│   ├── package.json
│   └── vite.config.ts
├── .env.example
├── .gitignore
└── LICENSE
```

---

## 5. Machine Learning Pipeline

The ML pipeline is trained on verified news and misinformation patterns:
1. **Preprocessing**: Normalized text, stripped URLs, preserved punctuation cues (exclamations, questions, capitalization ratio).
2. **Feature Extraction**: TF-IDF with sublinear term frequency scaling and 1-2 n-grams.
3. **Classifier**: Regularized Logistic Regression with balanced class weights.
4. **Evaluation Metrics** (evaluated on held-out test split):
   - **Accuracy**: 80.00%
   - **Precision**: 80.00%
   - **Recall**: 80.00%
   - **F1 Score**: 80.00%
   - **Confusion Matrix**: `[[8, 2], [2, 8]]`

The ML classifier outputs an **ML Pattern Signal** that detects sensationalism or clickbait phrasing without overriding real-world external evidence.

---

## 6. Installation & Running Locally

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node v24)
- MongoDB (optional; system automatically falls back to in-memory storage if unavailable)

### 1. Clone & Setup Environment
```bash
git clone https://github.com/truthlens/truthlens.git
cd truthlens
cp .env.example .env
```

### 2. Setup & Start Backend
```bash
# Optional: create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install Python requirements
pip install fastapi uvicorn pydantic pydantic-settings motor pymongo httpx beautifulsoup4 scikit-learn joblib pyjwt bcrypt pandas pytest

# Run automated tests
python -m pytest backend/tests -v

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now live at `http://127.0.0.1:8000`. Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Setup & Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 7. API Endpoints

- `GET /api/health` — System status, DB connectivity, ML model availability.
- `POST /api/verify` — Standard synchronous claim verification.
- `POST /api/verify/stream` — Real-time Server-Sent Events (SSE) verification stream.
- `GET /api/verify/demo/{example_id}` — Certified reference cases (`supported`, `contradicted`, `misleading`).
- `POST /api/auth/register` — User registration with bcrypt hashing.
- `POST /api/auth/login` — JWT token generation.
- `GET /api/auth/me` — Authenticated profile lookup.
- `GET /api/history` — Historical verification search and filtering.
- `GET /api/history/stats` — Verification metrics, category breakdown, activity timeline.
- `GET /api/history/{id}` — Single verification report inspection.

---

## 8. Verification & Test Suite

Run the complete backend test suite:
```bash
python -m pytest backend/tests -v
```
Tests verify:
- System health and database connectivity
- SSRF prevention against private IP subnets and localhost
- Multi-claim clause decomposition and attribution stripping
- Source domain authority categorization
- Unverified, Supported, and Contradicted decision logic
- ML Pattern Signal inference
- User registration, login, and demo endpoints

Test the production frontend build:
```bash
cd frontend
npm run build
```

---

## 9. Limitations & AI Ethics

1. **Information Horizon**: Live verification depends on the availability and indexing of public reporting, academic publications, and certified fact-checks.
2. **Novel Events**: Breaking events with zero published coverage will be classified as `UNVERIFIED`. TruthLens never assumes falsity based on missing documentation.
3. **Linguistic Stylometry**: The ML Pattern Signal reflects stylistic markers of clickbait or sensationalism and is explicitly segregated from evidentiary proof.

---

## 10. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
