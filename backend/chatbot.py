from fastapi import APIRouter
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(data: ChatRequest):

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": """
                You are FloTrack AI, a safe medical assistant.
                You help with menstrual health, PCOS, and wellness.
                Never diagnose or give emergency treatment.
                Always suggest doctor consultation when needed.
                """
            },
                 {
                "role": "user",
                "content": data.message
            }
        ]
    )

    reply = response.choices[0].message.content

    return {
        "reply": reply
    }