from fastapi import FastAPI
from models import AnemiaInput, PCOSInput
from database import SessionLocal, engine, Base
from models import User as UserModel, DailyLog, PCOSRecord, ChatMessage
from auth import create_user, authenticate
from ml_model import anemia_model, pcos_model
from datetime import datetime
from schemas import UserCreate
from chatbot import router as chatbot_router
import numpy as np

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FloTrack API", description="Women's Health Tracking & Chatbot API")

# Include chatbot router
app.include_router(chatbot_router, prefix="/api/chatbot", tags=["chatbot"])


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

# ─── CHAT HISTORY ────────────

@app.get("/chat-history/{user_id}")
def get_chat_history(user_id: int, limit: int = 50):
    """Get chat history for a user"""
    db = SessionLocal()
    try:
        messages = db.query(ChatMessage).filter(
            ChatMessage.user_id == user_id
        ).order_by(ChatMessage.created_at.desc()).limit(limit).all()
        
        return {
            "user_id": user_id,
            "messages": [
                {
                    "id": msg.id,
                    "user_message": msg.user_message,
                    "bot_response": msg.bot_response,
                    "source": msg.source,
                    "created_at": msg.created_at.isoformat() if msg.created_at else None
                }
                for msg in reversed(messages)
            ],
            "total": len(messages)
        }
    except Exception as e:
        return {"error": f"Failed to fetch chat history: {str(e)}"}
    finally:
        db.close()

@app.delete("/chat-history/{user_id}")
def clear_chat_history(user_id: int):
    """Clear chat history for a user"""
    db = SessionLocal()
    try:
        db.query(ChatMessage).filter(ChatMessage.user_id == user_id).delete()
        db.commit()
        return {"message": "Chat history cleared"}
    except Exception as e:
        db.rollback()
        return {"error": f"Failed to clear chat history: {str(e)}"}
    finally:
        db.close()

# ─── HEALTH CHECK ────────────

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "api": "FloTrack API",
        "version": "2.0",
        "features": ["user_auth", "anemia_prediction", "pcos_prediction", "lifestyle_tracking", "women_health_chatbot"]
    }
