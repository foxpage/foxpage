import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/list';
import * as API from '@/apis/application';
import * as AUTH_API from '@/apis/authorize';
import * as PROJECT_API from '@/apis/project';
import { defaultSuffix } from '@/constants/file';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationPageActionType } from '@/reducers/applications/detail/file/pages/list';
import { store } from '@/store/index';
import {
  ApplicationFileListFetchParams,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeQueryParams,
  AuthorizeUserFetchParams,
  ProjectFileDeleteParams,
  ProjectFileSaveParams,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* fetchApplicationPages(action: ApplicationPageActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId, page, size, search } = action.payload as ApplicationFileListFetchParams;
  const res = yield call(API.fetchApplicationPages, {
    applicationId,
    page,
    size,
    search: search || '',
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushApplicationPages(res.data || [], res.pageInfo));
  } else {
    const {
      file: { fetchPageListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchPageListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSavePage(action: ApplicationPageActionType) {
  yield put(ACTIONS.updateSaveLoading(true));

  const { params, cb } = action.payload as { params: ProjectFileSaveParams; cb?: () => void };
  const { folderId, applicationId, name } = params;
  const { editFile, pageInfo } = store.getState().applications.detail.file.pages.list;
  const api: any = PROJECT_API.updatePage;
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
      ACTIONS.fetchApplicationPages({
        ...pageInfo,
        search: '',
        applicationId,
      }),
    );

    if (typeof cb === 'function') cb();
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleDeletePage(action: ApplicationPageActionType) {
  const { params, cb } = action.payload as { params: ProjectFileDeleteParams; cb?: () => void };
  const { id, applicationId } = params;
  const res = yield call(PROJECT_API.deletePage, {
    id,
    applicationId,
    status: true,
  });

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    const { pageInfo } = store.getState().applications.detail.file.pages.list;
    yield put(
      ACTIONS.fetchApplicationPages({
        ...pageInfo,
        search: '',
        applicationId,
      }),
    );

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, deleteFailed);
  }
}

function* handleFetchAuthList(action: ApplicationPageActionType) {
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

function* handleCheckAuthRole(action: ApplicationPageActionType) {
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

function* handleSaveAuth(action: ApplicationPageActionType) {
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

function* handleDeleteAuth(action: ApplicationPageActionType) {
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

function* handleFetchAuthUserList(action: ApplicationPageActionType) {
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
  yield takeLatest(getType(ACTIONS.fetchApplicationPages), fetchApplicationPages);
  yield takeLatest(getType(ACTIONS.saveFile), handleSavePage);
  yield takeLatest(getType(ACTIONS.deleteFile), handleDeletePage);
  yield takeLatest(getType(ACTIONS.checkAuthRole), handleCheckAuthRole);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleFetchAuthList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleFetchAuthUserList);
  yield takeLatest(getType(ACTIONS.saveAuthUser), handleSaveAuth);
  yield takeLatest(getType(ACTIONS.deleteAuthUser), handleDeleteAuth);
}

export default function* rootSaga() {
  yield all([watch()]);
}
