# Chatbot Quick Start

## What Was Added

Your FloTrack app now includes a **women's health chatbot** with:

✅ **40+ pre-trained answers** about periods, PCOS, anemia, pregnancy, reproductive health, menopause
✅ **OpenAI integration** (optional, with fallback to local KB)
✅ **Chat history storage** - all conversations saved to MySQL
✅ **Fallback knowledge base** - works even without OpenAI API key
✅ **Smart routing** - recognizes greetings, help requests, and keywords

## Files Added/Modified

### New Files
1. **chatbot_knowledge_base.py** - 40+ Q&A pairs about women's health
2. **CHATBOT_DOCUMENTATION.md** - Full documentation

### Modified Files
1. **chatbot.py** - Enhanced with knowledge base + history storage
2. **app.py** - Added chatbot router + chat history endpoints
3. **models.py** - Added ChatMessage database model
4. **requirements.txt** - Added openai, python-dotenv

## Quick Test

### 1. Start the server
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

### 2. Test the chatbot
```bash
# Ask a question
curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is PCOS?", "user_id": 1}'

# Get available topics
curl http://localhost:8000/api/chatbot/topics

# Check chatbot health
curl http://localhost:8000/api/chatbot/health

# Get chat history for user 1
curl http://localhost:8000/chat-history/1
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/chat` | Send message to chatbot |
| GET | `/api/chatbot/topics` | Get list of available topics |
| GET | `/api/chatbot/health` | Check chatbot status |
| GET | `/chat-history/{user_id}` | Get user's chat history |
| DELETE | `/chat-history/{user_id}` | Clear user's chat history |

## Knowledge Base Topics

### Periods
- Normal cycle information
- Heavy periods (menorrhagia)
- Irregular periods
- Period pain management
- Missed periods
- Period symptoms

### PCOS
- What is PCOS
- Common symptoms
- Diagnosis process
- Management strategies
- Fertility with PCOS

### Anemia
- Definition and causes
- Symptoms to watch
- Iron deficiency anemia
- Connection to heavy periods
- Treatment options

### Pregnancy
- Early pregnancy signs
- When to test
- Prenatal care
- Nutrition during pregnancy

### Reproductive Health
- Contraception options
- STI prevention
- Cervical health
- Breast health

### Menopause
- Age and stages
- Symptoms (hot flashes, etc.)
- Hormone therapy
- Management

### General Health
- Exercise benefits
- Nutrition guidelines
- Mental health support
- Sleep hygiene

## Optional: Enable OpenAI

To use advanced AI responses (requires API key):

1. Get key from https://platform.openai.com/api-keys
2. Create `.env` in backend folder:
```
OPENAI_API_KEY=sk-your-key-here
```
3. Restart server - chatbot will automatically use OpenAI!

If no API key, chatbot uses the local knowledge base (which works great!).

## Chat History Example

```json
{
  "user_id": 1,
  "messages": [
    {
      "id": 1,
      "user_message": "What about PCOS?",
      "bot_response": "PCOS (Polycystic Ovary Syndrome) is a hormonal condition...",
      "source": "local_kb",
      "created_at": "2026-05-25T09:30:00"
    }
  ],
  "total": 1
}
```

## Key Features

1. **Always Online** - Local knowledge base works without internet
2. **Smart Fallback** - If OpenAI fails, uses local KB automatically
3. **Persistent Storage** - Chat history saved to MySQL
4. **Safe Responses** - System prompt ensures no medical diagnosis
5. **Easy Customization** - Edit knowledge base in `chatbot_knowledge_base.py`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Module not found" | Run `pip install -r requirements.txt` |
| OpenAI not working | Check `.env` file has API key, or use local KB |
| Chat history not saving | Verify `user_id` in request and MySQL is running |
| Server won't start | Check port 8000 is free, review server logs |

## Next Steps

- Customize knowledge base answers in `chatbot_knowledge_base.py`
- Connect frontend to `/api/chatbot/chat` endpoint
- Set up OpenAI API key for advanced responses
- Display chat history in user dashboard
- Add sentiment analysis to detect user concerns

---

**That's it!** Your women's health chatbot is ready to use. 🎉
