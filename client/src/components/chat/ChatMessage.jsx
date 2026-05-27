export default function ChatMessage({ message, isThinking }) {
  const isAssistant = message.role === 'assistant';

  if (isThinking) {
    return (
      <div className="chat-msg chat-msg--assistant">
        <div className="chat-msg-avatar">🤖</div>
        <div className="chat-bubble chat-bubble--thinking">
          <span className="thinking-dot" />
          <span className="thinking-dot" />
          <span className="thinking-dot" />
        </div>
      </div>
    );
  }

  const lines = (message.content || '').split('\n').filter((l) => l.trim() !== '' || true);

  return (
    <div className={`chat-msg chat-msg--${isAssistant ? 'assistant' : 'user'}`}>
      {isAssistant && <div className="chat-msg-avatar">🤖</div>}
      <div className={`chat-bubble chat-bubble--${isAssistant ? 'assistant' : 'user'}`}>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}
