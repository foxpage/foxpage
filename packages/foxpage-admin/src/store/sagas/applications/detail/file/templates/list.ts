import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/templates/list';
import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationTemplateActionType } from '@/reducers/applications/detail/file/templates/list';
import { ApplicationFileListFetchParams } from '@/types/index';

function* fetchApplicationTemplates(action: ApplicationTemplateActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId, page, size } = action.payload as ApplicationFileListFetchParams;
  const res = yield call(API.fetchApplicationTemplates, {
    applicationId,
    page,
    size,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushApplicationTemplates(res.data || [], res.pageInfo));
  } else {
    const {
      file: { fetchPageListFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchPageListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApplicationTemplates), fetchApplicationTemplates);
}

export default function* rootSaga() {
  yield all([watch()]);
}
