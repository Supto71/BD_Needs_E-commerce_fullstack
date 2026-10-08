import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return a success message to prevent email enumeration
      return NextResponse.json(
        { message: "If your email is registered, you will receive an OTP shortly." },
        { status: 200 }
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete existing OTPs for this email to prevent spam
    await prisma.passwordResetOTP.deleteMany({
      where: { email },
    });

    // Save new OTP
    await prisma.passwordResetOTP.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send Email using Resend (or SMTP fallback)
    await sendMail({
      to: email,
      subject: `Your BDNeeds Password Reset OTP is ${otp}`,
      text: `Hello,\n\nYou requested a password reset for your BDNeeds account.\nYour One-Time Password (OTP) is: ${otp}\n\nThis OTP is valid for 10 minutes. Please do not share this code with anyone.\n\nIf you did not make this request, please disregard this email.\n\nRegards,\nBDNeeds Support Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #334155;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <tr>
              <td style="padding: 32px 32px 20px; text-align: center; background-color: #0f172a;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">BDNeeds</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Password Reset Request</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                  We received a request to reset the password for your BDNeeds account. Use the verification code below to complete the reset:
                </p>
                <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; border: 1px dashed #cbd5e1;">
                  <span style="font-family: monospace; font-size: 34px; font-weight: 700; letter-spacing: 6px; color: #2563eb; display: inline-block;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
                  ⏳ This code is valid for <strong>10 minutes</strong>. Never share this OTP with anyone, including BDNeeds staff.
                </p>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px;">
                  <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
                    If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  &copy; ${new Date().getFullYear()} BDNeeds. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json(
      { message: "OTP sent successfully to your email." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to send OTP. Please try again later." },
      { status: 500 }
    );
  }
}
