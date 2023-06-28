import { model, Schema } from 'mongoose';

import { Content } from '@foxpage/foxpage-server-types';

// const tagsSchema = new Schema({});
const contentSchema = new Schema<Content>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    title: { type: String, required: true, minLength: 1, maxLength: 100 },
    tags: { type: Array, default: [] },
    fileId: { type: String, required: true, length: 20, ref: 'fp_application_file' },
    applicationId: { type: String, required: true, length: 20, ref: 'fp_application' },
    liveVersionNumber: { type: Number, required: true, min: 0, default: 0 },
    liveVersionId: { type: String, default: '' },
    type: { type: String, default: '' },
    creator: { type: String, required: true, length: 20 },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
  },
);

contentSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  if (!this.id) {
    this.createTime = currentTime;
  }
  next();
});

contentSchema.index({ id: 1 });
contentSchema.index({ applicationId: 1 });
contentSchema.index({ fileId: 1 });
contentSchema.index({ 'tags.locale': 1 });
contentSchema.index({ type: 1 });
contentSchema.index({ creator: 1 });
contentSchema.index({ deleted: 1 });
contentSchema.index({ createTime: -1 });

export default model<Content>('fp_application_content', contentSchema, 'fp_application_content');
