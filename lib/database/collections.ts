// ──────────────────────────────────────────────
// Collection name constants — read from .env
// ──────────────────────────────────────────────

// Gym collections
export const GYM_WORKOUTS = process.env.GYM_COLLECTION_WORKOUTS || 'workout_sessions';
export const GYM_WEIGHTS = process.env.GYM_COLLECTION_WEIGHTS || 'weight_logs';
export const GYM_EXERCISES = process.env.GYM_COLLECTION_EXERCISES || 'exercise_dictionary';

// Productivity collections
export const PROD_GOALS = process.env.PRODUCTIVITY_COLLECTION_GOALS || 'goals';
export const PROD_EVENTS = process.env.PRODUCTIVITY_COLLECTION_EVENTS || 'events';
export const PROD_RECURRING = process.env.PRODUCTIVITY_COLLECTION_RECURRING || 'recurring_goals';
export const PROD_INSIGHTS = process.env.PRODUCTIVITY_COLLECTION_INSIGHTS || 'insights';

// Jobs collections
export const JOBS_TRACKED = process.env.JOBS_COLLECTION_TRACKED || 'tracked_jobs';
export const JOBS_REFERRALS = process.env.JOBS_COLLECTION_REFERRALS || 'referrals';
