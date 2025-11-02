import React, { useState } from "react";
import "../styles/chatbot.css";

const API_CHAT_URL = import.meta.env.VITE_CHAT_HUB;

const ChatBot: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;

    // användarens fråga
    setMessages((prev) => [...prev, { sender: "user", text: question }]);

    try {
      const response = await fetch(API_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (response.ok) {
        const data = await response.text();
        // bottens svar
        setMessages((prev) => [...prev, { sender: "bot", text: data }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Ett fel inträffade. Försök igen." },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Kunde inte ansluta till servern." },
      ]);
    }

    setQuestion("");
  };

  return (
    <div>
      
      <img
        src={isOpen ? "/img/pngegg.png" : "/img/pngegg.png"} 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        />

        <p className="chatbot-ask">Psst... <br></br> fråga Jarvis!</p>

      {isOpen && (
        <div className="chatbot">
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <p key={index} className={msg.sender === "user" ? "user-message" : "bot-message"}>
                <strong>{msg.sender === "user" ? "Du:" : "Jarvis:"}</strong> {msg.text}
              </p>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Skriv din fråga här..."
            />
            <button onClick={handleSend}>Skicka</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;