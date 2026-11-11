import { NextResponse } from 'next/server';
import { getUsers, getOrders, getCustomersPaginated } from '@/lib/db';

export const dynamic = 'force-dynamic';

function buildCustomerSummary(
  c: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    avatarUrl: string | null;
    createdAt: Date | string;
    isFraud: boolean;
  },
  userOrders: { total: number; orderStatus: string; createdAt: Date | string }[]
) {
  const totalSpent = userOrders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);
  const lastOrder = userOrders[0]?.createdAt || null;

  const now = new Date();
  const accountAgeDays = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);

  let clientTag = 'Regular Client';
  if (c.isFraud) {
    clientTag = 'Fraud Client';
  } else if (accountAgeDays < 30) {
    clientTag = 'New Client';
  } else {
    const recentOrders = userOrders.filter(
      (o) => (now.getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 30
    );
    if (recentOrders.length >= 3) {
      clientTag = 'VIP Client';
    } else if (userOrders.length >= 2) {
      const sortedOrders = [...userOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const gapDays =
        (new Date(sortedOrders[0].createdAt).getTime() -
          new Date(sortedOrders[1].createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
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
    ordersCount: userOrders.length,
    totalSpent: Number(totalSpent.toFixed(2)),
    lastOrder,
    clientTag,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isPaginated =
      searchParams.get('paginated') === 'true' ||
      searchParams.has('page') ||
      searchParams.has('limit');

    if (isPaginated) {
      const data = await getCustomersPaginated({
        search: searchParams.get('search') || undefined,
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 24,
      });

      const ordersByUser = new Map<string, typeof data.pageOrders>();
      for (const order of data.pageOrders) {
        if (!order.userId) continue;
        const list = ordersByUser.get(order.userId) || [];
        list.push(order);
        ordersByUser.set(order.userId, list);
      }

      const items = data.customers.map((c) => buildCustomerSummary(c, ordersByUser.get(c.id) || []));
      const adminsAndMods = data.adminsAndMods
        ? data.adminsAndMods.map((a) => buildCustomerSummary(a, []))
        : undefined;

      return NextResponse.json({
        items,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        hasMore: data.hasMore,
        ...(adminsAndMods !== undefined ? { adminsAndMods } : {}),
      });
    }

    const users = await getUsers();
    const allOrders = await getOrders();
    const customerSummaries = users.map((c) =>
      buildCustomerSummary(c, allOrders.filter((o) => o.userId === c.id))
    );

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
