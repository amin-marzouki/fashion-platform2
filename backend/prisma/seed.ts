import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // ── Clear existing tables ──────────────────────────────────────────────────
  await prisma.commission.deleteMany()
  await prisma.wardrobe.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.avatar.deleteMany()
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()
  await prisma.market.deleteMany()

  // ── Markets ────────────────────────────────────────────────────────────────
  const markets = await Promise.all([
    prisma.market.create({ data: { name: 'Zara',    logo_url: '/logos/zara.png',    banner_url: '/banners/zara.jpg',    description: 'Fast fashion essentials' } }),
    prisma.market.create({ data: { name: 'Gucci',   logo_url: '/logos/gucci.png',   banner_url: '/banners/gucci.jpg',   description: 'Luxury Italian fashion' } }),
    prisma.market.create({ data: { name: 'H&M',     logo_url: '/logos/hm.png',      banner_url: '/banners/hm.jpg',      description: 'Affordable everyday style' } }),
    prisma.market.create({ data: { name: 'Nike',    logo_url: '/logos/nike.png',    banner_url: '/banners/nike.jpg',    description: 'Sport and streetwear' } }),
    prisma.market.create({ data: { name: 'Versace', logo_url: '/logos/versace.png', banner_url: '/banners/versace.jpg', description: 'Bold luxury fashion' } }),
  ])

  // ── Products ────────────────────────────────────────────────────────────────
  const productData = [
    { market_id: markets[0].id, name: 'Zara Classic White Tee',    brand: 'Zara',    category: 'Tees',    product_type: 'Tee',    price: 29.99,  model_3d_url: 'outfit_zara_white_tee',     size_chest_min: 90, size_chest_max: 110, size_waist_min: 75, size_waist_max: 95, size_hip_min: 85, size_hip_max: 105, stock: 100 },
    { market_id: markets[0].id, name: 'Zara Slim Denim Jacket',    brand: 'Zara',    category: 'Jackets', product_type: 'Jacket', price: 89.99,  model_3d_url: 'outfit_zara_denim_jacket',   size_chest_min: 90, size_chest_max: 110, size_waist_min: 75, size_waist_max: 95, size_hip_min: 85, size_hip_max: 105, stock: 50 },
    { market_id: markets[1].id, name: 'Gucci Floral Suit',         brand: 'Gucci',   category: 'Suits',   product_type: 'Suit',   price: 2400.0, model_3d_url: 'outfit_gucci_floral_suit',   size_chest_min: 95, size_chest_max: 115, size_waist_min: 80, size_waist_max: 100, size_hip_min: 90, size_hip_max: 110, stock: 15 },
    { market_id: markets[1].id, name: 'Gucci Logo Polo',           brand: 'Gucci',   category: 'Polos',   product_type: 'Polo',   price: 650.0,  model_3d_url: null,                         size_chest_min: 95, size_chest_max: 115, size_waist_min: 80, size_waist_max: 100, size_hip_min: 90, size_hip_max: 110, stock: 40 },
    { market_id: markets[2].id, name: 'H&M Linen Summer Dress',    brand: 'H&M',     category: 'Dresses', product_type: 'Dress',  price: 39.99,  model_3d_url: null,                         size_chest_min: 80, size_chest_max: 100, size_waist_min: 60, size_waist_max: 80,  size_hip_min: 85, size_hip_max: 105, stock: 200 },
    { market_id: markets[2].id, name: 'H&M Evening Gown',          brand: 'H&M',     category: 'Dresses', product_type: 'Dress',  price: 79.99,  model_3d_url: 'outfit_hm_evening_gown',     size_chest_min: 80, size_chest_max: 100, size_waist_min: 60, size_waist_max: 80,  size_hip_min: 85, size_hip_max: 105, stock: 25 },
    { market_id: markets[3].id, name: 'Nike Tech Fleece Hoodie',   brand: 'Nike',    category: 'Hoodies', product_type: 'Hoodie', price: 120.0,  model_3d_url: 'outfit_nike_tech_hoodie',    size_chest_min: 85, size_chest_max: 105, size_waist_min: 70, size_waist_max: 90,  size_hip_min: 80, size_hip_max: 100, stock: 150 },
    { market_id: markets[3].id, name: 'Nike Dri-FIT Training Set', brand: 'Nike',    category: 'Sets',    product_type: 'Set',    price: 95.0,   model_3d_url: null,                         size_chest_min: 85, size_chest_max: 105, size_waist_min: 70, size_waist_max: 90,  size_hip_min: 80, size_hip_max: 100, stock: 80 },
    { market_id: markets[4].id, name: 'Versace Baroque Blazer',    brand: 'Versace', category: 'Blazers', product_type: 'Blazer', price: 3200.0, model_3d_url: 'outfit_versace_baroque_blz', size_chest_min: 95, size_chest_max: 115, size_waist_min: 80, size_waist_max: 100, size_hip_min: 90, size_hip_max: 110, stock: 10 },
    { market_id: markets[4].id, name: 'Versace Chain Print Shirt', brand: 'Versace', category: 'Shirts',  product_type: 'Shirt',  price: 750.0,  model_3d_url: null,                         size_chest_min: 95, size_chest_max: 115, size_waist_min: 80, size_waist_max: 100, size_hip_min: 90, size_hip_max: 110, stock: 35 },
  ]

  const products = []
  for (const d of productData) {
    const product = await prisma.product.create({
      data: {
        market_id: d.market_id,
        name: d.name,
        brand: d.brand,
        category: d.category,
        product_type: d.product_type,
        price: d.price,
        description: d.name + ' — premium piece',
        image_url: `/products/${d.brand.toLowerCase()}_placeholder.jpg`,
        model_3d_url: d.model_3d_url,
        size_chest_min: d.size_chest_min,
        size_chest_max: d.size_chest_max,
        size_waist_min: d.size_waist_min,
        size_waist_max: d.size_waist_max,
        size_hip_min: d.size_hip_min,
        size_hip_max: d.size_hip_max,
        stock: d.stock,
      }
    })
    products.push(product)
  }

  // ── Users + Avatars ────────────────────────────────────────────────────────
  const usersData = [
    { 
      email: 'ali@demo.com',    
      name: 'Ali Ben Salah',   
      gender: 'M' as const,
      height: 185.0,
      weight: 80.0,
      shoulder: 46.0,
      chest: 100.0,
      waist: 82.0,
      hips: 96.0,
      referral_code: 'REF_ALI',
      metahuman_id: 'BP_Avatar_01',
      isModel: true,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      bodyDescription: 'Height: 185cm • Athletic Build • Chest: 100cm • Waist: 82cm',
      clothesTaste: 'Minimalist streetwear, oversized hoodies, clean graphic tees, and luxury sports aesthetics.'
    },
    { 
      email: 'sara@demo.com',   
      name: 'Sara Mansour',    
      gender: 'F' as const,
      height: 176.0,
      weight: 58.0,
      shoulder: 39.0,
      chest: 88.0,
      waist: 64.0,
      hips: 92.0,
      referral_code: 'REF_SARA',
      metahuman_id: 'BP_Avatar_02',
      isModel: true,
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      bodyDescription: 'Height: 176cm • Elegant Slender Build • Waist: 64cm • Hips: 92cm',
      clothesTaste: 'Luxury evening gowns, silk blouses, high-waisted tailored pants, and timeless Italian design.'
    },
    { 
      email: 'karim@demo.com',  
      name: 'Karim Trabelsi',  
      gender: 'M' as const,
      height: 180.0,
      weight: 76.0,
      shoulder: 44.0,
      chest: 96.0,
      waist: 80.0,
      hips: 94.0,
      referral_code: 'REF_KARIM',
      metahuman_id: 'BP_Avatar_03',
      isModel: false,
      photo: null,
      bodyDescription: null,
      clothesTaste: null
    },
    { 
      email: 'lina@demo.com',   
      name: 'Lina Bouaziz',    
      gender: 'F' as const,
      height: 172.0,
      weight: 56.0,
      shoulder: 38.0,
      chest: 86.0,
      waist: 66.0,
      hips: 90.0,
      referral_code: 'REF_LINA',
      metahuman_id: 'BP_Avatar_04',
      isModel: true,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      bodyDescription: 'Height: 172cm • Fit/Toned Build • Chest: 88cm • Waist: 66cm',
      clothesTaste: 'Casual chic, premium denim, athletic workout sets, and bold high-fashion jackets.'
    },
    { 
      email: 'youssef@demo.com',
      name: 'Youssef Gharbi',  
      gender: 'M' as const,
      height: 178.0,
      weight: 72.0,
      shoulder: 43.0,
      chest: 94.0,
      waist: 78.0,
      hips: 92.0,
      referral_code: 'REF_YOUSSEF',
      metahuman_id: 'BP_Avatar_05',
      isModel: false,
      photo: null,
      bodyDescription: null,
      clothesTaste: null
    },
  ]

  const createdUsers = []
  for (const u of usersData) {
    const password = await bcrypt.hash('demo1234', 10)
    const wallet_balance = u.email === 'ali@demo.com' ? 210.01 : u.email === 'sara@demo.com' ? 8.99 : u.email === 'lina@demo.com' ? 12.00 : 0
    const total_commission = u.email === 'ali@demo.com' ? 240.00 : u.email === 'sara@demo.com' ? 8.99 : u.email === 'lina@demo.com' ? 12.00 : 0

    const user = await prisma.user.create({
      data: { 
        email: u.email, 
        name: u.name, 
        password, 
        role: 'USER',
        gender: u.gender,
        height: u.height,
        weight: u.weight,
        shoulder: u.shoulder,
        chest: u.chest,
        waist: u.waist,
        hips: u.hips,
        referral_code: u.referral_code,
        total_commission,
        isModel: u.isModel,
        photo: u.photo,
        bodyDescription: u.bodyDescription,
        clothesTaste: u.clothesTaste,
        wallet_balance
      }
    })
    createdUsers.push(user)

    await prisma.avatar.create({
      data: {
        user_id: user.id,
        metahuman_id: u.metahuman_id,
        status: 'READY',
        photos_urls: [],
      }
    })

    // Seed public wardrobe items
    await prisma.wardrobe.create({ data: { user_id: user.id, product_id: products[0].id } })
    await prisma.wardrobe.create({ data: { user_id: user.id, product_id: products[2].id } })
  }

  // Seed custom commissions to populate tables dynamically
  const ali = createdUsers[0]
  const sara = createdUsers[1]
  const lina = createdUsers[3]

  // Ali's commission log
  const order1 = await prisma.order.create({
    data: {
      user_id: sara.id,
      total_amount: 2400.00,
      status: 'paid',
      referred_by: ali.id
    }
  })
  await prisma.commission.create({
    data: {
      referrer_id: ali.id,
      order_id: order1.id,
      amount: 240.00,
      status: 'paid'
    }
  })

  // Sara's commission log
  const order2 = await prisma.order.create({
    data: {
      user_id: ali.id,
      total_amount: 89.90,
      status: 'paid',
      referred_by: sara.id
    }
  })
  await prisma.commission.create({
    data: {
      referrer_id: sara.id,
      order_id: order2.id,
      amount: 8.99,
      status: 'paid'
    }
  })

  // Lina's commission log
  const order3 = await prisma.order.create({
    data: {
      user_id: ali.id,
      total_amount: 120.00,
      status: 'paid',
      referred_by: lina.id
    }
  })
  await prisma.commission.create({
    data: {
      referrer_id: lina.id,
      order_id: order3.id,
      amount: 12.00,
      status: 'paid'
    }
  })

  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
