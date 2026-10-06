'use client';

import React from 'react';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
          New Product Master
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Add an engineered product to the catalog with multi-color and spec variants.
        </p>
      </div>

      <ProductForm isEdit={false} />
    </div>
  );
}
