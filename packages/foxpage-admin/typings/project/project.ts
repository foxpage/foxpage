import {
  CommonDeleteParams,
  CommonFetchParams,
  ProjectEntity,
  ResponseBody,
} from '@foxpage/foxpage-client-types';

export interface ProjectListFetchParams extends Partial<CommonFetchParams> {
  applicationId?: string;
  searchText?: string;
  searchType?: string;
  type?: string;
}

export interface ProjectListFetchResponse extends ResponseBody {
  data: ProjectEntity[];
}

export type ProjectAddParams = Pick<ProjectEntity, 'name'> &
  Pick<ProjectListFetchParams, 'organizationId' | 'applicationId'> & {
    type: string;
  };

export interface ProjectSaveParams {
  editProject?: Partial<ProjectEntity>;
  organizationId?: string;
  applicationId?: string;
}

export interface ProjectDeleteParams extends Omit<CommonDeleteParams, 'id'> {
  projectId: string;
}

export interface ProjectUpdateParams extends ProjectAddParams {
  id: string;
}

export interface ProjectPageTemplateContentFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  projectId: string;
}
