from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import Base, User
import models
from database import engine, get_db
from schemas import UserCreate

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class PeriodCreate(BaseModel):
    start_date: str
    end_date: str
    flow_level: str

# CORS (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# API
@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/periods/")
def create_period(data: PeriodCreate, db: Session = Depends(get_db)):
    new_period = models.Period(
        start_date=data.start_date,
        end_date=data.end_date,
        flow_level=data.flow_level
    )
    db.add(new_period)
    db.commit()
    db.refresh(new_period)
    return new_period