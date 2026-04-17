from sqlalchemy import Column, Integer, String, JSON
from app.database import Base

class UserConfig(Base):
    __tablename__ = "user_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    agency_name = Column(String)
    niche = Column(String)
    goals = Column(JSON, default=list) # Store as list of strings
    integrations = Column(JSON, default=dict) # Store API keys/secrets
