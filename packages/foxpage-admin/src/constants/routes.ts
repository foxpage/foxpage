const ROUTE_FOLDER_MAP = {
  application: '/applications/:applicationId/projects/list',
  projects: '/projects/list',
  personal: '/workspace/projects/personal/list',
  involved: '/workspace/projects/shared/list',
};

const ROUTE_FILE_MAP = {
  application: '/applications/:applicationId/projects/detail',
  projects: '/projects/detail',
  personal: '/workspace/projects/personal/detail',
  involved: '/workspace/projects/shared/detail',
};

const ROUTE_CONTENT_MAP = {
  application: '/applications/:applicationId/projects/content/content',
  projects: '/projects/content',
  personal: '/workspace/projects/personal/content',
  involved: '/workspace/projects/shared/content',
};

const ROUTE_SEARCH_MAP = {
  application: '/applications/:applicationId/projects/search',
  projects: '/projects/search',
  personal: '/workspace/projects/personal/search',
  involved: '/workspace/projects/shared/search',
};

const ROUTE_BUILDER_MAP = {
  application: '/builder',
  projects: '/builder',
  personal: '/builder',
  involved: '/builder',
};

export { ROUTE_BUILDER_MAP, ROUTE_CONTENT_MAP, ROUTE_FILE_MAP, ROUTE_FOLDER_MAP, ROUTE_SEARCH_MAP };
