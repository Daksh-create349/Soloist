from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "sqlite:///./soloist.db"
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:3000"
    NOTION_API_KEY: str = ""
    NOTION_DATABASE_ID: str = ""

    # JIRA
    JIRA_URL: str = ""
    JIRA_EMAIL: str = ""
    JIRA_API_TOKEN: str = ""

    # Google Calendar
    GOOGLE_CALENDAR_CREDENTIALS_FILE: str = "soloist-493618-94a8fbda5337.json"

    # Gmail
    GMAIL_USER: str = ""
    GMAIL_APP_PASSWORD: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
