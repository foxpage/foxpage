import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import * as ACTIONS from '@/store/actions/applications/detail/settings/application';
import { ApplicationSettingsActionType } from '@/store/reducers/applications/detail/settings/application';
import { ApplicationEntityMultiHost, ApplicationSaveParams } from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchApplicationInfo(action: ApplicationSettingsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId } = action.payload as { applicationId: string };
  const res = yield call(API.fetchAppDetail, { applicationId });

  if (res.code === 200) {
    yield put(ACTIONS.pushApplicationInfo(res.data));
  } else {
    const {
      application: { fetchDetailFailed },
    } = getBusinessI18n();

    errorToast(res, fetchDetailFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleFetchAllLocales(action: ApplicationSettingsActionType) {
  const { applicationId } = action.payload as { applicationId: string };
  const res = yield call(API.fetchAllLocales, { applicationId });

  if (res.code === 200) {
    yield put(ACTIONS.pushAllLocales(res.data));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* handleSaveApplicationInfo(action: ApplicationSettingsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { application } = action.payload as { application: ApplicationEntityMultiHost };
  const params: ApplicationSaveParams = {
    applicationId: application.id,
    slug: application.slug,
    host: application.host,
    name: application.name,
    intro: application.intro,
    locales: application.localeObjects.map((item) => `${item.language}-${item.region}`),
    resources: application.resources,
  };
  const res = yield call(API.updateApp, params);

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);
  } else {
    errorToast(res, saveFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApplicationInfo), handleFetchApplicationInfo);
  yield takeLatest(getType(ACTIONS.fetchAllLocales), handleFetchAllLocales);
  yield takeLatest(getType(ACTIONS.saveApplication), handleSaveApplicationInfo);
}

export default function* rootSaga() {
  yield all([watch()]);
}
