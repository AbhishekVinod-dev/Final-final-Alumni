import React, { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages([...newMessages, { sender: "bot", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { sender: "bot", text: "⚠️ Error contacting AI" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">AI Alumni Assistant</h1>

      <div className="w-full max-w-lg bg-gray-800 p-4 rounded-lg shadow-md h-96 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              msg.sender === "user" ? "bg-blue-600 text-right" : "bg-gray-700 text-left"
            }`}
          >
            {msg.sender === "bot" ? (
              <div
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            ) : (
              msg.text
            )}
          </div>
        ))}
        {loading && <p className="text-gray-400">AI is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-full max-w-lg mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 p-2 rounded-l bg-gray-700 border border-gray-600"
        />
        <button
          onClick={sendMessage}
          className="px-4 bg-blue-600 rounded-r hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
