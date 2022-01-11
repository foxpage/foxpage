export const PRE = {
  APP: 'appl',
  CONTENT: 'cont',
  CONTENT_VERSION: 'cver',
  FILE: 'file',
  FOLDER: 'fold',
  LOG: 'logs',
  ORDER: 'oder',
  ORGANIZATION: 'orga',
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
  ORGANIZATION: 'organization',
  APPLICATION: 'application',
  FOLDER: 'folder',
  FILE: 'file',
  CONTENT: 'content',
  VERSION: 'version',
  TEAM: 'team',

  COMPONENT: 'component',
  CONDITION: 'condition',
  EDITOR: 'editor',
  FUNCTION: 'function',
  LIBRARY: 'library',
  PACKAGE: 'package',
  PAGE: 'page',

  PROJECT: 'project',
  PROJECT_FOLDER: 'project_folder',
  RESOURCE: 'resource',
  TEMPLATE: 'template',
  VARIABLE: 'variable',

  GOODS: 'goods',
};

export const LOG = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish',
  LIVE: 'live',
  LOGIN: 'login',
  LOGOUT: 'logout',

  VERSION_UPDATE: 'version_update',
  VERSION_REMOVE: 'version_remove',
  CONTENT_UPDATE: 'content_update',
  CONTENT_REMOVE: 'content_remove',
  CONTENT_TAG: 'content_tag',
  FILE_UPDATE: 'file_update',
  FILE_REMOVE: 'file_remove',
  FILE_TAG: 'file_tag',
  META_UPDATE: 'meta_update',
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
  STATUS_RELEASE_CANDIDATE: 'release candidate',
  STATUS_RELEASE: 'release',
};

export const DELIVERY_CLONE = 'clone';
export const DELIVERY_REFERENCE = 'reference';

export const TAG = {
  CLONE: 'cloneFrom',
  COPY: 'copyFrom',
  RESOURCE_GROUP: 'resourceGroup',
  RESOURCE_CONFIG: 'resourceConfig',
  DELIVERY_CLONE: 'clone',
  DELIVERY_REFERENCE: 'reference',
};

export const CONT_STORE = 'store';

export const RESPONSE_LEVEL = {
  SUCCESS: 200,
  DOWNLOAD: 210,
  WARNING: 400,
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

export const METHOD = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
};
