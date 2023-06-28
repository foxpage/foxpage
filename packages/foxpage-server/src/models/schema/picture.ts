import { model, Schema } from 'mongoose';

import { Picture } from '@foxpage/foxpage-server-types';

const picCategorySchema = new Schema({
  applicationId: { type: String, required: true, length: 20 },
  folderId: { type: String, length: 20 },
  fileId: { type: String, length: 20 },
  contentId: { type: String, length: 20 },
  locales: { type: [String] },
});

const pictureSchema = new Schema<Picture>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    name: { type: String, required: true, minLength: 1, maxLength: 100 },
    category: { type: picCategorySchema },
    tags: { type: Array, default: [] },
    url: { type: String, required: true },
    creator: { type: String, required: true, length: 20 },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
  },
);

pictureSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  if (!this.id) {
    this.createTime = currentTime;
  }
  next();
});

pictureSchema.index({ id: 1 });
pictureSchema.index({ creator: 1 });
pictureSchema.index({ deleted: 1 });

export default model<Picture>('fp_picture', pictureSchema, 'fp_picture');
