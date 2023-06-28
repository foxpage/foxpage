import { DynamicOperationEnum } from './workspace';

const FileTypes = Object.freeze([
  {
    label: 'Page',
    type: 'page',
  },
  {
    label: 'Template',
    type: 'template',
  },
  {
    label: 'BLock',
    type: 'block',
  },
]);

const Suffix = Object.freeze([
  {
    label: '.html',
    type: 'html',
  },
]);

const defaultSuffix: any = {
  template: Suffix[0].type,
  page: Suffix[0].type,
};

const suffixTagColor: any = {
  template: '#2db7f5',
  page: '#87d068',
  component: 'magenta',
  editor: 'geekblue',
  block: '#108ee9',
  library: 'gold',
  refer: 'geekblue',
  error: '#ff4d4f',
  post: '#49cc90',
  put: '#fca130',
  delete: '#f50',
};

const dynamicColor: { [key in DynamicOperationEnum]: string } = {
  live: 'green',
  publish: 'green',
  create: 'blue',
  update: 'blue',
  delete: 'red',
  set: 'blue',
};

const componentType = Object.freeze({
  label: 'Component',
  type: 'component',
});

const rootFolderType = {
  project: 'project',
  variable: 'variable',
  condition: 'condition',
  component: 'component',
  resource: 'resource',
};

// FileTagType
enum ResourceTagEnum {
  ResourceGroup = 'resourceGroup',
  ResourceConfig = 'resourceConfig',
}

export {
  componentType,
  defaultSuffix,
  dynamicColor,
  FileTypes,
  ResourceTagEnum,
  rootFolderType,
  Suffix,
  suffixTagColor,
};
