import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/function';
import * as API from '@/apis/group/application/function';
import { getBusinessI18n } from '@/pages/locale';
import { FunctionActionType } from '@/reducers/builder/function';
import { searchVariableRelation } from '@/services/builder';
import { store } from '@/store/index';
import {
  FuncDeleteParams,
  FuncDeleteRes,
  FuncFetchParams,
  FuncFetchRes,
  FuncNewParams,
  FuncNewRes,
  FuncUpdateParams,
  FuncUpdateRes,
} from '@/types/application/function';
import { isNameError } from '@/utils/error';

function* handleFetchList(actions: FunctionActionType) {
  yield put(ACTIONS.updateLoading(true));
  const {
    function: { fetchFailed },
  } = getBusinessI18n();
  const { params } = actions.payload as { params: FuncFetchParams };
  const rs: FuncFetchRes = yield call(API.getFunctions, params);
  if (rs.code === 200) {
    yield put(ACTIONS.pushList(rs));
  } else {
    message.error(rs.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* fetchApplicationFunctions(actions: FunctionActionType) {
  yield put(ACTIONS.updateLoading(true));
  const {
    function: { fetchFailed },
  } = getBusinessI18n();
  const { applicationId, page, size } = actions.payload as FuncFetchParams;
  const rs: FuncFetchRes = yield call(API.getApplicationFunctions, { applicationId, page, size });
  if (rs.code === 200) {
    yield put(ACTIONS.pushList(rs));
  } else {
    message.error(rs.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* refresh() {
  const applicationId = store.getState().builder.page.applicationId;
  const folderId = store.getState().builder.page.folderId;

  if (applicationId && folderId) {
    yield put(
      ACTIONS.fetchList({
        applicationId,
        folderId,
        page: 1,
        size: 10,
      }),
    );
  }
}

function* handleSaveFunction(actions: FunctionActionType) {
  const { params, cb } = actions.payload as { params: FuncNewParams; cb?: () => void };

  if (isNameError(params?.name)) {
    return;
  }
  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();
  yield put(ACTIONS.updateLoading(true));

  const isError = yield setRelationToContent(params);
  if (isError) {
    yield put(ACTIONS.updateLoading(false));
    return;
  }

  const rs: FuncNewRes = yield call(API.addFunction, params);
  if (rs.code === 200) {
    message.success(saveSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(rs.msg || saveFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleDeleteFunction(actions: FunctionActionType) {
  yield put(ACTIONS.updateLoading(true));
  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();
  const { params, cb, refreshData } = actions.payload as {
    params: FuncDeleteParams;
    cb?: () => void;
    refreshData: boolean;
  };
  const rs: FuncDeleteRes = yield call(API.deleteFunction, params);
  if (rs.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') cb();

    if (refreshData) {
      yield refresh();
    }
  } else {
    message.error(rs.msg || deleteFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleUpdateFunction(actions: FunctionActionType) {
  const { params, cb } = actions.payload as {
    params: FuncUpdateParams;
    cb?: () => void;
    refreshData: boolean;
  };
  if (isNameError(params?.name)) {
    return;
  }
  const {
    global: { updateSuccess, updateFailed },
  } = getBusinessI18n();
  yield put(ACTIONS.updateLoading(true));

  const isError = yield setRelationToContent(params);
  if (isError) {
    yield put(ACTIONS.updateLoading(false));
    return;
  }

  const rs: FuncUpdateRes = yield call(API.updateFunction, params);
  if (rs.code === 200) {
    message.success(updateSuccess);
    if (typeof cb === 'function') cb();
  } else {
    message.error(rs.msg || updateFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* setRelationToContent(params: FuncUpdateParams | FuncNewParams) {
  const { applicationId, folderId } = store.getState().builder.page;
  if (params.content) {
    const { relation, hasError } = yield searchVariableRelation({
      applicationId,
      folderId,
      props: params.content.schemas || {},
      oldRelation: {},
    });
    if (hasError) {
      return true;
    }
    params.content.relation = relation;
  }
  return false;
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.fetchApplicationFunctions), fetchApplicationFunctions);
  yield takeLatest(getType(ACTIONS.saveFunction), handleSaveFunction);
  yield takeLatest(getType(ACTIONS.deleteFunction), handleDeleteFunction);
  yield takeLatest(getType(ACTIONS.updateFunction), handleUpdateFunction);
}

export default function* rootSaga() {
  yield all([watch()]);
}
