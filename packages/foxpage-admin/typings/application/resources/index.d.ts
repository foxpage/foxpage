export * from './details.d';
export * from './groups.d';

export interface AppResourceGroupType {
  id: string;
  name: string;
  type: string;
  detail: {
    host: string;
  }
}

export interface ResourceGroupType {
  applicationId: string;
  createTime: string;
  creator: string;
  folderPath: string;
  group: {
    name: string;
    type: string;
    detail: {
      host: string;
      downloadHost: string;
    }
  }
  id: string;
  intro: string;
  name: string;
  tags: Array<{ tagType: string;[index: string]: any }>
  updateTime: string;
}
