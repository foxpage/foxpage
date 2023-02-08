import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/common';
import { fetchTeamUsers } from '@/apis/team';
import { getBusinessI18n } from '@/foxI18n/index';
import { SystemActionType } from '@/reducers/system/common';
import { TeamMembersFetchParams } from '@/types/index';

export function* handleFetchTeamMembers(action: SystemActionType) {
  const { params } = action.payload as { params: TeamMembersFetchParams };
  const res = yield call(fetchTeamUsers, params);
  if (res.code === 200) {
    yield put(ACTIONS.pushTeamMembers(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    message.error(fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchTeamMembers), handleFetchTeamMembers);
}

export default function* rootSaga() {
  yield all([watch()]);
}
