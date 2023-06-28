import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/applications/list';
import * as API from '@/apis/application';
import * as AUTH_API from '@/apis/authorize';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationsActionType } from '@/reducers/workspace/applications/list';
import { store } from '@/store/index';
import {
  Application,
  ApplicationListFetchParams,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeUserFetchParams,
  ResponseBody,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchList(actions: ApplicationsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = actions.payload as { params: ApplicationListFetchParams };
  const res = yield call(API.fetchList, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushList(res.data || [], res.pageInfo));
  } else {
    const {
      application: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveApp() {
  yield put(ACTIONS.updateSaveLoading(true));

  const { editApp, pageInfo } = store.getState().workspace.applications.list;
  const { organizationId } = store.getState().system.user;
  const res: ResponseBody = yield call(editApp.id ? API.updateApp : API.addApp, {
    organizationId,
    ...editApp,
    applicationId: editApp.id,
  } as Application);

  const {
    global: { saveFailed, saveSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    // close drawer & refresh application list
    yield put(ACTIONS.openEditDrawer(false));

    yield put(
      ACTIONS.fetchList({
        organizationId,
        type: 'user',
        ...pageInfo,
        search: '',
      }),
    );
  } else {
    errorToast(res, saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleDeleteApp(actions: ApplicationsActionType) {
  yield put(ACTIONS.updateSaveLoading(true));

  const { applicationId } = actions.payload as { applicationId: string };
  const res: ResponseBody = yield call(API.deleteApp, applicationId);

  const {
    global: { deleteFailed, deleteSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    // close drawer & refresh application list
    yield put(ACTIONS.openEditDrawer(false));

    const { pageInfo } = store.getState().workspace.applications.list;
    const { organizationId } = store.getState().system.user;

    yield put(
      ACTIONS.fetchList({
        organizationId,
        type: 'user',
        ...pageInfo,
        search: '',
      }),
    );
  } else {
    errorToast(res, deleteFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleAuthFetchList(action: ApplicationsActionType) {
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

function* handleAuthUserFetchList(action: ApplicationsActionType) {
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

function* handleAuthAdd(action: ApplicationsActionType) {
  const { params, cb } = action.payload as { params: AuthorizeAddParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeAdd, params);

  const {
    global: { addFailed, saveSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, addFailed);
  }
}

function* handleAuthDelete(action: ApplicationsActionType) {
  const { params, cb } = action.payload as { params: AuthorizeDeleteParams; cb: () => void };
  const res = yield call(AUTH_API.authorizeDelete, params);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, deleteFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveApp), handleSaveApp);
  yield takeLatest(getType(ACTIONS.deleteApp), handleDeleteApp);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleAuthFetchList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleAuthUserFetchList);
  yield takeLatest(getType(ACTIONS.saveAuthUser), handleAuthAdd);
  yield takeLatest(getType(ACTIONS.deleteAuthUser), handleAuthDelete);
}

export default function* rootSaga() {
  yield all([watch()]);
}
