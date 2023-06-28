import { AbstractEntity, BaseFileEntity } from '../common';
import { DynamicDataLevelEnum, DynamicDataTypeEnum } from '../enums';
import { Creator } from '../user';

export type DynamicContentTag = {
  [key in 'isBase' | 'mockId']: any;
};
export interface DynamicContentItem extends AbstractEntity {
  applicationId?: string;
  deleted?: boolean;
  fileId?: string;
  liveVersionId?: string;
  liveVersionNumber?: number;
  title?: string;
  type?: string;
  tags?: DynamicContentTag[];
}

export interface DynamicContent {
  before?: DynamicContentItem;
  after?: DynamicContentItem;
  id: string;
}

export interface DynamicCategory {
  type: string;
  fileId: string;
  contentId: string;
  versionId: string;
  folderId: string;
  applicationId: string;
  version: string;
  contentName: string;
  fileName: string;
  folderName: string;
  applicationName: string;
}

export interface DynamicEntity extends BaseFileEntity<DynamicContent> {
  actionType: string;
  category: DynamicCategory;
  deleted: boolean;
  action: string;
  transactionId: string;
  operator: string;
  dataType: DynamicDataTypeEnum;
}
