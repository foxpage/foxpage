import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/register';
import * as API from '@/apis/system/register/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { RegisterActionType } from '@/reducers/system/register';
import { RegisterParams } from '@/types/index';
import { errorToast } from '@/utils/error-toast';

export function* handleRegister(action: RegisterActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { userInfo, cb } = action.payload as { userInfo: RegisterParams; cb?: () => void };
  const res = yield call(API.register, userInfo);

  if (res.code === 200) {
    if (typeof cb === 'function') {
      cb();
    }
  } else {
    const {
      login: { registerFailed },
    } = getBusinessI18n();

    errorToast(res, registerFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.register), handleRegister);
}

export default function* rootSaga() {
  yield all([watch()]);
}
