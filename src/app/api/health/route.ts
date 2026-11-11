import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Health endpoint used by the GitHub → cPanel deploy workflow.
 * `uptimeSeconds` proves the Node.js process restarted after a deploy.
 * Always returns 200 for `status` so a DB outage does not look like a failed deploy.
 */
export async function GET() {
  let db: 'ok' | 'down' = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = 'ok';
  } catch {
    db = 'down';
  }

  let build = '';
  try {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const file = path.join(process.cwd(), 'BUILD_INFO');
    if (fs.existsSync(file)) build = fs.readFileSync(file, 'utf8').trim();
  } catch {
    // BUILD_INFO only exists in the cPanel bundle
  }

  return NextResponse.json(
    {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      db,
      build,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

