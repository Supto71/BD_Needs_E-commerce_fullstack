import { NextResponse } from 'next/server';
import { getUsers, getOrders } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getUsers();
    const customers = users; // Return all users so admin can assign roles
    const allOrders = await getOrders();

    const customerSummaries = customers.map((c) => {
      const orders = allOrders.filter((o) => o.userId === c.id);
      const totalSpent = orders
        .filter((o) => o.orderStatus !== 'CANCELLED')
        .reduce((sum, o) => sum + o.total, 0);
      const lastOrder = orders[0]?.createdAt || null;

      const now = new Date();
      const accountAgeDays = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      
      let clientTag = 'Regular Client';
      
      if (c.isFraud) {
        clientTag = 'Fraud Client';
      } else if (accountAgeDays < 30) {
        clientTag = 'New Client';
      } else {
        const recentOrders = orders.filter(o => (now.getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 30);
        if (recentOrders.length >= 3) {
          clientTag = 'VIP Client';
        } else if (orders.length >= 2) {
          const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const gapDays = (new Date(sortedOrders[0].createdAt).getTime() - new Date(sortedOrders[1].createdAt).getTime()) / (1000 * 60 * 60 * 24);
          if (gapDays > 60) {
            clientTag = 'Return Client';
          }
        }
      }

      const { password: _, ...safeCustomer } = c;
      if (safeCustomer.email.startsWith('admin_')) {
        safeCustomer.email = safeCustomer.email.replace(/^admin_/, '');
      }
      return {
        ...safeCustomer,
        ordersCount: orders.length,
        totalSpent: Number(totalSpent.toFixed(2)),
        lastOrder,
        clientTag,
      };
    });

    return NextResponse.json(customerSummaries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }
    
    const { createUser, getUserByEmail } = await import('@/lib/db');
    const adminEmail = `admin_${email}`;
    const existing = await getUserByEmail(adminEmail);
    if (existing) {
      return NextResponse.json({ error: 'An Admin/Moderator account with this email already exists' }, { status: 409 });
    }

    // Set name based on role
    const name = role === 'ADMIN' ? 'Admin User' : 'Moderator User';

    const user = await createUser({
      name,
      email: adminEmail,
      password,
      role: role as 'ADMIN' | 'MODERATOR',
      phone: '',
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
