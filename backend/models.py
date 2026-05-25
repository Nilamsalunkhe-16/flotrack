from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float, Boolean, Text, Enum, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
import enum

Base = declarative_base()

#  User model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    age = Column(Integer)
    created_at = Column(TIMESTAMP)

    cycles = relationship("Cycle", back_populates="user")
    logs = relationship("DailyLog", back_populates="user")
    pcos_records = relationship("PCOSRecord", back_populates="user")


#cycle model
class Cycle(Base):
    __tablename__ = "cycles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    cycle_length = Column(Integer)

    user = relationship("User", back_populates="cycles")  


#symptom model
class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))

    logs = relationship("LogSymptom", back_populates="symptom")  


class FlowLevel(enum.Enum):
    light = "light"
    medium = "medium"
    heavy = "heavy"

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    log_date = Column(Date)
    flow_level = Column(Enum(FlowLevel))
    mood = Column(String(50))
    notes = Column(Text)

    user = relationship("User", back_populates="logs")
    symptoms = relationship("LogSymptom", back_populates="log")    


#log symptom
class LogSymptom(Base):
    __tablename__ = "log_symptoms"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("daily_logs.id"))
    symptom_id = Column(Integer, ForeignKey("symptoms.id"))

    log = relationship("DailyLog", back_populates="symptoms")
    symptom = relationship("Symptom", back_populates="logs")    


# PCOS record model
class PCOSRecord(Base):
    __tablename__ = "pcos_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    record_date = Column(Date)
    weight = Column(Float)
    irregular_periods = Column(Boolean)
    acne = Column(Boolean)
    hair_loss = Column(Boolean)
    notes = Column(Text)

    user = relationship("User", back_populates="pcos_records")    


# Chat Message model for storing conversations
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user_message = Column(Text)
    bot_response = Column(Text)
    source = Column(String(50), default="local_kb")  # "openai" or "local_kb"
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])


# Pydantic models for API inputs
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
