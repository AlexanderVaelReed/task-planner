// نقطه ورود بک‌اند: فقط http.createServer از خود Node.
//
// مسیر هر درخواست:
//   مرورگر → server.js (خواندن URL و body، لاگ) → routes (پیدا کردن روت)
//   → middleware/auth (چک توکن) → controllers (منطق) → models (MongoDB) → پاسخ JSON

import http from 'node:http';
import { URL } from 'node:url';

import { config } from './config.js';
import { connectDb, closeDb } from './models/db.js';
import { handleRoute } from './routes/index.js';
import { HttpError, readJsonBody, sendJson, sendNoContent, setCorsHeaders } from './utils/http.js';
import { logRequest, nextRequestId } from './utils/logger.js';

const server = http.createServer(async (req, res) => {
  req.id = nextRequestId();
  req.startTime = Date.now();
  setCorsHeaders(res);

  try {
    // 1) شکستن URL به مسیر و query با ماژول url
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    req.pathname = url.pathname;
    req.query = Object.fromEntries(url.searchParams);

    // 2) خواندن body (فقط برای متدهایی که body دارند)
    req.body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readJsonBody(req) : {};

    logRequest(req);

    // 3) preflight مرورگر برای CORS
    if (req.method === 'OPTIONS') return sendNoContent(res);

    // 4) سپردن کار به Router
    await handleRoute(req, res);
  } catch (err) {
    if (!req.logged) logRequest(req);

    if (err instanceof HttpError) {
      return sendJson(res, err.status, { error: err.message });
    }
    console.error('❌ خطای پیش‌بینی‌نشده:', err);
    sendJson(res, 500, { error: 'خطای داخلی سرور' });
  }
});

async function main() {
  try {
    await connectDb();
  } catch (err) {
    console.error('❌ اتصال به MongoDB ناموفق بود:', err.message);
    console.error(`   مطمئن شوید MongoDB روی ${config.mongoUri} در حال اجراست.`);
    process.exit(1);
  }

  server.listen(config.port, () => {
    console.log(`🚀 سرور روی http://localhost:${config.port} اجرا شد`);
  });
}

process.on('SIGINT', async () => {
  console.log('\nدر حال خاموش کردن سرور...');
  await closeDb();
  process.exit(0);
});

main();
