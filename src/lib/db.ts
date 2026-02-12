import Database from 'better-sqlite3';

const db = new Database('xerfit.db');
db.pragma('journal_mode = WAL');

export async function query(sql: string, params: (string | number | boolean | null)[] = []) {
  try {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(params);
    } else {
      return stmt.run(params);
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default db;
