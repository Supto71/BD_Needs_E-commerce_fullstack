import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    
    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          storeName: 'BdNeeds',
          currency: 'BDT',
          shippingFeeInsideDhaka: 70,
          shippingFeeOutsideDhaka: 130,
          freeShippingThreshold: 5000,
          taxRate: 0,
          contactEmail: 'contact@bdneeds.com.bd',
          contactPhone: '01811277828'
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          storeName: 'BdNeeds',
          currency: 'BDT',
          shippingFeeInsideDhaka: 70,
          shippingFeeOutsideDhaka: 130,
          freeShippingThreshold: 5000,
          taxRate: 0,
          contactEmail: 'contact@bdneeds.com.bd',
          contactPhone: '01811277828'
        }
      });
    }

    const updatedSettings = await prisma.settings.update({
      where: { id: settings.id },
      data: {
        storeName: data.storeName ?? settings.storeName,
        currency: data.currency ?? settings.currency,
        shippingFeeInsideDhaka: data.shippingFeeInsideDhaka !== undefined ? Number(data.shippingFeeInsideDhaka) : settings.shippingFeeInsideDhaka,
        shippingFeeOutsideDhaka: data.shippingFeeOutsideDhaka !== undefined ? Number(data.shippingFeeOutsideDhaka) : settings.shippingFeeOutsideDhaka,
        freeShippingThreshold: data.freeShippingThreshold !== undefined ? Number(data.freeShippingThreshold) : settings.freeShippingThreshold,
        taxRate: data.taxRate !== undefined ? Number(data.taxRate) : settings.taxRate,
        contactEmail: data.contactEmail ?? settings.contactEmail,
        contactPhone: data.contactPhone ?? settings.contactPhone,
      }
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
