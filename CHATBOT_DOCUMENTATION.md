# FloTrack Women's Health Chatbot

## Overview
A comprehensive women's health chatbot integrated into FloTrack that answers common health questions about periods, PCOS, anemia, pregnancy, reproductive health, menopause, and general wellness.

## Features

### 1. **Dual-Mode Operation**
- **Primary**: Uses OpenAI GPT-4 Mini (if API key available) for advanced responses
- **Fallback**: Local knowledge base with 40+ pre-trained answers for reliable offline operation

### 2. **Knowledge Base Topics**
The chatbot provides information on:
- **Periods**: Normal cycles, heavy periods, irregular periods, cramps, missed periods, symptoms
- **PCOS**: Definition, symptoms, diagnosis, management, fertility
- **Anemia**: Definition, symptoms, iron deficiency, relation to heavy periods, treatment
- **Pregnancy**: Early signs, tests, prenatal care, nutrition
- **Reproductive Health**: Contraception, STI prevention, cervical health, breast health
- **Menopause**: Age, symptoms, hot flashes, hormone therapy
- **General Health**: Exercise, nutrition, mental health, sleep

### 3. **Chat History**
- All conversations are saved to MySQL database
- Users can retrieve their chat history
- Source tracking (OpenAI or local knowledge base)
- Timestamps on all messages

### 4. **Smart Routing**
- Greeting recognition
- Help request detection
- Keyword-based answer matching
- Intelligent fallback system

## API Endpoints

### 1. Chat Endpoint
```
POST /api/chatbot/chat
```
**Request:**
```json
{
  "message": "What should I know about heavy periods?",
  "user_id": 1
}
```

**Response:**
```json
{
  "reply": "Heavy periods (menorrhagia) involve excessive bleeding lasting more than 7 days...",
  "source": "openai",
  "timestamp": "2026-05-25T09:30:00.000000"
}
```

### 2. Get Available Topics
```
GET /api/chatbot/topics
```
**Response:**
```json
{
  "available_topics": [
    "periods: normal_cycle",
    "periods: heavy_periods",
    ...
  ],
  "total_topics": 45,
  "categories": ["periods", "pcos", "anemia", "pregnancy", "reproductive_health", "menopause", "general_health"]
}
```

### 3. Chatbot Health Check
```
GET /api/chatbot/health
```
**Response:**
```json
{
  "status": "healthy",
  "name": "FloTrack Health Assistant",
  "version": "2.0",
  "has_openai": true,
  "fallback_kb": "local_knowledge_base",
  "supports": ["text_chat", "history_storage"]
}
```

### 4. Get Chat History
```
GET /chat-history/{user_id}?limit=50
```
**Response:**
```json
{
  "user_id": 1,
  "messages": [
    {
      "id": 1,
      "user_message": "What about PCOS?",
      "bot_response": "PCOS (Polycystic Ovary Syndrome) is...",
      "source": "openai",
      "created_at": "2026-05-25T09:30:00"
    }
  ],
  "total": 25
}
```

### 5. Clear Chat History
```
DELETE /chat-history/{user_id}
```

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. OpenAI Setup (Optional)
To use OpenAI GPT-4 Mini for responses:

1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Create `.env` file in backend directory:
```env
OPENAI_API_KEY=sk-your-key-here
```

3. The chatbot will automatically use OpenAI if the key is available, otherwise it uses the local knowledge base.

### 3. Database Setup
The ChatMessage table is automatically created on app startup. Ensure MySQL is running with the `flowtrack` database.

### 4. Run the Server
```bash
cd backend
uvicorn app:app --reload
```

## Usage Examples

### Example 1: Ask about Heavy Periods
```bash
curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have very heavy periods, what should I do?",
    "user_id": 1
  }'
```

### Example 2: Ask about PCOS
```bash
curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is PCOS and how is it managed?",
    "user_id": 1
  }'
```

### Example 3: Get Available Topics
```bash
curl http://localhost:8000/api/chatbot/topics
```

### Example 4: Retrieve Chat History
```bash
curl http://localhost:8000/chat-history/1?limit=20
```

## Chatbot Behavior

### Smart Features
1. **Greeting Recognition**: Detects hello, hi, greetings
2. **Help Requests**: Provides topic list when asked for help
3. **Keyword Matching**: Finds answers based on question keywords
4. **Intelligent Fallback**: Falls back to local KB if OpenAI fails
5. **Error Handling**: Always returns a helpful response

### Response Sources
- **OpenAI** (if configured): Advanced, conversational responses
- **Local Knowledge Base**: Fast, reliable, always available

### Safety Features
- System prompt ensures no medical diagnosis
- Always suggests consulting healthcare professionals
- Non-judgmental, supportive tone
- Medically accurate information

## Database Schema

### ChatMessage Table
```sql
CREATE TABLE chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  user_message TEXT,
  bot_response TEXT,
  source VARCHAR(50),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Configuration

### Local Knowledge Base
Edit `chatbot_knowledge_base.py` to:
- Add new Q&A pairs
- Update existing answers
- Add new categories
- Customize keyword matching

### OpenAI Settings
Edit `chatbot.py` to:
- Change model (gpt-4, gpt-3.5-turbo, etc.)
- Adjust system prompt
- Modify temperature/parameters

## Troubleshooting

### Chatbot not responding
1. Check if server is running: `http://localhost:8000/health`
2. Check chatbot health: `http://localhost:8000/api/chatbot/health`
3. Check MySQL connection
4. Review server logs

### OpenAI not working
1. Verify `.env` file has correct API key
2. Check OpenAI account has credits
3. Check API key permissions
4. Chatbot will automatically use local KB as fallback

### Chat history not saving
1. Verify user_id is provided in request
2. Check MySQL is running
3. Verify `flowtrack` database exists
4. Check user_id exists in users table

## Future Enhancements

1. **Symptom Checker**: Interactive symptom-to-condition mapping
2. **Health Tips**: Personalized daily health recommendations
3. **Medication Info**: Drug interactions and side effects
4. **Doctor Finder**: Location-based doctor recommendations
5. **Sentiment Analysis**: Detect user stress/concern levels
6. **Multi-language Support**: Responses in multiple languages
7. **Voice Chat**: Speech-to-text and text-to-speech
8. **Analytics**: Usage patterns and common questions

## Support

For issues or suggestions, please open an issue in the repository or contact support.

---

**Disclaimer**: This chatbot provides health information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.
