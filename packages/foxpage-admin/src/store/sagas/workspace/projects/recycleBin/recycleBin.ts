import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/recycleBin/recycleBin';
import * as API from '@/apis/workspace/projects';
import { getBusinessI18n } from '@/pages/locale';
import { RecycleActionType } from '@/reducers/workspace/projects/recycleBin/recycleBin';
import { ProjectCommonFetchParams } from '@/types/project';

function* handleSearchRecycles(action: RecycleActionType) {
  const { params } = action.payload as { params: ProjectCommonFetchParams };
  yield put(ACTIONS.updateLoading(true));
  const {
    global: { searchFailed },
  } = getBusinessI18n();
  const res = yield call(API.searchRecycles, params);
  if (res.code === 200) {
    yield put(ACTIONS.pushRecycles(res.data, res.pageInfo));
  } else {
    message.error(res.msg || searchFailed);
  }
  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.searchRecycles), handleSearchRecycles);
}

export default function* rootSaga() {
  yield all([watch()]);
}
