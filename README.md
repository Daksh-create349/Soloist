# Soloist — The AI Operating System for Solo Agencies

Soloist is a unified AI operating system built exclusively for solo operators. It's not another CRM. It's not another automation tool. It's the single place where your client relationships, your business operations, and your opportunity pipeline live together — and an AI layer runs the connective tissue between them.

![Soloist Dashboard](https://raw.githubusercontent.com/Daksh-create349/Soloist/main/public/dashboard_preview.png)

## ◉ The Problem Soloist Solves
The "one-person agency" is the fastest-growing segment of the creator economy. A solo designer, marketer, developer, or consultant can now deliver agency-quality output using AI tools — but they're often drowning in operational chaos. 

Soloist bridges the gap between a "One-Man Shop" and an "Elite Agency" by providing:
1. **Tool Consolidation**: No more context switching between CRM, Invoicing, and Lead Gen tools.
2. **Proactive Lead Discovery**: Surface opportunities before they go cold.
3. **Operational Autopilot**: Run your business while you focus on delivery.

---

## 🚀 Core Product Pillars

### 1. Opportunity Radar
Monitors job boards, LinkedIn, Reddit, and niche communities. Surfaces ranked leads, gigs, collabs, and trends for your specific niche — proactively.
- **Niche Profile Engine**: Define your skillset once; the system scores every lead for fit.
- **Multi-Source Monitor**: Real-time listening across 5+ platforms.
- **Trend Signals**: Intelligence on emerging markets before they peak.

### 2. Ops Autopilot
Set your rules once. Let Soloist handle the rest.
- **Automation Builder**: A visual, no-code rule builder (e.g., *"If invoice unpaid after 3 days → Send AI-drafted reminder"*).
- **AI Task Calibration**: Dynamically optimizes your schedule based on capacity.
- **Client Onboarding**: Automatically generates project briefs and first invoice drafts.

### 3. Revenue Intelligence
A real-time view of your business health.
- **MRR & Pipeline Tracking**: Full visibility into your earning potential.
- **Capacity Planner**: Tracks billable hours vs. availability.
- **Client Health Scoring**: Signals at-risk accounts before they churn.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Design System
- **Components**: Shadcn/UI + Framer Motion (Glassmorphism aesthetics)
- **State management**: React Query + Local State

### Backend
- **Core**: FastAPI (Python 3.10+)
- **Database**: SQLite (SQLAlchemy ORM)
- **AI Layer**: Anthropic Claude API (contextual drafting)
- **Architecture**: RESTful API with modular routing

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Anthropic API Key (optional for AI features)

### 1. Backend Setup
```bash
cd "Sololist Backend"
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd "Sololist Frontend"
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🎨 Design Philosophy
Soloist uses a **Rich Aesthetic** design system:
- **Glassmorphism**: Subtle translucent layers for depth.
- **Premium Dark Mode**: Harmonious HSL-tuned color palettes.
- **Micro-animations**: Smooth transitions using Framer Motion for a "living" interface.

---

## 🗺 Roadmap
- [x] **Phase 1**: Core CRM & Invoicing
- [x] **Phase 2**: AI Upsell Intelligence
- [ ] **Phase 3**: White-label Client Portals
- [ ] **Phase 4**: Native Mobile Companion app

---

## 📄 License
This project is for demonstration/startup MVP purposes. Built with ❤️ for the SummerHacks 2025 community.
