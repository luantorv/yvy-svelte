import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { ollamaGenerate, ollamaEmbed } from './ollama.js'

const DATA_DIR = join(process.cwd(), 'src', 'data')

function chunkText(text, maxLen = 800) {
  const words = text.split(/\s+/)
  const chunks = []
  let current = []
  let len = 0
  for (const w of words) {
    if (len + w.length + 1 > maxLen && current.length > 0) {
      chunks.push(current.join(' '))
      current = []
      len = 0
    }
    current.push(w)
    len += w.length + 1
  }
  if (current.length > 0) chunks.push(current.join(' '))
  return chunks
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1)
}

async function readLocalDocs() {
  const entries = await readdir(DATA_DIR)
  const docs = []
  for (const name of entries) {
    if (!name.endsWith('.md') && !name.endsWith('.txt')) continue
    const text = await readFile(join(DATA_DIR, name), 'utf-8')
    docs.push({ text, file: name })
  }
  if (docs.length === 0) throw new Error('No hay documentos en src/data/')
  console.log('Docs cargados:', docs.map(d => d.file))
  return docs
}

async function buildIndex() {
  const docs = await readLocalDocs()
  const allChunks = []
  for (const doc of docs) {
    for (const text of chunkText(doc.text)) {
      allChunks.push({ text, file: doc.file })
    }
  }

  const embeddings = await ollamaEmbed(allChunks.map(c => c.text))
  return allChunks.map((c, i) => ({ ...c, embedding: embeddings[i] }))
}

let indexPromise = null

export function getIndex() {
  if (!indexPromise) indexPromise = buildIndex()
  return indexPromise
}

export async function chat(question) {
  const index = await getIndex()

  const [qEmbedding] = await ollamaEmbed([question])

  const top = index
    .map(chunk => ({ ...chunk, score: cosine(qEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  const context = top.map(c => c.text).join('\n\n')

  if (!context.trim()) {
    return { response: 'No encontré nada relevante en tus archivos.', sources: [] }
  }

  const prompt = `Eres un asistente agrícola para la provincia de Misiones, Argentina.
Usa SOLO la siguiente información para responder. Si no está en el contexto, decilo.

${context}

Pregunta: ${question}
Respuesta:`

  const response = await ollamaGenerate(prompt)

  const sources = top.map(c => ({
    score: c.score,
    file: c.file,
    preview: c.text.slice(0, 100)
  }))

  return { response: response.trim() || 'No encontré nada relevante en tus archivos.', sources }
}

export async function rebuildIndex() {
  indexPromise = null
  try {
    await getIndex()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
