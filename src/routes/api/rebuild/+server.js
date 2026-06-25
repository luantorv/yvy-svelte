import { json } from '@sveltejs/kit'
import { rebuildIndex } from '$lib/server/rag.js'

export async function POST() {
  const result = await rebuildIndex()
  return json(result)
}
