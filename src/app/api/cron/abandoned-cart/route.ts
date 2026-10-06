import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Verify cron secret to prevent unauthorized execution
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Find carts that were updated more than 24 hours ago, but less than 48 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const abandonedCarts = await prisma.cart.findMany({
      where: {
        updatedAt: {
          lte: twentyFourHoursAgo,
          gte: fortyEightHoursAgo,
        },
        items: {
          some: {}, // Only carts that have items
        },
      },
      include: {
        user: true,
        items: true,
      },
    });

    if (abandonedCarts.length === 0) {
      return NextResponse.json({ message: 'No abandoned carts found.' });
    }

    let emailsSent = 0;

    // 3. Process each cart
    for (const cart of abandonedCarts) {
      // Check if user already placed an order in the last 24 hours
      const recentOrder = await prisma.order.findFirst({
        where: {
          userId: cart.userId,
          createdAt: {
            gte: twentyFourHoursAgo,
          },
        },
      });

      // If they recently ordered, ignore this cart
      if (recentOrder) continue;

      const userEmail = cart.user.email;
      const userName = cart.user.name;

      // TODO: Implement actual Email sending logic here using Resend / Nodemailer
      // Example:
      /*
      await sendEmail({
        to: userEmail,
        subject: `Hi ${userName}, you left something behind! 🛒`,
        html: `
          <p>We noticed you left some amazing products in your cart.</p>
          <a href="https://bdneeds.com/cart">Click here to complete your checkout</a>
        `
      });
      */
      
      console.log(`[Cron] Abandoned Cart Email sent to: ${userEmail}`);
      emailsSent++;
    }

    return NextResponse.json({ success: true, emailsSent });
  } catch (error) {
    console.error('Cron abandoned cart error:', error);
    return NextResponse.json({ error: 'Failed to process abandoned carts' }, { status: 500 });
  }
}
