import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/detail';
import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { ApplicationPackagesDetailActionType } from '@/reducers/applications/detail/packages/detail';
import { store } from '@/store/index';
import {
  AppComponentDetailAddComponentVersionParams,
  AppComponentDetailEditComponentVersionParams,
  AppComponentDetailFetchComponentInfoParams,
  AppComponentDetailFetchComponentVersionsParams,
  AppComponentDetailLiveComponentVersionParams,
  AppComponentDetailUpdateComponentVersionStatueParams,
  ComponentDisabledSaveParams,
  ComponentRemoteSaveParams,
  ComponentsReferLiveVersionUpdateParams,
  FilesFetchParams,
  OptionsAction,
  RemoteComponentFetchParams,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* fetchComponentInfo(action: ApplicationPackagesDetailActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params, options = {} } = action.payload as {
    params: AppComponentDetailFetchComponentInfoParams;
    options?: OptionsAction;
  };
  const { applicationId, id } = params || {};
  const res = yield call(API.getComponentsContents, {
    applicationId,
    id,
  });

  if (res.code === 200) {
    yield put(ACTIONS.updateComponentInfoState(res.data || {}));

    const { onSuccess } = options;
    if (typeof onSuccess === 'function') onSuccess();
  } else {
    const {
      component: { fetchDetailFailed },
    } = getBusinessI18n();

    errorToast(res, fetchDetailFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* addVersion(action: ApplicationPackagesDetailActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentDetailAddComponentVersionParams;
    options?: OptionsAction;
  };
  const res = yield call(API.postComponentsVersions, params);

  if (res.code === 200) {
    const { onSuccess } = options;
    if (typeof onSuccess === 'function') onSuccess();

    yield put(ACTIONS.fetchComponentVersionsAction({}));
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();
    errorToast(res, saveFailed);
  }
}

function* editVersion(action: ApplicationPackagesDetailActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentDetailEditComponentVersionParams;
    options?: OptionsAction;
  };
  const res = yield call(API.putComponentsVersions, params);

  if (res.code === 200) {
    const { onSuccess } = options;
    if (typeof onSuccess === 'function') onSuccess();

    yield put(ACTIONS.fetchComponentVersionsAction({}));
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();
    errorToast(res, saveFailed);
  }
}

function* fetchVersionList(action: ApplicationPackagesDetailActionType) {
  yield put(
    ACTIONS.updateVersionListState({
      loading: true,
    }),
  );

  const { params, options = {} } = action.payload as {
    params: AppComponentDetailFetchComponentVersionsParams;
    options?: OptionsAction;
  };
  const { applicationId, fileId, pageInfo } =
    store.getState().applications.detail.packages.detail.versionList;
  const { size = 10, page = 1 } = pageInfo;
  const res = yield call(API.getComponentsVersionSearchs, {
    applicationId,
    id: fileId,
    page: params?.page || page,
    size: params?.size || size,
  });

  if (res.code === 200) {
    yield put(
      ACTIONS.updateVersionListState({
        loading: false,
        versions: res.data || [],
        pageInfo: res.pageInfo || {
          page: 1,
          total: 0,
          size: 10,
        },
      }),
    );

    const { onSuccess } = options;
    if (typeof onSuccess === 'function') onSuccess();
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();
    errorToast(res, fetchListFailed);
  }
}

function* updateVersionStatus(action: ApplicationPackagesDetailActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentDetailUpdateComponentVersionStatueParams;
    options?: OptionsAction;
  };
  const res = yield call(API.putComponentsVersionPublish, params);

  const {
    global: { updateFailed, updateSuccess },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(updateSuccess);

    yield put(ACTIONS.fetchComponentVersionsAction({}));

    const { onSuccess } = options;
    if (typeof onSuccess === 'function') onSuccess();
  } else {
    errorToast(res, updateFailed);
  }
}

function* liveVersion(action: ApplicationPackagesDetailActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentDetailLiveComponentVersionParams;
    options?: OptionsAction;
  };
  const res = yield call(API.putComponentsLiveVersion, params);

  if (res.code === 200) {
    yield put(ACTIONS.fetchComponentVersionsAction({}));

    const { onSuccess } = options;
    if (typeof onSuccess === 'function') onSuccess();
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();
    errorToast(res, saveFailed);
  }
}

function* referLiveVersion(action: ApplicationPackagesDetailActionType) {
  const { params, options = {} } = action.payload as {
    params: ComponentsReferLiveVersionUpdateParams;
    options?: OptionsAction;
  };
  const res = yield call(API.putComponentsReferLiveVersion, params);

  if (res.code === 200) {
    yield put(ACTIONS.fetchComponentVersionsAction({}));

    const { onSuccess } = options;
    if (typeof onSuccess === 'function') onSuccess();
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();
    errorToast(res, saveFailed);
  }
}

function* handleFetchFileDetail(action: ApplicationPackagesDetailActionType) {
  const { applicationId, ids } = action.payload as FilesFetchParams;
  const res = yield call(API.fetchComponentDetail, {
    applicationId,
    ids,
  });

  if (res.code === 200 && res.data?.length > 0) {
    yield put(ACTIONS.pushFileDetail(res.data[0]));
  } else {
    const {
      file: { fetchDetailFailed },
    } = getBusinessI18n();

    errorToast(res, fetchDetailFailed);
  }
}

function* handleFetchComponentRemotes(action: ApplicationPackagesDetailActionType) {
  const params = action.payload as RemoteComponentFetchParams;
  const res = yield call(API.searchComponentRemotes, params);

  if (res.code === 200 && res.data) {
    const { components, lastVersion } = res.data;
    yield put(ACTIONS.pushComponentRemotes(components?.length > 0 ? components[0] : undefined, lastVersion));
  } else {
    const {
      component: { fetchUpdateInfoFailed },
    } = getBusinessI18n();

    errorToast(res, fetchUpdateInfoFailed);
  }
}

function* handleSaveComponentRemote(action: ApplicationPackagesDetailActionType) {
  yield put(ACTIONS.updateCloudSyncDrawerLoadingStatus(true));

  const params = action.payload as ComponentRemoteSaveParams;
  const res = yield call(API.saveComponentRemote, params);

  if (res.code === 200) {
    yield put(ACTIONS.updateCloudSyncDrawerOpenStatus(false));
    yield put(ACTIONS.fetchComponentVersionsAction({}));
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();

    errorToast(res, saveFailed);
  }
  yield put(ACTIONS.updateCloudSyncDrawerLoadingStatus(false));
}

function* handleFetchComponentUsed(action: ApplicationPackagesDetailActionType) {
  yield put(
    ACTIONS.updateVersionListState({
      loading: true,
    }),
  );

  const { page, size, live } = action.payload as { page?: number; size?: number; live?: boolean };
  const { applicationId, pageInfo } = store.getState().applications.detail.packages.detail.versionList;
  const componentInfo = store.getState().applications.detail.packages.detail.componentInfo;
  const res = yield call(API.fetchComponentUsed, {
    applicationId,
    name: componentInfo.title,
    page: page || pageInfo.page,
    size: size || pageInfo.size,
    live: live || false,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushComponentUsed(res.data));
    yield put(
      ACTIONS.updateVersionListState({
        pageInfo: res.pageInfo,
      }),
    );
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(
    ACTIONS.updateVersionListState({
      loading: false,
    }),
  );
}

function* handleSaveComponentDisabled(action: ApplicationPackagesDetailActionType) {
  const { params, cb } = action.payload as { params: ComponentDisabledSaveParams; cb?: () => void };
  const res = yield call(API.saveComponentDisabled, params);

  if (res.code === 200) {
    if (typeof cb === 'function') cb();
  } else {
    const {
      package: { disabledFailed },
    } = getBusinessI18n();

    errorToast(res, disabledFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchComponentInfoAction), fetchComponentInfo);
  yield takeLatest(getType(ACTIONS.addComponentVersionAction), addVersion);
  yield takeLatest(getType(ACTIONS.editComponentVersionAction), editVersion);
  yield takeLatest(getType(ACTIONS.fetchComponentVersionsAction), fetchVersionList);
  yield takeLatest(getType(ACTIONS.updateComponentVersionStatusAction), updateVersionStatus);
  yield takeLatest(getType(ACTIONS.liveComponentVersionAction), liveVersion);
  yield takeLatest(getType(ACTIONS.referLiveComponentVersionAction), referLiveVersion);
  yield takeLatest(getType(ACTIONS.fetchFileDetail), handleFetchFileDetail);
  yield takeLatest(getType(ACTIONS.fetchComponentRemotes), handleFetchComponentRemotes);
  yield takeLatest(getType(ACTIONS.saveComponentRemote), handleSaveComponentRemote);
  yield takeLatest(getType(ACTIONS.fetchComponentUsed), handleFetchComponentUsed);
  yield takeLatest(getType(ACTIONS.saveComponentDisabled), handleSaveComponentDisabled);
}

export default function* rootSaga() {
  yield all([watch()]);
}
