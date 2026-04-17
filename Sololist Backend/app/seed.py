"""Seed the database with initial data matching the frontend mockData.ts."""

from app.database import SessionLocal, create_tables
from app.models.client import Client
from app.models.automation import Automation
from app.models.capacity import Capacity
from app.models.invoice import Invoice
from app.models.opportunity import Opportunity
from app.models.message import Message
from datetime import date, datetime, timedelta


def seed():
    """Populate the database with seed data."""
    create_tables()
    db = SessionLocal()

    try:
        # Only seed if the database is empty
        if db.query(Client).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # ── Clients (matching initialClients in mockData.ts) ──
        clients = [
            Client(
                id=1,
                name="Sarah Chen",
                company="Stripe Inc.",
                email="sarah@stripe.com",
                initials="SC",
                avatar_bg="bg-solo-blue",
                project="Brand Redesign",
                project_type="Design",
                status="Active",
                health_color="bg-solo-teal",
                health_score=92,
                last_active="2h ago",
                start_date="Jan '25",
                progress=68,
                gross_worth=12000.0,
                collected=8400.0,
                collected_percent=70,
                source="referral",
                budget=12000.0,
            ),
            Client(
                id=2,
                name="Marcus Webb",
                company="Acme Corp",
                email="marcus@acmecorp.com",
                initials="MW",
                avatar_bg="bg-zinc-800",
                project="SEO Campaign",
                project_type="Marketing",
                status="Needs attention",
                health_color="bg-solo-amber",
                health_score=65,
                last_active="4d ago",
                start_date="Dec '24",
                progress=45,
                gross_worth=8500.0,
                collected=4250.0,
                collected_percent=50,
                source="linkedin",
                budget=8500.0,
            ),
            Client(
                id=3,
                name="Priya Nair",
                company="NovaTech",
                email="priya@novatech.io",
                initials="PN",
                avatar_bg="bg-solo-teal",
                project="Dev Consulting",
                project_type="Consulting",
                status="At risk",
                health_color="bg-solo-coral",
                health_score=38,
                last_active="12d ago",
                start_date="Sep '24",
                progress=90,
                gross_worth=25000.0,
                collected=22500.0,
                collected_percent=90,
                source="website",
                budget=25000.0,
            ),
            Client(
                id=4,
                name="James Liu",
                company="Moonbase Studio",
                email="james@moonbase.co",
                initials="JL",
                avatar_bg="bg-solo-amber",
                project="Copywriting",
                project_type="Marketing",
                status="Active",
                health_color="bg-solo-teal",
                health_score=88,
                last_active="1d ago",
                start_date="Feb '25",
                progress=15,
                gross_worth=4200.0,
                collected=2100.0,
                collected_percent=50,
                source="upwork",
                budget=4200.0,
            ),
            Client(
                id=5,
                name="Tara Singh",
                company="BloomVC",
                email="tara@bloomvc.com",
                initials="TS",
                avatar_bg="bg-solo-coral",
                project="Pitch Deck",
                project_type="Design",
                status="Active",
                health_color="bg-solo-teal",
                health_score=95,
                last_active="3h ago",
                start_date="Mar '25",
                progress=10,
                gross_worth=6500.0,
                collected=6500.0,
                collected_percent=100,
                source="referral",
                budget=6500.0,
            ),
        ]
        db.add_all(clients)

        # ── Automations (matching initialAutomations in mockData.ts) ──
        automations = [
            Automation(
                id=1,
                name="New Client Onboarding",
                trigger="New client added",
                action="Send scope + scope doc + first invoice",
                status="Active",
                last_run="2h ago",
                trigger_type="new_client",
                action_type="send_email",
                delay_days=0,
                tone="professional",
            ),
            Automation(
                id=2,
                name="Late Payment Follow-up",
                trigger="Invoice overdue > 3 days",
                action="Send AI-drafted reminder email",
                status="Active",
                last_run="Yesterday",
                trigger_type="invoice_overdue",
                action_type="send_email",
                delay_days=3,
                tone="friendly",
            ),
            Automation(
                id=3,
                name="Project Milestones",
                trigger="Client approves milestone",
                action="Notify client + send next invoice",
                status="Paused",
                last_run="4 days ago",
                trigger_type="milestone_approved",
                action_type="send_email",
                delay_days=0,
                tone="professional",
            ),
            Automation(
                id=4,
                name="Lead Qualification",
                trigger="New lead from Radar",
                action="Run profile match + AI draft proposal",
                status="Active",
                last_run="1 hour ago",
                trigger_type="new_lead",
                action_type="generate_proposal",
                delay_days=0,
                tone="professional",
            ),
            Automation(
                id=5,
                name="Weekly Status Update",
                trigger="Every Friday at 5 PM",
                action="Generate report + email to all active clients",
                status="Active",
                last_run="Last Friday",
                trigger_type="scheduled",
                action_type="generate_report",
                delay_days=0,
                tone="professional",
            ),
        ]
        db.add_all(automations)

        # ── Capacity ──
        capacity = Capacity(
            id=1,
            total_hours_weekly=45,
            billable_target=35,
            current_billable=28,
            current_ops=7,
        )
        db.add(capacity)

        # ── Sample Invoices ──
        today = date.today()
        invoices = [
            Invoice(
                client_id=1,
                invoice_number="#001",
                amount=2800.0,
                status="paid",
                due_date=today - timedelta(days=10),
                paid_date=today - timedelta(days=8),
            ),
            Invoice(
                client_id=1,
                invoice_number="#002",
                amount=2800.0,
                status="paid",
                due_date=today - timedelta(days=5),
                paid_date=today - timedelta(days=2),
            ),
            Invoice(
                client_id=1,
                invoice_number="#003",
                amount=2800.0,
                status="sent",
                due_date=today + timedelta(days=5),
            ),
            Invoice(
                client_id=2,
                invoice_number="#001",
                amount=4250.0,
                status="paid",
                due_date=today - timedelta(days=15),
                paid_date=today - timedelta(days=14),
            ),
            Invoice(
                client_id=3,
                invoice_number="#001",
                amount=12500.0,
                status="paid",
                due_date=today - timedelta(days=60),
                paid_date=today - timedelta(days=58),
            ),
            Invoice(
                client_id=3,
                invoice_number="#002",
                amount=10000.0,
                status="overdue",
                due_date=today - timedelta(days=3),
            ),
        ]
        db.add_all(invoices)

        # ── Opportunities (Radar) ──
        opportunities = [
            Opportunity(
                id=1,
                title="Senior UX Designer needed for fintech app",
                company="Nexus Finance",
                source="Upwork",
                budget="$85/hr · Contract",
                match_score=96,
                posted_at="2 hours ago",
                description="Looking for a seasoned UX Designer to lead the redesign of our flagship mobile banking application. Must have experience with complex financial dashboards and accessibility standards.",
                platform="Upwork",
                rate="$85/hr",
                badge_color="bg-solo-teal",
                badge_text="text-solo-teal",
            ),
            Opportunity(
                id=2,
                title="Full-stack developer for SaaS MVP build",
                company="Lumina Labs",
                source="LinkedIn",
                budget="$12k Fixed · 6 Weeks",
                match_score=88,
                posted_at="5 hours ago",
                description="We need a full-stack expert to build the MVP for our next-gen project management tool. Tech stack: React, Node.js, PostgreSQL.",
                platform="LinkedIn",
                rate="$12,000",
                badge_color="bg-solo-blue",
                badge_text="text-solo-blue",
            ),
            Opportunity(
                id=3,
                title="Growth Marketer to scale B2B tool",
                company="Velocity Scale",
                source="Reddit",
                budget="$70/hr · Part-time",
                match_score=82,
                posted_at="1 day ago",
                description="Seeking a growth marketer with a track record in B2B SaaS. Responsible for content strategy, SEO, and paid acquisition.",
                platform="Reddit",
                rate="$70/hr",
                badge_color="bg-solo-amber",
                badge_text="text-solo-amber",
            ),
        ]
        db.add_all(opportunities)

        # ── Sample Messages ──
        messages = [
            Message(
                client_id=1,
                role="client",
                content="Hi! Just wanted to say I'm loving the initial brand concepts. Can we discuss the color palette on Tuesday?",
                timestamp=datetime.now() - timedelta(hours=5),
                is_read=False
            ),
            Message(
                client_id=1,
                role="user",
                content="So glad you like them, Sarah! I've marked Tuesday at 10 AM for our call. I'll prepare some color variations by then.",
                timestamp=datetime.now() - timedelta(hours=4),
                is_read=True
            ),
            Message(
                client_id=2,
                role="client",
                content="Hey Marcus, can you send over the SEO report for last month? Thanks!",
                timestamp=datetime.now() - timedelta(days=1),
                is_read=True
            )
        ]
        db.add_all(messages)

        db.commit()
        print("✅ Database seeded successfully!")
        print(f"   → {len(clients)} clients")
        print(f"   → {len(automations)} automations")
        print(f"   → {len(invoices)} invoices")
        print(f"   → {len(messages)} messages")
        print(f"   → 1 capacity config")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
