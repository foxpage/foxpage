import { model, Schema } from 'mongoose';

import { StoreGoods } from '@foxpage/foxpage-server-types';

const storeGoodsSchema = new Schema<StoreGoods>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    name: { type: String, required: true, minLength: 1, maxLength: 100 },
    intro: { type: String, default: '' },
    type: { type: String, required: true },
    details: { type: Object, required: true, default: {} },
    status: { type: Number, min: 0, max: 1, default: 1, required: true }, // 1:online,0:offline
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
  },
);

storeGoodsSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  if (!this.id) {
    this.createTime = currentTime;
  }
  next();
});

storeGoodsSchema.index({ id: 1 });
storeGoodsSchema.index({ creator: 1 });
storeGoodsSchema.index({ deleted: 1 });
storeGoodsSchema.index({ createTime: -1 });

export default model<StoreGoods>('fp_store_goods', storeGoodsSchema, 'fp_store_goods');
