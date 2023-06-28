export const PRE = {
  APP: 'appl',
  AUTH: 'auth',
  CONTENT: 'cont',
  CONTENT_VERSION: 'cver',
  FILE: 'file',
  FOLDER: 'fold',
  LOG: 'logs',
  ORDER: 'oder',
  ORGANIZATION: 'orga',
  PICTURE: 'pics',
  REGISTER: 'regi',
  RELATION: 'rela',
  RESOURCE: 'rsos',
  STORE: 'stor',
  STRUCTURE: 'stru',
  TEAM: 'team',
  TEMPLATE: 'temp',
  TRAN: 'trns',
  USER: 'user',
};

export const TYPE = {
  SYSTEM: 'system',
  ORGANIZATION: 'organization',
  APPLICATION: 'application',
  FOLDER: 'folder',
  FILE: 'file',
  CONTENT: 'content',
  VERSION: 'version',
  STRUCTURE: 'structure',
  TEAM: 'team',
  USER: 'user',

  COMPONENT: 'component',
  CONDITION: 'condition',
  EDITOR: 'editor',
  SYSCOMPONENT: 'systemComponent',
  FUNCTION: 'function',
  LIBRARY: 'library',
  PACKAGE: 'package',
  PAGE: 'page',

  PROJECT: 'project',
  PROJECT_FOLDER: 'project_folder',
  RESOURCE: 'resource',
  TEMPLATE: 'template',
  VARIABLE: 'variable',
  MOCK: 'mock',
  BLOCK: 'block',

  GOODS: 'goods',
  INVOLVE: 'involve',

  TAG: 'tag',

  BUILDER: 'builder',
};

export const LOG = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish',
  LIVE: 'live',
  LOGIN: 'login',
  LOGOUT: 'logout',
  SET: 'set',
  CLONE: 'clone',
  SYNC: 'sync',

  VERSION_UPDATE: 'version_update',
  VERSION_REMOVE: 'version_remove',
  CONTENT_UPDATE: 'content_update',
  CONTENT_REMOVE: 'content_remove',
  CONTENT_TAG: 'content_tag',
  CONTENT_OFFLINE: 'content_offline',
  FILE_UPDATE: 'file_update',
  FILE_REMOVE: 'file_remove',
  FILE_TAG: 'file_tag',
  FILE_EXTENSION: 'file_extension',
  META_UPDATE: 'meta_update',
  VERSION_STATUS: 'version_status',
  REQUEST: 'request',

  CATEGORY_SYSTEM: 'system',
  CATEGORY_ORGANIZATION: 'organization',
  CATEGORY_APPLICATION: 'application',
};

export const VERSION = {
  STATUS_DISCARD: 'discard',
  STATUS_BASE: 'base',
  STATUS_ALPHA: 'alpha',
  STATUS_BETA: 'beta',
  STATUS_CANARY: 'canary',
  STATUS_RELEASE_CANDIDATE: 'release candidate',
  STATUS_RELEASE: 'release',
};

export const DSL_VERSION = '1.0';

export const DELIVERY_CLONE = 'clone';
export const DELIVERY_REFERENCE = 'reference';

export const TAG = {
  COMPONENT_CATEGORY: 'componentCategory',
  CLONE: 'cloneFrom',
  COPY: 'copyFrom',
  RESOURCE_GROUP: 'resourceGroup',
  RESOURCE_CONFIG: 'resourceConfig',
  DELIVERY_CLONE: 'clone',
  DELIVERY_REFERENCE: 'reference',
  LOAD_ON_IGNITE: 'loadOnIgnite',
  SYNC_FROM: 'syncFrom',
  SYNC_TO: 'syncTo',
  DEPRECATED: 'deprecated',
};

export const CONT_STORE = 'store';

export const RESPONSE_LEVEL = {
  SUCCESS: 200,
  DOWNLOAD: 210,
  WARNING: 400,
  INVALID_TOKEN: 401,
  ACCESS_DENY: 403,
  NOT_FOUND: 404,
  ERROR: 500,
};

export const LOGGER_LEVEL = {
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  NONE: 5,
};

export const ACTION = {
  GET: 'get',
  SAVE: 'save',
};

export const METHOD = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
};

export const COMPONENT_TYPE = {
  REACT_COMPONENT: 'react.component',
};

export const STRUCTURE_TYPE = {
  DSL_TEMPLATE: 'dsl.template',
};

export const CACHE = {
  APP_DETAIL: 'application-detail-',
  COMPONENT_DETAIL: 'component-detail-',
};

export const COLLECT = {
  APP: 'fp_application',
  AUTH: 'fp_authorize',
  CONTENT: 'fp_application_content',
  CLOG: 'fp_content_log',
  FILE: 'fp_application_file',
  FOLD: 'fp_application_folder',
  LOG: 'fp_log',
  ORG: 'fp_organization',
  RELATION: 'fp_application_content_relation',
  TEAM: 'fp_team',
  USER: 'fp_user',
  VERSION: 'fp_application_content_version',
};
