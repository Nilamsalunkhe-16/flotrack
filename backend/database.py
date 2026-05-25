from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import pymysql
import os

# Database configuration
MYSQL_HOST = "127.0.0.1"
MYSQL_USER = "root"
MYSQL_PASSWORD = "nilam"
MYSQL_PORT = 3306
DATABASE_NAME = "flowtrack"

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{DATABASE_NAME}"

# Create database using raw pymysql connection
print("🔄 Initializing database connection...")
try:
    # Connect without selecting a database
    conn = pymysql.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        port=MYSQL_PORT
    )
    cursor = conn.cursor()
    
    # Create database if it doesn't exist
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DATABASE_NAME}")
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"✓ Database '{DATABASE_NAME}' ensured to exist")
except pymysql.Error as e:
    print(f"✗ Error creating database: {e}")
except Exception as e:
    print(f"✗ Unexpected error: {e}")

# Now create SQLAlchemy engine
try:
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Set to False to reduce noise
        pool_pre_ping=True,
        pool_recycle=3600
    )
    
    # Test connection
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    
    print(f"✓ Connected to MySQL database '{DATABASE_NAME}' successfully!")
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    print(f"  URL: {DATABASE_URL}")

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
