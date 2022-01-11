import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/group/application/list/';
import * as ACTIONS from '@/store/actions/group/application/settings';
import { SettingsActionType } from '@/store/reducers/group/application/settings';
import { ApplicationEditType } from '@/types/application';

function* handleFetchApplicationInfo(action: SettingsActionType) {
  const { applicationId } = action.payload as { applicationId: string };

  yield put(ACTIONS.updateLoading(true));
  const rs = yield call(API.getAppDetail, { applicationId });

  if (rs.code === 200) {
    yield put(ACTIONS.pushApplicationInfo(rs.data));
    yield put(ACTIONS.updateLoading(false));
  } else {
    message.error(rs.msg || 'Fetch application info failed.');
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
  const application = action.payload as ApplicationEditType;

  if (!application.name) {
    message.warn('Please input name');
    return;
  }
  if (!application.host) {
    message.warn('Please input host');
    return;
  }
  if (!application.slug) {
    message.warn('Please input slug');
    return;
  }

  for (const localeObj of application.localeObjects) {
    if (!localeObj.region) {
      message.warn('Please select country/region');
      return;
    }
    if (!localeObj.language) {
      message.warn('Please select language');
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
    message.success('Save succeed');
  } else {
    message.error(rs.msg || 'Save failed.');
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
