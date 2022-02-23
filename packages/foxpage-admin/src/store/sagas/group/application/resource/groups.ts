import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/resource/groups';
import * as API from '@/apis/group/application/resource';
import { FileTagType } from '@/constants/file';
import { getBusinessI18n } from '@/pages/locale';
import { AppResourceGroupsActionType } from '@/store/reducers/group/application/resource/groups';
import {
  AppResourcesGroupsDeleteResourcesGroupParams,
  AppResourcesGroupsFetchResourcesGroupsParams,
  AppResourcesGroupsSaveResourcesGroupParams,
  OptionsAction,
} from '@/types/index';

function* saveResourceGroup(action: AppResourceGroupsActionType) {
  const { params, options = {} } = action.payload as {
    params: AppResourcesGroupsSaveResourcesGroupParams;
    options?: OptionsAction;
  };
  const {
    global: { saveFailed },
  } = getBusinessI18n();
  const { id, appId, name, intro, resourceId, resourceType, config } = params || {};
  const { onSuccess, onFail } = options || {};
  const rs = yield call(id ? API.editGroup : API.postResourcesGroups, {
    id,
    applicationId: appId,
    name,
    intro,
    config,
    tags: [
      {
        type: FileTagType.ResourceGroup,
        resourceId,
        resourceType,
      },
    ],
  });
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    yield put(
      ACTIONS.fetchResourcesGroupsAction({
        appId,
      }),
    );
  } else {
    message.error(rs.msg || saveFailed);
    if (onFail) onFail();
  }
}

function* deleteResourceGroup(action: AppResourceGroupsActionType): any {
  const { params, options = {} } = action.payload as {
    params: AppResourcesGroupsDeleteResourcesGroupParams;
    options?: OptionsAction;
  };
  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();
  const { appId, id } = params;
  const { onSuccess, onFail } = options || {};

  const rs = yield call(API.putResourcesGroupStatus, {
    applicationId: appId,
    id,
    status: true,
  });
  if (rs.code === 200) {
    if (onSuccess) onSuccess();
    message.success(deleteSuccess);
    yield put(
      ACTIONS.fetchResourcesGroupsAction({
        appId,
      }),
    );
  } else {
    message.error(rs.msg || deleteFailed);
    if (onFail) onFail();
  }
}

function* fetchResourceGroups(action: AppResourceGroupsActionType) {
  const { params } = action.payload as {
    params: AppResourcesGroupsFetchResourcesGroupsParams;
    options?: OptionsAction;
  };
  const {
    global: { fetchListFailed },
  } = getBusinessI18n();
  const { appId } = params;
  yield put(
    ACTIONS.updateResourcesGroupsState({
      loading: true,
    }),
  );
  const rs = yield call(API.getResourcesGroupSearchs, {
    applicationId: appId,
  });
  let groupList = [];
  if (rs.code === 200) {
    groupList = rs.data || [];
  } else {
    message.error(rs.msg || fetchListFailed);
  }
  yield put(
    ACTIONS.updateResourcesGroupsState({
      groupList,
      loading: false,
    }),
  );
}

function* watch() {
  yield takeLatest(getType(ACTIONS.saveResourcesGroupAction), saveResourceGroup);
  yield takeLatest(getType(ACTIONS.deleteResourcesGroupAction), deleteResourceGroup);
  yield takeLatest(getType(ACTIONS.fetchResourcesGroupsAction), fetchResourceGroups);
}

export default function* rootSaga() {
  yield all([watch()]);
}
