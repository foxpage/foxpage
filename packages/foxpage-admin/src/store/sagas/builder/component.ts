import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/components';
import * as API from '@/apis/builder/component';
import { getBusinessI18n } from '@/foxI18n/index';
import { ComponentsActionType } from '@/store/reducers/builder/component';
import { ComponentFetchRes } from '@/types/index';

function* handleFetchComponents(action: ComponentsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId } = action.payload as { applicationId: string };
  const res: ComponentFetchRes = yield call(API.fetchLiveComponentList, {
    applicationId,
    type: ['component', 'systemComponent'],
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushComponentList(res.data || []));
  } else {
    const {
      component: { fetchListFailed },
    } = getBusinessI18n();

    message.error(fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchComponentList), handleFetchComponents);
}

export default function* rootSaga() {
  yield all([watch()]);
}
