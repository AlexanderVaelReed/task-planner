// لایه Model: تنها جایی که مستقیم با MongoDB حرف می‌زنیم.
// Controller نمی‌داند دیتابیس چیست؛ فقط این توابع را صدا می‌زند.
//
// شکل یک سند (document) در کالکشن tasks:
// {
//   _id: ObjectId,
//   user: 'admin',
//   title: 'خرید نان',
//   description: '...',
//   estimatedTime: 30,        // دقیقه
//   status: 'todo' | 'done',
//   createdAt: Date
// }

import { ObjectId } from 'mongodb';
import { getDb } from './db.js';
import { logDb } from '../utils/logger.js';

const tasks = () => getDb().collection('tasks');
const toObjectId = (id) => new ObjectId(id);

export const TaskModel = {
  isValidId(id) {
    return /^[a-f\d]{24}$/i.test(id);
  },

  async findAllByUser(user) {
    logDb(`tasks.find({ user: "${user}" }).sort({ createdAt: -1 })`);
    return tasks().find({ user }).sort({ createdAt: -1 }).toArray();
  },

  async findById(id, user) {
    logDb(`tasks.findOne({ _id: ObjectId("${id}"), user: "${user}" })`);
    return tasks().findOne({ _id: toObjectId(id), user });
  },

  async create(data) {
    logDb('tasks.insertOne({ ...task })');
    const result = await tasks().insertOne(data);
    return { ...data, _id: result.insertedId };
  },

  // سند را به‌روز می‌کند و نسخه جدید را برمی‌گرداند (یا null اگر پیدا نشد)
  async update(id, user, fields) {
    logDb(`tasks.findOneAndUpdate({ _id: ObjectId("${id}") }, { $set: ${JSON.stringify(fields)} })`);
    return tasks().findOneAndUpdate(
      { _id: toObjectId(id), user },
      { $set: fields },
      { returnDocument: 'after' },
    );
  },

  async remove(id, user) {
    logDb(`tasks.deleteOne({ _id: ObjectId("${id}"), user: "${user}" })`);
    const result = await tasks().deleteOne({ _id: toObjectId(id), user });
    return result.deletedCount === 1;
  },
};
