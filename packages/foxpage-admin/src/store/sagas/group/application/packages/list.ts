import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as API from '@/apis/group/application/packages';
import * as ACTIONS from '@/store/actions/group/application/packages/list';
import { store } from '@/store/index';
import { AppComponentListActionType } from '@/store/reducers/group/application/packages/list';
import { AppComponentFetchComponentsParams } from '@/types/application';
import { AppComponentAddComponentParams, AppComponentDeleteComponentParams, OptionsAction } from '@/types/index';

function* getComponentList(action: AppComponentListActionType) {
  const { params } = action.payload as { params: AppComponentFetchComponentsParams };
  const { applicationId } = params || {};
  const { applicationId: appId, selectPackage } = store.getState().group.application.packages.list;
  if (!applicationId && !appId) {
    message.error('Fetch list failed, applicationId is empty!!!');
    return;
  }
  yield put(
    ACTIONS.updateListState({
      loading: true,
    }),
  );
  const rs = yield call(API.getComponentSearchs, {
    applicationId: applicationId || appId,
    type: selectPackage,
    size: 1000,
  });
  if (rs.code === 200) {
    yield put(
      ACTIONS.updateListState({
        loading: false,
        componentList: rs.data || [],
      }),
    );
  } else {
    message.error(rs.msg || 'Fetch list failed.');
  }
}
function* addComponent(action: AppComponentListActionType) {
  const { params, options = {} } = action.payload as {
    params: AppComponentAddComponentParams;
    options?: OptionsAction;
  };
  const { applicationId, name, type } = params || {};
  const { onSuccess } = options;
  const rs = yield call(API.postComponents, {
    applicationId,
    name: name,
    type,
  });
  if (rs.code === 200) {
    message.success('Create component succeed.');
    if (onSuccess) onSuccess();
    yield put(
      ACTIONS.updateListState({
        selectPackage: type,
      }),
    );
    yield put(ACTIONS.fetchComponentsAction({}));
  } else {
    message.error(rs.msg || 'Fetch list failed');
  }
}

function* deleteComponent(action: AppComponentListActionType) {
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
  if (res.code === 200) {
    message.success(res.msg || 'Delete component succeed');
    if (onSuccess) onSuccess();
    yield put(ACTIONS.fetchComponentsAction({}));
  } else {
    message.error(res.msg || 'Delete component failed');
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchComponentsAction), getComponentList);
  yield takeLatest(getType(ACTIONS.addComponentAction), addComponent);
  yield takeLatest(getType(ACTIONS.deleteComponentAction), deleteComponent);
}

export default function* rootSaga() {
  yield all([watch()]);
}
