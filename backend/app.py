from fastapi import FastAPI
from models import User, AnemiaInput, PCOSInput
from database import data_collection
from auth import create_user, authenticate
from ml_model import anemia_model, pcos_model
import numpy as np

app = FastAPI()



# ─── AUTH ─────────────────────

@app.post("/signup")
def signup(user: User):
    create_user(user.email, user.password)
    return {"message": "User created"}

@app.post("/login")
def login(user: User):
    u = authenticate(user.email, user.password)
    if not u:
        return {"error": "Invalid credentials"}
    return {"message": "Login successful"}

# ─── ANEMIA ML ───────────────

@app.post("/predict-anemia")
def anemia(data: AnemiaInput):
    X = np.array([[data.heavyPeriods, data.fatigue, data.lowIronDiet]])
    pred = anemia_model.predict(X)[0]

    result = "High" if pred == 1 else "Low"

    data_collection.insert_one({
        "type": "anemia",
        "input": data.dict(),
        "result": result
    })

    return {"risk": result}

# ─── PCOS ML ─────────────────

@app.post("/predict-pcos")
def pcos(data: PCOSInput):
    X = np.array([[data.irregularCycles, data.weightGain, data.acne]])
    pred = pcos_model.predict(X)[0]

    result = "High" if pred == 1 else "Low"

    data_collection.insert_one({
        "type": "pcos",
        "input": data.dict(),
        "result": result
    })

    return {"risk": result}

# ─── SAVE LIFESTYLE ──────────

@app.post("/save-lifestyle")
def save(data: dict):
    data_collection.insert_one(data)
    return {"message": "Saved"}