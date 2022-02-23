import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template';
import { fetchRenderHtml } from '@/apis/builder/ssr';
import { getBusinessI18n } from '@/pages/locale';
import { store } from '@/store/index';
import { SsrActionType } from '@/store/reducers/builder/ssr';

function* renderHtml(action: SsrActionType) {
  const state = store.getState().builder.template;
  const {
    global: { previewFailed },
  } = getBusinessI18n();
  const { contentId } = state.version;
  const { applicationId } = action.payload as { applicationId: string };
  const res = yield call(fetchRenderHtml, {
    'app_id': applicationId,
    'page_id': contentId,
  });
  if (res.code === 200) {
    yield put(ACTIONS.pushSsrHtml(res.html));
  } else {
    message.error(res.msg || previewFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchSsrHtml), renderHtml);
}

export default function* rootSaga() {
  yield all([watch()]);
}
