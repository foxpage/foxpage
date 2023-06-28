export type ContentBaseStatus = 'base';
export type ContentDiscardStatus = 'discard';
export type ContentAlphaStatus = 'alpha';
export type ContentBetaStatus = 'beta';
export type ContentCanaryStatus = 'canary';
export type ContentReleaseStatus = 'release';
export type ContentReleaseCandidateStatus = 'releaseCandidate';

// content status
export type ContentStatus =
  | ContentBaseStatus
  | ContentDiscardStatus
  | ContentAlphaStatus
  | ContentBetaStatus
  | ContentCanaryStatus
  | ContentReleaseStatus
  | ContentReleaseCandidateStatus;

export type Tag = Record<string, any>;

interface CommonFields {
  id: string;
  creator: string;
  createTime?: Date | string;
  updateTime?: Date | string;
  deleted?: boolean;
}

export interface AppResource {
  id: string;
  name: string;
  type: number;
  detail: {
    host: string;
    downloadHost?: string;
  };
}

export interface AppSetting {
  [index: string]: any[];
}

export interface AppHost {
  url: string;
  locales: string[];
}

// Application
export interface Application extends CommonFields {
  name: string;
  intro: string;
  organizationId: string;
  host?: AppHost[];
  slug?: string;
  locales: string[];
  resources: AppResource[];
  setting?: AppSetting;
}

export interface Authorize extends CommonFields {
  type: string;
  typeId: string;
  targetId: string;
  mask: number;
  allow: boolean;
  relation?: Record<string, any>;
}

export interface SchemaDirective {
  tpl?: string;
  if?: string;
  else?: string;
}

export interface DslSchemas {
  id: string;
  name: string;
  label: string;
  type: string;
  version: string;
  children?: DslSchemas[];
  disable?: boolean;
  directive?: SchemaDirective;
  extension?: {
    parentId?: string;
    extendId?: string;
  };
  wrapper?: string;
  props?: Record<string, any>;
  style?: Record<string, any>;
}

export interface IdVersion {
  id: string;
  version?: string;
}

export interface IdVersionNumbers extends IdVersion {
  versionNumber: number;
}

export interface EditorEntry extends IdVersion {
  name?: string;
}

export interface Dependencies extends IdVersion {
  name?: string;
}

export interface DslRelation extends IdVersion {
  type: string;
}

export type ResourceType = 'node' | 'browser' | 'css' | 'debug';

export interface Resources {
  entry: Record<ResourceType, string | Record<string, string>>;
  'editor-entry': EditorEntry[];
  dependencies: Dependencies[];
}

export interface Component {
  id: string;
  resource: Resources;
  schema: string;
  meta?: Record<string, any>;
  useStyleEditor?: boolean;
  changelog?: string;
}

export interface DSL {
  id: string;
  schemas: DslSchemas[];
  relation: Record<string, DslRelation>;
  version?: string;
  extension?: Record<string, string>;
}

export interface ComponentDSL {
  id: string;
  resource: Resources;
  schema: string;
  meta?: string;
  changelog?: string;
  enableChildren?: boolean;
  useStyleEditor?: boolean;
}

// Variables, conditions, methods, etc. structure
export interface TypeFileDSL {
  id: string;
  schemas: {
    type: string;
    name: string;
    props: any;
  }[];
  relation: Record<string, Record<string, string>>;
}

export interface PicType {
  url: string;
  type: string;
  sort?: number;
}

export interface CommonContentVersion extends CommonFields {
  contentId: string;
  version: string;
  versionNumber: number;
  dslVersion?: string;
  status?: ContentStatus;
  pictures?: PicType[];
  operator?: Record<string, any>;
  contentUpdateTime?: Date | string;
}

export interface ContentVersion extends CommonContentVersion {
  content: DSL | ComponentDSL | TypeFileDSL | any;
}

export interface PageVersion extends CommonContentVersion {
  content: DSL;
}

export interface ComponentVersion extends CommonContentVersion {
  content: ComponentDSL;
}

export interface TypeVersion extends CommonContentVersion {
  content: TypeFileDSL;
}

export interface Relation {
  useContentId: string;
}

export interface ContentRelation extends CommonFields {
  contentId: string;
  versionNumber: number;
  relation: Relation[];
}

// Content
export interface Content extends CommonFields {
  title: string;
  tags: Tag[];
  fileId: string;
  applicationId: string;
  liveVersionNumber: number;
  liveVersionId?: string;
  type?: string;
}

export type FilePageType = 'page';
export type FileTemplateType = 'template';
export type FileVariableType = 'variable';
export type FileConditionType = 'condition';
export type FileRouteType = 'route';
export type FileJsFunctionType = 'jsPackage';
export type FilePackageType = 'package';
export type FileResourceType = 'resource';
export type FileComponentType = 'component';
export type FileEditorType = 'editor';
export type FileLibraryType = 'library';
export type FileFunctionType = 'function';

export type FileTypes =
  | FilePageType
  | FileTemplateType
  | FileVariableType
  | FileConditionType
  | FileRouteType
  | FileJsFunctionType
  | FilePackageType
  | FileResourceType
  | FileComponentType
  | FileEditorType
  | FileLibraryType
  | FileFunctionType;

// File
export interface File extends CommonFields {
  name: string;
  applicationId: string;
  folderId: string;
  type: FileTypes;
  suffix: string;
  subType?: string;
  componentType?: string;
  extension?: Record<string, any>;
  intro?: string;
  tags?: any[];
}

// Folder
export interface Folder extends CommonFields {
  name: string;
  intro: string;
  applicationId: string;
  parentFolderId: string;
  folderPath?: string;
  tags?: any[];
}

export interface Member {
  userId: string;
  joinTime: Date;
  status: boolean;
}

// Organization
export interface Organization extends CommonFields {
  name: string;
  members?: Member[];
}

// Team
export interface Team extends CommonFields {
  name: string;
  organizationId: string;
  members?: Member[];
}

export type SystemUser = 1;
export type ThirdUser = 2;
export type UserRegisterType = SystemUser | ThirdUser;

// User
export interface User {
  account: string;
  password: string;
  nickName: string;
  email: string;
  registerType: UserRegisterType;
  deleted: boolean;
  id?: string;
  changePwdStatus?: boolean;
  defaultOrganizationId?: string;
  createTime?: Date;
  updateTime?: Date;
}

// Store goods information
export interface StoreGoods {
  id: string;
  name: string;
  intro: string;
  type: FileTypes;
  details: {
    id: string;
    applicationId: string;
    projectId?: string;
    type?: string;
    creator?: string;
  };
  status: number;
  createTime?: Date;
  updateTime?: Date;
  deleted?: boolean;
}

export interface StoreOrder {
  id: string;
  goodsId: string;
  goodsVersionId: string;
  customer: StoreOrdersCustomer;
  delivery: string;
  createTime?: Date;
  updateTime?: Date;
  deleted?: boolean;
}

export interface StoreOrdersCustomer {
  applicationId: string;
  id?: string;
  projectId?: string;
  contentId?: string;
  userId?: string;
  type?: string;
}

export interface LogCategory {
  type: LogCategoryType;
  applicationId: string;
  applicationName: string;
  folderId?: string;
  folderName?: string;
  fileId?: string;
  fileName?: string;
  contentId?: string;
  contentName?: string;
  versionId?: string;
  version?: string;
}

// Here before, after includes all data types
export interface LogContent {
  id: string;
  after: any;
  before?: any;
  applicationId?: string;
  applicationName?: string;
  contentId?: string;
  name?: string;
  dataType?: string;
  dataLevel?: string;
}

export interface Log {
  id: string;
  action: LogActionType;
  actionType: string;
  operator: string;
  category: LogCategory;
  content: LogContent;
  createTime?: Date;
  updateTime?: Date;
  deleted: boolean;
}

export interface ContentLog {
  id: string;
  action: string;
  actionType?: string;
  category: Record<string, string>;
  content: { id: string; type: string; content: any }[];
  creator: string;
  createTime?: Date;
  updateTime?: Date;
}

export interface UserLog {
  id: string;
  transactionId: string;
  actionType: string;
  category: Record<string, string>;
  content: { id: string; type: string; content: any }[];
  creator: string;
  createTime?: Date;
  updateTime?: Date;
}

export interface PicCategory {
  applicationId: string;
  folderId?: string;
  fileId?: string;
  contentId?: string;
  locales?: string[];
}

export interface Picture {
  id: string;
  name: string;
  category: PicCategory;
  tags?: Record<string, any>[];
  url: string;
  creator: string;
  deleted: boolean;
  createTime?: Date;
  updateTime?: Date;
}

// Log operation type
export type LogCreateType = 'create';
export type LogUpdateType = 'update';
export type LogDeleteType = 'delete';
export type LogPublishType = 'publish';
export type LogLiveType = 'live';
export type LogTagType = 'tags';
export type LogLoginType = 'login';
export type LogLogoutType = 'logout';
export type LogFileUpdate = 'file_update';
export type LogFileRemove = 'file_remove';
export type LogFileTag = 'file_tag';
export type LogContentUpdate = 'content_update';
export type LogContentRemove = 'content_remove';
export type LogContentTag = 'content_tag';
export type LogVersionUpdate = 'version_update';
export type LogVersionRemove = 'version_remove';
export type LogMetaUpdate = 'meta_update';
export type LogActionType =
  | LogCreateType
  | LogUpdateType
  | LogDeleteType
  | LogPublishType
  | LogLiveType
  | LogTagType
  | LogLoginType
  | LogLogoutType
  | LogFileUpdate
  | LogFileRemove
  | LogFileTag
  | LogContentUpdate
  | LogContentRemove
  | LogContentTag
  | LogVersionUpdate
  | LogVersionRemove
  | LogMetaUpdate;

export type LogSystemType = 'system';
export type LogOrganizationType = 'organization';
export type LogApplicationType = 'application';
export type LogCategoryType = LogSystemType | LogOrganizationType | LogApplicationType;

// Folder type under application
export type AppProjectType = 'project';
export type AppVariableType = 'variable';
export type AppConditionType = 'condition';
export type AppComponentType = 'component';
export type AppLibraryType = 'library';
export type AppResourceType = 'resource';
export type AppFunctionType = 'function';
export type AppSettingType = 'app_setting';
export type AppFolderTypes =
  | AppProjectType
  | AppVariableType
  | AppConditionType
  | AppComponentType
  | AppLibraryType
  | AppResourceType
  | AppFunctionType
  | AppSettingType;

export type LangEn = 'en';
export type LangCn = 'cn';

export type LangEnums = LangEn | LangCn;
