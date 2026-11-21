import { useCallback, useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import Dashboard from './components/Dashboard.jsx';

// توکن فقط اینجا و فقط در حافظه (state) نگه داشته می‌شود.
// نه localStorage، نه sessionStorage، نه کوکی: با رفرش صفحه از بین می‌رود و باید دوباره لاگین کنید.
export default function App() {
  const [auth, setAuth] = useState(null); // { token, user } یا null

  const logout = useCallback(() => setAuth(null), []);

  if (!auth) return <LoginForm onLogin={setAuth} />;
  return <Dashboard token={auth.token} user={auth.user} onLogout={logout} />;
}
