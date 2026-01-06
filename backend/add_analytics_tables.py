"""
Add analytics tables to existing database
"""

from app.database import engine, Base
from app.models.user import User, UserPreferences
from app.models.conversation import Conversation, Message
from app.models.dashboard import (
    SavedQuery, Bookmark, ReadingList, ReadingListPaper,
    PaperNote, Alert, UserActivity, ApiUsage, PerformanceMetric
)

def add_analytics_tables():
    """Create all database tables (will skip existing ones)"""
    try:
        # Create all tables - SQLAlchemy will skip existing ones
        Base.metadata.create_all(bind=engine)
        print("SUCCESS: All tables created/updated successfully!")
        print("  - api_usage")
        print("  - performance_metrics")
        print("  - (and all other tables)")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    add_analytics_tables()

