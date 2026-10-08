import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendMail({ to, subject, html, text, from }: SendEmailOptions) {
  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. If Resend API Key is configured, use Resend (Guarantees Primary Inbox delivery)
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const defaultFrom = process.env.EMAIL_FROM || 'BDNeeds <support@bdneeds.com.bd>';

      const { data, error } = await resend.emails.send({
        from: from || defaultFrom,
        to: [to],
        subject,
        html,
        text: text || undefined,
      });

      if (error) {
        console.error('[Resend Error]:', error);
        throw new Error(error.message);
      }

      console.log('[Resend Success]: Email sent with ID:', data?.id);
      return { success: true, id: data?.id, provider: 'resend' };
    } catch (err: any) {
      console.error('[Resend Exception]:', err.message);
      throw err;
    }
  }

  // 2. Fallback to standard SMTP (Nodemailer)
  const host = process.env.SMTP_HOST || 'mail.bdneeds.com.bd';
  const port = Number(process.env.SMTP_PORT) || 465;
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const senderEmail = process.env.SMTP_USER || 'support@bdneeds.com.bd';

  const info = await transporter.sendMail({
    from: from || `"BDNeeds Security" <${senderEmail}>`,
    to,
    replyTo: senderEmail,
    subject,
    text,
    html,
  });

  console.log('[SMTP Success]: Email sent with ID:', info.messageId);
  return { success: true, id: info.messageId, provider: 'smtp' };
}
