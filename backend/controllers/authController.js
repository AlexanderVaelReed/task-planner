// Controller ورود: نام کاربری و رمز را با کاربر هاردکد شده مقایسه می‌کند
// و در صورت درست بودن، توکن امضاشده برمی‌گرداند.

import { config } from '../config.js';
import { signToken } from '../utils/jwt.js';
import { sendJson } from '../utils/http.js';
import { logStep } from '../utils/logger.js';

export async function login(req, res) {
  const { username, password } = req.body;
  logStep(req, 'CONTROLLER', 'بررسی نام کاربری و رمز با کاربر هاردکد شده');

  const valid =
    typeof username === 'string' &&
    typeof password === 'string' &&
    username === config.adminUser.username &&
    password === config.adminUser.password;

  if (!valid) {
    return sendJson(res, 401, { error: 'نام کاربری یا رمز عبور اشتباه است' });
  }

  const token = signToken({ username }, config.jwtSecret, config.tokenTtlSeconds);
  logStep(req, 'CONTROLLER', 'توکن ساخته شد');
  sendJson(res, 200, { token, user: { username } });
}
