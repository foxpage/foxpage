import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/more';
import * as API from '@/apis/builder/index';
import { FileTypeEnum } from '@/constants/index';
import { store } from '@/store/index';
import { MoreActionType } from '@/store/reducers/builder/more';
import { DslFetchParams } from '@/types/builder/more';

function* handleFetchDsl(action: MoreActionType) {
  const { fileType } = store.getState().builder.page;
  const { applicationId, ids } = action.payload as DslFetchParams;
  yield put(ACTIONS.updateLoading(true));

  const res = yield call(fileType === FileTypeEnum.page ? API.fetchPageDsl : API.fetchTemplateDsl, {
    applicationId,
    ids,
  });
  if (res.code === 200 && res.data?.length > 0) {
    yield put(ACTIONS.pushDsl(res.data[0]?.content));
  } else {
    message.error('Fetch dsl failed');
  }
  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchDsl), handleFetchDsl);
}

export default function* rootSaga() {
  yield all([watch()]);
}
