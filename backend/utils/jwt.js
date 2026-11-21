// یک JWT ساده (HS256) فقط با ماژول crypto خود Node.
// ساختار توکن: header.payload.signature  (هر سه بخش base64url)
// payload فقط کدگذاری شده، رمزنگاری نشده؛ امضا تضمین می‌کند کسی آن را دستکاری نکرده.

import crypto from 'node:crypto';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const sign = (data, secret) => crypto.createHmac('sha256', secret).update(data).digest('base64url');

export function signToken(payload, secret, expiresInSeconds) {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });
  const signature = sign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

// اگر توکن معتبر باشد payload را برمی‌گرداند، وگرنه null
export function verifyToken(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expected = sign(`${header}.${body}`, secret);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
