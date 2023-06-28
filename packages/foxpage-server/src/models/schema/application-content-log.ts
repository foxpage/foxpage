import { model, Schema } from 'mongoose';

import { ContentLog } from '@foxpage/foxpage-server-types';

const categorySchema = new Schema({
  fileId: String,
  contentId: String,
  versionId: String,
  structureId: String,
});

const appContentLogSchema = new Schema<ContentLog>(
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

appContentLogSchema.set('toJSON', { getters: true });
appContentLogSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  this.createTime = currentTime;
  return next();
});

appContentLogSchema.index({ id: 1 });
appContentLogSchema.index({ action: 1 });
appContentLogSchema.index({ 'category.versionId': 1 });
appContentLogSchema.index({ 'category.structureId': 1 });
appContentLogSchema.index({ creator: 1 });
appContentLogSchema.index({ createTime: -1 });

export default model<ContentLog>(
  'fp_application_content_log',
  appContentLogSchema,
  'fp_application_content_log',
);
