import { RelationsType, RelationType } from '@/types/builder';
import { BaseResponse, FileTag, PaginationReqParams } from '@/types/common';
import { Creator } from '@/types/user';

import { FuncContentItem } from './function';

export interface StaticVariableProps {
  type: string;
  value: { [name: string]: string };
}
export interface FunctionVariableProps {
  function: string;
  args: Array<string | { [name: string]: string }>;
}
export interface VariableContent {
  id: string;
  schemas: Array<{
    type: string;
    name: string;
    props: StaticVariableProps | FunctionVariableProps;
  }>;
  relation: RelationType;
}

interface VariableType {
  id: string;
  name: string;
  folderId: string;
  folderName?: string;
  creator: Creator;
  createTime: string;
  updateTime: string;
  contentId: string;
  content: VariableContent;
  relations?: RelationsType;
  tags: Array<FileTag>
};

export default VariableType;

export interface VariableSearchParams {
  applicationId: string;
  id?: string;
  names: string[];
}

export interface VariableDeleteParams {
  fileId: string;
  successCb?: () => void;
  folderId?: string;
}

export interface VariableSaveParams {
  successCb?: () => void;
  folderId?: string;
  applicationId: string;
}

export interface VariableDeleteParams extends VariableSaveParams {
  fileId: string;
}

export interface GetApplicationVariableParams extends PaginationReqParams {
  applicationId: string;
}

export interface GetApplicationVariableResult extends BaseResponse<VariableType> {
  list: VariableType[];
}
