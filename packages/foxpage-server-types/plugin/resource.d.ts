export abstract class ResourceAbstract {
  abstract resourceList(options: ResourceListOptions): Promise<IndexContent>;
}

export interface ResourceListOptions {
  type: string;
  packageName?: string;
  resourceConfig?: any;
  groupConfig?: any;
  appConfig?: any;
}

export interface IndexContent {
  group: string;
  packages: IndexContentPkg[];
  type?: string;
}

export interface IndexContentPkg {
  name: string;
  version: string;
  foxpage: {
    name: string;
    version: string;
    resourceName: string;
    meta: Record<string, any>;
    schema: Record<string, any>;
  };
  files?: Record<string, any>;
}
