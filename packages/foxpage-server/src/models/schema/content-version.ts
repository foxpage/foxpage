import _ from 'lodash';
import { model, Schema } from 'mongoose';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { DSL_VERSION, VERSION } from '../../../config/constant';

const contentVersionSchema = new Schema<ContentVersion>(
  {
    id: { type: String, required: true, length: 20, unique: true },
    contentId: { type: String, required: true, length: 20 },
    version: { type: String, maxLength: 20, default: '' },
    versionNumber: { type: Number, min: 0, default: 0 },
    dslVersion: { type: String, default: DSL_VERSION },
    status: { type: String, maxLength: 20, default: VERSION.STATUS_BASE },
    content: { type: Object, default: {} },
    pictures: { type: Array, default: [] },
    operator: { type: Object, default: {} },
    creator: { type: String, required: true, length: 20 },
    contentUpdateTime: { type: Date, default: '' },
    createTime: { type: Date, default: Date.now, required: true },
    updateTime: { type: Date, default: Date.now, required: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  {
    versionKey: false,
    minimize: false,
  },
);

contentVersionSchema.pre('save', function (next) {
  const currentTime = Date.now();
  this.updateTime = currentTime;
  if (!this.id) {
    this.createTime = currentTime;
  }

  if (this.content?.meta && _.isPlainObject(this.content.meta)) {
    this.content.meta = JSON.stringify(this.content.meta);
  }
  if (this.content?.schema && _.isPlainObject(this.content.schema)) {
    this.content.schema = JSON.stringify(this.content.schema);
  }
  if (this.content?.relation && _.isPlainObject(this.content.relation)) {
    this.content.relation = JSON.stringify(this.content.relation);
  }
  next();
});

contentVersionSchema.pre(['update', 'updateOne', 'updateMany'], function (next) {
  const versionContent = (this.getUpdate() || {}) as ContentVersion;

  if (versionContent.content) {
    if (versionContent?.content?.meta && _.isPlainObject(versionContent.content.meta)) {
      versionContent.content.meta = JSON.stringify(versionContent.content.meta);
    }

    if (versionContent?.content?.schema && _.isPlainObject(versionContent.content.schema)) {
      versionContent.content.schema = JSON.stringify(versionContent.content.schema);
    }

    if (versionContent?.content?.relation && _.isPlainObject(versionContent.content.relation)) {
      versionContent.content.relation = JSON.stringify(versionContent.content.relation);
    }

    this.update({}, { $set: { content: versionContent.content } });
  }
  next();
});

contentVersionSchema.pre('insertMany', function (next: any, docs: ContentVersion[]) {
  if (_.isArray(docs) && docs.length > 0) {
    for (const doc of docs) {
      if (doc.content) {
        if (doc?.content?.meta && _.isPlainObject(doc.content.meta)) {
          doc.content.meta = JSON.stringify(doc.content.meta);
        }

        if (doc?.content?.schema && _.isPlainObject(doc.content.schema)) {
          doc.content.schema = JSON.stringify(doc.content.schema);
        }

        if (doc?.content?.relation && _.isPlainObject(doc.content.relation)) {
          doc.content.relation = JSON.stringify(doc.content.relation);
        }
      }
    }
  }

  next();
});

// Format `meta` filed in version content after query
contentVersionSchema.post(['find', 'findOne'], function (result) {
  if (result) {
    !_.isArray(result) && (result = [result]);
    result.forEach((item: any) => {
      if (item?.content?.meta && _.isString(item.content.meta)) {
        try {
          item.content.meta = JSON.parse(item.content.meta);
        } catch (err) {
          console.log(err);
        }
      }
      if (item?.content?.schema && _.isString(item.content.schema)) {
        try {
          item.content.schema = JSON.parse(item.content.schema);
        } catch (err) {
          console.log(err);
        }
      }

      if (item?.content?.relation && _.isString(item.content.relation)) {
        try {
          item.content.relation = JSON.parse(item.content.relation);
        } catch (err) {
          console.log(err);
        }
      }
    });
  }
});

contentVersionSchema.index({ id: 1 });
contentVersionSchema.index({ contentId: 1 });
contentVersionSchema.index({ versionNumber: -1 });
contentVersionSchema.index({ creator: 1 });
contentVersionSchema.index({ deleted: 1 });
contentVersionSchema.index({ createTime: -1 });

export default model<ContentVersion>(
  'fp_application_content_version',
  contentVersionSchema,
  'fp_application_content_version',
);
