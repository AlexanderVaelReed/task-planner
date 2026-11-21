// تنها جایی که با Backend حرف می‌زنیم. هر درخواست و پاسخ در کنسول مرورگر لاگ می‌شود
// (F12 → Console) و همین‌طور در تب Network قابل مشاهده است.
//
// نکته: توکن اینجا ذخیره نمی‌شود؛ در state برنامه (App.jsx) نگه داشته می‌شود
// و برای هر درخواست به‌عنوان آرگومان به اینجا می‌رسد.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log(API_URL);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status; // 0 یعنی اصلاً به سرور نرسیدیم
  }
}

let requestCounter = 0;

async function request(path, { method = 'GET', body, token } = {}) {
  const id = ++requestCounter;

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  console.log(`➡️ [REQUEST #${id}] ${method} ${API_URL}${path}`, { headers, body });

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error(`❌ [NETWORK ERROR #${id}]`, err);
    throw new ApiError('ارتباط با سرور برقرار نشد. مطمئن شوید Backend اجرا شده است.', 0);
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  console.log(`⬅️ [RESPONSE #${id}] ${response.status} ${method} ${path}`, data);

  if (!response.ok) {
    throw new ApiError(data?.error || `خطای ${response.status}`, response.status);
  }
  return data;
}

export const login = (username, password) =>
  request('/api/login', { method: 'POST', body: { username, password } });

export const fetchTasks = (token) => request('/api/tasks', { token });

export const createTask = (token, task) =>
  request('/api/tasks', { method: 'POST', body: task, token });

export const updateTask = (token, id, task) =>
  request(`/api/tasks/${id}`, { method: 'PUT', body: task, token });

export const toggleTask = (token, id) =>
  request(`/api/tasks/${id}/toggle`, { method: 'PATCH', token });

export const deleteTask = (token, id) =>
  request(`/api/tasks/${id}`, { method: 'DELETE', token });
