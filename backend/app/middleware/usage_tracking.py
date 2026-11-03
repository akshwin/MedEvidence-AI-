"""
Middleware for tracking API usage and performance metrics
"""

import time
import json
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Callable
import uuid

from app.database import SessionLocal
from app.models.dashboard import ApiUsage, PerformanceMetric
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class UsageTrackingMiddleware(BaseHTTPMiddleware):
    """Middleware to track API usage and performance metrics"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip tracking for health checks and static files
        if request.url.path in ["/health", "/docs", "/openapi.json", "/"]:
            return await call_next(request)

        # Skip if tracking is disabled
        if not settings.enable_usage_tracking:
            return await call_next(request)

        # Get user ID from token if available
        user_id = None
        if "authorization" in request.headers:
            try:
                from app.api.routes.auth import decode_access_token

                token = request.headers["authorization"].replace("Bearer ", "")
                payload = decode_access_token(token)
                user_id = payload.get("sub")
            except:
                pass  # User not authenticated or token invalid

        # Track request start time
        start_time = time.time()
        request_size = 0

        # Calculate request size (approximate, don't consume body)
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                # Try to get content-length header first
                content_length = request.headers.get("content-length")
                if content_length:
                    request_size = int(content_length)
                else:
                    # Fallback: read body (this consumes it, so we need to recreate)
                    body = await request.body()
                    request_size = len(body)

                    # Recreate request with body for downstream handlers
                    async def receive():
                        return {"type": "http.request", "body": body}

                    request._receive = receive
            except:
                request_size = 0

        # Get client info
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")

        # Track endpoint
        endpoint = request.url.path
        method = request.method

        # Process request
        error_message = None
        status_code = 200
        response_size = 0

        try:
            response = await call_next(request)

            # Calculate response time
            response_time_ms = int((time.time() - start_time) * 1000)

            # Get status code
            status_code = response.status_code

            # Calculate response size (approximate)
            if hasattr(response, "body"):
                try:
                    response_size = len(response.body) if response.body else 0
                except:
                    pass

            # Log usage to database (async, non-blocking)
            try:
                db = SessionLocal()
                try:
                    usage = ApiUsage(
                        user_id=user_id,
                        endpoint=endpoint,
                        method=method,
                        status_code=status_code,
                        response_time_ms=response_time_ms,
                        request_size_bytes=request_size if request_size > 0 else None,
                        response_size_bytes=response_size if response_size > 0 else None,
                        error_message=error_message,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        metadata_json=(
                            json.dumps(
                                {
                                    "query_params": (
                                        str(request.url.query) if request.url.query else None
                                    )
                                }
                            )
                            if request.url.query
                            else None
                        ),
                    )
                    db.add(usage)

                    # Track performance metrics if enabled
                    if settings.enable_performance_monitoring:
                        # Track response time metric
                        perf_metric = PerformanceMetric(
                            metric_type="response_time",
                            endpoint=endpoint,
                            value=response_time_ms,
                            metadata_json=json.dumps(
                                {"method": method, "status_code": status_code}
                            ),
                        )
                        db.add(perf_metric)

                        # Track error rate if status >= 400
                        if status_code >= 400:
                            error_metric = PerformanceMetric(
                                metric_type="error_rate",
                                endpoint=endpoint,
                                value=1,
                                metadata_json=json.dumps(
                                    {"method": method, "status_code": status_code}
                                ),
                            )
                            db.add(error_metric)

                    db.commit()
                except Exception as e:
                    db.rollback()
                    # Don't fail the request if tracking fails
                    logger.error(f"Error tracking usage: {e}")
                finally:
                    db.close()
            except Exception as e:
                # Don't fail the request if tracking fails
                logger.error(f"Error creating DB session for usage tracking: {e}")

            return response

        except Exception as e:
            # Calculate response time even on error
            response_time_ms = int((time.time() - start_time) * 1000)
            error_message = str(e)
            status_code = 500

            # Log error usage
            try:
                db = SessionLocal()
                try:
                    usage = ApiUsage(
                        user_id=user_id,
                        endpoint=endpoint,
                        method=method,
                        status_code=500,
                        response_time_ms=response_time_ms,
                        request_size_bytes=request_size if request_size > 0 else None,
                        error_message=error_message,
                        ip_address=ip_address,
                        user_agent=user_agent,
                    )
                    db.add(usage)

                    # Track error metric
                    if settings.enable_performance_monitoring:
                        error_metric = PerformanceMetric(
                            metric_type="error_rate",
                            endpoint=endpoint,
                            value=1,
                            metadata_json=json.dumps(
                                {
                                    "method": method,
                                    "error": error_message[:200],  # Truncate long errors
                                }
                            ),
                        )
                        db.add(error_metric)

                    db.commit()
                except:
                    db.rollback()
                finally:
                    db.close()
            except:
                pass

            # Re-raise the exception
            raise
