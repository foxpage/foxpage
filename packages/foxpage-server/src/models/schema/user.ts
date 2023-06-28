import { model, Schema } from 'mongoose';

import { User } from '@foxpage/foxpage-server-types';

const userSchema = new Schema<User>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    account: { type: String, required: true, minLength: 2, maxLength: 100 },
    password: { type: String, maxLength: 100, select: false, default: '' },
    nickName: { type: String, minLength: 0, maxLength: 100, default: '' },
    email: { type: String, maxLength: 100, default: '' },
    registerType: { type: Number, required: true, min: 1, max: 10, default: 1 },
    changePwdStatus: { type: Boolean, default: false },
    defaultOrganizationId: { type: String, default: '' },
    createTime: { type: Date, required: true, default: Date.now },
    updateTime: { type: Date, required: true, default: Date.now },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
  },
);

userSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  if (!this.id) {
    this.createTime = currentTime;
  }
  next();
});

userSchema.index({ id: 1 });
userSchema.index({ account: 1 });
userSchema.index({ creator: 1 });
userSchema.index({ deleted: 1 });

export default model<User>('fp_user', userSchema, 'fp_user');
