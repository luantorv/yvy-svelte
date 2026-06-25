import { json } from '@sveltejs/kit'
import { chat } from '$lib/server/rag.js'

export async function POST({ request }) {
  const { question } = await request.json()
  try {
    const result = await chat(question)
    return json(result)
  } catch (e) {
    return json({ response: '❌ Error interno: ' + e.message, sources: [] }, { status: 500 })
  }
}
