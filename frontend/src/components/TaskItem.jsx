import { formatDate, formatMinutes } from '../utils.js';

export default function TaskItem({ task, isEditing, onToggle, onEdit, onDelete }) {
  const done = task.status === 'done';

  return (
    <li className={`task ${done ? 'task--done' : ''} ${isEditing ? 'task--editing' : ''}`}>
      <button
        className="check"
        onClick={() => onToggle(task)}
        title={done ? 'برگرداندن به «در انتظار»' : 'علامت‌گذاری به‌عنوان انجام‌شده'}
      >
        {done ? '✓' : ''}
      </button>

      <div className="task__body">
        <h3>{task.title}</h3>
        {task.description && <p className="muted">{task.description}</p>}
        <div className="task__meta">
          <span className={`badge badge--${task.status}`}>{done ? 'انجام شد' : 'در انتظار'}</span>
          <span>⏱ {formatMinutes(task.estimatedTime)}</span>
          <span>📅 {formatDate(task.createdAt)}</span>
        </div>
      </div>

      <div className="task__actions">
        <button className="btn btn--ghost" onClick={() => onEdit(task)}>
          ویرایش
        </button>
        <button className="btn btn--danger" onClick={() => onDelete(task)}>
          حذف
        </button>
      </div>
    </li>
  );
}
