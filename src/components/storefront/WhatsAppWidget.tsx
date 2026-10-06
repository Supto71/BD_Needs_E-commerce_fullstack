'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function WhatsAppWidget() {
  const pathname = usePathname();

  // Don't show on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const phoneNumber = '8801811277828'; // Ensure country code is included without '+'
  const message = 'Hello BdNeeds! I need some help.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-[#ffffff] rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
