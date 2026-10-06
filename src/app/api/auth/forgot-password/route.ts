import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import crypto from "crypto";

const prisma = new PrismaClient();

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

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"BDNeeds Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset OTP - BDNeeds",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0F172A; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">You requested to reset your password for your BDNeeds account. Here is your One-Time Password (OTP):</p>
          <div style="background-color: #F1F5F9; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563EB;">${otp}</span>
          </div>
          <p style="color: #475569; font-size: 14px; margin-bottom: 30px;">This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
          <p style="color: #94A3B8; font-size: 12px; border-top: 1px solid #E2E8F0; padding-top: 20px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "OTP sent successfully to your email." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Failed to send OTP. Please try again later." },
      { status: 500 }
    );
  }
}
