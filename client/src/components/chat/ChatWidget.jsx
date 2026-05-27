import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatWidget({ slug }) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage, initChat } = useChat(slug);
  const messagesEndRef = useRef(null);
  const openedOnce = useRef(false);

  useEffect(() => {
    if (isOpen && !openedOnce.current) {
      openedOnce.current = true;
      initChat();
    }
  }, [isOpen, initChat]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const showThinking = isLoading && (
    messages.length === 0 || messages[messages.length - 1]?.role !== 'assistant'
  );

  return (
    <>
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div className="chat-header-info">
              <div className="chat-header-avatar">🤖</div>
              <div>
                <div className="chat-header-title">Asistente de reservas</div>
                <div className="chat-header-sub">Respondiendo en segundos</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="chat-status">
                <span className="chat-status-dot" /> En línea
              </span>
              <button className="chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Cerrar">✕</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {showThinking && (
              <ChatMessage message={{ role: 'assistant' }} isThinking />
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      )}

      <button
        className="chat-fab"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir asistente'}
        title="Asistente de reservas"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </>
  );
}
