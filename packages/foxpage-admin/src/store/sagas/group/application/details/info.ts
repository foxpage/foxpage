import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import * as API from '../../../../../apis/group/application/list';
import * as ACTIONS from '../../../../actions/group/application/details/info';

function* handleFetchInfo(action: any): any {
  const { id } = action;
  yield put({
    type: ACTIONS.SET_LOADING,
    value: true,
  });

  const rs = yield call(API.getAppDetail, {
    applicationId: id,
  });

  if (rs.code === 200) {
    yield put({
      type: ACTIONS.FETCH_APPLICATION_INFO_SUCCESS,
      data: rs.data,
    });
  } else {
    message.error(rs.msg || 'Fetch info failed.');
  }
}

function* watch() {
  yield takeLatest(ACTIONS.FETCH_APPLICATION_INFO, handleFetchInfo);
}

export default function* rootSaga() {
  yield all([watch()]);
}
