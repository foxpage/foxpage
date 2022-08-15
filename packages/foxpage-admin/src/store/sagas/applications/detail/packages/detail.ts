import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/detail';
import * as API from '@/apis/application';
import * as PROJECT_API from '@/apis/project';
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
  ComponentRemoteSaveParams,
  FilesFetchParams,
  OptionsAction,
  RemoteComponentFetchParams,
} from '@/types/index';

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

    message.error(res.msg || fetchDetailFailed);
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
    message.error(res.msg);
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
    message.error(res.msg);
  }
}

function* fetchVersionList(action: ApplicationPackagesDetailActionType) {
  yield put(
    ACTIONS.updateVersionListState({
      loading: true,
    }),
  );

  const { options = {} } = action.payload as {
    params: AppComponentDetailFetchComponentVersionsParams;
    options?: OptionsAction;
  };
  const {
    applicationId,
    fileId,
    pageInfo,
  } = store.getState().applications.detail.packages.detail.versionList;
  const { size = 10, page = 1 } = pageInfo;
  const res = yield call(API.getComponentsVersionSearchs, {
    applicationId,
    id: fileId,
    size,
    page,
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
    message.error(res.msg);
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
    message.error(res.msg || updateFailed);
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
    message.error(res.msg);
  }
}

function* handleFetchFileDetail(action: ApplicationPackagesDetailActionType) {
  const { applicationId, ids } = action.payload as FilesFetchParams;
  const res = yield call(PROJECT_API.fetchFileDetail, {
    applicationId,
    ids,
  });

  if (res.code === 200 && res.data?.length > 0) {
    yield put(ACTIONS.pushFileDetail(res.data[0]));
  } else {
    const {
      file: { fetchDetailFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchDetailFailed);
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

    message.error(res.msg || fetchUpdateInfoFailed);
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

    message.error(res.msg || saveFailed);
  }
  yield put(ACTIONS.updateCloudSyncDrawerLoadingStatus(false));
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchComponentInfoAction), fetchComponentInfo);
  yield takeLatest(getType(ACTIONS.addComponentVersionAction), addVersion);
  yield takeLatest(getType(ACTIONS.editComponentVersionAction), editVersion);
  yield takeLatest(getType(ACTIONS.fetchComponentVersionsAction), fetchVersionList);
  yield takeLatest(getType(ACTIONS.updateComponentVersionStatusAction), updateVersionStatus);
  yield takeLatest(getType(ACTIONS.liveComponentVersionAction), liveVersion);
  yield takeLatest(getType(ACTIONS.fetchFileDetail), handleFetchFileDetail);
  yield takeLatest(getType(ACTIONS.fetchComponentRemotes), handleFetchComponentRemotes);
  yield takeLatest(getType(ACTIONS.saveComponentRemote), handleSaveComponentRemote);
}

export default function* rootSaga() {
  yield all([watch()]);
}
