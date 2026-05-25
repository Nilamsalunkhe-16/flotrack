from pydantic import BaseModel
from typing import Optional
from datetime import date

class UserCreate(BaseModel):
    name: Optional[str] = None
    email: str
    password: str

class AnemiaInput(BaseModel):
    user_id: Optional[int] = None
    heavyPeriods: int
    fatigue: int
    lowIronDiet: int

class PCOSInput(BaseModel):
    user_id: Optional[int] = None
    irregularCycles: int
    weightGain: int
    acne: int

class LifestyleData(BaseModel):
    user_id: int
    log_date: date
    flow_level: Optional[str] = None
    mood: Optional[str] = None
    notes: Optional[str] = None