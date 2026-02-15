require('dotenv').config();

const { serve } = require('@hono/node-server');
const cron = require('node-cron');
const app = require('./app');
const pool = require('./config/db');
const sync = require('./tasks/sync-hitokoto');

const PORT = process.env.PORT || 3000;

// 启动预热：数据库连接 + 首次同步
pool.query('SELECT 1').then(async () => {
  console.log('数据库连接就绪');
  // 首次启动同步一次
  const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM Data_love');
  if (cnt === 0) {
    console.log('数据表为空，立即执行首次同步...');
    await sync();
  }
}).catch((err) => {
  console.error('数据库连接失败:', err.message);
  process.exit(1);
});

// 定时同步：每天凌晨 3 点执行
cron.schedule('0 3 * * *', () => {
  console.log('[定时任务] 开始同步句子包');
  sync().catch((err) => console.error('[定时任务] 同步异常:', err.message));
});

const server = serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`服务已启动: http://localhost:${PORT}`);
  console.log('定时同步: 每天 03:00');
});

// 优雅关闭
function shutdown() {
  console.log('正在关闭服务...');
  server.close(() => {
    pool.end().then(() => {
      console.log('已关闭');
      process.exit(0);
    });
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
