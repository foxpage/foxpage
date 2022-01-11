import { message } from 'antd';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/resource/detail';
import * as API from '@/apis/group/application/resource';
import { AppResourceDetailActionType } from '@/store/reducers/group/application/resource/detail';
import {
  AppResourcesDetailsAddFileParams,
  AppResourcesDetailsAddFolderParams,
  AppResourcesDetailsFetchGroupInfoParams,
  AppResourcesDetailsFetchResourcesListParams,
  AppResourcesDetailsRemoveResourcesParams,
  AppResourcesDetailsUpdateFileParams,
  AppResourcesDetailsUpdateFolderParams,
} from '@/types/application';
import { OptionsAction } from '@/types/common';

function* addResourceFile(action: AppResourceDetailActionType) {
  const { params, options } = action.payload as {
    params: AppResourcesDetailsAddFileParams;
    options?: OptionsAction;
  };
  const { applicationId, curFolderId, filepath } = params || {};
  const { onSuccess } = options || {};
  if (!applicationId || !curFolderId || !filepath) {
    message.error('Add file fail: params is not valid.');
    console.error('[error]: Add file fail: params is not valid,', params);
    return;
  }
  const rs = yield call(API.postResourcesContents, {
    applicationId,
    folderId: curFolderId,
    content: {
      realPath: filepath,
    },
  });
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    message.success('Add succeed.');
    yield put(ACTIONS.fetchResourcesListAction({}));
  } else {
    message.error(rs.msg || 'Add file fail...');
  }
}

function* updateResourceFile(action: AppResourceDetailActionType) {
  const { params, options } = action.payload as {
    params: AppResourcesDetailsUpdateFileParams;
    options?: OptionsAction;
  };
  const { applicationId, fileId, filepath } = params || {};
  const { onSuccess } = options || {};
  if (!applicationId || !fileId || !filepath) {
    message.error('Update file fail: params is not valid.');
    console.error('[error]: Update file fail: params is not valid', params);
    return;
  }
  const rs = yield call(API.putResourcesContents, {
    applicationId,
    id: fileId,
    content: {
      realPath: filepath,
    },
  });
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    message.success('Update succeed.');
    yield put(ACTIONS.fetchResourcesListAction({}));
  } else {
    message.error(rs.msg || 'Add file fail...');
  }
}

function* addResourceFolder(action: AppResourceDetailActionType) {
  const { params, options } = action.payload as {
    params: AppResourcesDetailsAddFolderParams;
    options?: OptionsAction;
  };
  const { applicationId, curFolderId, name } = params || {};
  const { onSuccess } = options || {};
  if (!applicationId || !curFolderId || !name) {
    message.error('Add folder fail: params is not valid.');
    console.error('[error]: Add folder fail: params is not valid', params);
    return;
  }
  const rs = yield call(API.postResourcesFolders, {
    applicationId,
    parentFolderId: curFolderId,
    name,
  });
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    message.success('Add succeed.');
    yield put(ACTIONS.fetchResourcesListAction({}));
  } else {
    message.error(rs.msg || 'Save failed');
  }
}

function* updateResourceFolder(action: AppResourceDetailActionType) {
  const { params, options } = action.payload as {
    params: AppResourcesDetailsUpdateFolderParams;
    options?: OptionsAction;
  };
  const { applicationId, folderId, name } = params || {};
  const { onSuccess } = options || {};
  if (!applicationId || !folderId || !name) {
    message.error('Update folder fail: params is not valid.');
    console.error('[error]: Update folder fail: params is not valid', params);
    return;
  }
  const rs = yield call(API.putResourcesFolders, {
    applicationId,
    id: folderId,
    name,
  });
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    message.success('Edit succeed.');
    yield put(ACTIONS.fetchResourcesListAction({}));
  } else {
    message.error(rs.msg || 'Save failed');
  }
}

function* removeResources(action: AppResourceDetailActionType) {
  const { params } = action.payload as {
    params: AppResourcesDetailsRemoveResourcesParams;
    options?: OptionsAction;
  };
  const { applicationId, selectedRowKeys = [] } = params || {};
  if (!applicationId || !selectedRowKeys || !(selectedRowKeys.length > 0)) {
    message.error('Remove resource fail: params is not valid.');
    console.error('[error]: Remove resource fail: params is not valid', params);
    return;
  }
  const rs = yield call(API.putResourcesStatus, {
    applicationId,
    ids: selectedRowKeys,
    status: true,
  });
  if (rs.code === 200) {
    message.success('Remove succeed.');
    yield put(
      ACTIONS.updateResourcesDetailState({
        selectedRowKeys: [],
      }),
    );
    yield put(ACTIONS.fetchResourcesListAction({}));
  } else {
    message.error(rs.msg || 'Save failed');
  }
}

function* fetchResourceData(action: AppResourceDetailActionType) {
  const { params } = action.payload as {
    params: AppResourcesDetailsFetchResourcesListParams;
    options?: OptionsAction;
  };
  const { appId, folderPath } = params;
  const { applicationId, folderPath: _folderPath } = yield select(store => store.group.application.resource.detail);
  yield put(
    ACTIONS.updateResourcesDetailState({
      resLoading: true,
    }),
  );
  const rs = yield call(API.getResourcesByPaths, {
    applicationId: appId || applicationId,
    path: folderPath || _folderPath,
    depth: 1,
  });
  if (rs.code === 200) {
    const resourceRootInfo = rs.data || {};
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
    message.error(rs.msg || 'Save failed');
  }
}

function* fetchGroupInfo(action: AppResourceDetailActionType) {
  const { params } = action.payload as {
    params: AppResourcesDetailsFetchGroupInfoParams;
    options?: OptionsAction;
  };
  const { applicationId, path } = params;
  const rs = yield call(API.getResourcesGroups, {
    applicationId,
    path,
  });
  if (rs.code === 200) {
    const groupInfo = rs.data || {};
    yield put(
      ACTIONS.updateResourcesDetailState({
        groupInfo,
      }),
    );
  } else {
    message.error(rs.msg || 'Save failed');
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.addFileAction), addResourceFile);
  yield takeLatest(getType(ACTIONS.updateFileAction), updateResourceFile);
  yield takeLatest(getType(ACTIONS.addFolderAction), addResourceFolder);
  yield takeLatest(getType(ACTIONS.updateFolderAction), updateResourceFolder);
  yield takeLatest(getType(ACTIONS.removeResourcesAction), removeResources);
  yield takeLatest(getType(ACTIONS.fetchResourcesListAction), fetchResourceData);
  yield takeLatest(getType(ACTIONS.fetchGroupInfoAction), fetchGroupInfo);
}

export default function* rootSaga() {
  yield all([watch()]);
}
