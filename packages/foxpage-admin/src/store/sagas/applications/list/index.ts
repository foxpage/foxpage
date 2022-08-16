import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/list';
import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationsActionType } from '@/reducers/applications/list';
import { store } from '@/store/index';
import { Application, ApplicationListFetchParams, ResponseBody } from '@/types/index';

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

    message.error(res.msg || fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveApp() {
  yield put(ACTIONS.updateSaveLoading(true));

  const { editApp, pageInfo } = store.getState().applications.list;
  const { organizationId } = store.getState().system.user;
  const rs: ResponseBody = yield call(API.addApp, {
    organizationId,
    ...editApp,
    applicationId: editApp.id,
  } as Application);

  const {
    global: { saveFailed, saveSuccess },
  } = getBusinessI18n();

  if (rs.code === 200) {
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
    message.error(rs.msg || saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveApp), handleSaveApp);
}

export default function* rootSaga() {
  yield all([watch()]);
}
