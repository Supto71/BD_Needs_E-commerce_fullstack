import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { isFraud, role } = await request.json();
    
    const updateData: any = {};
    if (isFraud !== undefined) updateData.isFraud = isFraud;
    if (role !== undefined) updateData.role = role;

    await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findUnique({ 
      where: { id },
      include: {
        orders: { include: { items: true } },
        reviews: true
      }
    });
    if (user) {
      await prisma.recycleBin.create({
        data: {
          entityType: 'User',
          entityId: id,
          entityTitle: user.name,
          originalData: JSON.parse(JSON.stringify(user))
        }
      });
    }

    // Delete related orders first
    await prisma.orderItem.deleteMany({
      where: { order: { userId: id } }
    });
    await prisma.order.deleteMany({
      where: { userId: id }
    });
    await prisma.review.deleteMany({
      where: { userId: id }
    });
    
    // Now delete user
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
