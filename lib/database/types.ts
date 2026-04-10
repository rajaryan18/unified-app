// ──────────────────────────────────────────────
// Entity type definitions
// ──────────────────────────────────────────────

// ── Gym ──

export interface WorkoutSession {
  _id?: string;
  sessionId: string;
  userId: string;
  email: string;
  date: string;
  workoutTime?: string;
  exercises: Array<{
    exerciseId: string;
    name: string;
    sets: Array<{ setId: string; weight: string; reps: string }>;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeightLog {
  _id?: string;
  weightId: string;
  userId: string;
  email: string;
  weight: number;
  unit: string;
  date: string;
  createdAt?: string;
}

export interface Exercise {
  _id?: string;
  name: string;
  targetMuscle: string;
  isCustom: boolean;
  createdByEmail?: string;
  createdAt?: string;
}

// ── Productivity ──

export type TimeSegment = 'Before breakfast' | 'Before lunch' | 'Before gym' | 'Before dinner' | 'Before sleep';
export type GoalClassification = 'productive' | 'waste' | 'none';

export interface Goal {
  _id?: string;
  goalId: string;
  userId: string;
  date: string;
  segment: TimeSegment;
  text: string;
  isCompleted: boolean;
  classification?: GoalClassification;
  createdAt?: string;
}

export interface CalendarEvent {
  _id?: string;
  eventId: string;
  userId: string;
  date: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
}

export interface RecurringGoal {
  _id?: string;
  recurringId: string;
  userId: string;
  text: string;
  segment: TimeSegment;
  startDate: string;
  endDate?: string;
  isAlwaysRecurring: boolean;
  createdAt?: string;
}

export interface Insight {
  _id?: string;
  insightId: string;
  userId: string;
  date: string;
  sessionName: string;
  productive: number;
  waste: number;
  none: number;
  createdAt?: string;
}

// ── Jobs ──

export interface Referral {
  _id?: string;
  id: string;
  user_id: string;
  job_id: string;
  person: string;
  date: string;
  last_followup: string;
}

export interface TrackedJob {
  _id?: string;
  job_id: string;
  user_id: string;
  title: string;
  company: string;
  location: string;
  link: string;
  status: string;
  source: string;
  last_followup: string | null;
  notes: Array<{ date: string; note: string }>;
  created_at: string;
  createdAt?: string;
  updatedAt?: string;
  referrals?: Referral[];
}
