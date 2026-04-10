import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { JOBS_REFERRALS } from '@/lib/database/collections';

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID || 'hardcoded_user_001';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const { person } = await request.json();
    if (!person) return NextResponse.json({ error: 'Person name is required' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('jobs');
    const today = new Date().toISOString().split('T')[0];
    const referral = await db.insertOne(JOBS_REFERRALS, {
      id: `ref_${Date.now().toString(36)}`,
      user_id: HARDCODED_USER_ID,
      job_id: jobId,
      person,
      date: today,
      last_followup: today,
    });
    return NextResponse.json(referral, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const referralId = searchParams.get('referralId');
    if (!referralId) return NextResponse.json({ error: 'Referral ID is required' }, { status: 400 });

    const today = new Date().toISOString().split('T')[0];
    const db = DatabaseFactory.getDatabase('jobs');
    const ok = await db.updateOne(JOBS_REFERRALS, { id: referralId }, { $set: { last_followup: today } });
    if (!ok) return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    return NextResponse.json({ message: 'Referral followed up' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
