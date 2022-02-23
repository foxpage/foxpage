import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/list';
import * as API from '@/apis/group/application/list';
import { getBusinessI18n } from '@/pages/locale';
import { ApplicationActionType } from '@/reducers/group/application/list';
import { store } from '@/store/index';
import { Application, ApplicationFetchParams, ApplicationFetchResponse, ResponseBody } from '@/types/index';
import { getLoginUser } from '@/utils/index';

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
  if (!editApp.name) {
    message.warning(nameInvalid);
    return;
  }
  const { organizationId } = getLoginUser();
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
      }),
    );
  } else {
    message.error(rs.msg || saveFailed);
  }
  yield put(ACTIONS.updateSaving(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveApp), handleSaveApp);
}

export default function* rootSaga() {
  yield all([watch()]);
}
