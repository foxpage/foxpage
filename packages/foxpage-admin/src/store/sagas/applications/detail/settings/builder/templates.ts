import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/application/settings/builder';
import { fetchProjectTemplateContent } from '@/apis/project';
import { getBusinessI18n } from '@/foxI18n/index';
import * as ACTIONS from '@/store/actions/applications/detail/settings/builder/template';
import { store } from '@/store/index';
import { BuilderTemplateSettingsActionType } from '@/store/reducers/applications/detail/settings/builder/templates';
import {
  ApplicationSettingBuilderFetchParams,
  ApplicationSettingBuilderSaveParams,
  BaseResponse,
  ProjectPageTemplateContentFetchParams,
} from '@/types/index';

function* handleFetchTemplates(action: BuilderTemplateSettingsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: ApplicationSettingBuilderFetchParams };
  const res = yield call(API.getApplicationsBuilderSetting, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushTemplates(res));
  } else {
    const {
      component: { fetchListFailed },
    } = getBusinessI18n();

    message.error(fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveTemplate(action: BuilderTemplateSettingsActionType) {
  yield put(ACTIONS.updateSaveLoading(true));

  const { params } = action.payload as { params: ApplicationSettingBuilderSaveParams };
  const res: BaseResponse = yield call(API.saveApplicationsBuilderSetting, params);

  const {
    global: { saveFailed, saveSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    const pageInfo = store.getState().applications.detail.settings.builder.templates.pageInfo;
    yield put(
      ACTIONS.fetchTemplates({
        applicationId: params.applicationId,
        type: 'template',
        page: pageInfo.page,
        size: pageInfo.size,
      }),
    );
  } else {
    message.error(saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleFetchTemplatesContent(action: BuilderTemplateSettingsActionType) {
  yield put(ACTIONS.updateModalState({ loading: true }));

  const { params } = action.payload as { params: ProjectPageTemplateContentFetchParams };
  const res = yield call(fetchProjectTemplateContent, params);

  if (res.code === 200) {
    yield put(ACTIONS.updateModalState({ list: res.data, pageInfo: res.pageInfo }));
  } else {
    const {
      component: { fetchListFailed },
    } = getBusinessI18n();

    message.error(fetchListFailed);
  }

  yield put(ACTIONS.updateModalState({ loading: false }));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchTemplates), handleFetchTemplates);
  yield takeLatest(getType(ACTIONS.saveCategory), handleSaveTemplate);
  yield takeLatest(getType(ACTIONS.fetchTemplatesContent), handleFetchTemplatesContent);
}

export default function* rootSaga() {
  yield all([watch()]);
}
