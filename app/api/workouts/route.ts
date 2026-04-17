import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { GYM_WORKOUTS, GYM_EXERCISES } from '@/lib/database/collections';
import { v4 as uuidv4 } from 'uuid';

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID || 'hardcoded_user_001';
const GYM_EMAIL = '18raj06@gmail.com';

export async function GET() {
  try {
    const db = DatabaseFactory.getDatabase('gym');
    const workouts = await db.find(GYM_WORKOUTS, { email: GYM_EMAIL }, { sort: { date: -1 } });
    return NextResponse.json(workouts);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { exercises, workoutTime } = await request.json();
    if (!exercises) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('gym');

    // Upsert custom exercises
    for (const ex of exercises) {
      if (ex.name) {
        const existing = await db.findOne(GYM_EXERCISES, { name: ex.name, createdByEmail: GYM_EMAIL });
        if (!existing) {
          await db.insertOne(GYM_EXERCISES, {
            name: ex.name,
            targetMuscle: 'Other',
            isCustom: true,
            createdByEmail: GYM_EMAIL,
          });
        }
      }
    }

    const session = await db.insertOne(GYM_WORKOUTS, {
      sessionId: `session_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
      userId: HARDCODED_USER_ID,
      email: GYM_EMAIL,
      date: new Date(),
      workoutTime,
      exercises,
    });

    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
