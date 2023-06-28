import { model, Schema } from 'mongoose';

import { ContentLog } from '@foxpage/foxpage-server-types';

// TODO: need to deprecated

const categorySchema = new Schema({
  applicationId: String,
  folderId: String,
  fileId: String,
  contentId: String,
  versionId: String,
  structureId: String,
});

const contentLogSchema = new Schema<ContentLog>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    action: { type: String, required: true },
    actionType: { type: String },
    category: { type: categorySchema },
    content: { type: Array, required: true, default: [] },
    creator: { type: String, length: 20 },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
  },
  {
    versionKey: false,
  },
);

contentLogSchema.set('toJSON', { getters: true });
contentLogSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  this.createTime = currentTime;
  return next();
});

contentLogSchema.index({ id: 1 });
contentLogSchema.index({ action: 1 });
contentLogSchema.index({ 'category.versionId': 1 });
contentLogSchema.index({ 'category.structureId': 1 });
contentLogSchema.index({ creator: 1 });
contentLogSchema.index({ createTime: -1 });

export default model<ContentLog>('fp_content_log', contentLogSchema, 'fp_content_log');
