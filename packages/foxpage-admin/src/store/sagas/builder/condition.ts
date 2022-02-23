import { message } from 'antd';
import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/condition';
import * as API from '@/apis/group/application/condition';
import { searchVariable } from '@/apis/group/application/variable/index';
import { ConditionActionType } from '@/reducers/builder/condition';
import { searchVariableRelation } from '@/services/builder';
import { store } from '@/store/index';
import {
  ConditionDeleteParams,
  ConditionDeleteRes,
  ConditionFetchParams,
  ConditionFetchRes,
  ConditionNewParams,
  ConditionNewRes,
  ConditionUpdateParams,
  ConditionUpdateRes,
} from '@/types/application/condition';
import VariableType from '@/types/application/variable';
import { isNameError } from '@/utils/error';

import { getBusinessI18n } from '../../../pages/locale/index';

function* handleFetchList(actions: ConditionActionType) {
  yield put(ACTIONS.updateLoading(true));
  const {
    condition: { fetchFailed },
  } = getBusinessI18n();
  const { params } = actions.payload as { params: ConditionFetchParams };
  const rs: ConditionFetchRes = yield call(API.getConditions, params);
  if (rs.code === 200) {
    yield put(ACTIONS.pushList(rs));
  } else {
    message.error(rs.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* fetchApplicationConditions(actions: ConditionActionType) {
  yield put(ACTIONS.updateLoading(true));
  const {
    condition: { fetchFailed },
  } = getBusinessI18n();
  const { applicationId, page, size } = actions.payload as ConditionFetchParams;
  const rs: ConditionFetchRes = yield call(API.getApplicationConditions, { applicationId, page, size });
  if (rs.code === 200) {
    yield put(ACTIONS.pushList(rs));
  } else {
    message.error(rs.msg || fetchFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* refresh() {
  const { applicationId, folderId } = store.getState().builder.page;

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

function* handleSaveCondition(actions: ConditionActionType) {
  const { applicationId, folderId } = store.getState().builder.page;

  const {
    refreshList = true,
    params,
    cb,
  } = actions.payload as {
    params: ConditionNewParams;
    cb?: (contentId?: string) => void;
    refreshList: boolean;
  };
  if (isNameError(params?.name)) {
    return;
  }
  const {
    global: { saveSuccess, saveFailed },
  } = getBusinessI18n();
  yield put(ACTIONS.updateLoading(true));
  if (params.content) {
    const { relation, hasError } = yield searchVariableRelation({
      applicationId,
      folderId,
      props: params.content.schemas || {},
      oldRelation: {},
    });
    if (hasError) {
      yield put(ACTIONS.updateLoading(false));
      return;
    }
    params.content.relation = relation;
  }
  const rs: ConditionNewRes = yield call(API.addCondition, params);
  if (rs.code === 200) {
    message.success(saveSuccess);

    if (typeof cb === 'function') cb(rs.data.contentId);

    if (refreshList) {
      yield refresh();
    }
  } else {
    message.error(rs.msg || saveFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleDeleteCondition(actions: ConditionActionType) {
  yield put(ACTIONS.updateLoading(true));
  const {
    global: { deleteSuccess, deleteFailed },
  } = getBusinessI18n();
  const {
    params,
    cb,
    refreshList = true,
  } = actions.payload as {
    params: ConditionDeleteParams;
    cb?: () => void;
    refreshList: boolean;
  };
  const rs: ConditionDeleteRes = yield call(API.deleteCondition, params);
  if (rs.code === 200) {
    message.success(deleteSuccess);

    if (typeof cb === 'function') cb();

    if (refreshList) {
      yield refresh();
    }
  } else {
    message.error(rs.msg || deleteFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleUpdateCondition(actions: ConditionActionType) {
  const {
    params,
    refreshList = true,
    cb,
  } = actions.payload as {
    params: ConditionUpdateParams;
    cb?: () => void;
    refreshList: boolean;
  };
  if (isNameError(params?.name)) {
    return;
  }
  const {
    global: { updateSuccess, updateFailed },
  } = getBusinessI18n();
  yield put(ACTIONS.updateLoading(true));
  const { applicationId, folderId } = params;

  const { relation, hasError } = yield searchVariableRelation({
    applicationId,
    folderId,
    props: params.content.schemas || {},
    oldRelation: {},
  });
  if (hasError) {
    yield put(ACTIONS.updateLoading(false));
    return;
  }
  params.content.relation = relation;

  const rs: ConditionUpdateRes = yield call(API.updateCondition, params);
  if (rs.code === 200) {
    message.success(updateSuccess);

    if (typeof cb === 'function') cb();

    if (refreshList) {
      yield refresh();
    }
  } else {
    message.error(rs.msg || updateFailed);
  }

  yield put(ACTIONS.updateLoading(false));
}

function* handleUpdateConditionVersion(actions: ConditionActionType) {
  yield put(ACTIONS.updateLoading(true));
  const {
    global: { updateSuccess, updateFailed },
  } = getBusinessI18n();
  const { params, cb } = actions.payload as {
    cb: () => void;
    params: ConditionUpdateParams;
  };
  const relation = params.content.relation;
  if (relation) {
    for (const key in relation) {
      delete relation[key].content;
    }
  }
  const rs: ConditionUpdateRes = yield call(API.updateConditionVersion, {
    ...params,
    id: params.content?.id,
  } as ConditionUpdateParams);
  if (rs.code === 200) {
    message.success(updateSuccess);

    if (typeof cb === 'function') cb();
  } else {
    message.error(rs.msg || updateFailed);
  }
}

function* searchLocalTimeVariable(actions: ConditionActionType) {
  const { search, cb } = actions.payload as { search: string[]; cb: (data: VariableType[]) => void };
  const { applicationId, folderId } = store.getState().builder.page;
  const res = yield call(searchVariable, { applicationId, id: folderId, names: search });
  cb && cb(res.code === 200 ? res.data : []);
}

function* watch() {
  yield takeLatest(getType(ACTIONS.fetchList), handleFetchList);
  yield takeLatest(getType(ACTIONS.fetchApplicationConditions), fetchApplicationConditions);
  yield takeLatest(getType(ACTIONS.saveCondition), handleSaveCondition);
  yield takeLatest(getType(ACTIONS.deleteCondition), handleDeleteCondition);
  yield takeLatest(getType(ACTIONS.updateCondition), handleUpdateCondition);
  yield takeLatest(getType(ACTIONS.updateConditionVersion), handleUpdateConditionVersion);
  yield takeLatest(getType(ACTIONS.searchLocalTimeVariable), searchLocalTimeVariable);
}

export default function* rootSaga() {
  yield all([watch()]);
}
