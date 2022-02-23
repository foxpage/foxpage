import _ from 'lodash';

import { FoxpageComponentType, loader } from '@foxpage/foxpage-js-sdk';
import { BrowserModule } from '@foxpage/foxpage-types';

import { ComponentSourceMapType, ComponentSourceType, ComponentStructure } from '../interface';

const loadedComponent: Record<string, FoxpageComponentType> = {};
/**
 * filter duplicates
 * @param {*} list component list
 */
const removeDuplicates = (list: Array<ComponentStructure>) => {
  const typeVersionStrs: Array<string> = [];
  return list.filter(item => {
    const { name, version } = item;
    const typeVersionStr = name + version;
    if (typeVersionStrs.indexOf(typeVersionStr) === -1) {
      typeVersionStrs.push(typeVersionStr);
      return item;
    }
    return null;
  });
};

export const getComponentList = (renderStructure: ComponentStructure[]) => {
  let list: ComponentStructure[] = [];
  renderStructure?.forEach((treeItem: ComponentStructure) => {
    if (treeItem.children && treeItem.children.length > 0) {
      list = list.concat(getComponentList(treeItem.children));
    }
    if (treeItem.name) {
      list.push(treeItem);
    }
  });
  return list;
};

/**
 * 组件content
 * @param component
 * @returns
 */
const getContent = (component: ComponentStructure, componentSource: ComponentSourceMapType) => {
  const content = !component.version
    ? componentSource[component.name]
    : componentSource[`${component.name}@${component.version}`];
  return content;
};

/**
 * 递归push 依赖
 * @param loaderConfig
 * @param component
 */
const pushDependencyToConfig = (loaderConfig: BrowserModule[], component, componentSource) => {
  if (component.name) {
    const content = getContent(component, componentSource);
    const componentResource = content?.resource;
    if (componentResource) {
      pushToConfig(loaderConfig, component, componentResource);
    }
    componentResource?.dependencies.forEach(item => {
      pushDependencyToConfig(loaderConfig, item, componentSource);
    });
  }
};

const pushToConfig = (loaderConfig: BrowserModule[], component, componentResource: ComponentSourceType) => {
  const entrySource = componentResource.entry;
  if (!loaderConfig.find(item => item.name === component.name) && entrySource?.browser) {
    const { path, host } = entrySource.browser;
    const meta = _.cloneDeep(component.meta);
    if (entrySource.css) {
      const { path: cssPath, host: cssHost } = entrySource.css;
      if (cssPath && cssHost) {
        meta.assets = [{ url: cssHost + cssPath }];
      }
    }

    if (host && path) {
      loaderConfig.push({
        name: component.name,
        url: host + path,
        meta,
        version: '',
        deps: componentResource.dependencies?.filter(item => !!item.name).map(item => item.name) || [],
      });
    }
  }
};

/**
 * get load config
 * @param needLoadComponents component list
 * @returns BrowserModule array
 */
const getComponentLoaderConfig = (
  needLoadComponents: Array<ComponentStructure>,
  componentSource: ComponentSourceMapType,
): Array<BrowserModule> => {
  const loaderConfig: BrowserModule[] = [];

  needLoadComponents.forEach(component => {
    const content = getContent(component, componentSource);
    const componentResource = content?.resource;
    if (componentResource) {
      //browser
      pushToConfig(loaderConfig, component, componentResource);

      // dependencies
      componentResource.dependencies.forEach(item => {
        pushDependencyToConfig(loaderConfig, item, componentSource);
      });

      //editor
      const editorEntrySource = componentResource['editor-entry'];
      editorEntrySource?.forEach(editor => {
        const editorContent = !editor.version
          ? componentSource[editor.name]
          : componentSource[`${editor.name}@${editor.version}`];
        const editorSource = editorContent?.resource;
        if (editorSource) {
          pushToConfig(loaderConfig, editor, editorSource);
        }
      });
    }
  });
  return loaderConfig;
};

const loadFramework = () => {
  const frameworkResources = {
    requirejsLink: 'https://www.unpkg.com/requirejs@2.3.6/require.js',
    libs: {
      react: {
        url: 'https://www.unpkg.com/react@16.14.0/umd/react.development.js',
        injectWindow: 'React',
        umdModuleName: 'react',
      },
      'react-dom': {
        url: 'https://www.unpkg.com/react-dom@16.14.0/umd/react-dom.development.js',
        injectWindow: 'ReactDOM',
        umdModuleName: 'react-dom',
      },
    },
    win: window,
  };
  return loader.initFramework(frameworkResources);
};

/**
 * load component
 * @param needLoadComponents  component list
 * @returns load result
 */
const load = async (needLoadComponents: Array<ComponentStructure>, config: Array<BrowserModule>) => {
  const promise: Array<Promise<FoxpageComponentType>> = [];
  const keys: string[] = [];
  const noResourceComponentName: string[] = [];

  needLoadComponents.forEach(component => {
    if (!config.find(item => item.name === component.name)) {
      noResourceComponentName.push(component.name);
    } else if (!loadedComponent[component.name]) {
      keys.push(component.name);
      promise.push(loader.loadComponent(component.name, ''));
    }

    const editorEntry = component.resource?.['editor-entry'] || [];
    if (editorEntry.length > 0 && editorEntry[0].name) {
      const name = editorEntry[0].name;
      const componentConfig = config.find(item => item.name === name);
      if (!componentConfig) {
        noResourceComponentName.push(name);
      } else if (!loadedComponent[name]) {
        promise.push(loader.loadComponent(editorEntry[0].name, ''));
        keys.push(editorEntry[0].name);
      }
    }
  });
  const componentResource = await Promise.all(promise);
  console.log('componentResource=', componentResource);

  return {
    noResourceComponentName,
    componentResource,
    keys,
  };
};

export const loadComponent = async (renderStructure: ComponentStructure[], componentSource: ComponentSourceMapType) => {
  const componentList = getComponentList(renderStructure);
  const needLoadComponents = removeDuplicates(componentList);
  await loadFramework();

  const componentLoadConfig = getComponentLoaderConfig(needLoadComponents, componentSource);

  console.log('loadConfig=', componentLoadConfig);
  loader.configComponent(componentLoadConfig);

  const { keys, componentResource, noResourceComponentName } = await load(needLoadComponents, componentLoadConfig);

  keys.forEach((key, index: number) => {
    loadedComponent[key] = componentResource[index];
  });
  return { loadedComponent, noResourceComponentName, componentList };
};
