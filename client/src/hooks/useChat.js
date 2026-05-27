import { useState, useCallback, useRef } from 'react';
import { streamChat } from '../services/chat.service';

export function useChat(slug) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(messages);
  const initialized = useRef(false);

  // Keep ref in sync so callbacks always see latest messages without re-creating
  messagesRef.current = messages;

  const sendMessage = useCallback(
    async (text, { hidden = false } = {}) => {
      const userMsg = { role: 'user', content: text, hidden };
      const snapshot = [...messagesRef.current, userMsg];

      setMessages(snapshot);
      setIsLoading(true);

      // Strip display-only flags before sending to the API
      const apiMessages = snapshot.map(({ role, content }) => ({ role, content }));

      let accumulatedText = '';

      try {
        for await (const event of streamChat({ slug, messages: apiMessages })) {
          if (event.type === 'text-delta') {
            accumulatedText += event.delta;
            setMessages([
              ...snapshot,
              { role: 'assistant', content: accumulatedText },
            ]);
          } else if (event.type === 'error') {
            throw new Error(event.message);
          }
        }
      } catch (err) {
        if (!accumulatedText) {
          const msg = err?.message || 'Error desconocido';
          setMessages([
            ...snapshot,
            { role: 'assistant', content: `Error: ${msg}` },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [slug]
  );

  const initChat = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;
    await sendMessage('Hola, ¿en qué podés ayudarme?', { hidden: true });
  }, [sendMessage]);

  const visibleMessages = messages.filter((m) => !m.hidden);

  return { messages: visibleMessages, isLoading, sendMessage, initChat };
}
