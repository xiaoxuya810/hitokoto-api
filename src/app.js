const { Hono } = require('hono');
const { cors } = require('hono/cors');
const pool = require('./config/db');

const app = new Hono();

// 缓存 MAX(id)，避免每次查询都扫描
let maxId = 0;
let maxIdExpires = 0;
const MAX_ID_TTL = 60_000; // 60 秒刷新一次

async function getMaxId() {
  const now = Date.now();
  if (maxId > 0 && now < maxIdExpires) return maxId;
  const [[row]] = await pool.query('SELECT MAX(id) AS maxId FROM Data_love');
  maxId = row.maxId || 0;
  maxIdExpires = now + MAX_ID_TTL;
  return maxId;
}

// 通过随机 id 查询，走主键索引，比 ORDER BY RAND() 快几十倍
async function getRandomRows(count) {
  const max = await getMaxId();
  if (max === 0) return [];

  // 生成足够多的随机 id 候选（多取一些，防止 id 空洞导致不够）
  const candidateCount = count * 3;
  const ids = new Set();
  while (ids.size < candidateCount) {
    ids.add(Math.floor(Math.random() * max) + 1);
  }

  const [rows] = await pool.query(
    `SELECT * FROM Data_love WHERE id IN (?) ORDER BY RAND() LIMIT ?`,
    [[...ids], count]
  );
  return rows;
}

app.use('*', cors());

app.get('/yiyi', async (c) => {
  try {
    const data = await getRandomRows(10);
    c.header('Cache-Control', 'no-cache');
    return c.json({ code: 200, data, by: '小旭' });
  } catch (err) {
    console.error('查询失败:', err.message);
    return c.json({ code: 500, msg: '服务器内部错误' }, 500);
  }
});

// 健康检查
app.get('/health', (c) => c.json({ status: 'ok' }));

// 广告接口
const ADS_SQL = `
  SELECT ad_id, title, description, icon_url, landing_page, ad_type, style, expires_at
  FROM ads
  WHERE is_active = 1
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
`;

app.get('/api/v1/ads/active', async (c) => {
  try {
    const [rows] = await pool.query(ADS_SQL);
    for (const ad of rows) {
      if (typeof ad.style === 'string') ad.style = JSON.parse(ad.style);
    }
    return c.json({ code: 200, data: rows });
  } catch (err) {
    console.error('广告查询失败:', err.message);
    return c.json({ code: 500, msg: '服务器内部错误' }, 500);
  }
});

module.exports = app;
