import React from 'react';

const directory = [
  {
    category: 'Clothing & Apparel',
    match: ['clothing', 'apparel', 'fashion', 'men', 'women'],
    subs: [
      {
        name: "Men's Clothing",
        products: ['T-Shirt', 'Polo T-Shirt', 'Casual Shirt', 'Formal Shirt', 'Jeans', 'Trousers', 'Drop-Shoulder T-Shirt', 'Winter Denim', 'Full-Sleeve T-Shirt', 'Hoodie', 'Winter Shirt'],
      },
      {
        name: "Women's Clothing",
        products: ['Three-Piece', 'Salwar Kameez', 'Saree', 'Kurti', 'Tops', 'Ladies T-Shirt', 'Ladies Jeans', 'Leggings', 'Hijab', 'Scarf/Orna', 'Abaya', 'Burqa', 'Night Dress'],
      }
    ]
  },
  {
    category: 'Electronics & Lighting',
    match: ['electronics', 'lighting', 'gadgets', 'electrical', 'accessories'],
    subs: [
      {
        name: 'Products',
        products: ['Mobile Charger', 'USB Cable', 'Power Bank', 'Earphones', 'Bluetooth Speaker', 'Electric Fan', 'Extension Board', 'LED Bulb', 'LED Emergency Light', 'Profile Light', 'Focus Light', 'Hanging Light']
      }
    ]
  },
  {
    category: 'Beauty & Personal Care',
    match: ['beauty', 'care', 'cosmetics', 'makeup', 'skincare'],
    subs: [
      {
        name: 'Products',
        products: ['Primer', 'Foundation', 'Concealer', 'Compact Powder', 'Face Powder', 'Blush', 'Highlighter', 'Makeup Remover', 'Eyeliner', 'Mascara', 'Eyebrow Pencil', 'Lipstick', 'Lip Gloss', 'Nail Polish', 'Face Wash', 'Body Wash', 'Soap', 'Moisturizer', 'Sunscreen', 'Hair Serum', 'Perfume', 'Body Spray']
      }
    ]
  },
  {
    category: 'Health & Medical',
    match: ['health', 'medical', 'medicine', 'pharmacy', 'wellness'],
    subs: [
      {
        name: 'Products',
        products: ['Sanitary Pad', 'Panty Liner', 'Tampon', 'Menstrual Cup', 'Menstrual Disc', 'Period Panty', 'Reusable Cloth Pad', 'Intimate Wash', 'Period Pain Relief Patch', 'Heating Pad', 'Thermometer', 'Digital BP Monitor', 'Pulse Oximeter', 'First Aid Box', 'Syringe', 'Surgical Gloves', 'Face Mask', 'Cotton', 'Bandage', 'Antiseptic Solution']
      }
    ]
  },
  {
    category: 'Groceries',
    match: ['groceries', 'grocery', 'food', 'cooking'],
    subs: [
      {
        name: 'Products',
        products: ['Rice', 'Lentils', 'Chickpeas', 'Flour', 'Cooking Oil', 'Salt', 'Sugar', 'Potatoes', 'Onions', 'Eggs', 'Tea', 'Coffee', 'Liquid Milk', 'Powdered Milk', 'Biscuits', 'Bread', 'Noodles', 'Spices', 'Tomato Sauce', 'Soy Sauce']
      }
    ]
  },
  {
    category: 'Toys & Kids',
    match: ['toys', 'kids', 'baby', 'children'],
    subs: [
      {
        name: 'Products',
        products: ['Toy Motorcycle', 'Toy Train', 'Toy Airplane', 'Toy Helicopter', 'Toy Robot', 'Toy Gun', 'Doll', 'Teddy Bear', 'Toy Kitchen Set']
      }
    ]
  },
  {
    category: 'Sports Equipments',
    match: ['sports', 'equipment', 'fitness', 'outdoor'],
    subs: [
      {
        name: 'Products',
        products: ['Cricket Bat', 'Cricket Ball', 'Cricket Gloves', 'Football', 'Football Boots', 'Badminton Racket', 'Badminton Shuttle', 'Tennis Racket', 'Volleyball', 'Sports Jersey']
      }
    ]
  },
  {
    category: 'Footwear',
    match: ['footwear', 'shoes', 'sneakers', 'sandals'],
    subs: [
      {
        name: "Men's",
        products: ['Sneakers', "Men's Shoes"]
      },
      {
        name: "Women's",
        products: ['Sneakers', "Women's Shoes"]
      }
    ]
  }
];

export default function CategorySeoBlock({ categoryName }: { categoryName: string }) {
  const normalizedName = categoryName.toLowerCase();
  
  const matchedData = directory.find(d => 
    d.match.some(keyword => normalizedName.includes(keyword))
  );

  if (!matchedData) return null;

  return (
    <section className="bg-slate-50 border-t border-slate-200 py-10 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-sm font-bold text-[#0B132B] mb-4">
          Discover {matchedData.category} at BDNEEDS
        </h2>
        
        <div className="space-y-4">
          {matchedData.subs.map((sub, sIdx) => (
            <div key={sIdx}>
              {sub.name !== 'Products' && (
                <strong className="text-xs text-slate-700 block mb-1">{sub.name}</strong>
              )}
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Shop top quality items including: {sub.products.map((p, pIdx) => (
                  <React.Fragment key={pIdx}>
                    <span className="hover:text-blue-600 transition-colors cursor-default">{p}</span>
                    {pIdx < sub.products.length - 1 && ', '}
                  </React.Fragment>
                ))}. Browse our extensive collection and order online for fast delivery anywhere in Bangladesh.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
