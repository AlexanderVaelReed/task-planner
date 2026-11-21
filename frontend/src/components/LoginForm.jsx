import { useState } from 'react';
import { login } from '../api.js';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(username, password);
      onLogin({ token: data.token, user: data.user });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>📝 برنامه‌ریز تسک</h1>
        <p className="muted">برای ادامه وارد شوید</p>

        <label>
          نام کاربری
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </label>

        <label>
          رمز عبور
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="alert">{error}</div>}

        <button className="btn btn--primary" disabled={submitting}>
          {submitting ? 'در حال ورود...' : 'ورود'}
        </button>

        <p className="hint">
          کاربر ثابت: <code>admin</code> / <code>123456</code>
        </p>
      </form>
    </div>
  );
}
