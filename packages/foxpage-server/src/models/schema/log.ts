import { model, Schema } from 'mongoose';

import { Log } from '@foxpage/foxpage-server-types';

const stringTypeSchema = new Schema({ id: String, type: String });
const logSchema = new Schema<Log>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    transactionId: { type: String, required: true, length: 20 },
    action: { type: String, required: true },
    operator: { type: String, required: true, length: 20 },
    category: { type: stringTypeSchema, default: {} },
    content: { type: Object, required: true, default: {} },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
  },
);

logSchema.set('toJSON', { getters: true });
logSchema.pre('save', function(next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  this.createTime = currentTime;
  return next();
});

logSchema.index({ id: 1 });
logSchema.index({ action: 1 });
logSchema.index({ operator: 1 });
logSchema.index({ 'content.realMethod': 1 });
logSchema.index({ 'content.response.code': 1 });
logSchema.index({ 'content.applicationId': 1 });
logSchema.index({ createTime: -1 });
logSchema.index({ deleted: 1 });

export default model<Log>('fp_log', logSchema, 'fp_log');
