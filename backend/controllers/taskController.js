// Controller تسک‌ها: ورودی را اعتبارسنجی می‌کند، Model را صدا می‌زند و پاسخ می‌دهد.
// همه توابع بعد از middleware اجرا می‌شوند، پس req.user همیشه وجود دارد.

import { TaskModel } from '../models/taskModel.js';
import { sendJson } from '../utils/http.js';
import { logStep } from '../utils/logger.js';

const STATUSES = ['todo', 'done'];

// اعتبارسنجی و پاک‌سازی ورودی. فقط فیلدهای مجاز را برمی‌گرداند.
function validateTask(body, { isUpdate = false } = {}) {
  const errors = [];
  const data = {};

  if (typeof body.title !== 'string' || !body.title.trim()) {
    errors.push('عنوان تسک الزامی است');
  } else if (body.title.trim().length > 200) {
    errors.push('عنوان نباید بیش از ۲۰۰ کاراکتر باشد');
  } else {
    data.title = body.title.trim();
  }

  data.description = typeof body.description === 'string' ? body.description.trim() : '';

  const time =
    body.estimatedTime === undefined || body.estimatedTime === '' ? 0 : Number(body.estimatedTime);
  if (!Number.isFinite(time) || time < 0) {
    errors.push('زمان تخمینی باید عددی غیرمنفی (دقیقه) باشد');
  } else {
    data.estimatedTime = time;
  }

  if (body.status !== undefined) {
    if (STATUSES.includes(body.status)) data.status = body.status;
    else errors.push('وضعیت باید todo یا done باشد');
  } else if (!isUpdate) {
    data.status = 'todo';
  }

  return { errors, data };
}

// شناسه داخل URL را چک می‌کند؛ اگر بد باشد خودش 400 می‌فرستد
function getValidId(req, res) {
  const { id } = req.params;
  if (!TaskModel.isValidId(id)) {
    sendJson(res, 400, { error: 'شناسه تسک نامعتبر است' });
    return null;
  }
  return id;
}

export async function getTasks(req, res) {
  const tasks = await TaskModel.findAllByUser(req.user.username);
  logStep(req, 'CONTROLLER', `${tasks.length} تسک پیدا شد`);
  sendJson(res, 200, tasks);
}

export async function createTask(req, res) {
  const { errors, data } = validateTask(req.body);
  if (errors.length) {
    logStep(req, 'CONTROLLER', `اعتبارسنجی ناموفق: ${errors.join(' | ')}`);
    return sendJson(res, 400, { error: errors.join('، '), errors });
  }

  const task = await TaskModel.create({
    ...data,
    user: req.user.username,
    createdAt: new Date(),
  });
  sendJson(res, 201, task);
}

export async function updateTask(req, res) {
  const id = getValidId(req, res);
  if (!id) return;

  const { errors, data } = validateTask(req.body, { isUpdate: true });
  if (errors.length) {
    logStep(req, 'CONTROLLER', `اعتبارسنجی ناموفق: ${errors.join(' | ')}`);
    return sendJson(res, 400, { error: errors.join('، '), errors });
  }

  const updated = await TaskModel.update(id, req.user.username, data);
  if (!updated) return sendJson(res, 404, { error: 'تسک پیدا نشد' });
  sendJson(res, 200, updated);
}

// وضعیت را بین todo و done عوض می‌کند: اول سند فعلی را می‌خوانیم، بعد وضعیت جدید را می‌نویسیم
export async function toggleTask(req, res) {
  const id = getValidId(req, res);
  if (!id) return;

  const task = await TaskModel.findById(id, req.user.username);
  if (!task) return sendJson(res, 404, { error: 'تسک پیدا نشد' });

  const newStatus = task.status === 'done' ? 'todo' : 'done';
  logStep(req, 'CONTROLLER', `تغییر وضعیت: ${task.status} → ${newStatus}`);

  const updated = await TaskModel.update(id, req.user.username, { status: newStatus });
  sendJson(res, 200, updated);
}

export async function deleteTask(req, res) {
  const id = getValidId(req, res);
  if (!id) return;

  const deleted = await TaskModel.remove(id, req.user.username);
  if (!deleted) return sendJson(res, 404, { error: 'تسک پیدا نشد' });
  sendJson(res, 200, { message: 'تسک حذف شد', id });
}
