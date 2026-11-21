import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// عمداً <React.StrictMode> استفاده نشده: در حالت توسعه، StrictMode افکت‌ها را دو بار
// اجرا می‌کند و هر درخواست دوبار در کنسول لاگ می‌شد؛ برای دیدن جریان داده گیج‌کننده است.
createRoot(document.getElementById('root')).render(<App />);
