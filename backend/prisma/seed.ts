import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // ── Clear existing tables ──────────────────────────────────────────────────
  await prisma.transaction.deleteMany()
  await prisma.wardrobeItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.avatar.deleteMany()
  await prisma.user.deleteMany()
  await prisma.outfit.deleteMany()
  await prisma.market.deleteMany()

  // ── Markets ────────────────────────────────────────────────────────────────
  const markets = await Promise.all([
    prisma.market.create({ data: { name: 'Zara',    logo_url: '/logos/zara.png',    banner_url: '/banners/zara.jpg',    description: 'Fast fashion essentials' } }),
    prisma.market.create({ data: { name: 'Gucci',   logo_url: '/logos/gucci.png',   banner_url: '/banners/gucci.jpg',   description: 'Luxury Italian fashion' } }),
    prisma.market.create({ data: { name: 'H&M',     logo_url: '/logos/hm.png',      banner_url: '/banners/hm.jpg',      description: 'Affordable everyday style' } }),
    prisma.market.create({ data: { name: 'Nike',    logo_url: '/logos/nike.png',    banner_url: '/banners/nike.jpg',    description: 'Sport and streetwear' } }),
    prisma.market.create({ data: { name: 'Versace', logo_url: '/logos/versace.png', banner_url: '/banners/versace.jpg', description: 'Bold luxury fashion' } }),
  ])

  // ── Outfits ────────────────────────────────────────────────────────────────
  const outfitData = [
    { market_id: markets[0].id, name: 'Zara Classic White Tee',    price: 29.99,  has_3d_model: true,  skm_asset_key: 'outfit_zara_white_tee',     tags: ['casual','basic'],          occasion: 'casual',   style_type: 'classic'    },
    { market_id: markets[0].id, name: 'Zara Slim Denim Jacket',    price: 89.99,  has_3d_model: true,  skm_asset_key: 'outfit_zara_denim_jacket',   tags: ['casual','outerwear'],      occasion: 'casual',   style_type: 'classic'    },
    { market_id: markets[1].id, name: 'Gucci Floral Suit',         price: 2400.0, has_3d_model: true,  skm_asset_key: 'outfit_gucci_floral_suit',   tags: ['formal','wedding','fancy'],occasion: 'wedding',  style_type: 'luxury'     },
    { market_id: markets[1].id, name: 'Gucci Logo Polo',           price: 650.0,  has_3d_model: false, skm_asset_key: null,                         tags: ['smart-casual'],            occasion: 'casual',   style_type: 'luxury'     },
    { market_id: markets[2].id, name: 'H&M Linen Summer Dress',   price: 39.99,  has_3d_model: false, skm_asset_key: null,                         tags: ['summer','casual'],         occasion: 'casual',   style_type: 'classic'    },
    { market_id: markets[2].id, name: 'H&M Evening Gown',          price: 79.99,  has_3d_model: true,  skm_asset_key: 'outfit_hm_evening_gown',     tags: ['formal','fancy','evening'],occasion: 'gala',     style_type: 'classic'    },
    { market_id: markets[3].id, name: 'Nike Tech Fleece Hoodie',   price: 120.0,  has_3d_model: true,  skm_asset_key: 'outfit_nike_tech_hoodie',    tags: ['sport','streetwear'],      occasion: 'sport',    style_type: 'streetwear' },
    { market_id: markets[3].id, name: 'Nike Dri-FIT Training Set', price: 95.0,   has_3d_model: false, skm_asset_key: null,                         tags: ['sport','gym'],             occasion: 'sport',    style_type: 'streetwear' },
    { market_id: markets[4].id, name: 'Versace Baroque Blazer',    price: 3200.0, has_3d_model: true,  skm_asset_key: 'outfit_versace_baroque_blz', tags: ['formal','luxury','bold'],  occasion: 'gala',     style_type: 'luxury'     },
    { market_id: markets[4].id, name: 'Versace Chain Print Shirt', price: 750.0,  has_3d_model: false, skm_asset_key: null,                         tags: ['bold','smart-casual'],     occasion: 'casual',   style_type: 'luxury'     },
  ]

  const outfits = await Promise.all(
    outfitData.map(d => prisma.outfit.create({ data: { ...d, images: [], description: d.name + ' — premium piece' } }))
  )

  // ── Users + Avatars ────────────────────────────────────────────────────────
  const usersData = [
    { 
      email: 'ali@demo.com',    
      display_name: 'Ali Ben Salah',   
      metahuman_id: 'BP_Avatar_01',
      isModel: true,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      bodyDescription: 'Height: 185cm • Athletic Build • Chest: 100cm • Waist: 82cm',
      clothesTaste: 'Minimalist streetwear, oversized hoodies, clean graphic tees, and luxury sports aesthetics.'
    },
    { 
      email: 'sara@demo.com',   
      display_name: 'Sara Mansour',    
      metahuman_id: 'BP_Avatar_02',
      isModel: true,
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      bodyDescription: 'Height: 176cm • Elegant Slender Build • Waist: 64cm • Hips: 92cm',
      clothesTaste: 'Luxury evening gowns, silk blouses, high-waisted tailored pants, and timeless Italian design.'
    },
    { 
      email: 'karim@demo.com',  
      display_name: 'Karim Trabelsi',  
      metahuman_id: 'BP_Avatar_03',
      isModel: false,
      photo: null,
      bodyDescription: null,
      clothesTaste: null
    },
    { 
      email: 'lina@demo.com',   
      display_name: 'Lina Bouaziz',    
      metahuman_id: 'BP_Avatar_04',
      isModel: true,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      bodyDescription: 'Height: 172cm • Fit/Toned Build • Chest: 88cm • Waist: 66cm',
      clothesTaste: 'Casual chic, premium denim, athletic workout sets, and bold high-fashion jackets.'
    },
    { 
      email: 'youssef@demo.com',
      display_name: 'Youssef Gharbi',  
      metahuman_id: 'BP_Avatar_05',
      isModel: false,
      photo: null,
      bodyDescription: null,
      clothesTaste: null
    },
  ]

  for (const u of usersData) {
    const password_hash = await bcrypt.hash('demo1234', 10)
    const wallet_balance = u.email === 'ali@demo.com' ? 210.01 : u.email === 'sara@demo.com' ? 8.99 : u.email === 'lina@demo.com' ? 12.00 : 0
    const user = await prisma.user.create({
      data: { 
        email: u.email, 
        display_name: u.display_name, 
        password_hash, 
        role: 'USER',
        isModel: u.isModel,
        photo: u.photo,
        bodyDescription: u.bodyDescription,
        clothesTaste: u.clothesTaste,
        wallet_balance
      }
    })
    await prisma.avatar.create({
      data: {
        user_id: user.id,
        metahuman_id: u.metahuman_id,
        status: 'READY',
        photos_urls: [],
      }
    })

    // Seed custom transaction logs for realistic dashboards
    if (u.email === 'ali@demo.com') {
      await prisma.transaction.create({
        data: {
          user_id: user.id,
          type: 'COMMISSION',
          amount: 240.00,
          description: '10% Affiliate Commission on Gucci Floral Suit purchased by Sara Mansour',
          status: 'COMPLETED'
        }
      })
      await prisma.transaction.create({
        data: {
          user_id: user.id,
          type: 'PURCHASE',
          amount: -29.99,
          description: 'Purchased Zara Classic White Tee',
          status: 'COMPLETED'
        }
      })
    } else if (u.email === 'sara@demo.com') {
      await prisma.transaction.create({
        data: {
          user_id: user.id,
          type: 'COMMISSION',
          amount: 8.99,
          description: '10% Affiliate Commission on Zara Slim Denim Jacket purchased by Ali Ben Salah',
          status: 'COMPLETED'
        }
      })
      await prisma.transaction.create({
        data: {
          user_id: user.id,
          type: 'PURCHASE',
          amount: -2400.00,
          description: 'Purchased Gucci Floral Suit',
          status: 'COMPLETED'
        }
      })
    } else if (u.email === 'lina@demo.com') {
      await prisma.transaction.create({
        data: {
          user_id: user.id,
          type: 'COMMISSION',
          amount: 12.00,
          description: '10% Affiliate Commission on Nike Tech Fleece Hoodie purchased by Karim Trabelsi',
          status: 'COMPLETED'
        }
      })
    }

    await prisma.wardrobeItem.create({ data: { user_id: user.id, outfit_id: outfits[0].id, is_public: true } })
    await prisma.wardrobeItem.create({ data: { user_id: user.id, outfit_id: outfits[2].id, is_public: true } })
  }

  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
