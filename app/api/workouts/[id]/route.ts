import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { GYM_WORKOUTS } from '@/lib/database/collections';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = DatabaseFactory.getDatabase('gym');
    const ok = await db.deleteOne(GYM_WORKOUTS, { sessionId: id });
    if (!ok) return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    return NextResponse.json({ message: 'Workout deleted' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = DatabaseFactory.getDatabase('gym');
    const ok = await db.updateOne(GYM_WORKOUTS, { sessionId: id }, { $set: body });
    if (!ok) return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    return NextResponse.json({ message: 'Workout updated' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
