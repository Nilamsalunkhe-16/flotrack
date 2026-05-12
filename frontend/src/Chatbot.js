import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [chat, setChat] = useState([
    {
      sender: "FloTrack AI",
      text: "Hi 🌸 I'm your health assistant. Ask me about periods, PCOS, symptoms, lifestyle, or wellness.",
    },
  ]);

  const messagesEndRef = useRef(null);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userText = message;

    const userMessage = {
      sender: "You",
      text: userText,
    };

    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/chat",
        {
          message: userText,
        }
      );

      const botMessage = {
        sender: "FloTrack AI",
        text:
          res.data.reply ||
          "I'm here to support your wellness 🌸",
      };

      setChat((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error(error);

      setChat((prev) => [
        ...prev,
        {
          sender: "FloTrack AI",
          text:
            "⚠ Unable to connect to server. Please check backend.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        style={styles.chatButton}
      >
        {open ? "✖" : "💬"}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={styles.chatContainer}>

          {/* Header */}
          <div style={styles.header}>
            <div>
              <div style={{ fontSize: "16px" }}>
                FloTrack AI 
              </div>

             
            </div>
          </div>

          {/* Messages */}
          <div style={styles.messages}>

            {chat.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  alignSelf:
                    msg.sender === "You"
                      ? "flex-end"
                      : "flex-start",

                  background:
                    msg.sender === "You"
                      ? "linear-gradient(135deg,#be89a9,#d8c0c0)"
                      : "rgb(248, 244, 244)",

                  color:
                    msg.sender === "You"
                      ? "white"
                      : "#333",
                }}
              >
                <div style={styles.sender}>
                  {msg.sender}
                </div>

                <div>{msg.text}</div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  ...styles.message,
                  background: "#f1f1f1",
                  color: "#555",
                }}
              >
                Typing...
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Input Area */}
          <div style={styles.inputArea}>

            <input
              type="text"
              placeholder="Ask something..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={handleKeyPress}
              style={styles.input}
            />

            <button
              onClick={sendMessage}
              style={styles.sendBtn}
            >
              ➤
            </button>

          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  chatButton: {
    position: "fixed",
    bottom: "20px",
    right: "65px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    border: "none",
    background:"linear-gradient(135deg,#be89a9,#d8c0c0)",

    color: "white",
    fontSize: "28px",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
    zIndex: 9999,
  },

  chatContainer: {
    position: "fixed",
    bottom: "95px",
    right: "10px",
    width: "300px",
    height: "460px",
    background: "white",
    borderRadius: "22px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 9999,
  },

  header: {
    background:"linear-gradient(135deg,#be89a9,#d8c0c0)",
    color: "white",
    padding: "18px",
    fontWeight: "bold",
  },

  online: {
    fontSize: "12px",
    opacity: 0.9,
    marginTop: "4px",
  },

  messages: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#f4e6e6",
  },

  message: {
    padding: "12px 14px",
    borderRadius: "16px",
    maxWidth: "80%",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  sender: {
    fontSize: "11px",
    fontWeight: "bold",
    marginBottom: "4px",
    opacity: 0.8,
  },

  inputArea: {
    display: "flex",
    padding: "12px",
    borderTop: "1px solid #eee",
    background: "white",
  },

  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
  },

  sendBtn: {
    marginLeft: "10px",
    width: "50px",
    border: "none",
    borderRadius: "14px",
    background:"linear-gradient(135deg,#be89a9,#d8c0c0)",

    color: "white",
    fontSize: "18px",
    cursor: "pointer",
  },
};