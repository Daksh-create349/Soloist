# Project Specification: Soloist Opportunity Agent

## 1. System Overview

Soloist is an autonomous, containerized AI agent swarm designed to act as a 24/7 opportunity engine for freelancers. It ingests a user's master resume and portfolio (via PDF, DOCX, or Text), indexes it into a local Vector DB, and autonomously hunts for freelance gigs across 5 specific platforms. For every high-match job, it generates a custom-tailored PDF resume, an outreach email, and provides a direct "Apply" link.

**Target Sources (Strictly Freelance/Gig):**

1. Upwork
2. Fiverr
3. LinkedIn (Contract/Freelance filter)
4. Reddit (r/forhire, r/freelance)
5. DuckDuckGo Search (Dorking for niche gigs)

**Tech Stack:**

- **Backend/API:** FastAPI (Python 3.12+)
- **Dependency Management:** `uv`
- **Containerization:** Docker & Docker Compose
- **Agent Orchestration:** LangGraph (State Machine)
- **Scraping & Anti-Bot Engine:** Playwright (Async, Stealth) + DuckDuckGo HTML parsing
- **Document Parsing:** `PyMuPDF` (PDFs), `python-docx` (Word docs)
- **PDF Generation:** `markdown2` + `WeasyPrint` (Markdown -> HTML -> PDF)
- **Vector Database (RAG):** ChromaDB (Local, persistent via Docker)
- **LLM Provider:** OpenAI API (`gpt-5-mini` for heavy processing/filtering, `gpt-5` or `gpt-4o` for final PDF resume and email drafting)
- **Database (Caching):** SQLite + SQLAlchemy
- **Frontend:** HTML/Vanilla JS (served via FastAPI static files)

---

## 2. Directory Structure

Enforce this exact modular structure during creation:

```text
soloist_agent/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Environment variables & configuration
│   ├── api/
│   │   ├── routes.py           # FastAPI endpoints (Upload, Scrape, Jobs)
│   ├── core/
│   │   ├── state.py            # LangGraph State TypedDict
│   │   ├── database.py         # SQLite setup & JobLead models
│   │   └── pdf_generator.py    # WeasyPrint logic for PDF generation
│   ├── scrapers/
│   │   ├── browser.py          # Playwright stealth & anti-scraping bypasses
│   │   ├── source_upwork.py    # RSS / Search Dorking
│   │   ├── source_linkedin.py  # Cookie-injected scraping
│   │   ├── source_reddit.py    # JSON/HTML parsing
│   │   ├── source_fiverr.py    # Buyer request/gig scraping
│   │   └── source_ddg.py       # DuckDuckGo dorking
│   ├── rag/
│   │   ├── document_parser.py  # PDF, DOCX, TXT extraction
│   │   ├── ingest.py           # Chunking and embedding logic
│   │   └── vector_store.py     # ChromaDB interface
│   └── agents/
│       ├── workflow.py         # LangGraph pipeline definition
│       ├── nodes.py            # Scout, Filter, Crafter nodes
│       └── prompts.py          # System prompts for gpt-5-mini
├── data/
│   ├── uploads/                # User uploaded PDFs/DOCs go here
│   └── generated_pdfs/         # Output tailored resumes
├── static/
│   ├── index.html              # Frontend UI with "Apply" buttons
│   ├── style.css
│   └── app.js
├── Dockerfile                  # Multi-stage Dockerfile (Playwright + WeasyPrint)
├── docker-compose.yml          # Container orchestration with volume mounts
├── pyproject.toml              # uv dependency configuration
└── .env.example
```

---

## 3. Core Modules & Implementation Details

### A. Anti-Scraping Bypass Strategies (Hackathon Loopholes)

Live scraping Upwork, Fiverr, and LinkedIn will immediately result in IP bans if done naively. Implement these specific workarounds in `app/scrapers/`:

1. **Playwright Stealth:** Use `playwright-stealth` package to spoof navigator properties and mask WebDriver status.
2. **DuckDuckGo Search Dorking (The Ultimate Bypass):** Instead of scraping Upwork's heavily guarded search bar, scrape DuckDuckGo with dorks: `site:upwork.com/freelance-jobs/ "machine learning" "budget"`. This bypasses Cloudflare completely.
3. **LinkedIn Authenticated Cookies:** Include a `LINKEDIN_SESSION_COOKIE` in `.env`. The Playwright script must inject this cookie into the browser context before navigating to `linkedin.com/jobs/search?f_WT=2` (Contract jobs).
4. **Reddit JSON:** Do not scrape Reddit HTML. Append `.json` to the subreddit URL (e.g., `reddit.com/r/forhire/new.json`) to get raw data and bypass HTML bot challenges.
5. **Target Quota:** The orchestrator must aim to extract exactly 3-5 valid job links from each of the 5 sources (total ~15-25 jobs per run).

### B. Document Ingestion & RAG (`app/rag/document_parser.py`)

- **Upload Endpoint:** `POST /api/upload` accepts `.txt`, `.pdf`, or `.docx`.
- **Parsing:** Use `PyMuPDF` (`fitz`) for PDFs and `python-docx` for Word documents to extract raw text.
- **Ingestion:** Split text into 500-token chunks with 50-token overlap. Embed using `text-embedding-3-small` and store in local ChromaDB.

### C. The Agentic Workflow (LangGraph)

Uses `gpt-5-mini` (or equivalent latest-gen fast model) to save tokens, switching to the heaviest model for the final craft.

1. **The Sourcing Node:** Triggers the 5 scraper modules concurrently via `asyncio.gather()`. Returns a list of structured job URLs and raw text.
2. **The Filter Node (`gpt-5-mini`):**
   - Queries ChromaDB with the job requirements.
   - Calculates a `match_score` (0-100).
   - If `match_score` > 75, proceeds. Otherwise, discards.
3. **The Crafter Node (`gpt-5`):**
   - **Task 1 (Email):** Drafts a highly specific outreach email.
   - **Task 2 (Resume Markdown):** Generates a Markdown resume highlighting _only_ the user's experience relevant to this specific gig.
4. **The PDF Generator (`app/core/pdf_generator.py`):**
   - Takes the outputted Markdown.
   - Uses `markdown2` to convert to HTML.
   - Uses `WeasyPrint` to convert HTML to a beautifully styled, downloadable PDF saved in `data/generated_pdfs/{job_id}.pdf`.

### D. Frontend Dashboard (`static/index.html`)

- **Upload Section:** Drag-and-drop zone for user's master resume (PDF/DOCX).
- **Run Button:** "Hunt for Gigs" (triggers the agent pipeline).
- **Results Feed:** A card for each matched job containing:
  - Job Title, Source (e.g., Fiverr, Upwork), and Match Score.
  - The Generated Email Draft (in a copyable `<textarea>`).
  - A **"Download Custom Resume (PDF)"** button.
  - A prominent **"Apply Now"** button that wraps the `job_url` in an `href` targeting `_blank` to immediately take the user to the live gig.

---

## 4. Docker & Infrastructure Constraints

### `Dockerfile`

To run Playwright and WeasyPrint (PDF generation) inside Docker, specific OS libraries are required.

- **Base Image:** `mcr.microsoft.com/playwright/python:v1.42.0-jammy`
- **System Dependencies:** Must run `apt-get update && apt-get install -y pango1.0-tools libpango-1.0-0 libcairo2 libpq-dev` (required for WeasyPrint to generate PDFs).
- **uv Setup:** Install `uv` globally and use `uv sync --frozen` to install `requirements.txt`/`pyproject.toml`.

### `docker-compose.yml`

Must include explicit volume mounts so user uploads and generated PDFs survive container restarts:

```yaml
services:
  soloist-api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./chroma_db:/app/chroma_db
      - ./sqlite_db:/app/sqlite_db
      - ./data:/app/data
    env_file:
      - .env
```

---

## 5. Execution Directives for the AI Coder

When building this project, strictly adhere to the following rules:

1. **Model Versions:** Use `gpt-4o-mini` / `gpt-5-mini` string representations for the Filter/Scout agents, and the highest intelligence model available (`gpt-4o` or `gpt-5`) for the Crafter agent.
2. **No Dummy Scraping:** Implement the actual anti-scraping bypasses mentioned above. Do not use fake JSON arrays. If Upwork blocks the scraper, the DuckDuckGo fallback parser MUST work.
3. **PDF Logic:** The PDF must be generated natively in Python (WeasyPrint). Do not rely on external paid APIs for PDF generation.
4. **Asynchronous Scraping:** The 5 sources must be scraped asynchronously to ensure the hackathon demo completes the sourcing phase in under 30 seconds.
5. **Robust Error Handling:** Wrap all scrapers in `try/except`. If Fiverr fails, the LangGraph state should still process the jobs successfully retrieved from Reddit and Upwork.
