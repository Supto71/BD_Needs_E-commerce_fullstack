import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const jsonBody = await request.json();

    const validationResult = registerSchema.safeParse(jsonBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = validationResult.data;

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: 'CUSTOMER',
      phone: phone || '',
    });

    const { password: _, ...safeUser } = user;
    const response = NextResponse.json({ success: true, user: safeUser });

    response.cookies.set({
      name: 'bdneeds_session',
      value: JSON.stringify({ id: user.id, role: user.role }),
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
