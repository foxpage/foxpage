import { model, Schema } from 'mongoose';

import { Folder } from '@foxpage/foxpage-server-types';

// const folderTypeSchema = new Schema({ type: String }); // type, resourceType,...
const folderSchema = new Schema<Folder>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    name: { type: String, required: true, minLength: 2, maxLength: 100 },
    intro: { type: String, maxLength: 1000 },
    tags: { type: [] },
    applicationId: { type: String, required: true, length: 20, ref: 'fp_application' },
    parentFolderId: { type: String, ref: 'fp_application_folder', default: null },
    folderPath: { type: String, maxLength: 100, default: '' },
    creator: { type: String, required: true, length: 20 },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
  },
);

folderSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  if (!this.id) {
    this.createTime = currentTime;
  }
  next();
});

folderSchema.index({ id: 1 });
folderSchema.index({ applicationId: 1 });
folderSchema.index({ parentFolderId: 1 });
folderSchema.index({ 'tags.type': 1 });
folderSchema.index({ creator: 1 });
folderSchema.index({ deleted: 1 });
folderSchema.index({ createTime: -1 });

export default model<Folder>('fp_application_folder', folderSchema, 'fp_application_folder');
