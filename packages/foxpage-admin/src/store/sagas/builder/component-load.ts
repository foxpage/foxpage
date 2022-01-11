import _ from 'lodash';
import { all, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { FoxpageComponentType, loader } from '@foxpage/foxpage-js-sdk';
import { BrowserModule } from '@foxpage/foxpage-types';

import * as ACTIONS from '@/actions/builder/component-load';
import { ComponentLoadActionType } from '@/reducers/builder/viewer';
import { store } from '@/store/index';
import { ComponentSourceType,ComponentStructure } from '@/types/builder';
import { IWindow } from '@/types/index';

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
      // type : component export name eg. banner-1.0.0
      typeVersionStrs.push(typeVersionStr);
      return item;
    }
    return null;
  });
};

/**
 * 组件content
 * @param component
 * @returns
 */
const getContent = (component: ComponentStructure) => {
  const componentSourceMap = store.getState().builder.template.componentSourceMap;
  const content = !component.version
    ? componentSourceMap[component.name]
    : componentSourceMap[`${component.name}@${component.version}`];
  return content;
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
 * 递归push 依赖
 * @param loaderConfig
 * @param component
 */
const pushDependencyToConfig = (loaderConfig: BrowserModule[], component) => {
  if (component.name) {
    const content = getContent(component);
    const componentResource = content?.resource;
    if (componentResource) {
      pushToConfig(loaderConfig, component, componentResource);
    }
    componentResource?.dependencies.forEach(item => {
      pushDependencyToConfig(loaderConfig, item);
    });
  }
};

/**
 * load framework
 */
function* loadFramework(win: IWindow) {
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
    win,
  };
  yield loader.initFramework(frameworkResources);
}

/**
 * get load config
 * @param needLoadComponents component list
 * @returns BrowserModule array
 */
const getComponentLoaderConfig = (needLoadComponents: Array<ComponentStructure>): Array<BrowserModule> => {
  const loaderConfig: BrowserModule[] = [];

  const componentSourceMap = store.getState().builder.template.componentSourceMap;

  needLoadComponents.forEach(component => {
    const content = getContent(component);
    const componentResource = content?.resource;
    if (componentResource) {
      //browser
      pushToConfig(loaderConfig, component, componentResource);

      // dependencies
      componentResource.dependencies.forEach(item => {
        pushDependencyToConfig(loaderConfig, item);
      });

      //editor
      const editorEntrySource = componentResource['editor-entry'];
      editorEntrySource?.forEach(editor => {
        const editorContent = !editor.version
          ? componentSourceMap[editor.name]
          : componentSourceMap[`${editor.name}@${editor.version}`];
        const editorSource = editorContent?.resource;
        if (editorSource) {
          pushToConfig(loaderConfig, editor, editorSource);
        }
      });
    }
  });
  return loaderConfig;
};

/**
 * load component
 * @param needLoadComponents  component list
 * @returns load result
 */
function* load(needLoadComponents: Array<ComponentStructure>, config: Array<BrowserModule>) {
  const { loadedComponent } = store.getState().builder.viewer;
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
  yield put(ACTIONS.pushNoResourceComponentName(noResourceComponentName));
  const componentResource = yield all(promise);
  console.log('componentResource=', componentResource);

  return {
    componentResource,
    keys,
  };
}

/**
 * load
 * @param action action
 */
function* handleLoadComponent(action: ComponentLoadActionType) {
  const state = store.getState().builder;
  const { win } = action.payload as { win: IWindow };

  const componentList = state.template.parsedComponentList;
  const needLoadComponents = removeDuplicates(componentList);

  yield put(ACTIONS.updateLoadingStatus(true));

  yield loadFramework(win);

  const componentLoadConfig = getComponentLoaderConfig(needLoadComponents);
  console.log('loadConfig=', componentLoadConfig);
  loader.configComponent(componentLoadConfig);

  // if (typeof win.define === 'function') {
  // win.define('react', window.React);
  // win.define('antd', require('antd'));
  // win.define('react-dom', window.ReactDOM);
  // }

  const { keys, componentResource } = yield load(needLoadComponents, componentLoadConfig);

  yield put(ACTIONS.pushLoadedResource(componentResource, keys));

  yield put(ACTIONS.updateLoadingStatus(false));
  yield put(ACTIONS.updateRequireLoadStatus(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.loadComponent), handleLoadComponent);
}

export default function* rootSaga() {
  yield all([watch()]);
}
