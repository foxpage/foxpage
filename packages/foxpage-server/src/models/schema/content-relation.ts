import { model, Schema } from 'mongoose';

import { ContentRelation } from '@foxpage/foxpage-server-types';

const relationSchema = new Schema({ useContentId: String });
const contentRelationSchema = new Schema<ContentRelation>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    contentId: { type: String, required: true, length: 20 },
    versionNumber: { type: Number, min: 0, default: 0 },
    relation: { type: [relationSchema], default: [] },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
  },
);

contentRelationSchema.pre('save', function(next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  if (!this.id) {
    this.createTime = currentTime;
  }
  next();
});

contentRelationSchema.index({ id: 1 });
contentRelationSchema.index({ contentId: 1 });
contentRelationSchema.index({ versionNumber: 1 });
contentRelationSchema.index({ deleted: 1 });
contentRelationSchema.index({ createTime: -1 });

export default model<ContentRelation>(
  'fp_application_content_relation',
  contentRelationSchema,
  'fp_application_content_relation',
);
