import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/templates/content';
import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationTemplateContentActionType } from '@/reducers/applications/detail/file/templates/content';
import { ProjectContentFetchParams } from '@/types/index';

function* handleFetchPageContents(action: ApplicationTemplateContentActionType) {
  yield put(ACTIONS.updateLoading(true));

  const params = action.payload as ProjectContentFetchParams;
  const res = yield call(API.fetchApplicationTemplateContents, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushTemplateContentList(res.data || [], res.pageInfo));
  } else {
    const {
      content: { fetchFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchTemplateContentList), handleFetchPageContents);
}

export default function* rootSaga() {
  yield all([watch()]);
}
