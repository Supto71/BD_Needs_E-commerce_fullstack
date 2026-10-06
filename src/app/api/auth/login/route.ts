import { NextResponse } from 'next/server';
import { getUserByIdentifier } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { identifier, password, loginType } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Phone and password are required' },
        { status: 400 }
      );
    }

    let user = null;
    
    if (loginType === 'ADMIN') {
      user = await getUserByIdentifier(`admin_${identifier}`);
      if (!user) {
        user = await getUserByIdentifier(identifier);
      }
    } else {
      user = await getUserByIdentifier(identifier);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password) || user.password === password;

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (loginType === 'ADMIN' && user.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Invalid administrator credentials' },
        { status: 401 }
      );
    }

    const { password: _, ...safeUser } = user;
    if (safeUser.email.startsWith('admin_')) {
      safeUser.email = safeUser.email.replace(/^admin_/, '');
    }
    const response = NextResponse.json({ success: true, user: safeUser });

    // Set HTTP-only cookie for session tracking
    response.cookies.set({
      name: 'bdneeds_session',
      value: JSON.stringify({ id: user.id, role: user.role }),
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
