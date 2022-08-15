import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/content';
import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationPageContentActionType } from '@/reducers/applications/detail/file/pages/content';
import { ProjectContentFetchParams } from '@/types/index';

function* handleFetchPageContents(action: ApplicationPageContentActionType) {
  yield put(ACTIONS.updateLoading(true));

  const params = action.payload as ProjectContentFetchParams;
  const res = yield call(API.fetchApplicationPageContents, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushPageContentList(res.data || [], res.pageInfo));
  } else {
    const {
      content: { fetchFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchPageContentList), handleFetchPageContents);
}

export default function* rootSaga() {
  yield all([watch()]);
}
