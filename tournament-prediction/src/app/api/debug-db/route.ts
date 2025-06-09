// app/api/debug-db/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET() {
  try {
    const users = await prisma.users.findMany();
    return NextResponse.json({ ok: true, users });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
