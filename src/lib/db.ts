import mysql from 'mysql2/promise';

let pool: mysql.Pool;

if (process.env.NODE_ENV === 'production') {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
  });
} else {
  // Check if there is already a connection pool in global scope
  if (!(global as any).mysqlPool) {
    (global as any).mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10, // Limit connections in dev
      queueLimit: 0,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
    });
  }
  pool = (global as any).mysqlPool;
}

export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;
