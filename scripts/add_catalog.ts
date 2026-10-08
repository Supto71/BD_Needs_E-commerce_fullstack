import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Load .env
function loadProjectEnv() {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}
loadProjectEnv();

const prisma = new PrismaClient();

const catalog = [
  {
    category: "Clothing & Apparel",
    icon: "Shirt",
    subcategories: [
      {
        name: "Men's Clothing",
        products: ["T-Shirt", "Polo T-Shirt", "Casual Shirt", "Formal Shirt", "Jeans", "Trousers", "Drop-Shoulder T-Shirt", "Winter Denim", "Full-Sleeve T-Shirt", "Hoodie", "Winter Shirt"]
      },
      {
        name: "Women's Clothing",
        products: ["Three-Piece", "Salwar Kameez", "Saree", "Kurti", "Tops", "Ladies T-Shirt", "Ladies Jeans", "Leggings", "Hijab", "Scarf/Orna", "Abaya", "Burqa", "Night Dress"]
      }
    ]
  },
  {
    category: "Electronics & Lighting",
    icon: "Zap",
    products: ["Mobile Charger", "USB Cable", "Power Bank", "Earphones", "Bluetooth Speaker", "Electric Fan", "Extension Board", "LED Bulb", "LED Emergency Light", "Profile Light", "Focus Light", "Hanging Light"]
  },
  {
    category: "Beauty & Personal Care",
    icon: "Sparkles",
    products: ["Primer", "Foundation", "Concealer", "Compact Powder", "Face Powder", "Blush", "Highlighter", "Makeup Remover", "Eyeliner", "Mascara", "Eyebrow Pencil", "Lipstick", "Lip Gloss", "Nail Polish", "Face Wash", "Body Wash", "Soap", "Moisturizer", "Sunscreen", "Hair Serum", "Perfume", "Body Spray"]
  },
  {
    category: "Health & Medical",
    icon: "Stethoscope", // generic lucide icon name (can be mapped later)
    products: ["Sanitary Pad", "Panty Liner", "Tampon", "Menstrual Cup", "Menstrual Disc", "Period Panty", "Reusable Cloth Pad", "Intimate Wash", "Period Pain Relief Patch", "Heating Pad", "Thermometer", "Digital BP Monitor", "Pulse Oximeter", "First Aid Box", "Syringe", "Surgical Gloves", "Face Mask", "Cotton", "Bandage", "Antiseptic Solution"]
  },
  {
    category: "Groceries",
    icon: "ShoppingBag",
    products: ["Rice", "Lentils", "Chickpeas", "Flour", "Cooking Oil", "Salt", "Sugar", "Potatoes", "Onions", "Eggs", "Tea", "Coffee", "Liquid Milk", "Powdered Milk", "Biscuits", "Bread", "Noodles", "Spices", "Tomato Sauce", "Soy Sauce"]
  },
  {
    category: "Toys & Kids",
    icon: "Gamepad2",
    products: ["Toy Motorcycle", "Toy Train", "Toy Airplane", "Toy Helicopter", "Toy Robot", "Toy Gun", "Doll", "Teddy Bear", "Toy Kitchen Set"]
  },
  {
    category: "Sports Equipments",
    icon: "Dumbbell",
    products: ["Cricket Bat", "Cricket Ball", "Cricket Gloves", "Football", "Football Boots", "Badminton Racket", "Badminton Shuttle", "Tennis Racket", "Volleyball", "Sports Jersey"]
  },
  {
    category: "Footwear",
    icon: "Footprints",
    subcategories: [
      {
        name: "Men’s",
        products: ["Sneakers", "Men's Shoes"]
      },
      {
        name: "Women’s",
        products: ["Women's Sneakers", "Women's Shoes"]
      }
    ]
  }
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log("Starting to insert catalog...");
  
  for (const catData of catalog) {
    const catSlug = slugify(catData.category);
    
    // Create or find category
    let category = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: catData.category,
          slug: catSlug,
          description: `Best quality ${catData.category}`,
          image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80", // placeholder
          icon: catData.icon,
          isActive: true
        }
      });
      console.log(`Created Category: ${category.name}`);
    }

    // Handle products directly under category
    if (catData.products) {
      for (const prodName of catData.products) {
        const prodSlug = slugify(prodName + "-" + Math.floor(Math.random()*1000));
        await createProduct(prodName, prodSlug, category.id, category.name, null, null);
      }
    }

    // Handle subcategories
    if (catData.subcategories) {
      for (const sub of catData.subcategories) {
        const subSlug = slugify(catData.category + "-" + sub.name);
        let subcat = await prisma.subcategory.findUnique({ where: { slug: subSlug } });
        if (!subcat) {
          subcat = await prisma.subcategory.create({
            data: {
              name: sub.name,
              slug: subSlug,
              categoryId: category.id,
              isActive: true
            }
          });
          console.log(`  Created Subcategory: ${subcat.name}`);
        }

        // Add products under subcategory
        for (const prodName of sub.products) {
          const prodSlug = slugify(prodName + "-" + Math.floor(Math.random()*1000));
          await createProduct(prodName, prodSlug, category.id, category.name, subcat.id, subcat.name);
        }
      }
    }
  }
  console.log("Finished inserting catalog!");
}

async function createProduct(name: string, slug: string, catId: string, catName: string, subId: string | null, subName: string | null) {
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return;

  const basePrice = Math.floor(Math.random() * 2000) + 100;

  await prisma.product.create({
    data: {
      name,
      slug,
      brand: "BDNeeds",
      categoryId: catId,
      categoryName: catName,
      subcategoryId: subId,
      subcategoryName: subName,
      basePrice,
      originalPrice: basePrice * 1.2,
      discount: 20,
      stock: 50,
      sku: slug.substring(0, 10).toUpperCase() + "-" + Math.floor(Math.random()*1000),
      shortDescription: `High quality ${name} for your everyday needs.`,
      description: `Detailed description for ${name}. This product is top-tier and provides excellent value.`,
      features: ["Premium quality", "Durable", "Affordable"],
      specifications: { "Color": "Various", "Size": "Standard" },
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
      tags: [name, catName],
      isPublished: true,
      seoTitle: `${name} | Buy Online | BDNeeds`,
      seoDescription: `Buy ${name} at the best price in Bangladesh from BDNeeds. Fast delivery.`,
      imageAlt: `${name} Price in Bangladesh`
    }
  });
  console.log(`    Created Product: ${name}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
