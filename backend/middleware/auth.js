// Middleware احراز هویت: قبل از Controller اجرا می‌شود.
// هدر باید این شکل باشد:  Authorization: Bearer <token>
// اگر توکن نبود یا اشتباه بود، همین‌جا 401 می‌دهیم و Controller اصلاً اجرا نمی‌شود.

import { config } from '../config.js';
import { verifyToken } from '../utils/jwt.js';
import { sendJson } from '../utils/http.js';
import { logStep } from '../utils/logger.js';

// true یعنی ادامه بده، false یعنی پاسخ 401 ارسال شده
export function authenticate(req, res) {
  const header = req.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    logStep(req, 'MIDDLEWARE', 'توکن در هدر Authorization پیدا نشد → 401');
    sendJson(res, 401, { error: 'توکن ارسال نشده است' });
    return false;
  }

  const payload = verifyToken(token, config.jwtSecret);
  if (!payload) {
    logStep(req, 'MIDDLEWARE', 'توکن نامعتبر یا منقضی است → 401');
    sendJson(res, 401, { error: 'توکن نامعتبر یا منقضی شده است' });
    return false;
  }

  req.user = { username: payload.username };
  logStep(req, 'MIDDLEWARE', `توکن معتبر است؛ کاربر: ${req.user.username}`);
  return true;
}
