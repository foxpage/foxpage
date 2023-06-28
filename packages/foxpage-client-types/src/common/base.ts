import { Relation, RelationDetails, Schemas } from '../builder';
import { Creator } from '../user';

export interface AbstractEntity {
  id: string;
  createTime?: string;
  updateTime?: string;
  creator?: Creator;
}

export interface BaseObjectEntity {
  key: string;
  value: string;
}

export interface BaseFileEntity<C = Record<string, any>> extends Partial<AbstractEntity> {
  name?: string;
  type?: string | number;
  applicationId?: string;
  content: C;
  contentId: string;
  deleted?: boolean;
  folderId?: string;
  folderName?: string;
  intro?: string;
  online?: boolean;
  relations?: RelationDetails;
  relation?: Relation;
  schemas?: Schemas[];
  suffix?: string;
  tags?: FileTag[];
  version?: string;
  versionNumber?: number;
}

export interface CommonDrawerEntity {
  open: boolean;
  type?: 'add' | 'edit' | 'view';
  data: any;
}

export interface FileTag {
  [key: string]: unknown;
}

export interface HistoryState {
  backPathname: string;
  backSearch?: string;
}
