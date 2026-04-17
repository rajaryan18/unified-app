import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { PROD_EVENTS } from '@/lib/database/collections';
import { v4 as uuidv4 } from 'uuid';

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID || 'hardcoded_user_001';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const db = DatabaseFactory.getDatabase('productivity');
    const filter: Record<string, unknown> = { 
      $or: [{ userId: HARDCODED_USER_ID }, { userId: 'hardcoded_user_001' }]
    };
    if (date) filter.date = date;

    const events = await db.find(PROD_EVENTS, filter, { sort: { startTime: 1 } });
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { eventId, date, title, description, startTime, endTime } = await request.json();
    if (!date || !title) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('productivity');
    const event = await db.insertOne(PROD_EVENTS, {
      eventId: eventId || `evt_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
      userId: HARDCODED_USER_ID,
      date,
      title,
      description,
      startTime,
      endTime,
      createdAt: new Date(),
    });
    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
