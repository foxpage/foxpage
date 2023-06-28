import { message } from 'antd';
import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/fast';
import * as LIST_ACTIONS from '@/actions/applications/detail/packages/list';
import * as API from '@/apis/application';
import { ComponentType } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationPackagesFastActionType } from '@/reducers/applications/detail/packages/fast';
import { store } from '@/store/index';
import {
  ComponentRemote,
  ComponentRemoteSaveParams,
  EditorBatchPublishParams,
  EditorComponent,
  EditorComponentSavedRes,
  EditorComponentSaveParams,
  RemoteComponentFetchParams,
  RemoteComponentItem,
  RemoteResourceSavedData,
  RemoteResourceSavedRes,
  RemoteResourceSaveParams,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchPackages(action: ApplicationPackagesFastActionType) {
  yield put(ACTIONS.updateLoading(true));

  const params = action.payload as RemoteComponentFetchParams;
  const res = yield call(API.fetchRemoteComponents, params);

  if (res.code === 200 && res.data) {
    const { data = [], pageInfo } = res;
    yield put(ACTIONS.pushPackages(data, pageInfo));
  } else {
    const {
      component: { fetchUpdateInfoFailed },
    } = getBusinessI18n();

    errorToast(res, fetchUpdateInfoFailed);
  }
  yield put(ACTIONS.updateLoading(false));
}

export const initEntry = (prefix: string, path: string) => {
  return { contentId: '', path: prefix + path };
};

type Changes = Record<string, Record<string, string>>;

const initEditorComponent = (name: string, groupId: string, contentId?: string) => {
  return {
    name,
    groupId,
    component: {
      content: {
        resource: {
          entry: {
            browser: contentId, // ugly design
          },
        },
        meta: {},
        schema: {},
      },
    },
  } as EditorComponent;
};

const editorWrapper = (
  components: RemoteComponentItem[],
  savedResources: RemoteResourceSavedData = {},
  groupId: string,
) => {
  const editors: EditorComponent[] = [];
  components.forEach((item) => {
    const { components } = item;
    if (components[0]) {
      const { resource, component } = components[0];
      const componentName = resource.resourceName;
      const contentId = savedResources[componentName]?.umd['editor.js'];
      const value = contentId ? contentId : component?.content?.resource?.entry?.editor?.path;
      if (value) {
        const editor = initEditorComponent(`${resource.name}_editor`, groupId, value);
        editors.push(editor);
      }
    }
  });
  return editors;
};

const componentWrapper = (
  components: RemoteComponentItem[] = [],
  changes: Changes,
  editors: Record<string, { id: string; version?: string }> = {},
) => {
  return components.map((item) => {
    const { components = [], lastVersion } = item;
    const savedComponent = _.cloneDeep<ComponentRemote>(components[0]);
    const { component, resource, componentType } = savedComponent || {};
    const content = component?.content || {};
    const componentResource = content.resource || {};
    const entry = componentResource.entry;
    const { groupName, version, resourceName, name } = resource || {};
    const prefix = `${groupName}/${resourceName}/${version}/`;
    const values = changes[name] || {};
    if (values.browser) {
      entry.browser = initEntry(prefix, values.browser);
    }
    if (values.debug) {
      entry.debug = initEntry(prefix, values.debug);
    }
    if (values.node) {
      entry.node = initEntry(prefix, values.node);
    }
    if (values.css) {
      entry.css = initEntry(prefix, values.css);
    }
    delete entry.editor;

    // deal with editor
    const editorName = `${name}_editor`;
    const editor = editors[editorName];
    if (editor) {
      componentResource['editor-entry'] = [{ id: editor.id, name: editorName }];
    }

    // deal with lastVersion
    if (lastVersion) {
      content.meta = lastVersion.content.meta;
      componentResource.dependencies = lastVersion.content.resource.dependencies;
      component.content = { ...lastVersion.content, ...content };
    }

    if (!componentType) {
      savedComponent.componentType = ComponentType.reactComponent;
    }

    return savedComponent;
  });
};

function* handleSaveResource(params: RemoteResourceSaveParams) {
  const res: RemoteResourceSavedRes = yield call(API.saveResourceBatch, params);

  if (res.code === 200) {
    return res.data || {};
  } else {
    const {
      resource: { saveResourceFiled },
    } = getBusinessI18n();

    errorToast(res, saveResourceFiled);
    return null;
  }
}

function* handleSaveEditors(params: EditorComponentSaveParams) {
  const res: EditorComponentSavedRes = yield call(API.saveEditors, params);

  if (res.code === 200) {
    return res.data || {};
  } else {
    const {
      package: { saveComponentFiled },
    } = getBusinessI18n();

    errorToast(res, saveComponentFiled);
    return null;
  }
}

function* handleSaveComponents(params: ComponentRemoteSaveParams) {
  const res = yield call(API.saveComponentRemote, params);

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);
  } else {
    yield put(ACTIONS.updateSaving(false));
    errorToast(res, saveFailed);
  }
}

function* handlePublishEditors(params: EditorBatchPublishParams) {
  const res = yield call(API.batchPublishEditors, params);

  if (res.code === 200) {
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();
    errorToast(res, saveFailed);
  }
}

function* handleSaveChanges(action: ApplicationPackagesFastActionType) {
  yield put(ACTIONS.updateSaving(true));

  const { applicationId, cb } = action.payload as { applicationId: string; cb: () => void };
  const {
    packages = [],
    checkedList = [],
    changes = {},
    groupId,
  } = store.getState().applications.detail.packages.fast;
  const filters = packages.filter(
    (item) => checkedList.findIndex((key) => item.components[0].resource.name === key) > -1,
  );

  // 1: save resource batch
  const needSaveResources = filters.map((item) => item.components[0]?.resource).filter((item) => item.isNew);
  let savedResources = {};
  if (needSaveResources.length > 0) {
    savedResources = yield handleSaveResource({ applicationId, id: groupId, resources: needSaveResources });
  }
  if (!savedResources) {
    return null;
  }

  // 2: save editors
  const editors = editorWrapper(filters, savedResources, groupId);
  let savedEditors = {};
  if (editors.length > 0) {
    savedEditors = yield handleSaveEditors({ applicationId, components: editors });
  }
  if (!savedEditors) {
    return null;
  }

  yield handlePublishEditors({
    applicationId,
    idVersions: Object.values(savedEditors).map((item: any) => ({ id: item.id, version: item.version })),
  });

  // 3: save components
  const data = componentWrapper(filters, changes, savedEditors);
  yield handleSaveComponents({ applicationId, components: data });
  yield put(ACTIONS.updateSaving(false));

  yield put(ACTIONS.updateSelected([]));
  yield put(ACTIONS.clearChanges());

  if (typeof cb === 'function') {
    cb();
  } else {
    const { pageInfo, searchName } = store.getState().applications.detail.packages.fast;
    yield put(
      ACTIONS.fetchPackages({
        applicationId,
        groupId,
        size: pageInfo.size,
        page: pageInfo.page,
        name: searchName,
      }),
    );

    yield put(LIST_ACTIONS.fetchComponentsAction({ applicationId }));
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchPackages), handleFetchPackages);
  yield takeLatest(getType(ACTIONS.saveChanges), handleSaveChanges);
}

export default function* rootSaga() {
  yield all([watch()]);
}
