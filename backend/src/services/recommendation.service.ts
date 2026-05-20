import prisma from '../config/db'

export const getRecommendations = async (userId: number) => {
  const avatar = await prisma.avatar.findUnique({ where: { user_id: userId } })
  const body_params = {
    height: avatar?.body_height,
    weight: avatar?.body_weight,
    chest:  avatar?.body_chest,
    waist:  avatar?.body_waist,
    hips:   avatar?.body_hips,
  }

  try {
    const res = await fetch(`${process.env.RECOMMENDATION_SERVICE_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, body_params })
    })

    if (!res.ok) throw new Error('Recommendation service error')

    const data: any = await res.json()
    const recommended_outfit_ids: any[] = data.recommended_outfit_ids ?? []
    const productIds = recommended_outfit_ids.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id))

    if (productIds.length === 0) return []

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    return products
  } catch (err) {
    console.warn('Recommendation service unavailable, returning empty:', err)
    return []
  }
}
