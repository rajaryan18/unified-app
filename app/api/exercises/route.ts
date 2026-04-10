import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { GYM_EXERCISES } from '@/lib/database/collections';

const GYM_EMAIL = '18raj06@gmail.com';

const DEFAULT_EXERCISES = [
  { name: 'Bench Press', targetMuscle: 'Chest' },
  { name: 'Incline Bench Press', targetMuscle: 'Chest' },
  { name: 'Cable Fly', targetMuscle: 'Chest' },
  { name: 'Push-ups', targetMuscle: 'Chest' },
  { name: 'Squat', targetMuscle: 'Legs' },
  { name: 'Leg Press', targetMuscle: 'Legs' },
  { name: 'Leg Extension', targetMuscle: 'Legs' },
  { name: 'Deadlift', targetMuscle: 'Legs' },
  { name: 'Pull-ups', targetMuscle: 'Back' },
  { name: 'Lat Pulldown', targetMuscle: 'Back' },
  { name: 'Barbell Row', targetMuscle: 'Back' },
  { name: 'Cable Row', targetMuscle: 'Back' },
  { name: 'Overhead Press', targetMuscle: 'Shoulders' },
  { name: 'Lateral Raise', targetMuscle: 'Shoulders' },
  { name: 'Face Pull', targetMuscle: 'Shoulders' },
  { name: 'Bicep Curl', targetMuscle: 'Arms' },
  { name: 'Tricep Extension', targetMuscle: 'Arms' },
  { name: 'Hammer Curl', targetMuscle: 'Arms' },
  { name: 'Skull Crushers', targetMuscle: 'Arms' },
  { name: 'Plank', targetMuscle: 'Core' },
  { name: 'Crunches', targetMuscle: 'Core' },
];

export async function GET() {
  try {
    const db = DatabaseFactory.getDatabase('gym');
    const count = await db.countDocuments(GYM_EXERCISES);
    if (count === 0) {
      await db.insertMany(GYM_EXERCISES, DEFAULT_EXERCISES.map((e) => ({ ...e, isCustom: false, createdByEmail: GYM_EMAIL })));
    }
    const exercises = await db.find(GYM_EXERCISES, { $or: [{ isCustom: false }, { createdByEmail: GYM_EMAIL }] });
    return NextResponse.json(exercises);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, targetMuscle } = await request.json();
    if (!name || !targetMuscle) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('gym');
    const existing = await db.findOne(GYM_EXERCISES, { name, createdByEmail: GYM_EMAIL });
    if (existing) return NextResponse.json(existing);

    const exercise = await db.insertOne(GYM_EXERCISES, {
      name,
      targetMuscle,
      isCustom: true,
      createdByEmail: GYM_EMAIL,
    });
    return NextResponse.json(exercise, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
