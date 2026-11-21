import { useState } from 'react';

// هم برای ساخت تسک جدید و هم برای ویرایش استفاده می‌شود.
// اگر initial داده شود، حالت ویرایش است. والد با prop به نام key فرم را برای هر تسک از نو می‌سازد.
export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [estimatedTime, setEstimatedTime] = useState(initial?.estimatedTime ?? 30);
  const [status, setStatus] = useState(initial?.status ?? 'todo');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    const ok = await onSubmit({
      title,
      description,
      estimatedTime: Number(estimatedTime) || 0,
      status,
    });
    setSubmitting(false);

    // بعد از ساخت موفق، فرم را خالی کن
    if (ok && !initial) {
      setTitle('');
      setDescription('');
      setEstimatedTime(30);
      setStatus('todo');
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{initial ? '✏️ ویرایش تسک' : '➕ تسک جدید'}</h2>

      <label>
        عنوان
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: مطالعه React" required />
      </label>

      <label>
        توضیح <span className="muted">(اختیاری)</span>
        <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <div className="row">
        <label>
          زمان تخمینی (دقیقه)
          <input
            type="number"
            min="0"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
          />
        </label>

        <label>
          وضعیت
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">در انتظار (todo)</option>
            <option value="done">انجام‌شده (done)</option>
          </select>
        </label>
      </div>

      <div className="row row--end">
        {initial && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            انصراف
          </button>
        )}
        <button className="btn btn--primary" disabled={submitting}>
          {submitting ? 'در حال ذخیره...' : initial ? 'ذخیره تغییرات' : 'افزودن تسک'}
        </button>
      </div>
    </form>
  );
}
