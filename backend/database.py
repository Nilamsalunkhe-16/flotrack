from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# First connection to MySQL (no database selected)
MYSQL_URL = "mysql+pymysql://root:nilam@127.0.0.1:3306"
DATABASE_NAME = "flowtrack"
DATABASE_URL = f"{MYSQL_URL}/{DATABASE_NAME}"

# Create initial engine to ensure database exists
initial_engine = create_engine(MYSQL_URL)

# Create database if it doesn't exist
try:
    with initial_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {DATABASE_NAME}"))
        conn.commit()
    print(f"✓ Database '{DATABASE_NAME}' ensured to exist")
except Exception as e:
    print(f"Error creating database: {e}")

initial_engine.dispose()

# Now connect to the specific database
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,  # Test connections before using them
    pool_recycle=3600    # Recycle connections after 1 hour
)

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

# Test connection
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print(f"✓ Connected to MySQL database '{DATABASE_NAME}' successfully!")
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    print(f"  Make sure MySQL is running and the connection string is correct:")
    print(f"  {DATABASE_URL}")
