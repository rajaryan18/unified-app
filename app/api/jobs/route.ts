import { NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database/DatabaseFactory';
import { JOBS_TRACKED, JOBS_REFERRALS } from '@/lib/database/collections';

const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID || 'hardcoded_user_001';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const db = DatabaseFactory.getDatabase('jobs');
    const filter: Record<string, unknown> = { user_id: HARDCODED_USER_ID };
    if (status) filter.status = status;

    const jobs = await db.find(JOBS_TRACKED, filter, { sort: { created_at: -1 } });

    // Attach referrals to each job
    for (const job of jobs as Array<Record<string, unknown>>) {
      const referrals = await db.find(JOBS_REFERRALS, { user_id: HARDCODED_USER_ID, job_id: job.job_id });
      job.referrals = referrals;
    }

    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const db = DatabaseFactory.getDatabase('jobs');
    const job = await db.insertOne(JOBS_TRACKED, {
      job_id: body.job_id || `custom_${Date.now().toString(36)}`,
      user_id: HARDCODED_USER_ID,
      title: body.title,
      company: body.company,
      location: body.location || '',
      link: body.link || '',
      status: body.status || 'Applied',
      source: body.source || 'manual',
      last_followup: null,
      notes: [],
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    if (!jobId) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });

    const body = await request.json();
    const db = DatabaseFactory.getDatabase('jobs');
    const ok = await db.updateOne(JOBS_TRACKED, { job_id: jobId }, { $set: body });
    if (!ok) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ message: 'Job updated' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    if (!jobId) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });

    const db = DatabaseFactory.getDatabase('jobs');
    await db.deleteOne(JOBS_REFERRALS, { job_id: jobId });
    await db.deleteOne(JOBS_TRACKED, { job_id: jobId });
    return NextResponse.json({ message: 'Job deleted' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
