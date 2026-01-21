"""
Sentry integration for error tracking
"""

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from app.core.config import settings


def init_sentry():
    """Initialize Sentry error tracking"""
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],
            traces_sample_rate=0.1,  # 10% of transactions for performance monitoring
            profiles_sample_rate=0.1,  # 10% of transactions for profiling
            environment="development" if settings.debug else "production",
            enable_tracing=True,
        )
        print("Sentry initialized successfully")
    else:
        print("Sentry DSN not configured, skipping initialization")


def capture_exception(error: Exception, context: dict = None):
    """Capture an exception in Sentry"""
    if settings.sentry_dsn:
        with sentry_sdk.push_scope() as scope:
            if context:
                for key, value in context.items():
                    scope.set_context(key, value)
            sentry_sdk.capture_exception(error)


def capture_message(message: str, level: str = "info", context: dict = None):
    """Capture a message in Sentry"""
    if settings.sentry_dsn:
        with sentry_sdk.push_scope() as scope:
            if context:
                for key, value in context.items():
                    scope.set_context(key, value)
            sentry_sdk.capture_message(message, level=level)





