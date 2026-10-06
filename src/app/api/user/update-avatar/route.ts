import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId, avatarUrl } = await request.json();

    if (!userId || !avatarUrl) {
      return NextResponse.json({ error: 'User ID and Avatar URL are required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    const { password: _, ...safeUser } = updatedUser;

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Update avatar error:', error);
    return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 });
  }
}
