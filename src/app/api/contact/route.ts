import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Save contact form submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, subject: subject || '', message },
    });

    return NextResponse.json({ success: true, id: contact.id });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to save message.' }, { status: 500 });
  }
}

// GET: Fetch all contact messages (admin only)
export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Fetch contact messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages.' }, { status: 500 });
  }
}

// PATCH: Mark message as read
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isRead } = body;
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update contact message error:', error);
    return NextResponse.json({ error: 'Failed to update message.' }, { status: 500 });
  }
}
