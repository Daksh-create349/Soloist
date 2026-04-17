# Soloist Backend

Python (FastAPI) backend for the Soloist application — the AI operating system for solo operators.

## Quick Start

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the server (auto-seeds database on first run)
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.

## API Endpoints

| Group | Base Path | Methods |
|-------|-----------|---------|
| Clients | `/api/clients` | GET, POST, PUT, DELETE |
| Automations | `/api/automations` | GET, POST, PUT, PATCH, DELETE |
| Revenue | `/api/revenue` | GET (metrics, capacity, profitability), PUT (capacity) |
| Dashboard | `/api/dashboard` | GET (stats) |
| AI | `/api/ai` | POST (draft-email, draft-proposal, client-intelligence) |

## AI Features

AI endpoints work with **or without** an Anthropic API key:
- **With key**: Uses Claude for real-time generation
- **Without key**: Returns high-quality template drafts

To enable AI generation, add your key to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
```
DATABASE_URL=sqlite:///./soloist.db
ANTHROPIC_API_KEY=           # Optional
FRONTEND_URL=http://localhost:3000
```
