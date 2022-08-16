import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/application/settings/builder';
import { fetchProjectPageContent } from '@/apis/project';
import { getBusinessI18n } from '@/foxI18n/index';
import * as ACTIONS from '@/store/actions/applications/detail/settings/builder/page';
import { store } from '@/store/index';
import { BuilderPageSettingsActionType } from '@/store/reducers/applications/detail/settings/builder/pages';
import {
  ApplicationSettingBuilderFetchParams,
  ApplicationSettingBuilderSaveParams,
  BaseResponse,
  ProjectPageTemplateContentFetchParams,
} from '@/types/index';

function* handleFetchPages(action: BuilderPageSettingsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: ApplicationSettingBuilderFetchParams };
  const res = yield call(API.getApplicationsBuilderSetting, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushPages(res));
  } else {
    const {
      component: { fetchListFailed },
    } = getBusinessI18n();

    message.error(fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSavePage(action: BuilderPageSettingsActionType) {
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
      ACTIONS.fetchPages({
        applicationId: params.applicationId,
        type: 'page',
        page: pageInfo.page,
        size: pageInfo.size,
      }),
    );
  } else {
    message.error(saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleFetchPagesContent(action: BuilderPageSettingsActionType) {
  yield put(ACTIONS.updateModalState({ loading: true }));

  const { params } = action.payload as { params: ProjectPageTemplateContentFetchParams };
  const res = yield call(fetchProjectPageContent, params);

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
  yield takeLatest(getType(ACTIONS.fetchPages), handleFetchPages);
  yield takeLatest(getType(ACTIONS.saveCategory), handleSavePage);
  yield takeLatest(getType(ACTIONS.fetchPagesContent), handleFetchPagesContent);
}

export default function* rootSaga() {
  yield all([watch()]);
}
