import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/list';
import * as AUTH_API from '@/apis/auth';
import * as API from '@/apis/group/application/list';
import { getBusinessI18n } from '@/pages/locale';
import { ApplicationActionType } from '@/reducers/group/application/list';
import { store } from '@/store/index';
import {
  Application,
  ApplicationFetchParams,
  ApplicationFetchResponse,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeUserFetchParams,
  ResponseBody,
} from '@/types/index';

function* handleFetchList(actions: ApplicationActionType) {
  yield put(ACTIONS.updateFetching(true));

  const {
    application: { fetchListFailed },
  } = getBusinessI18n();
  const { params } = actions.payload as { params: ApplicationFetchParams };
  const rs: ApplicationFetchResponse = yield call(API.fetchList, params);
  if (rs.code === 200) {
    yield put(ACTIONS.pushAppList(rs));
  } else {
    message.error(rs.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateFetching(false));
}

function* handleSaveApp() {
  yield put(ACTIONS.updateSaving(true));
  const {
    application: { nameInvalid },
    global: { saveFailed },
  } = getBusinessI18n();
  const { editApp, pageInfo } = store.getState().group.application.list;
  const { organizationId } = store.getState().system;
  if (!editApp.name) {
    message.warning(nameInvalid);
    return;
  }
  const rs: ResponseBody = yield call(editApp.id ? API.updateApp : API.addApp, {
    organizationId,
    ...editApp,
    applicationId: editApp.id,
  } as Application);

  if (rs.code === 200) {
    yield put(ACTIONS.updateDrawerVisible(false));
    yield put(
      ACTIONS.fetchList({
        ...pageInfo,
        search: '',
        organizationId,
        type: 'user',
      }),
    );
  } else {
    message.error(rs.msg || saveFailed);
  }
  yield put(ACTIONS.updateSaving(false));
}

function* handleAuthFetchList(action: ApplicationActionType) {
  yield put(ACTIONS.updateAuthListLoading(true));

  const {
    global: { fetchListFailed },
  } = getBusinessI18n();

  const { params } = action.payload as { params: AuthorizeListFetchParams };
  const rs = yield call(AUTH_API.authorizeFetch, params);

  if (rs.code === 200) {
    yield put(ACTIONS.pushAuthList(rs.data || []));
  } else {
    message.error(rs.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateAuthListLoading(false));
}

function* handleAuthUserFetchList(action: ApplicationActionType) {
  const {
    global: { fetchListFailed },
  } = getBusinessI18n();

  const { params } = action.payload as { params: AuthorizeUserFetchParams };
  const rs = yield call(AUTH_API.authorizeUserFetch, params);

  if (rs.code === 200) {
    yield put(ACTIONS.pushUserList(rs.data || []));
  } else {
    message.error(rs.msg || fetchListFailed);
  }
}

function* handleAuthAdd(action: ApplicationActionType) {
  const {
    global: { addFailed },
  } = getBusinessI18n();

  const { params, cb } = action.payload as { params: AuthorizeAddParams; cb: () => void };
  const rs = yield call(AUTH_API.authorizeAdd, params);

  if (rs.code === 200) {
    if (typeof cb === 'function') {
      cb();
    }
  } else {
    message.error(rs.msg || addFailed);
  }
}

function* handleAuthDelete(action: ApplicationActionType) {
  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  const { params, cb } = action.payload as { params: AuthorizeDeleteParams; cb: () => void };
  const rs = yield call(AUTH_API.authorizeDelete, params);

  if (rs.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') {
      cb();
    }
  } else {
    message.error(rs.msg || deleteFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveApp), handleSaveApp);
  yield takeLatest(getType(ACTIONS.fetchAuthList), handleAuthFetchList);
  yield takeLatest(getType(ACTIONS.fetchUserList), handleAuthUserFetchList);
  yield takeLatest(getType(ACTIONS.authAddUser), handleAuthAdd);
  yield takeLatest(getType(ACTIONS.authDeleteUser), handleAuthDelete);
}

export default function* rootSaga() {
  yield all([watch()]);
}
