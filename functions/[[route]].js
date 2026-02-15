import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { cors } from 'hono/cors';
import mysql from 'mysql2/promise';

const app = new Hono();

let pool = null;

function getPool(env) {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DB_HOST,
      port: Number(env.DB_PORT) || 3306,
      user: env.DB_USER,
      password: env.DB_PASS,
      database: env.DB_NAME,
      charset: 'utf8mb4',
      connectionLimit: 3,
    });
  }
  return pool;
}

app.use('*', cors());

app.get('/yiyi', async (c) => {
  const db = getPool(c.env);
  try {
    // 高效随机查询（同 src/app.js 逻辑）
    const [[{ maxId }]] = await db.query('SELECT MAX(id) AS maxId FROM Data_love');
    if (!maxId) return c.json({ code: 200, data: [], by: '小旭' });

    const ids = new Set();
    while (ids.size < 30) {
      ids.add(Math.floor(Math.random() * maxId) + 1);
    }
    const [rows] = await db.query(
      'SELECT * FROM Data_love WHERE id IN (?) ORDER BY RAND() LIMIT 10',
      [[...ids]]
    );
    return c.json({ code: 200, data: rows, by: '小旭' });
  } catch (err) {
    return c.json({ code: 500, msg: '服务器内部错误' }, 500);
  }
});

app.get('/health', (c) => c.json({ status: 'ok' }));

export const onRequest = handle(app);
