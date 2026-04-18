"""Seed the database with initial data matching the Blender Graphic Designer persona."""

from app.database import SessionLocal, create_tables
from app.models.client import Client
from app.models.automation import Automation
from app.models.capacity import Capacity
from app.models.invoice import Invoice
from app.models.opportunity import Opportunity
from app.models.message import Message
from app.models.profile import UserConfig
from datetime import date, datetime, timedelta


def seed():
    """Populate the database with seed data only if it hasn't been set up yet."""
    create_tables()
    db = SessionLocal()

    try:
        # ── Skip seeding if a real profile already exists (set during onboarding) ──
        existing_profile = db.query(UserConfig).filter(UserConfig.id == 1).first()
        if existing_profile and existing_profile.name and existing_profile.name != "Daksh Shrivastav":
            print(f"✅ Profile already exists for '{existing_profile.name}' (niche: {existing_profile.niche}). Skipping seed.")
            db.close()
            return

        # Clear existing data to ensure persona sync is perfect
        db.query(Client).delete()
        db.query(Automation).delete()
        db.query(Opportunity).delete()
        db.query(Invoice).delete()
        db.query(Message).delete()
        db.query(Capacity).delete()
        db.query(UserConfig).delete()
        db.commit()

        # Use the real user's niche if available, else default to Blender persona
        niche = existing_profile.niche if existing_profile else "Blender Graphic Designing"
        seed_name = existing_profile.name if existing_profile else "Daksh Shrivastav"
        seed_agency = existing_profile.agency_name if existing_profile else "D-Motion Studios"
        seed_goals = existing_profile.goals if existing_profile else ["Scale to $20k MRR", "Build 3D Asset Library", "Hire Junior Modeler"]

        print(f"Seeding database for {seed_name} ({niche})...")

        # ── Profile ──
        profile = UserConfig(
            id=1,
            name=seed_name,
            agency_name=seed_agency,
            niche=niche,
            goals=seed_goals
        )
        db.add(profile)

        # ── Clients (3D / Animation / Design) ──
        clients = [
            Client(
                id=1,
                name="Sarah Jenkins",
                company="Unity Studios",
                email="sarah@unity.com",
                initials="SJ",
                avatar_bg="bg-solo-blue",
                project="Real-time Environment Assets",
                project_type="3D Environment Design",
                status="Active",
                health_color="bg-solo-teal",
                health_score=98,
                last_active="10m ago",
                start_date="Jan '25",
                progress=65,
                gross_worth=12000.0,
                collected=8500.0,
                collected_percent=70,
                source="Upwork",
                budget=12000.0,
            ),
            Client(
                id=2,
                name="Marco Rossi",
                company="Pixar Animation",
                email="m.rossi@pixar.com",
                initials="MR",
                avatar_bg="bg-solo-indigo",
                project="Character Sculpting (Hero A)",
                project_type="3D Modeling",
                status="Active",
                health_color="bg-solo-teal",
                health_score=92,
                last_active="2h ago",
                start_date="Feb '25",
                progress=40,
                gross_worth=18000.0,
                collected=5000.0,
                collected_percent=27,
                source="Referral",
                budget=18000.0,
            ),
            Client(
                id=3,
                name="Elena Vance",
                company="Architectural Visuals",
                email="elena@archviz.net",
                initials="EV",
                avatar_bg="bg-solo-amber",
                project="Luxury Penthouse Rendering",
                project_type="ArchViz",
                status="Paused",
                health_color="bg-solo-amber",
                health_score=75,
                last_active="2d ago",
                start_date="Dec '24",
                progress=90,
                gross_worth=8500.0,
                collected=8500.0,
                collected_percent=100,
                source="LinkedIn",
                budget=8500.0,
            ),
            Client(
                id=4,
                name="Tariq Khan",
                company="IndieGames Co",
                email="tariq@indiegames.io",
                initials="TK",
                avatar_bg="bg-solo-coral",
                project="Hard Surface Weapon Pack",
                project_type="Game Assets",
                status="At risk",
                health_color="bg-solo-coral",
                health_score=35,
                last_active="1w ago",
                start_date="Jan '25",
                progress=15,
                gross_worth=4500.0,
                collected=500.0,
                collected_percent=11,
                source="Upwork",
                budget=4500.0,
            ),
        ]
        db.add_all(clients)

        # ── Automations (3D Artist specific) ──
        automations = [
            Automation(
                id=1,
                name="Render Completion Notify",
                trigger="Dropbox folder syncs .exr",
                action="Send Slack notification & Update Notion Status",
                status="Active",
                last_run="15 mins ago",
                trigger_type="file_added",
                action_type="sync_notion",
                delay_days=0,
                tone="professional",
            ),
            Automation(
                id=2,
                name="Daily Progress Render",
                trigger="Every day at 6:00 PM",
                action="Email latest render to client via Gmail",
                status="Active",
                last_run="Yesterday",
                trigger_type="schedule",
                action_type="send_email",
                delay_days=0,
                tone="friendly",
            ),
            Automation(
                id=3,
                name="Milestone Calendar Sync",
                trigger="Notion Database 'Deadline' change",
                action="Sync event to Google Calendar",
                status="Active",
                last_run="3 days ago",
                trigger_type="notion_updated",
                action_type="add_calendar",
                delay_days=0,
                tone="professional",
            ),
            Automation(
                id=4,
                name="AI Proposal Draft",
                trigger="New Upwork matching 'Blender 3D'",
                action="Draft personalized proposal with AI",
                status="Active",
                last_run="1 hour ago",
                trigger_type="new_lead",
                action_type="generate_proposal",
                delay_days=0,
                tone="persuasive",
            ),
        ]
        db.add_all(automations)

        # ── Opportunities (niche-matched) ──
        opportunities = [
            Opportunity(
                id=1,
                title=f"Lead {niche} Artist (Blender)" if "Blender" in niche else f"Senior {niche} Specialist",
                company="Ubisoft",
                source="LinkedIn",
                budget="$80-$120/hr",
                match_score=96,
                posted_at="4h ago",
                description=f"Looking for an expert {niche} specialist to lead high-impact contract work.",
                platform="LinkedIn",
                rate="$100/hr",
                url=f"https://www.linkedin.com/jobs/search/?keywords={niche.replace(' ', '+')}",
                badge_color="bg-solo-blue",
                badge_text="text-solo-blue",
                verified=True,
            ),
            Opportunity(
                id=2,
                title=f"{niche} for High-Impact Project",
                company="MagicEden Labs",
                source="Upwork",
                budget="$5,000 Flat",
                match_score=88,
                posted_at="2h ago",
                description=f"Need a {niche} expert to deliver a focused project with high attention to detail.",
                platform="Upwork",
                rate="$5,000",
                url=f"https://www.upwork.com/nx/jobs/search/?q={niche.replace(' ', '+')}",
                badge_color="bg-solo-teal",
                badge_text="text-solo-teal",
                verified=True,
            ),
            Opportunity(
                id=3,
                title=f"{niche} Consultant — Retainer",
                company="Logitech G",
                source="Direct Portal",
                budget="$150/hr",
                match_score=92,
                posted_at="1h ago",
                description=f"Ongoing retainer contract for a {niche} specialist. Must have portfolio demonstrating past results.",
                platform="Website",
                rate="$150/hr",
                url=f"https://www.toptal.com/freelance-jobs?q={niche.replace(' ', '+')}",
                badge_color="bg-solo-indigo",
                badge_text="text-solo-indigo",
                verified=True,
            ),
        ]
        db.add_all(opportunities)

        # ── Capacity ──
        capacity = Capacity(
            id=1,
            total_hours_weekly=40,
            billable_target=30,
            current_billable=22,
            current_ops=8,
        )
        db.add(capacity)

        # ── Invoices ──
        today = date.today()
        invoices = [
            Invoice(client_id=1, invoice_number="INV-3D-001", amount=4500.0, status="paid", due_date=today - timedelta(days=10), paid_date=today - timedelta(days=8)),
            Invoice(client_id=2, invoice_number="INV-3D-002", amount=5000.0, status="pending", due_date=today + timedelta(days=5)),
        ]
        db.add_all(invoices)

        # ── Messages ──
        messages = [
            Message(client_id=1, role="client", content="Hey Daksh, the latest renders for the Unity project look incredible! Can we add a night theme?", timestamp=datetime.now() - timedelta(hours=2), is_read=False),
            Message(client_id=1, role="user", content="Thanks Sarah! Absolutely, I'll set up the lighting for a night cycle today.", timestamp=datetime.now() - timedelta(hours=1), is_read=True),
        ]
        db.add_all(messages)

        db.commit()
        print("✅ Database re-seeded for Daksh Shrivastav successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
