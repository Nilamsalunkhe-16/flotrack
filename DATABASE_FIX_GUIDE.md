# FloTrack Chatbot - Database Fix Guide

## Issue: "No database selected" Error

### Root Cause
The error occurs when:
1. The `flowtrack` database doesn't exist
2. Tables haven't been created yet
3. Database connection is lost

### Quick Fix

#### Step 1: Initialize the Database
```bash
cd backend
python init_db.py
```

You should see:
```
🔄 Initializing database...
✓ Database tables created successfully!

📊 Tables in database:
  ✓ users
  ✓ cycles
  ✓ symptoms
  ✓ daily_logs
  ✓ log_symptoms
  ✓ pcos_records
  ✓ chat_messages

✓ Database initialization complete!
```

#### Step 2: Verify MySQL is Running
```bash
# On Windows, check if MySQL service is running
sc query MySQL80  # or MySQL57, depending on your version

# If not running, start it:
net start MySQL80
```

#### Step 3: Test Database Connection
```bash
# Open MySQL command line
mysql -u root -p

# Then run:
mysql> USE flowtrack;
mysql> SHOW TABLES;
mysql> SELECT COUNT(*) FROM chat_messages;
```

#### Step 4: Start the Server
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

#### Step 5: Test the Chatbot
```bash
curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is PCOS?"}'
```

You should see a response from the knowledge base immediately (even without user_id).

---

## Detailed Troubleshooting

### Problem 1: "No database selected"
**Solution:**
```bash
python init_db.py
```

### Problem 2: "Access denied for user 'root'@'localhost'"
**Solution:**
1. Check MySQL credentials in `backend/database.py`
2. Update DATABASE_URL with correct username/password:
```python
DATABASE_URL = "mysql+pymysql://username:password@127.0.0.1:3306/flowtrack"
```

### Problem 3: "Can't connect to MySQL server on '127.0.0.1'"
**Solution:**
1. Ensure MySQL is running: `net start MySQL80`
2. Check MySQL is listening on port 3306: `netstat -an | findstr 3306`
3. Try localhost instead of 127.0.0.1 if that fails

### Problem 4: Chat works but history not saving
**Solution:**
- This is normal if `user_id` is not provided in the request
- For testing without saving history, don't include `user_id`:
```bash
curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is PCOS?"}'
```

### Problem 5: Tables don't exist
**Solution:**
```bash
# Delete old database and recreate
mysql -u root -p -e "DROP DATABASE flowtrack;"
mysql -u root -p -e "CREATE DATABASE flowtrack;"

# Then run init script
python init_db.py
```

---

## Verify Everything Works

### 1. Check Database
```bash
python init_db.py
```

### 2. Check MySQL Service
```bash
# Windows
net start MySQL80

# Linux/Mac
mysql.server start
```

### 3. Start Server
```bash
uvicorn app:app --reload
```

### 4. Test Chat Without User ID (Always Works)
```bash
curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

Expected response:
```json
{
  "reply": "Hello! I'm FloTrack Health Assistant...",
  "source": "local_kb",
  "timestamp": "2026-05-25T09:37:00"
}
```

### 5. Check Available Topics
```bash
curl http://localhost:8000/api/chatbot/topics
```

### 6. Check Chatbot Health
```bash
curl http://localhost:8000/api/chatbot/health
```

### 7. Test Chat With User ID (Saves to DB)
First, create a user:
```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Then chat with user_id:
```bash
curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What about periods?","user_id":1}'
```

### 8. Retrieve Chat History
```bash
curl http://localhost:8000/chat-history/1
```

---

## Environment Setup

### Create `.env` file (Optional - for OpenAI)
```bash
# In backend/ directory, create .env:
OPENAI_API_KEY=sk-your-key-here
```

If you have an OpenAI API key, it will use GPT-4 Mini for responses. Otherwise, it uses the local knowledge base.

---

## Complete Startup Sequence

```bash
# 1. Open command line
cd d:\flowtack.worktrees\agents-mysql-data-insertion-fix\backend

# 2. Ensure MySQL is running
net start MySQL80

# 3. Initialize database
python init_db.py

# 4. Install dependencies (if not already done)
pip install -r requirements.txt

# 5. Start the server
uvicorn app:app --reload

# 6. Test in another terminal
curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

---

## Key Points

✓ The chatbot works WITHOUT database (uses local knowledge base)
✓ Chat history is optional (only saves if user_id provided)
✓ OpenAI is optional (uses local KB as fallback)
✓ All errors are caught and handled gracefully

If you still see "no database selected":
1. Run `python init_db.py`
2. Restart the server
3. Try the test curl command again

---

## Contact
If issues persist, check:
- Server logs for detailed error messages
- MySQL is running and accessible
- Database credentials in `database.py` are correct
- Port 8000 is not in use by another application
