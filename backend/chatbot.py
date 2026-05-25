from fastapi import APIRouter
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
from chatbot_knowledge_base import search_knowledge_base, get_all_topics
from datetime import datetime

load_dotenv()

router = APIRouter()

# Initialize OpenAI client (optional)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

class ChatRequest(BaseModel):
    message: str
    user_id: int = None

class ChatResponse(BaseModel):
    reply: str
    source: str
    timestamp: str

@router.post("/chat", response_model=ChatResponse)
async def chat(data: ChatRequest):
    """
    Chat endpoint - ALWAYS works with knowledge base
    Optionally saves to database if user_id provided
    """
    reply = ""
    source = "local_kb"
    
    try:
        # Try OpenAI first if available
        if client and OPENAI_API_KEY:
            try:
                response = client.chat.completions.create(
                    model="gpt-4-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": """You are FloTrack AI, a safe medical assistant specialized in women's health.
You help with menstrual health, PCOS, anemia, pregnancy, reproductive health, and wellness.
Never diagnose diseases - always suggest consulting a healthcare professional.
Always suggest doctor consultation when symptoms are concerning.
Provide accurate, helpful information based on medical best practices."""
                        },
                        {
                            "role": "user",
                            "content": data.message
                        }
                    ]
                )
                reply = response.choices[0].message.content
                source = "openai"
            except Exception as e:
                print(f"OpenAI error: {e}, using local knowledge base")
                reply = search_knowledge_base(data.message)
                source = "local_kb"
        else:
            # Use local knowledge base
            reply = search_knowledge_base(data.message)
            source = "local_kb"
        
        # Try to save chat message if user_id provided
        if data.user_id:
            try:
                from database import SessionLocal
                from models import ChatMessage
                
                db = SessionLocal()
                chat_msg = ChatMessage(
                    user_id=data.user_id,
                    user_message=data.message,
                    bot_response=reply,
                    source=source,
                    created_at=datetime.utcnow()
                )
                db.add(chat_msg)
                db.commit()
                db.close()
                print(f"✓ Chat message saved for user {data.user_id}")
            except Exception as e:
                print(f"Warning: Could not save chat to database: {e}")
                # Don't fail the response, just skip saving
        
        return ChatResponse(
            reply=reply,
            source=source,
            timestamp=datetime.utcnow().isoformat()
        )
    
    except Exception as e:
        print(f"Error in chat: {e}")
        # Always fallback to knowledge base
        reply = search_knowledge_base(data.message)
        return ChatResponse(
            reply=reply,
            source="local_kb",
            timestamp=datetime.utcnow().isoformat()
        )

@router.get("/topics")
async def get_topics():
    """Get list of available chat topics"""
    topics = get_all_topics()
    return {
        "available_topics": topics,
        "total_topics": len(topics),
        "categories": ["periods", "pcos", "anemia", "pregnancy", "reproductive_health", "menopause", "general_health"]
    }

@router.get("/health")
async def chatbot_health():
    """Check chatbot health and capabilities"""
    return {
        "status": "healthy",
        "name": "FloTrack Health Assistant",
        "version": "2.0",
        "has_openai": bool(OPENAI_API_KEY and client),
        "fallback_kb": "local_knowledge_base",
        "supports": ["text_chat", "history_storage"],
        "knowledge_base_topics": len(get_all_topics())
    }
