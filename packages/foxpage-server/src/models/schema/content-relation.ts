import { model, Schema } from 'mongoose';

import { ContentRelation } from '@foxpage/foxpage-server-types';

const parentItemSchema = new Schema({ id: String, type: String });
const tagSchema = new Schema({ type: String, key: String, value: String });
const contentRelationSchema = new Schema<ContentRelation>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    applicationId: { type: String, required: true },
    type: { type: String, required: true },
    level: { type: String, required: true },
    parentItems: { type: [parentItemSchema], default: [] },
    tags: { type: [tagSchema], default: [] },
    deleted: { type: Boolean, required: true, default: false },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
  },
  {
    versionKey: false,
  },
);

contentRelationSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  if (!this.id) {
    this.createTime = currentTime;
  }
  next();
});

contentRelationSchema.index({ id: 1 });
contentRelationSchema.index({ applicationId: 1 });
contentRelationSchema.index({ 'tags.value': 1 });
contentRelationSchema.index({ type: 1 });
contentRelationSchema.index({ level: 1 });
contentRelationSchema.index({ deleted: 1 });
contentRelationSchema.index({ createTime: -1 });

export default model<ContentRelation>(
  'fp_application_content_relation',
  contentRelationSchema,
  'fp_application_content_relation',
);
