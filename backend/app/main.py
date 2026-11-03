"""
MedEvidence - Evidence-Based Medical Research LLM Platform
FastAPI Backend
"""

import logging

# Configure before app imports so import-time warnings are formatted too
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import Base, engine
from app.models import (
    user as _user,
    conversation as _conversation,
    dashboard as _dashboard,
)  # noqa: F401 (registers tables)
from app.api.routes import query, search, contact, auth, conversations, dashboard
from app.middleware.usage_tracking import UsageTrackingMiddleware
from app.services.sentry_service import init_sentry

# Initialize Sentry error tracking
init_sentry()

# Create any missing tables (no-op for existing ones)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedEvidence AI API",
    description="Evidence-based medical research assistant with peer-reviewed citations",
    version="0.1.0",
)

# Add usage tracking middleware (before CORS)
app.add_middleware(UsageTrackingMiddleware)

# CORS middleware
# Get allowed origins from environment or use defaults
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Add frontend URL from settings if provided
if settings.frontend_url and settings.frontend_url not in allowed_origins:
    allowed_origins.append(settings.frontend_url)

# In development, allow all origins for easier testing
# In production, use specific origins only
cors_origins = ["*"] if settings.debug else allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["conversations"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(query.router, prefix="/api", tags=["query"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(contact.router, prefix="/api", tags=["contact"])


@app.get("/")
async def root():
    return {
        "message": "MedEvidence AI API",
        "version": "0.1.0",
        "description": "Evidence-based medical research platform",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
