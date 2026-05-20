export const mapProductToOutfit = (product: any) => {
  if (!product) return null
  return {
    id: String(product.id),
    name: product.name,
    brand: product.brand,
    category: product.category,
    product_type: product.product_type,
    description: product.description || '',
    price: product.price,
    currency: 'USD',
    images: [product.image_url].filter(Boolean),
    has_3d_model: !!product.model_3d_url,
    model_3d_url: product.model_3d_url || null,
    skm_asset_key: product.model_3d_url || null,
    tags: [product.brand, product.category, product.product_type].filter(Boolean),
    occasion: product.category || null,
    style_type: product.product_type || null,
    stock: product.stock ?? 10
  }
}
