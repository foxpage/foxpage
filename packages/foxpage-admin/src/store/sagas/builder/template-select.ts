import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template-select';
import { getTemplates } from '@/apis/builder';
import { fetchApplicationStoreProjectGoods } from '@/apis/store/list';
import { TemplateSelectActionType } from '@/store/reducers/builder/template-select';
import { ApplicationStoreGoodsSearchParams, PageParam } from '@/types/builder';

function* fetchApplicationTemplate(action: TemplateSelectActionType) {
  yield put(ACTIONS.updateTemplateFetchLoading(true));
  const { applicationId } = action.payload as PageParam;
  const res = yield call(getTemplates, {
    applicationId,
  });
  if (res.code === 200) {
    yield put(ACTIONS.pushTemplates(res.data));
  } else {
    message.error('Fetch template failed');
  }
  yield put(ACTIONS.updateTemplateFetchLoading(false));
}

function* fetchStoreProjectGoods(action: TemplateSelectActionType) {
  yield put(ACTIONS.updateTemplateFetchLoading(true));
  const { applicationId, type, page, size } = action.payload as ApplicationStoreGoodsSearchParams;
  const res = yield call(fetchApplicationStoreProjectGoods, {
    applicationId,
    type,
    page,
    size,
  });
  if (res.code === 200) {
    yield put(ACTIONS.pushStoreProjectGoods(res.data, res.pageInfo));
  } else {
    message.error('Fetch template failed');
  }
  yield put(ACTIONS.updateTemplateFetchLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApplicationTemplate), fetchApplicationTemplate);
  yield takeLatest(getType(ACTIONS.fetchStoreProjectGoods), fetchStoreProjectGoods);
}

export default function* rootSaga() {
  yield all([watch()]);
}
