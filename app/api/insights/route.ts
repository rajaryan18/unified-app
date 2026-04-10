import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { PROD_INSIGHTS } from '@/lib/database/collections';

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID || 'hardcoded_user_001';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = DatabaseFactory.getDatabase('productivity');

    if (type === 'daily' && date) {
      const insights = await db.find(PROD_INSIGHTS, { userId: HARDCODED_USER_ID, date }, { sort: { sessionName: 1 } });
      return NextResponse.json(insights);
    }

    if (type === 'weekly' && startDate && endDate) {
      const insights = await db.find<Record<string, unknown>>(PROD_INSIGHTS, {
        userId: HARDCODED_USER_ID,
        date: { $gte: startDate, $lte: endDate },
      }, { sort: { date: 1 } });

      const grouped: Record<string, { date: string; productive: number; waste: number; none: number }> = {};
      for (const i of insights) {
        const d = i.date as string;
        if (!grouped[d]) grouped[d] = { date: d, productive: 0, waste: 0, none: 0 };
        grouped[d].productive += (i.productive as number) || 0;
        grouped[d].waste += (i.waste as number) || 0;
        grouped[d].none += (i.none as number) || 0;
      }
      return NextResponse.json(Object.values(grouped));
    }

    return NextResponse.json([]);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
