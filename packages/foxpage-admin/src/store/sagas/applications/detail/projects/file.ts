import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/projects/file';
import * as AUTH_API from '@/apis/authorize';
import { addBlock, updateBlock } from '@/apis/builder/block';
import * as API from '@/apis/project';
import { defaultSuffix, FileType } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationProjectsFileActionType } from '@/reducers/applications/detail/projects/file';
import { fetchScreenshots } from '@/store/actions/screenshot';
import { store } from '@/store/index';
import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeQueryParams,
  AuthorizeUserFetchParams,
  ParentFileFetchParams,
  ProjectFileDeleteParams,
  ProjectFileFetchParams,
  ProjectFileSaveParams,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchList(action: ApplicationProjectsFileActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: ProjectFileFetchParams };
  const res = yield call(API.getProjectFiles, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushFileList(res.data.files, res.pageInfo));
    yield put(
      fetchScreenshots({
        applicationId: params.applicationId,
        type: 'file',
        typeIds: res.data.files.map((item) => item.id),
      }),
    );
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveFile(action: ApplicationProjectsFileActionType) {
  yield put(ACTIONS.updateSaveLoading(true));

  const { params, cb } = action.payload as { params: ProjectFileSaveParams; cb?: () => void };
  const { folderId, applicationId, name } = params;
  const { editFile, pageInfo } = store.getState().applications.detail.projects.file;
  const apis = {
    [FileType.page]: [API.updatePage, API.addPage],
    [FileType.template]: [API.updateTemplate, API.addTemplate],
    [FileType.block]: [updateBlock, addBlock],
  };

  const api: any = editFile.id ? apis[editFile.type][0] : apis[editFile.type][1];

  const res = yield call(api, {
    id: editFile.id,
    name: name || editFile.name,
    folderId,
    applicationId,
    tags: editFile.tags,
    suffix: editFile.suffix || (defaultSuffix[editFile.type] as string),
  });

  if (res.code === 200) {
    yield put(ACTIONS.openEditDrawer(false));

    yield put(
      ACTIONS.fetchFileList({
        ...pageInfo,
        search: '',
        id: folderId,
        applicationId,
      }),
    );

    if (typeof cb === 'function') cb();
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();

    errorToast(res, res?.msg || saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleDeleteFile(action: ApplicationProjectsFileActionType) {
  const { params, cb } = action.payload as { params: ProjectFileDeleteParams; cb?: () => void };
  const { pageInfo } = store.getState().applications.detail.projects.file;
  const { fileDetail } = store.getState().applications.detail.projects.content;
  const apiMap = {
    [FileType.block]: API.deleteBlock,
    [FileType.page]: API.deletePage,
    [FileType.template]: API.deleteTemplate,
  };
  const api = apiMap[fileDetail.type];
  const { id, applicationId, folderId } = params;
  const res = yield call(api, {
    id,
    applicationId,
    status: true,
  });

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    yield put(
      ACTIONS.fetchFileList({
        ...pageInfo,
        search: '',
        id: folderId,
        applicationId,
      }),
    );

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, deleteFailed);
  }
}

function* handleFetchParentFiles(action: ApplicationProjectsFileActionType) {
  const { params, cb } = action.payload as { params: ParentFileFetchParams; cb?: (folder) => void };
  const res = yield call(API.fetchParentFiles, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushParentFiles(res.data));

    if (typeof cb === 'function') cb(res.data?.[0]);
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* handleFetchAuthList(action: ApplicationProjectsFileActionType) {
  yield put(ACTIONS.updateAuthListLoading(true));

  const { params } = action.payload as { params: AuthorizeListFetchParams };
  const res = yield call(AUTH_API.authorizeFetch, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushAuthList(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateAuthListLoading(false));
}

function* handleCheckAuthRole(action: ApplicationProjectsFileActionType) {
  const { params, cb } = action.payload as { params: AuthorizeQueryParams; cb?: (role) => void };
  const res = yield call(AUTH_API.authorizeCheck, params);

  if (res.code === 200) {
    if (typeof cb === 'function') cb(res.data.mask);
  } else {
    const {
      global: { searchFailed },
    } = getBusinessI18n();

    errorToast(res, searchFailed);
  }
}

function* handleSaveAuth(action: ApplicationProjectsFileActionType) {
  const { params, cb } = action.payload as { params: AuthorizeAddParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeAdd, params);

  if (res.code === 200) {
    if (typeof cb === 'function') {
      cb();
    }
  } else {
    const {
      global: { addFailed },
    } = getBusinessI18n();

    errorToast(res, addFailed);
  }
}

function* handleDeleteAuth(action: ApplicationProjectsFileActionType) {
  const { params, cb } = action.payload as { params: AuthorizeDeleteParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeDelete, params);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') {
      cb();
    }
  } else {
    errorToast(res, deleteFailed);
  }
}

function* handleFetchAuthUserList(action: ApplicationProjectsFileActionType) {
  const { params, cb } = action.payload as { params: AuthorizeUserFetchParams; cb?: (userList) => void };
  const res = yield call(AUTH_API.authorizeUserFetch, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushUserList(res.data || []));

    if (typeof cb === 'function') cb(res.data);
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchFileList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveFile), handleSaveFile);
  yield takeLatest(getType(ACTIONS.deleteFile), handleDeleteFile);
  yield takeLatest(getType(ACTIONS.fetchParentFiles), handleFetchParentFiles);
  yield takeLatest(getType(ACTIONS.checkAuthRole), handleCheckAuthRole);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleFetchAuthList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleFetchAuthUserList);
  yield takeLatest(getType(ACTIONS.saveAuthUser), handleSaveAuth);
  yield takeLatest(getType(ACTIONS.deleteAuthUser), handleDeleteAuth);
}

export default function* rootSaga() {
  yield all([watch()]);
}
