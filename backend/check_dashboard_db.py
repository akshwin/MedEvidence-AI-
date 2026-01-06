"""
Check if dashboard database tables exist
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import engine, Base
    from app.models.dashboard import (
        SavedQuery, Bookmark, ReadingList, ReadingListPaper,
        PaperNote, Alert, UserActivity
    )
    from sqlalchemy import inspect
    
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    required_tables = [
        'saved_queries',
        'bookmarks',
        'reading_lists',
        'reading_list_papers',
        'paper_notes',
        'alerts',
        'user_activities'
    ]
    
    print("Checking dashboard database tables...")
    print("-" * 50)
    
    missing_tables = []
    for table in required_tables:
        if table in existing_tables:
            print(f"✓ {table} - EXISTS")
        else:
            print(f"✗ {table} - MISSING")
            missing_tables.append(table)
    
    print("-" * 50)
    
    if missing_tables:
        print(f"\n❌ {len(missing_tables)} table(s) are missing!")
        print("\nTo fix this, run:")
        print("  python init_db.py")
        sys.exit(1)
    else:
        print("\n✅ All dashboard tables exist!")
        sys.exit(0)
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nMake sure you:")
    print("1. Are in the backend directory")
    print("2. Have activated your virtual environment")
    print("3. Have installed all requirements (pip install -r requirements.txt)")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)



