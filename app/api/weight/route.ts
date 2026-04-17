import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { GYM_WEIGHTS } from '@/lib/database/collections';
import { v4 as uuidv4 } from 'uuid';

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID || 'hardcoded_user_001';
const GYM_EMAIL = '18raj06@gmail.com';

export async function GET() {
  try {
    const db = DatabaseFactory.getDatabase('gym');
    const weights = await db.find(GYM_WEIGHTS, { email: GYM_EMAIL }, { sort: { date: 1 } });
    return NextResponse.json(weights);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { weight } = await request.json();
    if (!weight) return NextResponse.json({ error: 'Weight is required' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('gym');
    const entry = await db.insertOne(GYM_WEIGHTS, {
      weightId: `wt_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
      userId: HARDCODED_USER_ID,
      email: GYM_EMAIL,
      weight,
      unit: 'kg',
      date: new Date(),
    });

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
