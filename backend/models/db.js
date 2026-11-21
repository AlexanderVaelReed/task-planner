// اتصال به MongoDB با درایور رسمی. یک بار هنگام شروع سرور وصل می‌شویم
// و همان اتصال را در کل برنامه استفاده می‌کنیم.

import { MongoClient } from 'mongodb';
import { config } from '../config.js';

let client = null;
let db = null;

export async function connectDb() {
  client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  db = client.db(config.dbName);
  console.log(`✅ به MongoDB وصل شد: ${config.mongoUri} (دیتابیس: ${config.dbName})`);
  return db;
}

export function getDb() {
  if (!db) throw new Error('اتصال به دیتابیس برقرار نشده است');
  return db;
}

export async function closeDb() {
  if (client) await client.close();
}
