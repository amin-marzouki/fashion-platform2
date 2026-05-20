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

  // Step 2: DB search — Product model
  const allProducts = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    select: {
      id: true, name: true, price: true, description: true,
      image_url: true, model_3d_url: true, brand: true, category: true, product_type: true
    }
  })

  // Step 3: Score and rank by intent match
  const scored = allProducts
    .map(p => {
      let score = 0
      
      // Keywords/Occasion/Style matching against category, brand, and type
      const keywords = intent.keywords || []
      const matchedKeywords = keywords.filter((kw: string) =>
        p.name.toLowerCase().includes(kw.toLowerCase()) ||
        p.brand.toLowerCase().includes(kw.toLowerCase()) ||
        p.category.toLowerCase().includes(kw.toLowerCase()) ||
        p.product_type.toLowerCase().includes(kw.toLowerCase()) ||
        p.description.toLowerCase().includes(kw.toLowerCase())
      )
      score += matchedKeywords.length * 2

      // Text fallback: query words in name/brand/category
      const queryWords = query.toLowerCase().split(/\s+/)
      queryWords.forEach((w: string) => {
        if (p.name.toLowerCase().includes(w)) score += 1.0
        if (p.brand.toLowerCase().includes(w)) score += 0.8
        if (p.category.toLowerCase().includes(w)) score += 0.5
      })

      return { ...p, _score: score }
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 10)
    .map(({ _score, ...p }) => p)

  return res.json({ intent, results: scored })
}
