# 📝 Task Planner — پروژه یادگیری جریان داده

هدف این پروژه دیدن مسیر کامل داده است:

```
مرورگر (React) ──fetch──▶ Node.js خام ──driver──▶ MongoDB
      ▲                                              │
      └──────────────── پاسخ JSON ◀──────────────────┘
```

- **Frontend:** React + Vite (CSS ساده، بدون Tailwind)
- **Backend:** Node.js خام؛ فقط `http` و `url` (بدون Express/Fastify)
- **Database:** MongoDB با درایور رسمی `mongodb`
- **هیچ چیز در مرورگر ذخیره نمی‌شود:** نه localStorage، نه sessionStorage، نه IndexedDB. توکن فقط در state ریاکت است، پس با رفرش صفحه دوباره باید لاگین کنید.

## ساختار پروژه

```
task-planner/
├── backend/
│   ├── server.js                  نقطه ورود: http.createServer، خواندن URL/body، لاگ
│   ├── config.js                  پورت، آدرس MongoDB، کاربر admin
│   ├── routes/index.js            Router دست‌ساز (متد + مسیر → Controller)
│   ├── middleware/auth.js         چک توکن؛ در صورت مشکل 401
│   ├── controllers/
│   │   ├── authController.js      لاگین
│   │   └── taskController.js      CRUD تسک‌ها + اعتبارسنجی
│   ├── models/
│   │   ├── db.js                  اتصال به MongoDB
│   │   └── taskModel.js           تنها جایی که با MongoDB حرف می‌زند
│   └── utils/
│       ├── http.js                sendJson، readJsonBody، CORS
│       ├── jwt.js                 JWT ساده (HS256) با ماژول crypto
│       └── logger.js              لاگ‌های آموزشی
└── frontend/
    └── src/
        ├── api.js                 تمام fetch‌ها + لاگ در کنسول
        ├── App.jsx                نگهداری توکن در state
        └── components/            LoginForm, Dashboard, TaskForm, TaskItem
```

## پیش‌نیازها

- Node.js نسخه 18.11 یا بالاتر (`node -v`)
- MongoDB روی پورت پیش‌فرض 27017

## راه‌اندازی

### ۱) اجرای MongoDB

یکی از دو روش:

**با Docker (ساده‌ترین):**

```bash
docker run -d --name task-planner-mongo -p 27017:27017 mongo:7
```

**یا نصب محلی:** MongoDB Community را نصب کنید و `mongod` را اجرا کنید (روی لینوکس معمولاً `sudo systemctl start mongod`، روی مک با Homebrew: `brew services start mongodb-community`).

نیازی به ساختن دیتابیس یا کالکشن نیست؛ دیتابیس `task_planner` و کالکشن `tasks` با اولین تسک خودکار ساخته می‌شوند.

### ۲) اجرای Backend

```bash
cd backend
npm install
npm start          # یا npm run dev برای ری‌استارت خودکار
```

باید این‌ها را ببینید:

```
✅ به MongoDB وصل شد: mongodb://127.0.0.1:27017 (دیتابیس: task_planner)
🚀 سرور روی http://localhost:5000 اجرا شد
```

### ۳) اجرای Frontend (در ترمینال دوم)

```bash
cd frontend
npm install
npm run dev
```

مرورگر را روی **http://localhost:5173** باز کنید و با `admin` / `123456` وارد شوید.

## API

| متد | مسیر | نیاز به توکن | کار |
|---|---|---|---|
| POST | `/api/login` | ❌ | ورود؛ `{ token, user }` برمی‌گرداند |
| GET | `/api/tasks` | ✅ | لیست تسک‌های کاربر |
| POST | `/api/tasks` | ✅ | ساخت تسک |
| PUT | `/api/tasks/:id` | ✅ | ویرایش تسک |
| PATCH | `/api/tasks/:id/toggle` | ✅ | تغییر وضعیت todo ↔ done |
| DELETE | `/api/tasks/:id` | ✅ | حذف تسک |

هدر توکن: `Authorization: Bearer <token>`

شکل یک تسک:

```json
{
  "_id": "665f1c...",
  "user": "admin",
  "title": "مطالعه React",
  "description": "",
  "estimatedTime": 45,
  "status": "todo",
  "createdAt": "2026-11-21T17:30:00.000Z"
}
```

## چطور جریان داده را ببینیم؟

۱. **کنسول مرورگر (F12 → Console):** هر درخواست با `➡️ [REQUEST]` و هر پاسخ با `⬅️ [RESPONSE]` لاگ می‌شود.
۲. **تب Network مرورگر:** همان درخواست‌ها را با هدرها و payload کامل نشان می‌دهد. به درخواست‌های `OPTIONS` (preflight مربوط به CORS) هم دقت کنید.
۳. **ترمینال Backend:** برای هر درخواست کل مسیر چاپ می‌شود. نمونه برای ساخت یک تسک:

```
════════════════════════════════════════════════════════════════════════
📥 #3 درخواست ورودی
   POST /api/tasks
   headers: { "authorization": "Bearer eyJ...", "content-type": "application/json", ... }
   body   : { "title": "مطالعه React", "estimatedTime": 45, "status": "todo" }
   ↳ #3 [ROUTE] تطبیق با POST /api/tasks
   ↳ #3 [MIDDLEWARE] توکن معتبر است؛ کاربر: admin
   ↳ #3 [CONTROLLER] اجرای createTask()
   ↳ [MONGODB] tasks.insertOne({ ...task })
📤 #3 پاسخ خروجی  201  (6ms)
   body   : { "title": "مطالعه React", ..., "_id": "665f1c..." }
```

۴. **خود دیتابیس:** با `mongosh` یا MongoDB Compass ببینید سند واقعاً ذخیره شده:

```bash
mongosh
use task_planner
db.tasks.find().pretty()
```

## آزمایش‌های پیشنهادی

- **رفرش صفحه:** دوباره به صفحه لاگین برمی‌گردید، چون توکن فقط در حافظه بود. ولی تسک‌ها بعد از لاگین سر جایشان هستند، چون در MongoDB ذخیره شده‌اند.
- **رمز اشتباه:** پاسخ `401` را در کنسول و ترمینال ببینید.
- **توکن خراب:** با curl درخواست بدون توکن یا با توکن اشتباه بفرستید:

  ```bash
  curl -i http://localhost:5000/api/tasks
  curl -i -H "Authorization: Bearer wrong" http://localhost:5000/api/tasks
  ```

- **اعتبارسنجی:** تسک بدون عنوان بفرستید و `400` بگیرید.
- **تغییر مستقیم در دیتابیس:** در `mongosh` عنوان یک تسک را عوض کنید (`db.tasks.updateOne({}, { $set: { title: "تغییر از mongosh" } })`)، سپس صفحه را رفرش و دوباره لاگین کنید تا تغییر را در UI ببینید.
- **بستن MongoDB** (`docker stop task-planner-mongo`) هنگام اجرای سرور و دیدن خطاها.

## نکات

- توکن یک JWT ساده است که با `crypto` خود Node امضا می‌شود و یک ساعت اعتبار دارد.
- رمز عبور و کلید امضا عمداً هاردکد شده‌اند تا کد ساده بماند؛ در پروژه واقعی از هش (bcrypt/argon2)، دیتابیس کاربران و متغیر محیطی استفاده کنید.
- لاگ‌های Backend کل هدرها و body (از جمله رمز لاگین) را چاپ می‌کنند. این فقط برای یادگیری روی لوکال است.
- تنظیمات با متغیر محیطی قابل تغییرند: `PORT`, `MONGO_URI`, `DB_NAME`, `JWT_SECRET`؛ و در فرانت `VITE_API_URL` (فایل `frontend/.env.example`).
