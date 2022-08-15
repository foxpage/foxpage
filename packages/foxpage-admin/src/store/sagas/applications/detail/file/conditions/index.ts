import { message } from 'antd';
import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/conditions';
import * as API from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { ConditionActionType } from '@/reducers/applications/detail/file/conditions';
import { getRelation } from '@/sagas/builder/services';
import { store } from '@/store/index';
import {
  ConditionDeleteParams,
  ConditionDeleteRes,
  ConditionDetailFetchParams,
  ConditionEntity,
  ConditionFetchParams,
  ConditionFetchRes,
  ConditionPublishParams,
  ConditionSaveParams,
  ConditionSaveResponse,
  ConditionUpdateParams,
  ConditionUpdateRes,
  RelationDetails,
} from '@/types/index';
import { objectEmptyCheck } from '@/utils/empty-check';

function* handleFetchList(actions: ConditionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params } = actions.payload as { params: ConditionFetchParams };
  const { folderId, type } = params;
  const { scope } = store.getState().applications.detail.file.conditions;
  const res: ConditionFetchRes =
    !folderId && !type
      ? yield call(API.fetchAppConditions, { ...params, scope })
      : yield call(API.fetchConditions, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushList(res.data, res.pageInfo));
  } else {
    const {
      condition: { fetchFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleSaveCondition(actions: ConditionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params, cb } = actions.payload as {
    params: ConditionSaveParams;
    cb?: (contentId?: string) => void;
  };

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

  const res: ConditionSaveResponse = yield call(params?.id ? API.updateCondition : API.addCondition, _params);

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);

    if (typeof cb === 'function') cb(res.data.contentId);
  } else {
    message.error(res.msg || saveFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleDeleteCondition(actions: ConditionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params, cb } = actions.payload as {
    params: ConditionDeleteParams;
    cb?: () => void;
  };
  const res: ConditionDeleteRes = yield call(API.deleteCondition, params);

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

function* handleSaveConditionVersion(actions: ConditionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params, cb } = actions.payload as {
    params: ConditionUpdateParams;
    cb?: (id: string) => void;
  };

  const relation = params?.content?.relation;
  if (relation) {
    for (const key in relation) {
      delete relation[key].content;
    }
  }

  const res: ConditionUpdateRes = yield call(API.updateConditionVersion, {
    ...params,
    id: params.content?.id,
  } as ConditionUpdateParams);

  const {
    global: { updateSuccess, updateFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(updateSuccess);

    if (typeof cb === 'function') cb(params.content?.id || '');
  } else {
    message.error(res.msg || updateFailed);
  }
}

function* handlePublishCondition(action: ConditionActionType) {
  const { params, cb } = action.payload as { params: ConditionPublishParams; cb?: () => void };
  const rs = yield call(API.publishCondition, params);

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

function* handleFetchDetail(actions: ConditionActionType) {
  const { params, cb } = actions.payload as {
    params: ConditionDetailFetchParams;
    cb?: (condition: ConditionEntity) => void;
  };
  const res = yield call(API.fetchConditionDetail, params);

  if (res.code === 200) {
    yield put(ACTIONS.pushConditionDetail(res.data));

    if (typeof cb === 'function') cb(res.data);
  } else {
    const {
      condition: { fetchFailed },
    } = getBusinessI18n();

    message.error(res.msg || fetchFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.saveCondition), handleSaveCondition);
  yield takeLatest(getType(ACTIONS.deleteCondition), handleDeleteCondition);
  yield takeLatest(getType(ACTIONS.saveConditionVersion), handleSaveConditionVersion);
  yield takeLatest(getType(ACTIONS.publishCondition), handlePublishCondition);
  yield takeEvery(getType(ACTIONS.fetchConditionDetail), handleFetchDetail);
}

export default function* rootSaga() {
  yield all([watch()]);
}
