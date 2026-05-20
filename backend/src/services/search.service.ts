import { Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import prisma from '../config/db'
import { env } from '../config/env'

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

export const smartSearch = async (req: Request, res: Response) => {
  const { query } = req.body
  if (!query) return res.status(400).json({ error: 'Query required' })

  // Step 1: Parse natural language intent via Claude
  let intent: any = { occasion: null, style_type: null, keywords: [] }
  try {
    const intentRes = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Extract search intent from this fashion query. Return ONLY valid JSON with keys: occasion (string|null), style_type (string|null), keywords (string[]). Query: "${query}"`
      }]
    })
    const text = (intentRes.content[0] as any).text
    intent = JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch (err) {
    console.warn('Claude intent parse failed:', err)
  }

  // Step 2: DB search — tag/occasion filter
  const allOutfits = await prisma.outfit.findMany({
    where: { in_stock: true },
    select: {
      id: true, name: true, price: true, currency: true, images: true,
      has_3d_model: true, tags: true, occasion: true, style_type: true, description: true
    }
  })

  // Step 3: Score and rank by intent match
  const scored = allOutfits
    .map(o => {
      let score = 0
      if (intent.occasion && o.occasion === intent.occasion) score += 3
      if (intent.style_type && o.style_type === intent.style_type) score += 2
      const tags = (o.tags as string[]) || []
      const matchedKeywords = (intent.keywords || []).filter((kw: string) =>
        tags.some(t => t.toLowerCase().includes(kw.toLowerCase())) ||
        o.name.toLowerCase().includes(kw.toLowerCase())
      )
      score += matchedKeywords.length
      // Text fallback: query words in name
      const queryWords = query.toLowerCase().split(/\s+/)
      queryWords.forEach((w: string) => {
        if (o.name.toLowerCase().includes(w)) score += 0.5
      })
      return { ...o, _score: score }
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 10)
    .map(({ _score, ...o }) => o)

  return res.json({ intent, results: scored })
}
