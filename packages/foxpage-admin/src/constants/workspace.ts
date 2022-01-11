export const dynamicType = {
  put: 'modify',
  post: 'add',
  delete: 'delete',
};

export enum DynamicDataTypeEnum {
  application = 'application',
  project = 'project',
  page = 'page',
  template = 'template',
  function = 'function',
  condition = 'condition',
  variable = 'variable',
  team = 'team',
  organization = 'organization',
  component = 'component',
  resource = 'resource',
}

export enum DynamicDataLevelEnum {
  application = 'application',
  folder = 'folder',
  file = 'file',
  content = 'content',
  version = 'version',
}
