const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export async function* streamChat({ slug, messages }) {
  const response = await fetch(`${BASE}/publico/${slug}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: no se pudo conectar con el asistente`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6));
        yield event;
        if (event.type === 'done' || event.type === 'error') return;
      } catch {
        // línea malformada, ignorar
      }
    }
  }
}
