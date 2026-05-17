export async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();

  if (!text) {
    throw new Error(`Server returned an empty response (${res.status}). Check the server terminal for errors.`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(data.error || `Server error ${res.status}`);
  }

  return data;
}
