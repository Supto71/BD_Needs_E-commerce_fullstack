'use client';

import React, { useState, useEffect, use } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import { Product } from '@/types';

export default function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setProduct(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-slate-400">
        Loading product data...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-sm font-semibold text-slate-600">
        Product not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
          Edit Product: {product.name}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Update prices, manage variant matrix, and modify media assets.
        </p>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
