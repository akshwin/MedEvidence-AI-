"""
Check if dashboard tables exist, if not, create them
"""
from app.database import engine, Base
from app.models.user import User, UserPreferences
from app.models.conversation import Conversation, Message
from app.models.dashboard import (
    SavedQuery, Bookmark, ReadingList, ReadingListPaper,
    PaperNote, Alert, UserActivity
)
from sqlalchemy import inspect

def check_and_create_tables():
    """Check if tables exist and create them if missing"""
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # Required dashboard tables
    required_tables = [
        'saved_queries',
        'bookmarks',
        'reading_lists',
        'reading_list_papers',
        'paper_notes',
        'alerts',
        'user_activities'
    ]
    
    missing_tables = [table for table in required_tables if table not in existing_tables]
    
    if missing_tables:
        print(f"Missing tables: {missing_tables}")
        print("Creating missing tables...")
        Base.metadata.create_all(bind=engine)
        print("✓ Dashboard tables created successfully!")
    else:
        print("✓ All dashboard tables exist!")
    
    # Show all tables
    print(f"\nAll tables in database: {inspector.get_table_names()}")

if __name__ == "__main__":
    check_and_create_tables()





