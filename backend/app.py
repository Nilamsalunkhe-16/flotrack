from fastapi import FastAPI
from models import AnemiaInput, PCOSInput
from database import SessionLocal, engine, Base
from models import User as UserModel, DailyLog, PCOSRecord
from auth import create_user, authenticate
from ml_model import anemia_model, pcos_model
from datetime import datetime
from schemas import UserCreate
import numpy as np

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI()


# ─── AUTH ─────────────────────

@app.post("/signup")
def signup(user: UserCreate):
    try:
        create_user(user.email, user.password)
        return {"message": "User created successfully"}
    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        return {"error": f"Signup failed: {str(e)}"}

@app.post("/login")
def login(user: UserCreate):
    try:
        u = authenticate(user.email, user.password)
        if not u:
            return {"error": "Invalid credentials"}
        return {"message": "Login successful", "user_id": u.id}
    except Exception as e:
        return {"error": f"Login failed: {str(e)}"}

# ─── ANEMIA ML ───────────────

@app.post("/predict-anemia")
def anemia(data: AnemiaInput):
    db = SessionLocal()
    try:
        X = np.array([[data.heavyPeriods, data.fatigue, data.lowIronDiet]])
        pred = anemia_model.predict(X)[0]
        result = "High" if pred == 1 else "Low"
        
        # Save prediction to database
        if data.user_id:
            log = DailyLog(
                user_id=data.user_id,
                log_date=datetime.utcnow().date(),
                notes=f"Anemia Prediction: {result}"
            )
            db.add(log)
            db.commit()
        
        return {"risk": result}
    except Exception as e:
        db.rollback()
        return {"error": f"Prediction failed: {str(e)}"}
    finally:
        db.close()

# ─── PCOS ML ─────────────────

@app.post("/predict-pcos")
def pcos(data: PCOSInput):
    db = SessionLocal()
    try:
        X = np.array([[data.irregularCycles, data.weightGain, data.acne]])
        pred = pcos_model.predict(X)[0]
        result = "High" if pred == 1 else "Low"
        
        # Save PCOS record to database
        if data.user_id:
            pcos_record = PCOSRecord(
                user_id=data.user_id,
                record_date=datetime.utcnow().date(),
                irregular_periods=bool(data.irregularCycles),
                acne=bool(data.acne),
                notes=f"PCOS Prediction: {result}"
            )
            db.add(pcos_record)
            db.commit()
        
        return {"risk": result}
    except Exception as e:
        db.rollback()
        return {"error": f"Prediction failed: {str(e)}"}
    finally:
        db.close()

# ─── SAVE LIFESTYLE ──────────

@app.post("/save-lifestyle")
def save(data: dict):
    db = SessionLocal()
    try:
        if "user_id" in data and "log_date" in data:
            log = DailyLog(
                user_id=data["user_id"],
                log_date=data["log_date"],
                flow_level=data.get("flow_level"),
                mood=data.get("mood"),
                notes=data.get("notes")
            )
            db.add(log)
            db.commit()
            return {"message": "Lifestyle data saved successfully"}
        else:
            return {"error": "Missing user_id or log_date"}
    except Exception as e:
        db.rollback()
        return {"error": f"Save failed: {str(e)}"}
    finally:
        db.close()