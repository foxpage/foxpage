import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/list';
import * as API from '@/apis/application';
import { getBlockSearchs } from '@/apis/builder/block';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationPackagesActionType } from '@/reducers/applications/detail/packages/list';
import { store } from '@/store/index';
import {
  AppComponentAddComponentParams,
  AppComponentDeleteComponentParams,
  AppComponentFetchComponentsParams,
  AppComponentSetComponentParams,
  OptionsAction,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* handleFetchComponentList(action: ApplicationPackagesActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: AppComponentFetchComponentsParams };
  const { applicationId, page, size, search, forceSearch, type } = params || {};
  const {
    applicationId: appId,
    pageInfo,
    search: storeSearch,
    selectPackage,
  } = store.getState().applications.detail.packages.list;
  const _search = forceSearch ? search || '' : search || storeSearch || '';
  const res = yield call(API.getComponentSearchs, {
    applicationId: applicationId || appId,
    type: !!type ? type : selectPackage,
    page: page || pageInfo.page,
    size: size || pageInfo.size,
    search: _search,
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

    errorToast(res, fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleFetchBlockList(action: ApplicationPackagesActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as { params: AppComponentFetchComponentsParams };
  const { applicationId, page, size, search, type } = params || {};
  const {
    applicationId: appId,
    pageInfo,
    selectPackage,
  } = store.getState().applications.detail.packages.list;
  const res = yield call(getBlockSearchs, {
    applicationId: applicationId || appId,
    type: !!type ? type : selectPackage,
    page: page || pageInfo.page,
    size: size || pageInfo.size,
    search: search || '',
  });

  if (res.code === 200) {
    yield put(
      ACTIONS.updateListState({
        blockList: res.data || [],
        pageInfo: res.pageInfo,
      }),
    );
  } else {
    const {
      package: { fetchFailed },
    } = getBusinessI18n();

    errorToast(res, fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveComponent(action: ApplicationPackagesActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentAddComponentParams;
    options?: OptionsAction;
  };
  const { applicationId, name, type, componentType } = params || {};
  const { onSuccess } = options;
  const res = yield call(API.postComponents, {
    applicationId,
    name: name,
    type,
    componentType,
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
    errorToast(res, saveFailed);
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
    errorToast(res, deleteFailed);
  }
}

function* handleSetComponent(action: ApplicationPackagesActionType) {
  const { params, cb } = action.payload as {
    params: AppComponentSetComponentParams;
    cb?: () => void;
  };
  const res = yield call(API.putComponents, params);

  const {
    global: { updateSuccess, updateFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(updateSuccess);

    if (typeof cb === 'function') cb();

    yield put(ACTIONS.fetchComponentsAction({ applicationId: params.applicationId }));
  } else {
    errorToast(res, updateFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchComponentsAction), handleFetchComponentList);
  yield takeLatest(getType(ACTIONS.fetchBlocksAction), handleFetchBlockList);
  yield takeLatest(getType(ACTIONS.addComponentAction), handleSaveComponent);
  yield takeLatest(getType(ACTIONS.deleteComponentAction), handleDeleteComponent);
  yield takeLatest(getType(ACTIONS.setComponentAction), handleSetComponent);
}

export default function* rootSaga() {
  yield all([watch()]);
}
