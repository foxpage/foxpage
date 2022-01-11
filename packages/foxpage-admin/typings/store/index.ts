import { FileTypeEnum } from '@/constants/index';
import { StoreBuyGoodsType } from '@/constants/store';
import { OptionsAction, PaginationInfo, PaginationReqParams } from '@/types/index';
import { Creator } from '@/types/user';

import { ProjectContentType } from '../application/project';

export interface StoreFileResource {
  id: string;
  name: string;
  details: {
    applicationId: string;
    id: string;
    projectId: string;
  };
  type: FileTypeEnum;
  contents?: ProjectContentType[];
}

export interface StoreProjectResource {
  id: string;
  name: string;
  intro: string;
  creator: Creator;
  createTime?: string;
  updateTime?: string;
  folderPath: string;
  checked?: boolean;
  files: Array<StoreFileResource>;
  application: {
    id: string;
    name: string;
  };
}

export interface StorePackageResource {
  id: string;
  name: string;
  intro: string;
  creator: Creator;
  createTime?: string;
  updateTime?: string;
  checked?: boolean;
  application: {
    id: string;
    name: string;
  };
  details: {
    applicationId: string;
    id: string;
    projectId: string;
    type: string;
  };
}

export interface StoreResourceSearchParams extends PaginationReqParams {
  appIds?: string[];
  type: string;
}

export interface StoreResourceSearchResult extends ResponseBody {
  pageInfo: PaginationInfo;
  data: StoreProjectResource[];
}

export interface GoodsAddParams {
  appIds: string[];
  goodsIds: string[];
  delivery: StoreBuyGoodsType;
}

export interface GoodsCommitParams extends OptionsAction {
  applicationId: string;
  id: string;
  type: string;
  intro?: string;
}

export interface GoodsOfflineParams extends OptionsAction {
  applicationId: string;
  id: string;
}
