import { message } from 'antd';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/functions';
import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { FunctionActionType } from '@/reducers/applications/detail/file/functions';
import { getRelation } from '@/sagas/builder/services';
import { store } from '@/store/index';
import {
  FuncDeleteParams,
  FuncDeleteRes,
  FuncFetchParams,
  FuncFetchRes,
  FuncNewRes,
  FuncPublishParams,
  FuncSaveParams,
  RelationDetails,
} from '@/types/index';
import { nameErrorCheck, objectEmptyCheck } from '@/utils/index';

function* handleFetchList(actions: FunctionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = actions.payload as { params: FuncFetchParams };
  const { folderId, type } = params;
  const { scope } = store.getState().applications.detail.file.functions;
  const res: FuncFetchRes =
    !folderId && !type ? yield call(API.fetchAppFunctions, {...params, scope}) : yield call(API.fetchFunctions, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushList(res.data, res.pageInfo));
  } else {
    const {
      function: { fetchFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveFunction(actions: FunctionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params, cb } = actions.payload as { params: FuncSaveParams; cb?: () => void };

  if (nameErrorCheck(params?.name)) {
    return;
  }

  if (params.content) {
    const { realInvalids, relation } = yield getRelation(params.content as any, [] as RelationDetails);

    if (!objectEmptyCheck(realInvalids)) {
      yield put(ACTIONS.updateLoading(false));
      return;
    }

    params.content.relation = relation;
  }

  let _params: any = {
    applicationId: params.applicationId,
    folderId: params.folderId,
    name: params.name,
    content: params.content,
  };
  if (!!params?.id) {
    _params = {
      ..._params,
      id: params.id,
    };
  }

  const res: FuncNewRes = yield call(params?.id ? API.updateFunction : API.addFunction, _params);

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(res.msg || saveFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleDeleteFunction(actions: FunctionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params, cb } = actions.payload as {
    params: FuncDeleteParams;
    cb?: () => void;
  };
  const res: FuncDeleteRes = yield call(API.deleteFunction, params);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(res.msg || deleteFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handlePublishFunction(action: FunctionActionType) {
  const { params, cb } = action.payload as { params: FuncPublishParams; cb?: () => void };
  const rs = yield call(API.publishFunction, params);

  const {
    global: { publishSuccess, publishFailed },
  } = getBusinessI18n();

  if (rs.code === 200) {
    message.success(publishSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(rs.msg || publishFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveFunction), handleSaveFunction);
  yield takeLatest(getType(ACTIONS.deleteFunction), handleDeleteFunction);
  yield takeLatest(getType(ACTIONS.publishFunction), handlePublishFunction);
}

export default function* rootSaga() {
  yield all([watch()]);
}
