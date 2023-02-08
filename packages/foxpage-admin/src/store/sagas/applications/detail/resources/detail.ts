import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/resources/detail';
import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationResourceDetailActionType } from '@/reducers/applications/detail/resources/detail';
import { store } from '@/store/index';
import {
  AppResourcesDetailsAddFileParams,
  AppResourcesDetailsAddFolderParams,
  AppResourcesDetailsFetchGroupInfoParams,
  AppResourcesDetailsFetchResourcesListParams,
  AppResourcesDetailsRemoveResourcesParams,
  AppResourcesDetailsUpdateFileParams,
  AppResourcesDetailsUpdateFolderParams,
  OptionsAction,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* addResourceFile(action: ApplicationResourceDetailActionType) {
  const { params, options } = action.payload as {
    params: AppResourcesDetailsAddFileParams;
    options?: OptionsAction;
  };
  const { applicationId, curFolderId, filepath } = params || {};
  const res = yield call(API.postResourcesContents, {
    applicationId,
    folderId: curFolderId,
    content: {
      realPath: filepath,
    },
  });

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    yield put(ACTIONS.fetchResourcesList({ applicationId }));

    const { onSuccess } = options || {};
    if (typeof onSuccess === 'function') onSuccess();
  } else {
    errorToast(res, saveFailed);
  }
}

function* updateResourceFile(action: ApplicationResourceDetailActionType) {
  const { params, options } = action.payload as {
    params: AppResourcesDetailsUpdateFileParams;
    options?: OptionsAction;
  };
  const { applicationId, fileId, filepath } = params || {};
  const res = yield call(API.putResourcesContents, {
    applicationId,
    id: fileId,
    content: {
      realPath: filepath,
    },
  });

  const {
    global: { updateSuccess, updateFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(updateSuccess);

    yield put(ACTIONS.fetchResourcesList({ applicationId }));

    const { onSuccess } = options || {};
    if (typeof onSuccess === 'function') onSuccess();
  } else {
    errorToast(res, updateFailed);
  }
}

function* addResourceFolder(action: ApplicationResourceDetailActionType) {
  const { params, options } = action.payload as {
    params: AppResourcesDetailsAddFolderParams;
    options?: OptionsAction;
  };
  const { applicationId, curFolderId, name } = params || {};
  const res = yield call(API.postResourcesFolders, {
    applicationId,
    parentFolderId: curFolderId,
    name,
  });

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    yield put(ACTIONS.fetchResourcesList({ applicationId }));

    const { onSuccess } = options || {};
    if (typeof onSuccess === 'function') onSuccess();
  } else {
    errorToast(res, saveFailed);
  }
}

function* updateResourceFolder(action: ApplicationResourceDetailActionType) {
  const { params, options } = action.payload as {
    params: AppResourcesDetailsUpdateFolderParams;
    options?: OptionsAction;
  };
  const { applicationId, folderId, name } = params || {};
  const res = yield call(API.putResourcesFolders, {
    applicationId,
    id: folderId,
    name,
  });

  const {
    global: { updateSuccess, updateFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(updateSuccess);

    yield put(ACTIONS.fetchResourcesList({ applicationId }));

    const { onSuccess } = options || {};
    if (typeof onSuccess === 'function') onSuccess();
  } else {
    errorToast(res, updateFailed);
  }
}

function* removeResources(action: ApplicationResourceDetailActionType) {
  const { params } = action.payload as {
    params: AppResourcesDetailsRemoveResourcesParams;
  };
  const res = yield call(API.putResourcesStatus, {
    ...params,
    status: true,
  });

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    // clear selected key
    yield put(ACTIONS.updateSelectedRowKeys([]));

    yield put(ACTIONS.fetchResourcesList({ applicationId: params.applicationId }));
  } else {
    errorToast(res, deleteFailed);
  }
}

function* fetchResourceData(action: ApplicationResourceDetailActionType) {
  yield put(
    ACTIONS.updateResourcesDetailState({
      resLoading: true,
    }),
  );

  const { params } = action.payload as {
    params: AppResourcesDetailsFetchResourcesListParams;
  };
  const { applicationId, folderPath } = params;
  const { applicationId: _applicationId, folderPath: _folderPath } =
    store.getState().applications.detail.resources.detail;
  const res = yield call(API.getResourcesByPaths, {
    applicationId: applicationId || _applicationId,
    path: folderPath || _folderPath,
    depth: 1,
  });

  if (res.code === 200) {
    const resourceRootInfo = res.data || {};
    const { folders = [], files = [] } = resourceRootInfo.children || {};
    const resourceList = [
      ...folders.map((item: any = {}) => {
        item.key = item.key || item.id;
        item.__type = 'folder';
        delete item.children;
        return item;
      }),
      ...files.map((item: any = {}) => {
        item.key = item.key || item.id;
        item.__type = 'file';
        delete item.children;
        return item;
      }),
    ];
    delete resourceRootInfo.children;

    yield put(
      ACTIONS.updateResourcesDetailState({
        resLoading: false,
        resourceRootInfo,
        resourceList,
      }),
    );
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();

    errorToast(res, saveFailed);
  }
}

function* fetchGroupInfo(action: ApplicationResourceDetailActionType) {
  const { params } = action.payload as {
    params: AppResourcesDetailsFetchGroupInfoParams;
  };
  const res = yield call(API.getResourcesGroups, params);

  if (res.code === 200) {
    const groupInfo = res.data || {};
    yield put(
      ACTIONS.updateResourcesDetailState({
        groupInfo,
      }),
    );
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();

    errorToast(res, saveFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.addFile), addResourceFile);
  yield takeLatest(getType(ACTIONS.updateFile), updateResourceFile);
  yield takeLatest(getType(ACTIONS.addFolder), addResourceFolder);
  yield takeLatest(getType(ACTIONS.updateFolder), updateResourceFolder);
  yield takeLatest(getType(ACTIONS.removeResources), removeResources);
  yield takeLatest(getType(ACTIONS.fetchResourcesList), fetchResourceData);
  yield takeLatest(getType(ACTIONS.fetchGroupInfo), fetchGroupInfo);
}

export default function* rootSaga() {
  yield all([watch()]);
}
