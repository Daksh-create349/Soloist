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
    """Populate the database with seed data."""
    create_tables()
    db = SessionLocal()

    try:
        # Clear existing data to ensure persona sync is perfect
        db.query(Client).delete()
        db.query(Automation).delete()
        db.query(Opportunity).delete()
        db.query(Invoice).delete()
        db.query(Message).delete()
        db.query(Capacity).delete()
        db.query(UserConfig).delete()
        db.commit()

        print("Seeding database for Daksh Shrivastav (3D Artist)...")

        # ── Profile ──
        profile = UserConfig(
            id=1,
            name="Daksh Shrivastav",
            agency_name="D-Motion Studios",
            niche="Blender Graphic Designing",
            goals=["Scale to $20k MRR", "Build 3D Asset Library", "Hire Junior Modeler"]
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

        # ── Opportunities (Blender / 3D Modeling) ──
        opportunities = [
            Opportunity(
                id=1,
                title="Lead 3D Environment Artist (Blender)",
                company="Ubisoft",
                source="LinkedIn",
                budget="$80-$120/hr",
                match_score=96,
                posted_at="4h ago",
                description="Looking for an expert Blender artist to lead a team in creating high-poly environment assets for an unannounced RPG project.",
                platform="LinkedIn",
                rate="$100/hr",
                url="https://www.linkedin.com/jobs/view/123456789",
                badge_color="bg-solo-blue",
                badge_text="text-solo-blue",
            ),
            Opportunity(
                id=2,
                title="3D Character Modeler for NFT Collection",
                company="MagicEden Labs",
                source="Upwork",
                budget="$5,000 Flat",
                match_score=88,
                posted_at="2h ago",
                description="Need a Blender wizard to sculpt 10 base characters with 50+ modular trait items (hats, eyewear, armor). High-poly to low-poly baking required.",
                platform="Upwork",
                rate="$5,000",
                url="https://www.upwork.com/jobs/~0123456789abcdef",
                badge_color="bg-solo-teal",
                badge_text="text-solo-teal",
            ),
            Opportunity(
                id=3,
                title="Product Visualization (Blender + Cycles)",
                company="Logitech G",
                source="Direct Portal",
                budget="$150/hr",
                match_score=92,
                posted_at="1h ago",
                description="Ongoing contract for high-end product renders of gaming hardware. Must be expert in Cycles/Eevee and product lighting.",
                platform="Website",
                rate="$150/hr",
                url="https://logitech.com/careers/3d-design",
                badge_color="bg-solo-indigo",
                badge_text="text-solo-indigo",
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
