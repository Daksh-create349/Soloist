from app.config import get_settings
from typing import Optional

settings = get_settings()

# Default drafts used when no API key is configured (or as fallback)
DEFAULT_EMAIL_DRAFT = """Hi {client_name},

Hope the {project} work has been hitting the mark! Just a quick nudge — Invoice #{invoice_number} (${amount}) was due {days} days ago and seems to have slipped through the cracks.

No stress — you can pay securely here: [Pay Now]

Let me know if anything looks off.

Best,
Alex"""

DEFAULT_PROPOSAL_DRAFT = """Hi {company} team,

I came across your posting for {job_title} and it's a strong match for the work I specialize in.

I'm a product designer focused exclusively on fintech and B2B SaaS products. Over the last 3 years, I've helped 12+ financial products ship cleaner, more intuitive interfaces — from onboarding flows to complex dashboard redesigns.

A few things that stood out about your project:
· {highlight_1}
· {highlight_2}
· Timeline looks like a fit with my current availability

My rate is {rate}. I can start within the week.

Happy to share 2–3 relevant case studies if helpful.

Best,
Alex Rivera"""


async def generate_email_draft(
    client_name: str,
    client_email: str,
    project: str,
    tone: str = "friendly",
    context: Optional[str] = None,
) -> dict:
    """Generate an AI email draft using OpenAI."""

    if settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            system_prompt = f"""You are Soloist AI, a high-end productivity assistant for solo operators. 
Draft a {tone} follow-up email to a client.
Guidelines:
- Keep it concise (under 150 words)
- Match the tone: {tone}
- Include a clear call-to-action
- Sign off as "Alex"
- Do NOT include the subject line in the body content."""

            user_prompt = f"""Client: {client_name}
Email: {client_email}
Project: {project}
Context: {context or 'General follow-up'}"""

            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=500,
            )
            body = response.choices[0].message.content

            subject_response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a professional copywriter. Write a short, engaging email subject line for the following email body."},
                    {"role": "user", "content": body}
                ],
                max_tokens=50,
            )
            subject = subject_response.choices[0].message.content.strip().strip('"')

            return {
                "to": client_email,
                "subject": subject,
                "body": body,
                "tone": tone,
                "ai_generated": True,
            }
        except Exception as e:
            print(f"OpenAI Error: {e}")
            pass

    # Fallback: use template
    body = DEFAULT_EMAIL_DRAFT.format(
        client_name=client_name.split()[0] if client_name else "there",
        project=project or "current project",
        invoice_number="004",
        amount="2,800",
        days=3,
    )

    return {
        "to": client_email or "client@example.com",
        "subject": f"Quick note on Invoice #004 — Soloist",
        "body": body,
        "tone": tone,
        "ai_generated": False,
    }


async def generate_proposal_draft(
    job_title: str,
    company: str,
    platform: str = "Upwork",
    rate: str = "$85/hr",
    description: str = "",
    tone: str = "professional",
) -> dict:
    """Generate an AI proposal draft using OpenAI."""

    if settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            system_prompt = f"""You are Soloist AI, a top-tier freelancer. Write a compelling, high-converting proposal for a job.
Tone: {tone}
Guidelines:
- Keep it under 200 words
- Be specific to the job requirements
- Mention relevant expertise in product design and development
- Include the rate: {rate}
- End with a soft call-to-action
- Sign off as "Alex Rivera"
- Do NOT include a subject line."""

            user_prompt = f"""Job Title: {job_title}
Company: {company}
Platform: {platform}
Rate: {rate}
Job Description: {description}"""

            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=800,
            )
            body = response.choices[0].message.content

            return {
                "job_title": job_title,
                "company": company,
                "platform": platform,
                "rate": rate,
                "body": body,
                "tone": tone,
                "word_count": len(body.split()),
                "ai_generated": True,
            }
        except Exception as e:
            print(f"OpenAI Error: {e}")
            pass

    # Fallback: use template
    highlights = description.split(".")[:2] if description else [
        "Mobile-first fintech redesign — this is my primary area of focus",
        "You need someone who understands financial UX constraints — I do",
    ]
    body = DEFAULT_PROPOSAL_DRAFT.format(
        company=company or "the",
        job_title=job_title or "this role",
        highlight_1=highlights[0].strip() if highlights else "Strong skill match",
        highlight_2=highlights[1].strip() if len(highlights) > 1 else "Fits my current availability",
        rate=rate,
    )

    return {
        "job_title": job_title,
        "company": company,
        "platform": platform,
        "rate": rate,
        "body": body,
        "tone": tone,
        "word_count": len(body.split()),
        "ai_generated": False,
    }


async def get_client_intelligence(
    client_name: str,
    project: str,
    health_score: int,
) -> dict:
    """Generate AI intelligence insights for a client."""

    # Compute insights from data
    first_name = client_name.split()[0] if client_name else "Client"

    optimal_day = "Tuesday"
    optimal_time = "9-11 AM"

    if health_score > 80:
        risk_level = "Low"
        upsell_signal = f"Potential expansion detected in {project} scope based on recent messages."
    elif health_score > 50:
        risk_level = "Medium"
        upsell_signal = f"Client engagement is steady — consider proposing a follow-up phase for {project}."
    else:
        risk_level = "High"
        upsell_signal = f"Focus on retention. Schedule a check-in call about {project} progress."

    return {
        "optimal_contact": {
            "day": optimal_day,
            "time": optimal_time,
            "note": f"{first_name} responds fastest on {optimal_day} mornings between {optimal_time}.",
        },
        "upsell": {
            "signal": upsell_signal,
            "risk_level": risk_level,
        },
        "next_milestone": {
            "amount": 3600,
            "note": "AI will auto-fill from contract terms.",
        },
    }
