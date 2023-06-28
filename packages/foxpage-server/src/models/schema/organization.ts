import { model, Schema } from 'mongoose';

import { Organization } from '@foxpage/foxpage-server-types';

const organizationSchema = new Schema<Organization>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    name: { type: String, required: true, minLength: 1, maxLength: 100 },
    members: [{ userId: String, joinTime: Date, status: Boolean }],
    creator: { type: String, required: true, length: 20 },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
  },
);

organizationSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  if (!this.id) {
    this.createTime = currentTime;
  }
  next();
});

organizationSchema.index({ id: 1 });
organizationSchema.index({ creator: 1 });
organizationSchema.index({ deleted: 1 });

export default model<Organization>('fp_organization', organizationSchema, 'fp_organization');
