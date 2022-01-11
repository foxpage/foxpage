import { model, Schema } from 'mongoose';

import { File } from '@foxpage/foxpage-server-types';

// const tagsSchema = new Schema({});
const fileSchema = new Schema<File>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    name: { type: String, required: true, minLength: 2, maxLength: 100 },
    intro: { type: String, maxLength: 1000, default: '' },
    applicationId: { type: String, required: true, length: 20, ref: 'fp_application' },
    tags: { type: Array, default: [] },
    folderId: { type: String, maxLength: 20, ref: 'fp_application_folder' },
    type: { type: String, maxLength: 50, required: true },
    suffix: { type: String, maxLength: 50, default: '' },
    creator: { type: String, required: true, length: 20 },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
  },
);

fileSchema.pre('save', function(next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  if (!this.id) {
    this.createTime = currentTime;
  }
  next();
});

fileSchema.index({ id: 1 });
fileSchema.index({ applicationId: 1 });
fileSchema.index({ folderId: 1 });
fileSchema.index({ 'tags.pathname': 1 });
fileSchema.index({ type: 1 });
fileSchema.index({ creator: 1 });
fileSchema.index({ deleted: 1 });
fileSchema.index({ createTime: -1 });

export default model<File>('fp_application_file', fileSchema, 'fp_application_file');
