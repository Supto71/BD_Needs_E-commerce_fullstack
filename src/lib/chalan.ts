import crypto from 'crypto';
import { sendMail } from '@/lib/mail';

function getChalanSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    'bdneeds-chalan-hmac-secret-key'
  );
}

/**
 * Generates a deterministic HMAC signature for an order ID so a customer
 * (including guest checkouts) can securely view & download their own Chalan.
 */
export function createReceiptToken(orderId: string): string {
  return crypto
    .createHmac('sha256', getChalanSecret())
    .update(orderId)
    .digest('hex')
    .slice(0, 32);
}

/**
 * Verifies a receipt token against an order ID using constant-time comparison.
 */
export function verifyReceiptToken(
  orderId: string,
  token: string | null | undefined
): boolean {
  if (!token || typeof token !== 'string') return false;
  const expected = createReceiptToken(orderId);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBDT(amount: number): string {
  return `BDT ${Number(amount || 0).toLocaleString('en-US')}`;
}

export function buildChalanEmailHtml(order: any, chalanUrl: string): string {
  const addr =
    order.shippingAddress && typeof order.shippingAddress === 'object'
      ? order.shippingAddress
      : {};
  const addressLine = [addr.street, addr.area, addr.city, addr.postalCode]
    .filter(Boolean)
    .map(escapeHtml)
    .join(', ');

  const itemRows = (order.items || [])
    .map((item: any) => {
      const variantParts = [
        item.variantColor,
        item.variantSize,
        item.variantStorage,
      ]
        .filter(Boolean)
        .map(escapeHtml)
        .join(' • ');

      return `
        <tr>
          <td style="padding:12px 10px;border-bottom:1px solid #e2e8f0;">
            <div style="font-weight:700;color:#0B132B;font-size:13px;">${escapeHtml(
              item.productName
            )}</div>
            ${
              variantParts
                ? `<div style="color:#64748b;font-size:11px;margin-top:2px;">${variantParts}</div>`
                : ''
            }
          </td>
          <td style="padding:12px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#334155;">${Number(
            item.quantity
          )}</td>
          <td style="padding:12px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;color:#475569;">${formatBDT(
            item.price
          )}</td>
          <td style="padding:12px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;font-size:13px;color:#0B132B;">${formatBDT(
            item.price * item.quantity
          )}</td>
        </tr>
      `;
    })
    .join('');

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:24px;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <div style="background:#0B132B;padding:24px 28px;color:#ffffff;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="margin:0;font-size:22px;letter-spacing:1px;">BDNEEDS</h1>
            <p style="margin:4px 0 0;font-size:12px;color:#cbd5e1;">Official Order Chalan / Invoice</p>
          </div>
          <div style="text-align:right;font-size:12px;">
            <div style="font-weight:700;font-size:14px;">#${escapeHtml(order.orderNumber)}</div>
            <div style="color:#cbd5e1;margin-top:2px;">${escapeHtml(orderDate)}</div>
          </div>
        </div>

        <div style="padding:24px 28px;">
          <p style="margin:0 0 16px;font-size:14px;color:#334155;">
            Dear <strong>${escapeHtml(order.customerName)}</strong>, thank you for your order! Your order chalan is attached below.
          </p>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin-bottom:20px;font-size:12px;line-height:1.6;">
            <div><strong>Tracking No:</strong> ${escapeHtml(order.trackingNumber)}</div>
            <div><strong>Phone:</strong> ${escapeHtml(order.customerPhone)}</div>
            <div><strong>Delivery Address:</strong> ${addressLine}</div>
            <div><strong>Payment:</strong> ${escapeHtml(order.paymentMethod)} (${escapeHtml(order.paymentStatus)})</div>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:10px;text-align:left;font-size:11px;text-transform:uppercase;color:#475569;">Item</th>
                <th style="padding:10px;text-align:center;font-size:11px;text-transform:uppercase;color:#475569;">Qty</th>
                <th style="padding:10px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;">Price</th>
                <th style="padding:10px;text-align:right;font-size:11px;text-transform:uppercase;color:#475569;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div style="border-top:2px solid #0B132B;padding-top:12px;font-size:13px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="color:#64748b;">Subtotal:</span>
              <strong>${formatBDT(order.subtotal)}</strong>
            </div>
            ${
              Number(order.discount || 0) > 0
                ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#059669;">
                    <span>Discount:</span>
                    <strong>-${formatBDT(order.discount)}</strong>
                   </div>`
                : ''
            }
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#64748b;">Shipping Fee:</span>
              <strong>${formatBDT(order.shippingFee)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:#0B132B;padding-top:8px;border-top:1px solid #e2e8f0;">
              <span>Grand Total:</span>
              <span>${formatBDT(order.total)}</span>
            </div>
          </div>

          <div style="text-align:center;margin-top:28px;">
            <a href="${escapeHtml(chalanUrl)}" style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 24px;border-radius:10px;">
              View / Download Printable Chalan
            </a>
          </div>
        </div>

        <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 28px;text-align:center;font-size:11px;color:#64748b;">
          Thank you for shopping with BDNeeds! • bdneeds.com.bd
        </div>
      </div>
    </body>
  </html>
  `;
}

/**
 * Sends the order Chalan email to the customer if an email address was provided.
 * Fails silently with console logging so checkout never breaks if SMTP is unavailable.
 */
export async function sendOrderChalanEmail(order: any, origin?: string): Promise<void> {
  const email = typeof order?.customerEmail === 'string' ? order.customerEmail.trim() : '';
  if (!email) return;

  try {
    const baseUrl =
      origin || process.env.NEXTAUTH_URL || 'https://bdneeds.com.bd';
    const token = createReceiptToken(order.id);
    const chalanUrl = `${baseUrl}/invoice/${order.id}?token=${token}`;
    const html = buildChalanEmailHtml(order, chalanUrl);
    const text = `BDNeeds Order Chalan #${order.orderNumber}\nTotal: ${formatBDT(
      order.total
    )}\nTracking: ${order.trackingNumber}\nDownload Chalan: ${chalanUrl}`;

    await sendMail({
      to: email,
      subject: `BDNeeds Order Chalan #${order.orderNumber}`,
      html,
      text,
      from: process.env.EMAIL_FROM || 'BDNeeds Orders <support@bdneeds.com.bd>',
    });
  } catch (err) {
    console.warn('[Chalan Email Warning]: Failed to send order chalan email:', err);
  }
}

