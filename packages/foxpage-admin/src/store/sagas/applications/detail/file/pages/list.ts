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
  AuthorizeUserFetchParams,
  ProjectFileDeleteParams,
  ProjectFileSaveParams,
} from '@/types/index';

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

    message.error(res.msg || fetchPageListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSavePage(action: ApplicationPageActionType) {
  yield put(ACTIONS.updateSaveLoading(true));

  const { folderId, applicationId } = action.payload as ProjectFileSaveParams;
  const { editFile, pageInfo } = store.getState().applications.detail.file.pages.list;
  const api: any = PROJECT_API.updatePage;
  const rs = yield call(api, {
    id: editFile.id,
    name: editFile.name,
    folderId,
    applicationId,
    tags: editFile.tags,
    suffix: editFile.suffix || (defaultSuffix[editFile.type] as string),
  });

  if (rs.code === 200) {
    yield put(ACTIONS.openEditDrawer(false));

    yield put(
      ACTIONS.fetchApplicationPages({
        ...pageInfo,
        search: '',
        applicationId,
      }),
    );
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(rs.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleDeletePage(action: ApplicationPageActionType) {
  const { id, applicationId } = action.payload as ProjectFileDeleteParams;
  const rs = yield call(PROJECT_API.deleteFile, {
    id,
    applicationId,
    status: true,
  });

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (rs.code === 200) {
    message.success(deleteSuccess);

    const { pageInfo } = store.getState().applications.detail.file.pages.list;
    yield put(
      ACTIONS.fetchApplicationPages({
        ...pageInfo,
        search: '',
        applicationId,
      }),
    );
  } else {
    message.error(rs.msg || deleteFailed);
  }
}

function* handleFetchAuthList(action: ApplicationPageActionType) {
  yield put(ACTIONS.updateAuthListLoading(true));

  const { params } = action.payload as { params: AuthorizeListFetchParams };
  const rs = yield call(AUTH_API.authorizeFetch, params);

  if (rs.code === 200) {
    yield put(ACTIONS.pushAuthList(rs.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(rs.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateAuthListLoading(false));
}

function* handleSaveAuth(action: ApplicationPageActionType) {
  const { params, cb } = action.payload as { params: AuthorizeAddParams; cb: () => void };
  const rs = yield call(AUTH_API.authorizeAdd, params);

  if (rs.code === 200) {
    if (typeof cb === 'function') {
      cb();
    }
  } else {
    const {
      global: { addFailed },
    } = getBusinessI18n();

    message.error(rs.msg || addFailed);
  }
}

function* handleDeleteAuth(action: ApplicationPageActionType) {
  const { params, cb } = action.payload as { params: AuthorizeDeleteParams; cb: () => void };
  const rs = yield call(AUTH_API.authorizeDelete, params);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (rs.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') {
      cb();
    }
  } else {
    message.error(rs.msg || deleteFailed);
  }
}

function* handleFetchAuthUserList(action: ApplicationPageActionType) {
  const { params } = action.payload as { params: AuthorizeUserFetchParams };
  const rs = yield call(AUTH_API.authorizeUserFetch, params);

  if (rs.code === 200) {
    yield put(ACTIONS.pushUserList(rs.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(rs.msg || fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApplicationPages), fetchApplicationPages);
  yield takeLatest(getType(ACTIONS.saveFile), handleSavePage);
  yield takeLatest(getType(ACTIONS.deleteFile), handleDeletePage);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleFetchAuthList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleFetchAuthUserList);
  yield takeLatest(getType(ACTIONS.saveAuthUser), handleSaveAuth);
  yield takeLatest(getType(ACTIONS.deleteAuthUser), handleDeleteAuth);
}

export default function* rootSaga() {
  yield all([watch()]);
}
