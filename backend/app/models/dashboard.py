"""
Dashboard database models for user activity, saved queries, bookmarks, reading lists, notes, and alerts
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import json

from app.database import Base


class SavedQuery(Base):
    """Saved queries and searches"""

    __tablename__ = "saved_queries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    query_text = Column(Text, nullable=False)
    query_type = Column(String, nullable=False, default="search")  # 'search' or 'chat'
    results_count = Column(Integer, nullable=True)  # Number of results if applicable
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Store search filters/metadata as JSON
    metadata_json = Column(Text, nullable=True)  # JSON string of additional data

    def __repr__(self):
        return f"<SavedQuery(id={self.id}, user_id={self.user_id}, query_text={self.query_text[:50]}...)>"


class Bookmark(Base):
    """Favorite papers/bookmarks"""

    __tablename__ = "bookmarks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    paper_id = Column(String, nullable=False, index=True)  # PMID
    paper_title = Column(String, nullable=True)  # Cache title for quick display
    paper_authors = Column(Text, nullable=True)  # JSON string of authors
    paper_year = Column(Integer, nullable=True)
    paper_journal = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    notes = Column(Text, nullable=True)  # Quick notes on bookmark

    def __repr__(self):
        return f"<Bookmark(id={self.id}, user_id={self.user_id}, paper_id={self.paper_id})>"


class ReadingList(Base):
    """Reading lists for organizing papers"""

    __tablename__ = "reading_lists"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_public = Column(Boolean, default=False)  # For future sharing feature

    # Relationship
    papers = relationship(
        "ReadingListPaper", back_populates="reading_list", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<ReadingList(id={self.id}, user_id={self.user_id}, name={self.name})>"


class ReadingListPaper(Base):
    """Papers in reading lists (many-to-many relationship)"""

    __tablename__ = "reading_list_papers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reading_list_id = Column(String, ForeignKey("reading_lists.id"), nullable=False, index=True)
    paper_id = Column(String, nullable=False, index=True)  # PMID
    paper_title = Column(String, nullable=True)  # Cache title
    paper_authors = Column(Text, nullable=True)  # JSON string
    paper_year = Column(Integer, nullable=True)
    paper_journal = Column(String, nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow, index=True)
    notes = Column(Text, nullable=True)  # Notes specific to this paper in this list

    # Relationship
    reading_list = relationship("ReadingList", back_populates="papers")

    def __repr__(self):
        return f"<ReadingListPaper(id={self.id}, reading_list_id={self.reading_list_id}, paper_id={self.paper_id})>"


class PaperNote(Base):
    """Personal notes on papers"""

    __tablename__ = "paper_notes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    paper_id = Column(String, nullable=False, index=True)  # PMID
    paper_title = Column(String, nullable=True)  # Cache title
    title = Column(String, nullable=True)  # Note title
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tags_json = Column(Text, nullable=True)  # JSON string of tags

    def __repr__(self):
        return f"<PaperNote(id={self.id}, user_id={self.user_id}, paper_id={self.paper_id})>"


class Alert(Base):
    """Custom alerts for new papers matching criteria"""

    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)  # Alert name
    query = Column(Text, nullable=False)  # Search query for alert
    is_active = Column(Boolean, default=True, index=True)
    frequency = Column(String, default="daily")  # 'daily', 'weekly', 'monthly'
    last_checked = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Additional filters as JSON
    filters_json = Column(Text, nullable=True)  # JSON string of filters (year range, journal, etc.)

    def __repr__(self):
        return f"<Alert(id={self.id}, user_id={self.user_id}, name={self.name})>"


class UserActivity(Base):
    """Track user activity for recent activity feed"""

    __tablename__ = "user_activities"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    activity_type = Column(
        String, nullable=False, index=True
    )  # 'query', 'search', 'bookmark', 'note', 'conversation'
    activity_data_json = Column(Text, nullable=True)  # JSON string of activity details
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<UserActivity(id={self.id}, user_id={self.user_id}, activity_type={self.activity_type})>"


class ApiUsage(Base):
    """Track API usage per user for analytics and billing"""

    __tablename__ = "api_usage"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String, ForeignKey("users.id"), nullable=True, index=True
    )  # Nullable for anonymous usage
    endpoint = Column(String, nullable=False, index=True)  # e.g., '/api/query', '/api/search'
    method = Column(String, nullable=False, default="POST")  # GET, POST, etc.
    status_code = Column(Integer, nullable=False, index=True)  # HTTP status code
    response_time_ms = Column(Integer, nullable=True)  # Response time in milliseconds
    request_size_bytes = Column(Integer, nullable=True)  # Request size in bytes
    response_size_bytes = Column(Integer, nullable=True)  # Response size in bytes
    error_message = Column(Text, nullable=True)  # Error message if any
    ip_address = Column(String, nullable=True)  # Client IP address
    user_agent = Column(String, nullable=True)  # User agent string
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Additional metadata as JSON
    metadata_json = Column(Text, nullable=True)  # JSON string of additional data

    def __repr__(self):
        return f"<ApiUsage(id={self.id}, user_id={self.user_id}, endpoint={self.endpoint}, status_code={self.status_code})>"


class PerformanceMetric(Base):
    """Track performance metrics for monitoring"""

    __tablename__ = "performance_metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_type = Column(
        String, nullable=False, index=True
    )  # 'response_time', 'error_rate', 'throughput'
    endpoint = Column(String, nullable=True, index=True)  # Specific endpoint or 'all'
    value = Column(Integer, nullable=False)  # Metric value
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    metadata_json = Column(Text, nullable=True)  # Additional context

    def __repr__(self):
        return (
            f"<PerformanceMetric(id={self.id}, metric_type={self.metric_type}, value={self.value})>"
        )


class PaperAnnotation(Base):
    """Annotations and highlights on papers"""

    __tablename__ = "paper_annotations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    paper_id = Column(String, nullable=False, index=True)  # PMID
    paper_title = Column(String, nullable=True)  # Cache title
    annotation_type = Column(
        String, nullable=False, default="highlight"
    )  # 'highlight', 'note', 'comment'
    selected_text = Column(Text, nullable=True)  # The text that was highlighted
    start_offset = Column(Integer, nullable=True)  # Character offset where annotation starts
    end_offset = Column(Integer, nullable=True)  # Character offset where annotation ends
    content = Column(Text, nullable=True)  # Annotation content/note
    color = Column(String, nullable=True, default="yellow")  # Highlight color
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tags_json = Column(Text, nullable=True)  # JSON string of tags

    def __repr__(self):
        return f"<PaperAnnotation(id={self.id}, user_id={self.user_id}, paper_id={self.paper_id}, type={self.annotation_type})>"


class PaperComparison(Base):
    """Paper comparison sessions"""

    __tablename__ = "paper_comparisons"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=True)  # Optional name for the comparison
    paper_ids_json = Column(Text, nullable=False)  # JSON array of paper IDs being compared
    comparison_data_json = Column(Text, nullable=True)  # JSON of comparison metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<PaperComparison(id={self.id}, user_id={self.user_id}, name={self.name})>"


class PaperRecommendation(Base):
    """AI-powered paper recommendations"""

    __tablename__ = "paper_recommendations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String, ForeignKey("users.id"), nullable=True, index=True
    )  # Nullable for anonymous
    source_paper_id = Column(
        String, nullable=False, index=True
    )  # The paper recommendations are based on
    recommended_paper_id = Column(String, nullable=False, index=True)  # The recommended paper
    recommendation_type = Column(
        String, nullable=False, default="similar"
    )  # 'similar', 'cited_by', 'cites', 'related'
    score = Column(Integer, nullable=True)  # Relevance score (0-100)
    reason = Column(Text, nullable=True)  # Why this paper was recommended
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<PaperRecommendation(id={self.id}, source_paper_id={self.source_paper_id}, recommended_paper_id={self.recommended_paper_id})>"
