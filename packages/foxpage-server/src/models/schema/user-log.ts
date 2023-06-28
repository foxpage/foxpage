import { model, Schema } from 'mongoose';

import { UserLog } from '@foxpage/foxpage-server-types';

const categorySchema = new Schema({
  applicationId: String,
  folderId: String,
  fileId: String,
  contentId: String,
  versionId: String,
});

const userLogSchema = new Schema<UserLog>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    transactionId: { type: String, require: true },
    actionType: { type: String },
    category: { type: categorySchema },
    content: { type: Object, required: true, default: {} },
    creator: { type: String, length: 20 },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
  },
  {
    versionKey: false,
  },
);

userLogSchema.set('toJSON', { getters: true });
userLogSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  this.createTime = currentTime;
  return next();
});

userLogSchema.index({ id: 1 });
userLogSchema.index({ actionType: 1 });
userLogSchema.index({ 'category.applicationId': 1 });
userLogSchema.index({ 'category.versionId': 1 });
userLogSchema.index({ creator: 1 });
userLogSchema.index({ createTime: -1 });

export default model<UserLog>('fp_user_log', userLogSchema, 'fp_user_log');
