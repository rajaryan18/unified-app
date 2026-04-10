import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { PROD_RECURRING } from '@/lib/database/collections';
import { v4 as uuidv4 } from 'uuid';

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID || 'hardcoded_user_001';

export async function GET() {
  try {
    const db = DatabaseFactory.getDatabase('productivity');
    const goals = await db.find(PROD_RECURRING, { userId: HARDCODED_USER_ID }, { sort: { createdAt: -1 } });
    return NextResponse.json(goals);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { recurringId, text, segment, startDate, endDate, isAlwaysRecurring } = await request.json();
    if (!text || !segment || !startDate) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('productivity');
    const goal = await db.insertOne(PROD_RECURRING, {
      recurringId: recurringId || `rec_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
      userId: HARDCODED_USER_ID,
      text,
      segment,
      startDate,
      endDate,
      isAlwaysRecurring: isAlwaysRecurring ?? true,
    });
    return NextResponse.json(goal, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Recurring goal ID is required' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('productivity');
    await db.deleteOne(PROD_RECURRING, { recurringId: id });
    return NextResponse.json({ message: 'Recurring goal deleted' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
