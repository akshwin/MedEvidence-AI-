"""
Initialize database and create tables
"""

from app.database import engine, Base
from app.models.user import User, UserPreferences
from app.models.conversation import Conversation, Message
from app.models.dashboard import (
    SavedQuery, Bookmark, ReadingList, ReadingListPaper,
    PaperNote, Alert, UserActivity, ApiUsage, PerformanceMetric,
    PaperAnnotation, PaperComparison, PaperRecommendation
)

def init_db():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()

