// Reads an SSE stream from a POST endpoint.
// Fires callbacks as events arrive so the UI can update incrementally.
export async function streamSearch({ url, body, onStatus, onSummary, onProduct, onDone, onError }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let msg = `Server error ${response.status}`;
    try { msg = JSON.parse(text).error || msg; } catch {}
    throw new Error(msg);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let rawBuffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    rawBuffer += decoder.decode(value, { stream: true });

    // SSE messages are separated by \n\n
    const messages = rawBuffer.split('\n\n');
    rawBuffer = messages.pop(); // last chunk may be incomplete

    for (const message of messages) {
      if (!message.trim() || message.startsWith(':')) continue; // skip keep-alive pings

      let eventType = null;
      let eventData = null;

      for (const line of message.split('\n')) {
        if (line.startsWith('event: ')) eventType = line.slice(7).trim();
        else if (line.startsWith('data: ')) {
          try { eventData = JSON.parse(line.slice(6)); } catch {}
        }
      }

      if (!eventType || eventData === null) continue;

      if (eventType === 'status')  onStatus?.(eventData);
      if (eventType === 'summary') onSummary?.(eventData);
      if (eventType === 'product') onProduct?.(eventData);
      if (eventType === 'done')    onDone?.(eventData);
      if (eventType === 'error')   onError?.(eventData);
    }
  }
}
