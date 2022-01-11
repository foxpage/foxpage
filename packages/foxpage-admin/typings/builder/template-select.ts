import { FileTypeEnum } from '@/constants/index';

import { PaginationReqParams } from '../common';

export interface ApplicationStoreGoodsSearchParams extends PaginationReqParams {
  applicationId: string;
  type: FileTypeEnum;
}
