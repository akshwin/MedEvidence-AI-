"""
Configuration settings
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Keys
    # IMPORTANT: Do not hardcode secrets in source. Set GROQ_API_KEY via environment variables.
    groq_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None  # Deprecated, kept for backward compatibility
    openai_api_key: Optional[str] = None
    pinecone_api_key: Optional[str] = None  # Made optional for now
    pinecone_environment: str = "us-east-1"
    
    # Database
    database_url: str = "sqlite:///./researchgpt.db"
    
    # Server
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # Vector DB
    vector_db_index_name: str = "sample"
    embedding_model: str = "llama-text-embed-v2"
    embedding_dimension: int = 1024
    
    # PubMed
    pubmed_email: Optional[str] = "user@example.com"  # Made optional for now
    
    # Email Settings (for contact form)
    smtp_server: Optional[str] = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None  # Gmail App Password
    contact_recipient_email: Optional[str] = None  # Defaults to smtp_username if not set
    
    # LLM Settings
    llm_model: str = "llama-3.1-8b-instant"  # Groq model
    max_tokens: int = 2000
    temperature: float = 0.3
    
    # RAG Settings
    top_k: int = 5  # Number of papers to retrieve
    
    # Authentication Settings
    secret_key: str = "your-secret-key-change-in-production-use-env-var"
    access_token_expire_minutes: int = 30 * 24 * 60  # 30 days
    verification_token_expire_hours: int = 24
    reset_token_expire_hours: int = 1
    
    # Frontend URL (for email links)
    frontend_url: str = "http://localhost:3000"
    
    # Monitoring & Analytics
    sentry_dsn: Optional[str] = None  # Sentry DSN for error tracking
    enable_usage_tracking: bool = True  # Enable API usage tracking
    enable_performance_monitoring: bool = True  # Enable performance metrics
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

