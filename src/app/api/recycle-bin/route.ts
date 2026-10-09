import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.recycleBin.findMany({
      orderBy: { deletedAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recycle bin items' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const empty = searchParams.get('empty');

    if (empty === 'true') {
      await prisma.recycleBin.deleteMany({});
      return NextResponse.json({ success: true, message: 'Recycle bin emptied successfully' });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error emptying recycle bin:', error);
    return NextResponse.json({ error: 'Failed to empty recycle bin' }, { status: 500 });
  }
}
