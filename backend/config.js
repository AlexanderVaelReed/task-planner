// تنظیمات مرکزی بک‌اند.
// هر مقدار را می‌توان با متغیر محیطی عوض کرد (مثلاً PORT=4000 npm start).

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
  dbName: process.env.DB_NAME || 'task_planner',

  // کلید امضای توکن. فقط برای یادگیری؛ در پروژه واقعی هرگز هاردکد نکنید.
  jwtSecret: process.env.JWT_SECRET || 'learning-only-secret-change-me',
  tokenTtlSeconds: 60 * 60, // اعتبار توکن: یک ساعت

  // تنها کاربر سیستم (هاردکد شده)
  adminUser: { username: 'admin', password: '123456' },
};
