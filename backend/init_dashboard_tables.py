"""
Initialize dashboard database tables
Run this script to create all dashboard-related tables
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import engine, Base
    from app.models.user import User, UserPreferences
    from app.models.conversation import Conversation, Message
    from app.models.dashboard import (
        SavedQuery, Bookmark, ReadingList, ReadingListPaper,
        PaperNote, Alert, UserActivity
    )
    
    print("Initializing database tables...")
    print("-" * 50)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database tables created successfully!")
    print("\nCreated tables:")
    print("  - users")
    print("  - user_preferences")
    print("  - conversations")
    print("  - messages")
    print("  - saved_queries")
    print("  - bookmarks")
    print("  - reading_lists")
    print("  - reading_list_papers")
    print("  - paper_notes")
    print("  - alerts")
    print("  - user_activities")
    print("-" * 50)
    print("\n✅ Dashboard is now ready to use!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nPlease make sure:")
    print("1. You are in the backend directory")
    print("2. Your virtual environment is activated")
    print("3. All dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error creating tables: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)



