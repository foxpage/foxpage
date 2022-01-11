const FileTypes = Object.freeze([
  {
    label: 'Page',
    type: 'page',
  },
  {
    label: 'Template',
    type: 'template',
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
  library: 'gold',
  refer: 'red',
  post: '#49cc90',
  put: '#fca130',
  delete: '#f50',
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

export { componentType, defaultSuffix, FileTypes, rootFolderType,Suffix, suffixTagColor };
