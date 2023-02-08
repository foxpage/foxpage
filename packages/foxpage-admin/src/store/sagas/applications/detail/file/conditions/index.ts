import { message } from 'antd';
import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/conditions';
import * as API from '@/apis/application';
import { RecordActionType } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { ConditionActionType } from '@/reducers/applications/detail/file/conditions';
import { getRelation } from '@/sagas/builder/services';
import * as RECORD_ACTIONS from '@/store/actions/record';
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
import { errorToast, objectEmptyCheck } from '@/utils/index';

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

    errorToast(res, fetchFailed);
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
    const { applicationId } = store.getState().applications.detail.settings.app;
    const { realInvalids, relation } = yield getRelation(params.content as any, [] as RelationDetails, {
      applicationId: params?.applicationId || applicationId,
    });

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
  if (!!params?.subType) {
    _params = {
      ..._params,
      subType: params.subType,
    };
  }
  if (!!params?.pageContentId) {
    _params = {
      ..._params,
      pageContentId: params.pageContentId,
    };
  }

  const editStatus = !!params?.id;
  const res: ConditionSaveResponse = yield call(editStatus ? API.updateCondition : API.addCondition, _params);

  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(saveSuccess);
    if (editStatus) {
      yield put(
        RECORD_ACTIONS.addUserRecords(RecordActionType.CONDITION_UPDATE, [_params], {
          save: true,
          applicationId: params.applicationId,
          contentId: params?.content?.id,
        }),
      );
    } else {
      yield put(
        RECORD_ACTIONS.addUserRecords(RecordActionType.CONDITION_CREATE, [_params], {
          save: true,
          applicationId: params.applicationId,
          contentId: res.data.contentId,
        }),
      );
    }
    if (typeof cb === 'function') cb(res.data.contentId);
  } else {
    errorToast(res, saveFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleDeleteCondition(actions: ConditionActionType) {
  yield put(ACTIONS.updateLoading(true));

  const { params, cb } = actions.payload as {
    params: ConditionDeleteParams;
    cb?: () => void;
  };
  const { condition, ...rest } = params;
  const res: ConditionDeleteRes = yield call(API.deleteCondition, rest);

  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(deleteSuccess);
    yield put(
      RECORD_ACTIONS.addUserRecords(RecordActionType.CONDITION_REMOVE, [params], {
        save: true,
        applicationId: params.applicationId,
        contentId: condition?.contentId,
      }),
    );

    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, deleteFailed);
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

  if (params?.content?.version) {
    delete params.content.version;
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
    errorToast(res, updateFailed);
  }
}

function* handlePublishCondition(action: ConditionActionType) {
  const { params, cb } = action.payload as { params: ConditionPublishParams; cb?: () => void };
  const res = yield call(API.publishCondition, params);

  const {
    global: { publishSuccess, publishFailed },
  } = getBusinessI18n();

  if (res.code === 200) {
    message.success(publishSuccess);
    yield put(
      RECORD_ACTIONS.addUserRecords(RecordActionType.CONDITION_PUBLISH, [params], {
        save: true,
        applicationId: params.applicationId,
        contentId: params.contentId,
      }),
    );
    if (typeof cb === 'function') cb();
  } else {
    errorToast(res, publishFailed);
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

    errorToast(res, fetchFailed);
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
