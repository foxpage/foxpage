import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/group/application/packages';
import { fetchFileDetail } from '@/apis/group/file';
import * as ACTIONS from '@/store/actions/group/application/packages/detail';
import { store } from '@/store/index';
import { AppComponentDetailActionType } from '@/store/reducers/group/application/packages/detail';
import { FileDetailFetchParams } from '@/types/application/file';
import {
  AppComponentDetailAddComponentVersionParams,
  AppComponentDetailEditComponentVersionParams,
  AppComponentDetailFetchComponentInfoParams,
  AppComponentDetailFetchComponentVersionsParams,
  AppComponentDetailLiveComponentVersionParams,
  AppComponentDetailUpdateComponentVersionStatueParams,
  ComponentRemoteSaveParams,
  ComponentRemotesFetchParams,
  OptionsAction,
} from '@/types/index';

function* fetchComponentInfo(action: AppComponentDetailActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentDetailFetchComponentInfoParams;
    options?: OptionsAction;
  };
  const { applicationId, id } = params || {};
  const { onSuccess } = options;
  yield put(
    ACTIONS.updateDetailState({
      compInfoLoading: true,
    }),
  );
  const rs = yield call(API.getComponentsContents, {
    applicationId,
    id,
  });
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    yield put(
      ACTIONS.updateDetailState({
        compInfoLoading: false,
      }),
    );
    yield put(ACTIONS.updateComponentInfoState(rs.data || {}));
  } else {
    message.error(rs.msg || 'Fetch component info failed.');
  }
}

function* addVersion(action: AppComponentDetailActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentDetailAddComponentVersionParams;
    options?: OptionsAction;
  };
  const { onSuccess } = options;
  const rs = yield call(API.postComponentsVersions, params);
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    yield put(ACTIONS.fetchComponentVersionsAction({}));
  } else {
    message.error(rs.msg);
  }
}

function* editVersion(action: AppComponentDetailActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentDetailEditComponentVersionParams;
    options?: OptionsAction;
  };
  const { onSuccess } = options;
  const rs = yield call(API.putComponentsVersions, params);
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    yield put(ACTIONS.fetchComponentVersionsAction({}));
  } else {
    message.error(rs.msg);
  }
}

function* fetchVersionList(action: AppComponentDetailActionType) {
  const { options = {} } = action.payload as {
    params: AppComponentDetailFetchComponentVersionsParams;
    options?: OptionsAction;
  };
  const { onSuccess } = options;
  yield put(
    ACTIONS.updateVersionListState({
      loading: true,
    }),
  );
  const { applicationId, fileId, pageInfo } = store.getState().group.application.packages.detail.versionList;
  const { size = 10, page = 1 } = pageInfo;
  const rs = yield call(API.getComponentsVersionSearchs, {
    applicationId,
    id: fileId,
    size,
    page,
  });
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    yield put(
      ACTIONS.updateVersionListState({
        loading: false,
        versions: rs.data || [],
        pageInfo: rs.pageInfo || {
          page: 1,
          total: 0,
          size: 10,
        },
      }),
    );
  } else {
    message.error(rs.msg);
  }
}

function* updateVersionStatus(action: AppComponentDetailActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentDetailUpdateComponentVersionStatueParams;
    options?: OptionsAction;
  };
  const { onSuccess } = options;
  const rs = yield call(API.putComponentsVersionPublish, params);
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    yield put(ACTIONS.fetchComponentVersionsAction({}));
    message.success('Update version status success...');
  } else {
    message.error(rs.msg);
  }
}

function* liveVersion(action: AppComponentDetailActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentDetailLiveComponentVersionParams;
    options?: OptionsAction;
  };
  const { onSuccess } = options;
  const rs = yield call(API.putComponentsLiveVersion, params);
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    yield put(ACTIONS.fetchComponentVersionsAction({}));
  } else {
    message.error(rs.msg);
  }
}

function* handleFetchFileDetail(action: AppComponentDetailActionType) {
  const { applicationId, ids } = action.payload as FileDetailFetchParams;
  const rs = yield call(fetchFileDetail, {
    applicationId,
    ids,
  });
  if (rs.code === 200 && rs.data?.length > 0) {
    yield put(ACTIONS.pushFileDetail(rs.data[0]));
  } else {
    message.error(rs.msg || 'Fetch file detail failed');
  }
}

function* handleFetchComponentRemotes(action: AppComponentDetailActionType) {
  const params = action.payload as ComponentRemotesFetchParams;
  const rs = yield call(API.searchComponentRemotes, params);
  if (rs.code === 200 && rs.data) {
    const { components, lastVersion } = rs.data;
    yield put(ACTIONS.pushComponentRemotes(components, lastVersion));
  } else {
    message.error(rs.msg || 'Fetch component updates failed');
  }
}

function* handleSaveComponentRemote(action: AppComponentDetailActionType) {
  const params = action.payload as ComponentRemoteSaveParams;
  yield put(ACTIONS.updateCloudSyncDrawerLoadingStatus(true));
  const rs = yield call(API.saveComponentRemote, params);
  if (rs.code === 200) {
    yield put(ACTIONS.updateCloudSyncDrawerOpenStatus(false));
    yield put(ACTIONS.fetchComponentVersionsAction({}));
  } else {
    message.error(rs.msg || 'Save failed');
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
