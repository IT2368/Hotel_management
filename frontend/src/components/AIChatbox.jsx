import React, { useState, useRef, useEffect } from 'react';

const BOT_AVATAR = '🤖';
const USER_AVATAR = '🧑';
const CHATBOX_WIDTH = 350;
const CHATBOX_HEIGHT = 500;
const LOCALSTORAGE_KEY = 'ai_chatbox_history';

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const defaultWelcome = {
  role: 'assistant',
  content: 'Hello! I am your AI assistant. How can I help you today?',
  timestamp: new Date().toISOString(),
};

export default function AIChatBox({ forceOpen = false, hideFloatingButton = false }) {
  const [open, setOpen] = useState(forceOpen);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(LOCALSTORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return [defaultWelcome];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // If forceOpen, always open
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;
    setError(null);
    const userMsg = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Unknown error');
      }
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err.message || 'Could not get response.');
      setMessages((msgs) => [
        ...msgs,
        {
          role: 'assistant',
          content: `Error: ${err.message || 'Could not get response.'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Only open/close (no minimize, no drag)
  if (!forceOpen && !open) {
    if (hideFloatingButton) return null;
    return (
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: 56, height: 56, boxShadow: '0 2px 8px #0002', fontSize: 28, cursor: 'pointer',
          }}
          title="Open AI Chat"
        >
          💬
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: CHATBOX_WIDTH,
        height: CHATBOX_HEIGHT,
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 4px 24px #0003',
        zIndex: 9999,
        fontFamily: 'Segoe UI, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#2563eb',
          color: 'white',
          padding: '12px 16px',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 18 }}>AI Assistant</span>
        {!forceOpen && (
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}
            title="Close"
          >
            ✖
          </button>
        )}
      </div>
      {/* Chat body */}
      <>
        <div
          style={{
            flex: 1,
            padding: 16,
            background: '#f8fafc',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ fontSize: 24 }}>{msg.role === 'user' ? USER_AVATAR : BOT_AVATAR}</div>
              <div style={{
                background: msg.role === 'user' ? '#2563eb' : '#e0e7ef',
                color: msg.role === 'user' ? 'white' : '#222',
                borderRadius: 12,
                padding: '8px 14px',
                maxWidth: 220,
                fontSize: 15,
                wordBreak: 'break-word',
                boxShadow: msg.role === 'user' ? '0 1px 4px #2563eb22' : '0 1px 4px #0001',
                position: 'relative',
              }}>
                {msg.content}
                <div style={{ fontSize: 10, color: '#888', marginTop: 2, textAlign: 'right' }}>
                  {formatTime(new Date(msg.timestamp))}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 24 }}>{BOT_AVATAR}</div>
              <div style={{ color: '#2563eb', fontSize: 15 }}>
                <span className="spinner" style={{ marginRight: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" strokeDasharray="31.415, 31.415" transform="rotate(72.3242 25 25)"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/></circle></svg>
                </span>
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {/* Input area */}
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: 12,
            borderTop: '1px solid #e5e7eb',
            background: '#f1f5f9',
            gap: 8,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 15,
              outline: 'none',
              background: 'white',
            }}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>
        {/* Error message */}
        {error && (
          <div style={{ color: '#dc2626', background: '#fee2e2', padding: 8, borderRadius: 8, margin: 8, textAlign: 'center', fontSize: 14 }}>
            {error} <button onClick={sendMessage} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}>Retry</button>
          </div>
        )}
      </>
    </div>
  );
}