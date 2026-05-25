from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = "mysql+pymysql://root:nilam@127.0.0.1:3306/flowtrack"

engine = create_engine(DATABASE_URL, echo=True)

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
        print("Connected to MySQL successfully!")
        conn.execute("SELECT 1")
except Exception as e:
    print(f"Database connection failed: {e}")