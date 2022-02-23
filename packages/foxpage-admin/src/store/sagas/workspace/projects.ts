import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects';
import * as API from '@/apis/workspace/projects';
import { getBusinessI18n } from '@/pages/locale';
import { ProjectsActionType } from '@/reducers/workspace/projects';
import { PaginationReqParams } from '@/types/common';

function* handleSearchMyProjects(action: ProjectsActionType) {
  const { page, search, size } = action.payload as PaginationReqParams;
  yield put(ACTIONS.updateLoading(true));
  const {
    global: { searchFailed },
  } = getBusinessI18n();
  const res = yield call(API.searchMyProjects, { page, search, size });
  yield put(ACTIONS.updateLoading(false));
  if (res.code === 200) {
    yield put(ACTIONS.pushMyProjects(res.data, res.pageInfo));
  } else {
    message.error(res.msg || searchFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.searchMyProjects), handleSearchMyProjects);
}

export default function* rootSaga() {
  yield all([watch()]);
}
