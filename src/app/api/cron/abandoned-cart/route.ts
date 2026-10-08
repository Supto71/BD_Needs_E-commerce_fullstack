import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

// ─── Email Transporter ────────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ─── HTML Email Template ──────────────────────────────────────────────────────
function buildAbandonedCartEmail(userName: string, cartUrl: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>You left something behind!</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;max-width:600px;width:100%;">
            
            <!-- Header -->
            <tr>
              <td style="background-color:#0B132B;padding:30px 40px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:900;letter-spacing:2px;">BDNEEDS</h1>
                <p style="color:#94a3b8;margin:6px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Premium Essentials</p>
              </td>
            </tr>

            <!-- Hero Icon -->
            <tr>
              <td style="padding:40px 40px 20px;text-align:center;">
                <div style="font-size:48px;">🛒</div>
                <h2 style="color:#0B132B;font-size:22px;font-weight:900;margin:16px 0 8px;">
                  আপনি কিছু রেখে গেছেন, ${userName}!
                </h2>
                <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0;">
                  আপনার কার্টে কিছু পণ্য এখনও অপেক্ষা করছে।<br/>
                  অর্ডার সম্পন্ন করুন এবং দ্রুত ডেলিভারি উপভোগ করুন!
                </p>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td style="padding:20px 40px 40px;text-align:center;">
                <a 
                  href="${cartUrl}" 
                  style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:0.5px;"
                >
                  🛍️ কার্ট দেখুন ও অর্ডার করুন
                </a>
              </td>
            </tr>

            <!-- Benefits Bar -->
            <tr>
              <td style="padding:0 40px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:16px;text-align:center;border-right:1px solid #e2e8f0;">
                      <div style="font-size:20px;">🚚</div>
                      <p style="color:#0B132B;font-size:11px;font-weight:700;margin:6px 0 0;">দ্রুত ডেলিভারি</p>
                      <p style="color:#64748b;font-size:10px;margin:3px 0 0;">সারাদেশে</p>
                    </td>
                    <td style="padding:16px;text-align:center;border-right:1px solid #e2e8f0;">
                      <div style="font-size:20px;">🔄</div>
                      <p style="color:#0B132B;font-size:11px;font-weight:700;margin:6px 0 0;">৭ দিন রিটার্ন</p>
                      <p style="color:#64748b;font-size:10px;margin:3px 0 0;">সহজ প্রক্রিয়া</p>
                    </td>
                    <td style="padding:16px;text-align:center;">
                      <div style="font-size:20px;">🔒</div>
                      <p style="color:#0B132B;font-size:11px;font-weight:700;margin:6px 0 0;">নিরাপদ পেমেন্ট</p>
                      <p style="color:#64748b;font-size:10px;margin:3px 0 0;">bKash, Nagad, COD</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:11px;margin:0;">
                  এই ইমেইলটি পেতে না চাইলে এটি উপেক্ষা করুন।
                </p>
                <p style="color:#94a3b8;font-size:11px;margin:8px 0 0;">
                  © ${new Date().getFullYear()} BDNeeds &nbsp;|&nbsp; 
                  <a href="https://bdneeds.com.bd" style="color:#2563eb;text-decoration:none;">bdneeds.com.bd</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

// ─── Cron Handler ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    // 1. Verify cron secret to prevent unauthorized execution
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Find carts updated between 24 and 48 hours ago that still have items
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const abandonedCarts = await prisma.cart.findMany({
      where: {
        updatedAt: {
          lte: twentyFourHoursAgo,
          gte: fortyEightHoursAgo,
        },
        items: { some: {} },
      },
      include: {
        user: true,
        items: true,
      },
    });

    if (abandonedCarts.length === 0) {
      return NextResponse.json({ message: 'No abandoned carts found.', emailsSent: 0 });
    }

    const transporter = createTransporter();
    let emailsSent = 0;
    const errors: string[] = [];

    for (const cart of abandonedCarts) {
      // 3. Skip if user placed an order in the last 24 hours
      const recentOrder = await prisma.order.findFirst({
        where: {
          userId: cart.userId,
          createdAt: { gte: twentyFourHoursAgo },
        },
      });
      if (recentOrder) continue;

      const userEmail = cart.user.email;
      const userName = cart.user.name;
      const cartUrl = 'https://bdneeds.com.bd/cart';

      try {
        await transporter.sendMail({
          from: `"BDNeeds" <${process.env.SMTP_USER}>`,
          to: userEmail,
          subject: `${userName}, আপনার কার্টে পণ্য অপেক্ষা করছে! 🛒`,
          html: buildAbandonedCartEmail(userName, cartUrl),
        });

        console.log(`[Cron] Abandoned cart email sent to: ${userEmail}`);
        emailsSent++;
      } catch (emailError) {
        console.error(`[Cron] Failed to send email to ${userEmail}:`, emailError);
        errors.push(userEmail);
      }
    }

    return NextResponse.json({
      success: true,
      totalAbandoned: abandonedCarts.length,
      emailsSent,
      failed: errors.length,
    });
  } catch (error) {
    console.error('Cron abandoned cart error:', error);
    return NextResponse.json({ error: 'Failed to process abandoned carts' }, { status: 500 });
  }
}
