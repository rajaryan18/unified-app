import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { PROD_GOALS } from '@/lib/database/collections';
import { v4 as uuidv4 } from 'uuid';

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID || 'hardcoded_user_001';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const db = DatabaseFactory.getDatabase('productivity');
    const filter: Record<string, unknown> = { userId: HARDCODED_USER_ID };
    if (date) filter.date = date;

    const goals = await db.find(PROD_GOALS, filter, { sort: { segment: 1 } });
    return NextResponse.json(goals);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { goalId, date, segment, text } = await request.json();
    if (!date || !segment || !text) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('productivity');
    const goal = await db.insertOne(PROD_GOALS, {
      goalId: goalId || `goal_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
      userId: HARDCODED_USER_ID,
      date,
      segment,
      text,
      isCompleted: false,
    });
    return NextResponse.json(goal, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isCompleted, classification, segment } = await request.json();
    if (!id) return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('productivity');
    const update: Record<string, unknown> = {};
    if (typeof isCompleted === 'boolean') update.isCompleted = isCompleted;
    if (classification) update.classification = classification;
    if (segment) update.segment = segment;

    const ok = await db.updateOne(PROD_GOALS, { goalId: id }, { $set: update });
    if (!ok) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    return NextResponse.json({ message: 'Goal updated' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('productivity');
    await db.deleteOne(PROD_GOALS, { goalId: id });
    return NextResponse.json({ message: 'Goal deleted' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
