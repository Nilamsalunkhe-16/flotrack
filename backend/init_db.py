"""
Database initialization script
Run this before starting the app to ensure database and tables exist
"""

from database import engine, Base
from models import User, DailyLog, PCOSRecord, ChatMessage, Cycle, Symptom, LogSymptom

def init_db():
    """Initialize database - create all tables"""
    try:
        print("🔄 Initializing database...")
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully!")
        
        # List created tables
        print("\n📊 Tables in database:")
        tables = Base.metadata.tables.keys()
        for table in tables:
            print(f"  ✓ {table}")
        
        print("\n✓ Database initialization complete!")
        return True
    except Exception as e:
        print(f"✗ Error initializing database: {e}")
        return False

if __name__ == "__main__":
    init_db()
