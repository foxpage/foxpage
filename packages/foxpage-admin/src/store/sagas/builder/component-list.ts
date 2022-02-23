import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/component-list';
import { fetchLiveComponentList } from '@/apis/builder';
import { getBusinessI18n } from '@/pages/locale';
import { ListActionType } from '@/reducers/builder/component-list';
/**
 * load component list
 * @param action action
 */
function* handleFetchComponentList(action: ListActionType) {
  const { applicationId } = action.payload as { applicationId: string };
  const {
    component: { fetchListFailed },
  } = getBusinessI18n();
  yield put(ACTIONS.updateComponentListLoading(false));

  const res = yield call(fetchLiveComponentList, { applicationId });
  if (res.code === 200) {
    yield put(ACTIONS.pushComponentList(res.data));
  } else {
    message.error(res.msg || fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchComponentList), handleFetchComponentList);
}

export default function* rootSaga() {
  yield all([watch()]);
}
