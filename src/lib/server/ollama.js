const BASE = process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434'
const MODEL = process.env.OLLAMA_MODEL ?? 'phi3:latest'
const EMBED_MODEL = 'nomic-embed-text'

export async function ollamaGenerate(prompt, system) {
  const body = {
    model: MODEL,
    prompt,
    stream: false,
    options: {
      temperature: 0.7,
      top_p: 0.9,
      repeat_penalty: 1.1,
      num_ctx: 4048,
      num_predict: 512,
      stop: ['</s>']
    }
  }
  if (system) body.system = system

  const res = await fetch(`${BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  return data.response ?? ''
}

export async function ollamaEmbed(texts) {
  const results = []
  for (const text of texts) {
    const res = await fetch(`${BASE}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBED_MODEL, prompt: text })
    })
    const data = await res.json()
    results.push(data.embedding)
  }
  return results
}
