import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/resources/groups';
import * as API from '@/apis/application';
import { ResourceTagEnum } from '@/constants/file';
import { getBusinessI18n } from '@/foxI18n/index';
import { AppResourceGroupsActionType } from '@/reducers/applications/detail/resources/groups';
import {
  ApplicationResourcesAllGroupsFetchParams,
  ApplicationResourcesFetchParams,
  ApplicationResourcesGroupDeleteParams,
  ApplicationResourcesGroupSaveParams,
  ApplicationResourcesRemoteUrlFetchParams,
  BaseResponse,
  OptionsAction,
} from '@/types/index';
import { errorToast } from '@/utils/error-toast';

function* fetchResourceGroups(action: AppResourceGroupsActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = action.payload as {
    params: ApplicationResourcesAllGroupsFetchParams;
    options?: OptionsAction;
  };
  const { applicationId } = params;
  const res = yield call(API.fetchResourcesGroups, {
    applicationId,
  });

  if (res.code === 200) {
    yield put(ACTIONS.pushResourcesGroups(res.data));
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* saveResourceGroup(action: AppResourceGroupsActionType) {
  const { params, options = {} } = action.payload as {
    params: ApplicationResourcesGroupSaveParams;
    options?: OptionsAction;
  };
  const { id, applicationId, name, intro, resourceId, resourceType, config } = params || {};
  let reqParams: any = {
    applicationId,
    name,
    intro,
    config,
  };
  if (id) {
    reqParams = {
      ...reqParams,
      id,
    };
  } else {
    reqParams = {
      ...reqParams,
      tags: [
        {
          type: ResourceTagEnum.ResourceGroup,
          resourceId,
          resourceType,
        },
      ],
    };
  }
  const res = yield call(id ? API.updateGroupConfig : API.addResourcesGroup, reqParams);

  const { onSuccess, onFail } = options || {};

  if (res.code === 200) {
    if (onSuccess) onSuccess();
    yield put(
      ACTIONS.fetchResourcesGroups({
        applicationId,
      }),
    );
  } else {
    const {
      global: { saveFailed },
    } = getBusinessI18n();

    errorToast(res, saveFailed);

    if (onFail) onFail();
  }
}

function* deleteResourceGroup(action: AppResourceGroupsActionType): any {
  const { params, options = {} } = action.payload as {
    params: ApplicationResourcesGroupDeleteParams;
    options?: OptionsAction;
  };
  const { onSuccess, onFail } = options || {};
  const res = yield call(API.deleteResourcesGroup, params);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    const { applicationId } = params;

    yield put(
      ACTIONS.fetchResourcesGroups({
        applicationId,
      }),
    );

    if (typeof onSuccess === 'function') onSuccess();
  } else {
    errorToast(res, deleteFailed);

    if (typeof onFail === 'function') onFail();
  }
}

function* handleFetchResourceRemoteUrl(action: AppResourceGroupsActionType) {
  const params = action.payload as ApplicationResourcesRemoteUrlFetchParams;
  const res: BaseResponse = yield call(API.fetchResourceRemoteUrl, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushResourcesRemoteUrl((res.msg as string) || ''));
  } else {
    yield put(ACTIONS.pushResourcesRemoteUrl(''));
  }
}

function* handleFetchResourcesGroupTypes(action: AppResourceGroupsActionType) {
  const { params, cb } = action.payload as {
    params: ApplicationResourcesFetchParams;
    cb?: (groupTypeList) => void;
  };
  const res = yield call(API.fetchApplicationsResourcesGroupTypes, params);

  if (res.code === 200) {
    if (typeof cb === 'function') cb(res.data);
  } else {
    const {
      global: { fetchListFailed },
    } = getBusinessI18n();

    errorToast(res, fetchListFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchResourcesGroups), fetchResourceGroups);
  yield takeLatest(getType(ACTIONS.saveResourcesGroup), saveResourceGroup);
  yield takeLatest(getType(ACTIONS.deleteResourcesGroup), deleteResourceGroup);
  yield takeLatest(getType(ACTIONS.fetchResourcesRemoteUrl), handleFetchResourceRemoteUrl);
  yield takeLatest(getType(ACTIONS.fetchResourcesGroupTypes), handleFetchResourcesGroupTypes);
}

export default function* rootSaga() {
  yield all([watch()]);
}
