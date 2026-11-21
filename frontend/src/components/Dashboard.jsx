import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '../api.js';
import TaskForm from './TaskForm.jsx';
import TaskItem from './TaskItem.jsx';
import { formatMinutes } from '../utils.js';

const FILTERS = [
  { key: 'all', label: 'همه' },
  { key: 'todo', label: 'در انتظار' },
  { key: 'done', label: 'انجام‌شده' },
];

// جریان داده در این کامپوننت:
//   عمل کاربر (کلیک) → تابع api.* → fetch به Backend → MongoDB → پاسخ → setTasks → رندر مجدد
// state فقط یک «کپی نمایشی» است؛ منبع حقیقت دیتابیس است.
export default function Dashboard({ token, user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  // 401 یعنی توکن مشکل دارد → برگرد به صفحه لاگین
  const handleError = useCallback(
    (err) => {
      if (err.status === 401) return onLogout();
      setError(err.message || 'خطای ناشناخته');
    },
    [onLogout],
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTasks(await api.fetchTasks(token));
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [token, handleError]);

  // بعد از اولین رندر، لیست تسک‌ها را از سرور می‌گیریم
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ساخت یا ویرایش؛ true/false برمی‌گرداند تا فرم بداند باید خالی شود یا نه
  async function handleSave(data) {
    setError('');
    try {
      if (editing) {
        const updated = await api.updateTask(token, editing._id, data);
        setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        setEditing(null);
      } else {
        const created = await api.createTask(token, data);
        setTasks((prev) => [created, ...prev]);
      }
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }

  async function handleToggle(task) {
    setError('');
    try {
      const updated = await api.toggleTask(token, task._id);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      handleError(err);
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`تسک «${task.title}» حذف شود؟`)) return;
    setError('');
    try {
      await api.deleteTask(token, task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      if (editing?._id === task._id) setEditing(null);
    } catch (err) {
      handleError(err);
    }
  }

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'done').length;
    const remainingMinutes = tasks
      .filter((t) => t.status === 'todo')
      .reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    return { total: tasks.length, done, todo: tasks.length - done, remainingMinutes };
  }, [tasks]);

  const visibleTasks = tasks.filter((t) => filter === 'all' || t.status === filter);

  return (
    <div className="container">
      <header className="topbar">
        <h1>📝 برنامه‌ریز تسک</h1>
        <div className="topbar__user">
          <span className="muted">سلام، {user.username}</span>
          <button className="btn btn--ghost" onClick={onLogout}>
            خروج
          </button>
        </div>
      </header>

      <section className="stats">
        <div className="stat">
          <strong>{stats.total.toLocaleString('fa-IR')}</strong>
          <span>کل تسک‌ها</span>
        </div>
        <div className="stat">
          <strong>{stats.todo.toLocaleString('fa-IR')}</strong>
          <span>در انتظار</span>
        </div>
        <div className="stat">
          <strong>{stats.done.toLocaleString('fa-IR')}</strong>
          <span>انجام‌شده</span>
        </div>
        <div className="stat">
          <strong>{formatMinutes(stats.remainingMinutes)}</strong>
          <span>زمان باقی‌مانده</span>
        </div>
      </section>

      {error && <div className="alert">{error}</div>}

      <div className="layout">
        <aside>
          <TaskForm
            key={editing?._id ?? 'new'}
            initial={editing}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </aside>

        <main className="card">
          <div className="list-head">
            <h2>تسک‌ها</h2>
            <div className="filters">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`chip ${filter === f.key ? 'chip--active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="empty">در حال دریافت از سرور...</p>
          ) : visibleTasks.length === 0 ? (
            <p className="empty">
              {tasks.length === 0 ? 'هنوز تسکی ندارید. اولین تسک را بسازید!' : 'تسکی با این فیلتر نیست.'}
            </p>
          ) : (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  isEditing={editing?._id === task._id}
                  onToggle={handleToggle}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
