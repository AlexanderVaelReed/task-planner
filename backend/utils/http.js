// ابزارهای کوچک HTTP: چون Express نداریم، این کارها را خودمان انجام می‌دهیم.

import { logResponse } from './logger.js';

const MAX_BODY_BYTES = 1024 * 1024; // 1MB

// خطایی که status مشخص دارد و به کاربر نشان داده می‌شود
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// CORS: مرورگر اجازه می‌دهد صفحه‌ای از localhost:5173 به localhost:5000 درخواست بزند
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
  logResponse(res.req, status, data);
}

export function sendNoContent(res) {
  res.writeHead(204);
  res.end();
  logResponse(res.req, 204, null);
}

// بدنه درخواست به‌صورت stream می‌رسد؛ باید تکه‌ها را جمع کنیم و JSON.parse کنیم.
// (از Buffer استفاده می‌کنیم تا حروف فارسی بین دو تکه خراب نشوند.)
export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'حجم درخواست بیش از حد مجاز است'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new HttpError(400, 'بدنه درخواست JSON معتبر نیست'));
      }
    });

    req.on('error', reject);
  });
}
