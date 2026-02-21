const pool = require('../config/db');

const CDN_SOURCES = [
  'https://cdn.jsdmirror.com/gh/hitokoto-osc/sentences-bundle@latest/sentences/',
  'https://cdn.jsdelivr.net/gh/hitokoto-osc/sentences-bundle@latest/sentences/',
];
const CATEGORIES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];

async function fetchCategory(category) {
  for (const base of CDN_SOURCES) {
    try {
      const url = `${base}${category}.json`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      return await res.json();
    } catch {
      continue;
    }
  }
  throw new Error('所有源均不可用');
}

async function sync() {
  console.log('[同步] 开始拉取一言句子包...');
  let total = 0;

  for (const cat of CATEGORIES) {
    try {
      const sentences = await fetchCategory(cat);
      if (!sentences.length) continue;

      const values = sentences.map((s) => [s.id, s.hitokoto]);

      const [result] = await pool.query(
        `INSERT INTO Data_love (id, text) VALUES ?
         ON DUPLICATE KEY UPDATE text=VALUES(text)`,
        [values]
      );

      const inserted = result.affectedRows - result.changedRows;
      console.log(`[同步] 分类 [${cat}]: ${sentences.length} 条, 新增 ${inserted}`);
      total += sentences.length;
    } catch (err) {
      console.error(`[同步] 分类 [${cat}] 失败:`, err.message);
    }
  }

  console.log(`[同步] 完成, 共处理 ${total} 条`);
  return total;
}

module.exports = sync;
