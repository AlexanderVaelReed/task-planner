// Router دست‌ساز: بدون Express، فقط یک آرایه از روت‌ها و تطبیق با regex.
// هر روت: متد + مسیر + (آیا نیاز به لاگین دارد؟) + تابع Controller

import { login } from '../controllers/authController.js';
import {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { sendJson } from '../utils/http.js';
import { logStep } from '../utils/logger.js';

// "/api/tasks/:id" را به regex تبدیل می‌کند و نام پارامترها را نگه می‌دارد
function route(method, path, handler, { protectedRoute = false } = {}) {
  const keys = [];
  const source = path.replace(/:([A-Za-z]+)/g, (_, key) => {
    keys.push(key);
    return '([^/]+)';
  });
  return { method, path, pattern: new RegExp(`^${source}/?$`), keys, handler, protectedRoute };
}

const routes = [
  route('POST', '/api/login', login),

  route('GET', '/api/tasks', getTasks, { protectedRoute: true }),
  route('POST', '/api/tasks', createTask, { protectedRoute: true }),
  route('PUT', '/api/tasks/:id', updateTask, { protectedRoute: true }),
  route('PATCH', '/api/tasks/:id/toggle', toggleTask, { protectedRoute: true }),
  route('DELETE', '/api/tasks/:id', deleteTask, { protectedRoute: true }),
];

export async function handleRoute(req, res) {
  let pathMatched = false;

  for (const r of routes) {
    const match = r.pattern.exec(req.pathname);
    if (!match) continue;

    pathMatched = true;
    if (r.method !== req.method) continue;

    req.params = Object.fromEntries(r.keys.map((key, i) => [key, decodeURIComponent(match[i + 1])]));
    logStep(req, 'ROUTE', `تطبیق با ${r.method} ${r.path}`);

    // اگر روت محافظت‌شده است، اول middleware
    if (r.protectedRoute && !authenticate(req, res)) return;

    logStep(req, 'CONTROLLER', `اجرای ${r.handler.name}()`);
    return r.handler(req, res);
  }

  if (pathMatched) return sendJson(res, 405, { error: 'متد مجاز نیست' });
  sendJson(res, 404, { error: 'مسیر پیدا نشد' });
}
