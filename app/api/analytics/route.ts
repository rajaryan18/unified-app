import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { PROD_GOALS } from '@/lib/database/collections';

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID || 'hardcoded_user_001';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const db = DatabaseFactory.getDatabase('productivity');
    const goals = await db.find<Record<string, unknown>>(PROD_GOALS, { userId: HARDCODED_USER_ID, date });

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.isCompleted).length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const segmentBreakdown: Record<string, { segment: string; total: number; completed: number; pending: number }> = {};
    for (const goal of goals) {
      const seg = goal.segment as string;
      if (!segmentBreakdown[seg]) segmentBreakdown[seg] = { segment: seg, total: 0, completed: 0, pending: 0 };
      segmentBreakdown[seg].total += 1;
      if (goal.isCompleted) segmentBreakdown[seg].completed += 1;
      else segmentBreakdown[seg].pending += 1;
    }

    return NextResponse.json({ date, totalGoals, completedGoals, completionRate, segmentBreakdown: Object.values(segmentBreakdown) });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
