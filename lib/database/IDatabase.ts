// ──────────────────────────────────────────────
// Database Interface
// ──────────────────────────────────────────────
// Every database type (MongoDB, JSON, etc.) must implement this.

export type DbName = 'gym' | 'productivity' | 'jobs';

export interface FindOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

export interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // ── Read ──
  find<T>(collection: string, filter?: Record<string, unknown>, options?: FindOptions): Promise<T[]>;
  findOne<T>(collection: string, filter: Record<string, unknown>): Promise<T | null>;
  countDocuments(collection: string, filter?: Record<string, unknown>): Promise<number>;

  // ── Write ──
  insertOne<T>(collection: string, doc: Record<string, unknown>): Promise<T>;
  insertMany<T>(collection: string, docs: Record<string, unknown>[]): Promise<T[]>;

  // ── Update / Delete ──
  updateOne(collection: string, filter: Record<string, unknown>, update: Record<string, unknown>): Promise<boolean>;
  deleteOne(collection: string, filter: Record<string, unknown>): Promise<boolean>;
}
