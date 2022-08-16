import {
  AbstractEntity,
  Application,
  CommonDeleteParams,
  CommonFetchParams,
  FileTag,
  ResponseBody,
} from '@/types/index';

export interface ProjectEntity extends Pick<AbstractEntity, 'id' | 'createTime' | 'creator' | 'updateTime'> {
  application: Pick<Application, 'id' | 'name'>;
  deleted: boolean;
  folderPath: string;
  intro: string;
  name?: string;
  parentFolderId: string;
  tags: FileTag[];
}

export interface ProjectListFetchParams extends CommonFetchParams {
  applicationId?: string;
  type?: string;
}

export interface ProjectListFetchResponse extends ResponseBody {
  data: ProjectEntity[];
}

export type ProjectAddParams = Pick<ProjectEntity, 'name'> &
  Pick<ProjectListFetchParams, 'organizationId' | 'applicationId'> & {
    type: string;
  };

export type ProjectSaveParams = Pick<CommonFetchParams, 'organizationId' | 'applicationId'>;

export interface ProjectDeleteParams extends Omit<CommonDeleteParams, 'id'> {
  projectId: string;
}

export interface ProjectUpdateParams extends ProjectAddParams {
  id: string;
}

export interface ProjectPageTemplateContentFetchParams extends Omit<CommonFetchParams, 'organizationId'> {
  projectId: string;
}
