export enum DynamicOperationEnum {
  create = 'create',
  update = 'update',
  delete = 'delete',
  live = 'live',
  publish = 'publish',
  set = 'set',
  clone = 'clone',
}

export enum DynamicOperationTargetEnum {
  application = 'application',
  project = 'project',
  page = 'page',
  content = 'content',
  block = 'block',
  template = 'template',
  function = 'function',
  condition = 'condition',
  variable = 'variable',
  component = 'component',
  folder = 'folder',
  resource = 'resource',
}

export enum DynamicContentType {
  version = 'version',
  file = 'file',
}
