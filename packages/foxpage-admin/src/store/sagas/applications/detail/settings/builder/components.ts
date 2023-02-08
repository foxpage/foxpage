import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/application/settings/builder';
import { getBusinessI18n } from '@/foxI18n/index';
import * as ACTIONS from '@/store/actions/applications/detail/settings/builder/component';
import { store } from '@/store/index';
import { BuilderComponentSettingsActionType } from '@/store/reducers/applications/detail/settings/builder/components';
import {
  ApplicationSettingBuilderDeleteParams,
  ApplicationSettingBuilderSaveParams,
  BaseResponse,
  CategoryTypeFetchRes,
  ComponentCategoryFetchParams,
  ComponentCategoryFetchRes,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchCategoryComponents(action: BuilderComponentSettingsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId, page, size, search = '' } = action.payload as ComponentCategoryFetchParams;
  const res: ComponentCategoryFetchRes = yield call(API.getApplicationsBuilderSetting, {
    applicationId,
    type: 'component',
    page,
    size,
    search,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushComponents(res));
  } else {
    const {
      component: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveCategory(action: BuilderComponentSettingsActionType) {
  yield put(ACTIONS.updateSaveLoading(true));

  const { params } = action.payload as { params: ApplicationSettingBuilderSaveParams };
  const res: BaseResponse = yield call(API.saveApplicationsBuilderSetting, params);

  const {
    global: { saveFailed, saveSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    yield put(ACTIONS.updateEditorVisible(false, null));

    const { pageInfo, searchText } = store.getState().applications.detail.settings.builder.components;
    yield put(
      ACTIONS.fetchComponents({ applicationId: params.applicationId, ...pageInfo, search: searchText || '' }),
    );
  } else {
    errorToast(res, saveFailed);
  }

  yield put(ACTIONS.updateSaveLoading(false));
}

function* handleFetchCategory(action: BuilderComponentSettingsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { applicationId } = action.payload as { applicationId: string };
  const res: CategoryTypeFetchRes = yield call(API.getCategories, {
    applicationId,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushCategories(res.data || []));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleDeleteCategory(action: BuilderComponentSettingsActionType) {
  const { params } = action.payload as { params: ApplicationSettingBuilderDeleteParams };
  const res: BaseResponse = yield call(API.deleteApplicationsBuilderSetting, params);

  const {
    global: { deleteFailed, deleteSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    const { pageInfo, searchText } = store.getState().applications.detail.settings.builder.components;
    yield put(
      ACTIONS.fetchComponents({ applicationId: params.applicationId, ...pageInfo, search: searchText || '' }),
    );
  } else {
    errorToast(res, deleteFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchComponents), handleFetchCategoryComponents);
  yield takeLatest(getType(ACTIONS.saveCategory), handleSaveCategory);
  yield takeLatest(getType(ACTIONS.fetchCategories), handleFetchCategory);
  yield takeLatest(getType(ACTIONS.deleteCategory), handleDeleteCategory);
}

export default function* rootSaga() {
  yield all([watch()]);
}
