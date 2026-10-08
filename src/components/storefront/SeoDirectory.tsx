import React from 'react';

const directory = [
  {
    category: 'Clothing & Apparel',
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
    subs: [
      {
        name: 'Products',
        products: ['Mobile Charger', 'USB Cable', 'Power Bank', 'Earphones', 'Bluetooth Speaker', 'Electric Fan', 'Extension Board', 'LED Bulb', 'LED Emergency Light', 'Profile Light', 'Focus Light', 'Hanging Light']
      }
    ]
  },
  {
    category: 'Beauty & Personal Care',
    subs: [
      {
        name: 'Products',
        products: ['Primer', 'Foundation', 'Concealer', 'Compact Powder', 'Face Powder', 'Blush', 'Highlighter', 'Makeup Remover', 'Eyeliner', 'Mascara', 'Eyebrow Pencil', 'Lipstick', 'Lip Gloss', 'Nail Polish', 'Face Wash', 'Body Wash', 'Soap', 'Moisturizer', 'Sunscreen', 'Hair Serum', 'Perfume', 'Body Spray']
      }
    ]
  },
  {
    category: 'Health & Medical',
    subs: [
      {
        name: 'Products',
        products: ['Sanitary Pad', 'Panty Liner', 'Tampon', 'Menstrual Cup', 'Menstrual Disc', 'Period Panty', 'Reusable Cloth Pad', 'Intimate Wash', 'Period Pain Relief Patch', 'Heating Pad', 'Thermometer', 'Digital BP Monitor', 'Pulse Oximeter', 'First Aid Box', 'Syringe', 'Surgical Gloves', 'Face Mask', 'Cotton', 'Bandage', 'Antiseptic Solution']
      }
    ]
  },
  {
    category: 'Groceries',
    subs: [
      {
        name: 'Products',
        products: ['Rice', 'Lentils', 'Chickpeas', 'Flour', 'Cooking Oil', 'Salt', 'Sugar', 'Potatoes', 'Onions', 'Eggs', 'Tea', 'Coffee', 'Liquid Milk', 'Powdered Milk', 'Biscuits', 'Bread', 'Noodles', 'Spices', 'Tomato Sauce', 'Soy Sauce']
      }
    ]
  },
  {
    category: 'Toys & Kids',
    subs: [
      {
        name: 'Products',
        products: ['Toy Motorcycle', 'Toy Train', 'Toy Airplane', 'Toy Helicopter', 'Toy Robot', 'Toy Gun', 'Doll', 'Teddy Bear', 'Toy Kitchen Set']
      }
    ]
  },
  {
    category: 'Sports Equipments',
    subs: [
      {
        name: 'Products',
        products: ['Cricket Bat', 'Cricket Ball', 'Cricket Gloves', 'Football', 'Football Boots', 'Badminton Racket', 'Badminton Shuttle', 'Tennis Racket', 'Volleyball', 'Sports Jersey']
      }
    ]
  },
  {
    category: 'Footwear',
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

export default function SeoDirectory() {
  return (
    <section className="bg-slate-50 border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#0B132B]">Explore BDNEEDS Product Directory</h2>
          <p className="text-xs text-slate-500 mt-2">Browse our extensive collection of premium products across various categories.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {directory.map((cat, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-sm font-bold text-[#0B132B] uppercase tracking-wider border-b border-slate-200 pb-2">
                {cat.category}
              </h3>
              {cat.subs.map((sub, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  {sub.name !== 'Products' && (
                    <h4 className="text-xs font-bold text-slate-700">{sub.name}</h4>
                  )}
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {sub.products.map((p, pIdx) => (
                      <React.Fragment key={pIdx}>
                        <span className="hover:text-blue-600 cursor-default transition-colors">{p}</span>
                        {pIdx < sub.products.length - 1 && ', '}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
