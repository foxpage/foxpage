import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/group/application/list/';
import { getBusinessI18n } from '@/pages/locale';
import * as ACTIONS from '@/store/actions/group/application/settings';
import { SettingsActionType } from '@/store/reducers/group/application/settings';
import { ApplicationEditType } from '@/types/application';

function* handleFetchApplicationInfo(action: SettingsActionType) {
  const { applicationId } = action.payload as { applicationId: string };
  const {
    application: { fetchDetailFailed },
  } = getBusinessI18n();
  yield put(ACTIONS.updateLoading(true));
  const rs = yield call(API.getAppDetail, { applicationId });

  if (rs.code === 200) {
    yield put(ACTIONS.pushApplicationInfo(rs.data));
    yield put(ACTIONS.updateLoading(false));
  } else {
    message.error(rs.msg || fetchDetailFailed);
  }
}

function* handleFetchAllLocales(action: SettingsActionType) {
  const { applicationId } = action.payload as { applicationId: string };

  const rs = yield call(API.getAllLocales, { applicationId });

  if (rs.code === 200) {
    yield put(ACTIONS.pushAllLocales(rs.data));
  }
}

function* handleSaveApplicationInfo(action: SettingsActionType) {
  const {
    application: { nameInvalid, resourceNameInvalid, resourceTypeInvalid, hostInvalid, regionInvalid, languageInvalid },
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();
  const application = action.payload as ApplicationEditType;

  if (!application.name) {
    message.warn(nameInvalid);
    return;
  }

  for (const localeObj of application.localeObjects) {
    if (!localeObj.region) {
      message.warn(regionInvalid);
      return;
    }
    if (!localeObj.language) {
      message.warn(languageInvalid);
      return;
    }
  }

  for (const resource of application.resources) {
    const { detail, name, type } = resource;
    if (!name) {
      message.warn(resourceNameInvalid);
      return;
    }
    if (!type) {
      message.warn(resourceTypeInvalid);
      return;
    }
    if (!detail?.host) {
      message.warn(hostInvalid);
      return;
    }
  }

  yield put(ACTIONS.updateLoading(true));
  const rs = yield call(API.updateApp, {
    applicationId: application.id,
    slug: application.slug,
    host: application.host,
    name: application.name,
    intro: application.intro,
    locales: application.localeObjects.map(item => `${item.language}-${item.region}`),
    resources: application.resources,
  });

  if (rs.code === 200) {
    message.success(saveSuccess);
  } else {
    message.error(rs.msg || saveFailed);
  }
  yield put(ACTIONS.updateLoading(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchApplicationInfo), handleFetchApplicationInfo);
  yield takeLatest(getType(ACTIONS.saveApplication), handleSaveApplicationInfo);
  yield takeLatest(getType(ACTIONS.fetchAllLocales), handleFetchAllLocales);
}

export default function* rootSaga() {
  yield all([watch()]);
}
