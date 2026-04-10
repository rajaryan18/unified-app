import { DbName, IDatabase } from './IDatabase';
import { MongoDatabase } from './MongoDatabase';

// ──────────────────────────────────────────────
// Singleton Factory — one connection per DB, lazy-init
// ──────────────────────────────────────────────

export class DatabaseFactory {
  private static instances: Map<DbName, IDatabase> = new Map();

  static getDatabase(name: DbName): IDatabase {
    if (!this.instances.has(name)) {
      const username = process.env.MONGODB_USERNAME!;
      const password = process.env.MONGODB_PASSWORD!;
      const host = process.env.MONGODB_HOST!;

      let dbName: string;
      switch (name) {
        case 'gym':
          dbName = process.env.GYM_DBNAME || 'test';
          break;
        case 'productivity':
          dbName = process.env.PRODUCTIVITY_DBNAME || 'productivity';
          break;
        case 'jobs':
          dbName = process.env.JOBS_DBNAME || 'jobs';
          break;
      }

      const uri = `mongodb+srv://${username}:${password}@${host}/`;
      this.instances.set(name, new MongoDatabase(uri, dbName));
    }
    return this.instances.get(name)!;
  }
}
