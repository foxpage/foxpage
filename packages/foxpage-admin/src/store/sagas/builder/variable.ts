import { message } from 'antd';
import _ from 'lodash';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/variable';
import * as API from '@/apis/group/application/variable';
import { VariableTypes } from '@/pages/common/constant/VariableFile';
import { getBusinessI18n } from '@/pages/locale';
import { ProjectContentActionType } from '@/reducers/workspace/projects/project/content';
import { searchVariableRelation } from '@/services/builder';
import { store } from '@/store/index';
import { VariableActionType } from '@/store/reducers/builder/variable';
import VariableType, {
  VariableDeleteParams,
  VariablePublishParams,
  VariableSaveParams,
} from '@/types/application/variable';
import { PaginationInfo } from '@/types/common';
import { GoodsCommitParams } from '@/types/store';
import { isNameError } from '@/utils/error';

function* getVariables(action: VariableActionType) {
  const { applicationId } = store.getState().builder.page;
  const { folderId, type } = action.payload as { folderId?: string; type?: string };
  const {
    variable: { fetchFailed },
  } = getBusinessI18n();

  yield put(ACTIONS.setLoadingStatus(true));
  const params: any = {
    applicationId,
    page: 1,
    size: 1000,
  };
  if (folderId) {
    params.folderId = folderId;
  }
  if (type) {
    params.type = type;
  }
  const res = yield call(API.getVariables, params);
  if (res.code === 200) {
    yield put(ACTIONS.pushVariables(res.data, res.pageInfo));
    yield put(ACTIONS.setLoadingStatus(false));
  } else {
    message.error(res.msg || fetchFailed);
  }
}

function* getApplicationVariables(action: VariableActionType) {
  const { applicationId, pageInfo } = action.payload as {
    applicationId: string;
    pageInfo?: PaginationInfo;
  };
  const {
    variable: { fetchFailed },
  } = getBusinessI18n();

  yield put(ACTIONS.setLoadingStatus(true));
  const params = {
    applicationId,
    page: pageInfo?.page,
    size: pageInfo?.size,
  };

  const res = yield call(API.getApplicationVariables, params);
  if (res.code === 200) {
    yield put(ACTIONS.pushVariables(res.data, res.pageInfo));
    yield put(ACTIONS.setLoadingStatus(false));
  } else {
    message.error(res.msg || fetchFailed);
  }
}

function* saveVariables(action: VariableActionType) {
  const { applicationId, folderId, successCb } = action.payload as VariableSaveParams;
  const editVariable = _.cloneDeep(store.getState().builder.variable.editVariable);
  if (isNameError(editVariable?.name)) {
    return null;
  }
  const {
    global: { saveFailed },
  } = getBusinessI18n();

  const schemas = editVariable.content.schemas;
  schemas[0].name = editVariable.name;

  const oldRelation = editVariable.content.relation || {};

  const { relation, hasError } = yield searchVariableRelation({
    applicationId,
    folderId,
    props: schemas[0].props || {},
    oldRelation,
  });

  if (hasError) {
    return;
  }

  //variable type = data.function.call
  if (VariableTypes[1] === schemas[0].type) {
    editVariable.content.relation = { ...oldRelation, ...relation };
  } else {
    editVariable.content.relation = relation;
  }

  delete editVariable.relations;

  const res = yield call(editVariable.id ? API.updateVariables : API.addVariables, {
    ...editVariable,
    applicationId,
    folderId,
  });
  if (res.code === 200) {
    yield put(ACTIONS.updateVariableEditDrawerOpen());
    if (typeof successCb === 'function') {
      successCb();
    } else {
      yield put(ACTIONS.getVariables(folderId));
    }
  } else {
    message.error(res.msg || saveFailed);
  }
}

function* getBuildVersion(action: VariableActionType) {
  const { file, applicationId } = action.payload as { file: VariableType; applicationId: string };
  const {
    variable: { fetchDetailFailed },
  } = getBusinessI18n();
  const res = yield call(API.getVariableBuildVersion, {
    applicationId,
    id: file.contentId,
  });
  if (res.code === 200) {
    yield put(
      ACTIONS.pushVariableBuilderVersion({
        ...file,
        content: res.data.content,
        relations: res.data.relations,
      }),
    );
  } else {
    message.error(res.msg || fetchDetailFailed);
  }
}

function* deleteVariable(action: VariableActionType) {
  const { applicationId, folderId, fileId, successCb } = action.payload as VariableDeleteParams;
  const {
    global: { deleteFailed },
  } = getBusinessI18n();
  const res = yield call(API.deleteVariable, {
    applicationId,
    id: fileId,
    status: true,
  });
  if (res.code === 200) {
    if (typeof successCb === 'function') {
      successCb();
    } else {
      yield put(ACTIONS.getVariables(folderId));
    }
  } else {
    message.error(res.msg || deleteFailed);
  }
}

function* handlePublish(action: ProjectContentActionType) {
  const { params, cb } = action.payload as { params: VariablePublishParams; cb?: () => void };
  const rs = yield call(API.publish, params);

  const {
    global: { publishSuccess, publishFailed },
  } = getBusinessI18n();

  if (rs.code === 200) {
    message.success(publishSuccess);

    if (typeof cb === 'function') {
      cb();
    }
  } else {
    message.error(rs.msg || publishFailed);
  }
}

function* handleCommitToStore(action: ProjectContentActionType) {
  const { params, cb } = action.payload as { params: GoodsCommitParams; cb?: () => void };
  const { applicationId, id, type, isOnline } = params;
  const newParams = isOnline
    ? {
        applicationId,
        id,
      }
    : {
        applicationId,
        id,
        type,
      };
  const api = isOnline ? API.revokeFromStore : API.commitToStore;
  const rs = yield call(api, newParams);

  const {
    global: { commitSuccess, commitFailed, revokeSuccess, revokeFailed },
  } = getBusinessI18n();

  if (rs.code === 200) {
    message.success(isOnline ? revokeSuccess : commitSuccess);

    if (typeof cb === 'function') {
      cb();
    }
  } else {
    message.error(rs.msg || isOnline ? revokeFailed : commitFailed);
  }
}

function* watch() {
  yield takeLatest(getType(ACTIONS.getApplicationVariables), getApplicationVariables);
  yield takeLatest(getType(ACTIONS.getVariables), getVariables);
  yield takeLatest(getType(ACTIONS.saveVariable), saveVariables);
  yield takeLatest(getType(ACTIONS.getVariableBuilderVersion), getBuildVersion);
  yield takeLatest(getType(ACTIONS.deleteVariable), deleteVariable);
  yield takeLatest(getType(ACTIONS.publishVariable), handlePublish);
  yield takeLatest(getType(ACTIONS.commitToStore), handleCommitToStore);
}

export default function* rootSaga() {
  yield all([watch()]);
}
