import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/list';
import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationPageActionType } from '@/reducers/applications/detail/file/pages/list';
import { ApplicationFileListFetchParams } from '@/types/index';

function* fetchApplicationPages(action: ApplicationPageActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId, page, size } = action.payload as ApplicationFileListFetchParams;
  const res = yield call(API.fetchApplicationPages, {
    applicationId,
    page,
    size,
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

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApplicationPages), fetchApplicationPages);
}

export default function* rootSaga() {
  yield all([watch()]);
}
