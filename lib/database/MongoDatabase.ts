import mongoose from 'mongoose';
import { IDatabase, FindOptions } from './IDatabase';

// ──────────────────────────────────────────────
// MongoDB Implementation of IDatabase
// ──────────────────────────────────────────────

export class MongoDatabase implements IDatabase {
  private conn: mongoose.Mongoose | null = null;
  private connecting: Promise<void> | null = null;

  constructor(
    private readonly uri: string,
    private readonly dbName: string,
  ) {}

  // ── Connection ──
  async connect(): Promise<void> {
    // Already connected
    if (this.conn?.connection.readyState === 1) return;
    // Connection in progress — wait for it
    if (this.connecting) return this.connecting;

    this.connecting = mongoose
      .connect(this.uri, { dbName: this.dbName })
      .then((m) => { this.conn = m; })
      .finally(() => { this.connecting = null; });

    return this.connecting;
  }

  async disconnect(): Promise<void> {
    if (this.conn) {
      await this.conn.disconnect();
      this.conn = null;
    }
  }

  // ── Helpers ──
  private async ensureConnected(): Promise<mongoose.Connection> {
    await this.connect();
    return this.conn!.connection;
  }

  /** Convert ObjectId to string for JSON serialization */
  private serialize(doc: Record<string, unknown> | null): Record<string, unknown> | null {
    if (!doc) return null;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(doc)) {
      if (key === '_id') {
        out._id = (value as mongoose.Types.ObjectId).toString();
      } else if (value instanceof mongoose.Types.ObjectId) {
        out[key] = value.toString();
      } else {
        out[key] = value;
      }
    }
    return out;
  }

  private serializeMany(docs: Record<string, unknown>[]): Record<string, unknown>[] {
    return docs.map((d) => this.serialize(d)!);
  }

  // ── Read ──
  async find<T>(
    collection: string,
    filter: Record<string, unknown> = {},
    options?: FindOptions,
  ): Promise<T[]> {
    const db = await this.ensureConnected();
    const coll = db.collection(collection);
    let cursor = coll.find(filter);
    if (options?.sort) cursor = cursor.sort(options.sort);
    if (options?.skip) cursor = cursor.skip(options.skip);
    if (options?.limit) cursor = cursor.limit(options.limit);
    const docs = await cursor.toArray();
    return this.serializeMany(docs) as T[];
  }

  async findOne<T>(
    collection: string,
    filter: Record<string, unknown>,
  ): Promise<T | null> {
    const db = await this.ensureConnected();
    const doc = await db.collection(collection).findOne(filter);
    return this.serialize(doc) as T | null;
  }

  async countDocuments(
    collection: string,
    filter: Record<string, unknown> = {},
  ): Promise<number> {
    const db = await this.ensureConnected();
    return db.collection(collection).countDocuments(filter);
  }

  // ── Write ──
  async insertOne<T>(
    collection: string,
    doc: Record<string, unknown>,
  ): Promise<T> {
    const db = await this.ensureConnected();
    const result = await db.collection(collection).insertOne(doc);
    const inserted = await db.collection(collection).findOne({ _id: result.insertedId });
    return this.serialize(inserted) as T;
  }

  async insertMany<T>(
    collection: string,
    docs: Record<string, unknown>[],
  ): Promise<T[]> {
    const db = await this.ensureConnected();
    await db.collection(collection).insertMany(docs);
    return this.serializeMany(docs) as T[];
  }

  // ── Update / Delete ──
  async updateOne(
    collection: string,
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
  ): Promise<boolean> {
    const db = await this.ensureConnected();
    const result = await db.collection(collection).updateOne(filter, update);
    return result.matchedCount > 0;
  }

  async deleteOne(
    collection: string,
    filter: Record<string, unknown>,
  ): Promise<boolean> {
    const db = await this.ensureConnected();
    const result = await db.collection(collection).deleteOne(filter);
    return result.deletedCount > 0;
  }
}
