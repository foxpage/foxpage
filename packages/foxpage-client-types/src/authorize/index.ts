import { AbstractEntity } from '../common';

export interface AuthorizeCommon
  extends Pick<AbstractEntity, 'id' | 'createTime' | 'creator' | 'updateTime'> {
  type?: string;
  deleted: boolean;
  mask: number;
  typeId: string;
}

export interface AuthorizeResCommon extends AuthorizeCommon {
  targetId: string;
}
