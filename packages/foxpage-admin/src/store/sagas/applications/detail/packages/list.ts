import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/list';
import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationPackagesActionType } from '@/reducers/applications/detail/packages/list';
import { store } from '@/store/index';
import {
  AppComponentAddComponentParams,
  AppComponentDeleteComponentParams,
  AppComponentFetchComponentsParams,
  OptionsAction,
} from '@/types/index';

function* handleFetchComponentList(action: ApplicationPackagesActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: AppComponentFetchComponentsParams };
  const { applicationId, page, size, search, type } = params || {};
  const {
    applicationId: appId,
    pageInfo,
    selectPackage,
  } = store.getState().applications.detail.packages.list;
  const res = yield call(API.getComponentSearchs, {
    applicationId: applicationId || appId,
    type: !!type ? type : selectPackage,
    page: page || pageInfo.page,
    size: size || pageInfo.size,
    search: search || '',
  });

  if (res.code === 200) {
    yield put(
      ACTIONS.updateListState({
        componentList: res.data || [],
        pageInfo: res.pageInfo,
      }),
    );
  } else {
    const {
      package: { fetchFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveComponent(action: ApplicationPackagesActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentAddComponentParams;
    options?: OptionsAction;
  };
  const { applicationId, name, type } = params || {};
  const { onSuccess } = options;
  const res = yield call(API.postComponents, {
    applicationId,
    name: name,
    type,
  });

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);
    if (onSuccess) onSuccess();
    yield put(
      ACTIONS.updateListState({
        selectPackage: type,
      }),
    );
    yield put(ACTIONS.fetchComponentsAction({ applicationId }));
  } else {
    message.error(res.msg || saveFailed);
  }
}

function* handleDeleteComponent(action: ApplicationPackagesActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentDeleteComponentParams;
    options?: OptionsAction;
  };
  const { applicationId, id } = params || {};
  const { onSuccess } = options;
  const res = yield call(API.putComponentsStatus, {
    applicationId,
    id,
    status: true,
  });

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(res.msg || deleteSuccess);

    if (onSuccess) onSuccess();

    yield put(ACTIONS.fetchComponentsAction({ applicationId }));
  } else {
    message.error(res.msg || deleteFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchComponentsAction), handleFetchComponentList);
  yield takeLatest(getType(ACTIONS.addComponentAction), handleSaveComponent);
  yield takeLatest(getType(ACTIONS.deleteComponentAction), handleDeleteComponent);
}

export default function* rootSaga() {
  yield all([watch()]);
}
