'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { LanguageProvider } from './LanguageContext';
import CartDrawer from '@/components/storefront/CartDrawer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SessionProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </SessionProvider>
    </LanguageProvider>
  );
}
